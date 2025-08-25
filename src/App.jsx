import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — Quiz+Audio+Streaks (v3)
 * - Tap audio ≈ 85%, Long-press ≈ 65% (Azure/Browser). ElevenLabs = normal (API limitation).
 * - Streak increments once per calendar day when a 10-question quiz is completed.
 * - Quiz pulls from ALL tabs, with RAG mix: 40% 🔴, 50% 🟠, 10% 🟢 (fallback if bucket-low).
 * - Recent-history filter reduces repeats across sessions.
 * - Finish screen with score + streak feedback.
 */

const LS_KEY = "lt_phrasebook_v2";
const LSK_TTS_PROVIDER = "lt_tts_provider"; // 'browser' | 'elevenlabs' | 'azure'
const LSK_ELEVEN_KEY = "lt_eleven_key";
const LSK_ELEVEN_VOICE = "lt_eleven_voice"; // {id,name}
const LSK_USAGE = "lt_eleven_usage_v1";     // {month:"YYYY-MM", requests:number}
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice";   // {shortName}
const LSK_RECENT = "lt_quiz_recent_v1";     // string[] of ids
const LSK_STATS = "lt_gamestats_v2";        // {streak,lastCompletedDay,...}

const saveData = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows));
const loadData = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)||"[]"); } catch { return []; } };
const monthKey = () => new Date().toISOString().slice(0,7);
const loadUsage = () => { try { const u=JSON.parse(localStorage.getItem(LSK_USAGE)||"null"); return (!u||u.month!==monthKey())?{month:monthKey(),requests:0}:u; } catch { return {month:monthKey(),requests:0}; } };
const saveUsage = (u)=>localStorage.setItem(LSK_USAGE, JSON.stringify(u));
const todayDays = ()=>Math.floor(Date.now()/86400000);
const now = ()=>Date.now();

function normalizeRag(icon=""){ const s=String(icon).trim(); const low=s.toLowerCase();
  if(["🔴","🟥","red"].includes(s)||low==="red") return "🔴";
  if(["🟠","🟧","🟨","🟡"].includes(s)||["amber","orange","yellow"].includes(low)) return "🟠";
  if(["🟢","🟩","green"].includes(s)||low==="green") return "🟢";
  return "";
}
const cn=(...xs)=>xs.filter(Boolean).join(" ");

/* XLSX (UMD) */
async function loadXLSX(){
  if(window.XLSX) return window.XLSX;
  const urls=[
    "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.19.3/xlsx.full.min.js",
    "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js",
    "https://unpkg.com/xlsx@0.19.3/dist/xlsx.full.min.js",
  ];
  let err; for(const src of urls){ try{
    await new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.async=true; s.onload=()=>res(); s.onerror=(e)=>rej(e); document.head.appendChild(s); });
    if(window.XLSX) return window.XLSX;
  }catch(e){ err=e; } }
  throw err||new Error("Failed to load XLSX");
}
async function importXlsx(file){
  const XLSX=await loadXLSX();
  const wb=XLSX.read(await file.arrayBuffer(),{type:"array"});
  const tabs=new Set(["Phrases","Questions","Words"]);
  const merged=[];
  for (const name of wb.SheetNames){
    const ws=wb.Sheets[name]; if(!ws) continue;
    const json=XLSX.utils.sheet_to_json(ws,{defval:""});
    for (const r of json){
      const row={
        English: r.English??r.english??"",
        Lithuanian: r.Lithuanian??r.lithuanian??"",
        Phonetic: r.Phonetic??r.phonetic??"",
        Category: r.Category??r.category??"",
        Usage: r.Usage??r.usage??"",
        Notes: r.Notes??r.notes??"",
        "RAG Icon": normalizeRag(r["RAG Icon"]??r.RAG??r.rag??""),
        Sheet: tabs.has(name)?name:(r.Sheet||"Phrases"),
        ease: 2.5, intervalDays: 0, due: 0, correctStreak: 0,
      };
      if(row.English || row.Lithuanian) merged.push(row);
    }
  }
  return merged;
}
function exportJson(rows){
  const url=URL.createObjectURL(new Blob([JSON.stringify(rows,null,2)],{type:"application/json"}));
  const a=document.createElement("a"); a.href=url; a.download="lt-phrasebook.json"; a.click(); URL.revokeObjectURL(url);
}

/* Voices */
function useVoices(){
  const [voices,setVoices]=useState([]);
  useEffect(()=>{ const refresh=()=>{
      const v=window.speechSynthesis?.getVoices?.()||[];
      const sorted=[...v].sort((a,b)=>{ const aLt=(a.lang||"").toLowerCase().startsWith("lt"); const bLt=(b.lang||"").toLowerCase().startsWith("lt"); if(aLt&&!bLt) return -1; if(bLt&&!aLt) return 1; return a.name.localeCompare(b.name); });
      setVoices(sorted);
    };
    refresh(); window.speechSynthesis?.addEventListener?.("voiceschanged",refresh);
    return ()=>window.speechSynthesis?.removeEventListener?.("voiceschanged",refresh);
  },[]);
  return voices;
}
function speakBrowser(text, voice, rate=1){
  if(!window.speechSynthesis){ alert("Speech synthesis not supported."); return; }
  const u=new SpeechSynthesisUtterance(text); if(voice) u.voice=voice; u.lang=voice?.lang||"lt-LT"; u.rate=rate;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}
// ElevenLabs (no client rate control)
async function fetchElevenVoicesHTTP(key){ const r=await fetch("https://api.elevenlabs.io/v1/voices",{headers:{"xi-api-key":key}}); if(!r.ok) throw new Error("Failed to fetch voices"); const d=await r.json(); return (d.voices||[]).map(v=>({id:v.voice_id,name:v.name})); }
async function speakElevenLabsHTTP(text, voiceId, key){
  const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,{method:"POST",headers:{"xi-api-key":key,"Content-Type":"application/json",Accept:"audio/mpeg"},body:JSON.stringify({text,model_id:"eleven_multilingual_v2",voice_settings:{stability:0.4, similarity_boost:0.7, style:0.2, use_speaker_boost:true}})}); 
  if(!r.ok) throw new Error("ElevenLabs TTS failed: "+r.status+" "+r.statusText); const b=await r.blob(); return URL.createObjectURL(b);
}
// Azure (+SSML rate)
async function fetchAzureVoicesHTTP(key,region){ const url=`https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`; const r=await fetch(url,{headers:{"Ocp-Apim-Subscription-Key":key}}); if(!r.ok) throw new Error("Failed to fetch Azure voices"); const d=await r.json(); return d.map(v=>({shortName:v.ShortName, locale:v.Locale, displayName:v.LocalName||v.FriendlyName||v.ShortName})); }
function escapeXml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"); }
async function speakAzureHTTP(text, shortName, key, region, ratePercent="100%"){
  const url=`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml=`<speak version="1.0" xml:lang="lt-LT"><voice name="${shortName}"><prosody rate="${ratePercent}">${escapeXml(text)}</prosody></voice></speak>`;
  const r=await fetch(url,{method:"POST",headers:{"Ocp-Apim-Subscription-Key":key,"Content-Type":"application/ssml+xml","X-Microsoft-OutputFormat":"audio-24khz-48kbitrate-mono-mp3"},body:ssml});
  if(!r.ok) throw new Error("Azure TTS failed: "+r.status+" "+r.statusText); const b=await r.blob(); return URL.createObjectURL(b);
}

/* Spaced repetition */
function ensureSR(row){ if(row.ease==null) row.ease=2.5; if(row.intervalDays==null) row.intervalDays=0; if(row.due==null) row.due=0; if(row.correctStreak==null) row.correctStreak=0; return row; }
function schedule(result,row){ ensureSR(row); const td=todayDays();
  if(result==="correct"){ row.ease=Math.max(1.3,row.ease+0.1); row.intervalDays=row.intervalDays?Math.round(row.intervalDays*row.ease):1; row.correctStreak=(row.correctStreak||0)+1; }
  else { row.ease=Math.max(1.3,row.ease-0.2); row.intervalDays=0; row.correctStreak=0; }
  row.due=(td+row.intervalDays)*86400000;
  if(row.correctStreak>=3 && row["RAG Icon"]==="🟠") row["RAG Icon"]="🟢";
  if(result==="wrong" && row["RAG Icon"]==="🟢") row["RAG Icon"]="🟠";
}

/* Stats / streaks */
const defaultStats=()=>({streak:0,lastCompletedDay:null,xp:0,combo:0});
function loadStats(){ try{ return JSON.parse(localStorage.getItem(LSK_STATS)||"null")||defaultStats(); }catch{ return defaultStats(); } }
function saveStats(s){ localStorage.setItem(LSK_STATS, JSON.stringify(s)); }

/* Recent history */
function loadRecent(){ try{ return JSON.parse(localStorage.getItem(LSK_RECENT)||"[]"); }catch{ return []; } }
function saveRecent(arr){ localStorage.setItem(LSK_RECENT, JSON.stringify(arr.slice(-80))); } // keep last 80 ids

/* Main */
export default function App(){
  const fileRef = useRef(null);
  const longPressRef = useRef(null);

  const [rows,setRows]=useState(loadData().map(ensureSR));
  const [tab,setTab]=useState("Phrases");
  const [q,setQ]=useState("");
  const [direction,setDirection]=useState("EN2LT"); // EN2LT | LT2EN

  const [ttsProvider,setTtsProvider]=useState(()=>localStorage.getItem(LSK_TTS_PROVIDER)||"browser");
  const [voiceName,setVoiceName]=useState("");

  // ElevenLabs
  const [elevenKey,setElevenKey]=useState(()=>localStorage.getItem(LSK_ELEVEN_KEY)||"");
  const [elevenVoiceId,setElevenVoiceId]=useState(()=>{try{return JSON.parse(localStorage.getItem(LSK_ELEVEN_VOICE)||"null")?.id||"";}catch{return "";}});
  const [elevenVoiceName,setElevenVoiceName]=useState(()=>{try{return JSON.parse(localStorage.getItem(LSK_ELEVEN_VOICE)||"null")?.name||"";}catch{return "";}});
  const [usage,setUsage]=useState(loadUsage());
  const [elevenVoices,setElevenVoices]=useState([]);

  // Azure
  const [azureKey,setAzureKey]=useState(()=>localStorage.getItem(LSK_AZURE_KEY)||"");
  const [azureRegion,setAzureRegion]=useState(()=>localStorage.getItem(LSK_AZURE_REGION)||"");
  const [azureVoiceShortName,setAzureVoiceShortName]=useState(()=>{try{return JSON.parse(localStorage.getItem(LSK_AZURE_VOICE)||"null")?.shortName||"";}catch{return "";}});
  const [azureVoices,setAzureVoices]=useState([]);

  // Game
  const [stats,setStats]=useState(loadStats());
  const [quizOpen,setQuizOpen]=useState(false);
  const [quizItems,setQuizItems]=useState([]); // [{rowIdx, choices:[{text,isCorrect}], prompt}]
  const [quizCursor,setQuizCursor]=useState(0);
  const [selectedIdx,setSelectedIdx]=useState(null);
  const [correctIdx,setCorrectIdx]=useState(null);
  const [answered,setAnswered]=useState(false);
  const [wasCorrect,setWasCorrect]=useState(false);
  const [score,setScore]=useState(0);
  const [finishOpen,setFinishOpen]=useState(false);

  const [confirmClear,setConfirmClear]=useState(false);
  const [ragPriority,setRagPriority]=useState("");
  const [settingsOpen,setSettingsOpen]=useState(false);

  const voices=useVoices();
  const voice=useMemo(()=>voices.find(v=>v.name===voiceName)||voices.find(v=>(v.lang||"").toLowerCase().startsWith("lt"))||voices[0],[voices,voiceName]);

  useEffect(()=>saveData(rows),[rows]);
  useEffect(()=>localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider),[ttsProvider]);
  useEffect(()=>{ if(elevenKey) localStorage.setItem(LSK_ELEVEN_KEY, elevenKey); },[elevenKey]);
  useEffect(()=>{ localStorage.setItem(LSK_ELEVEN_VOICE, JSON.stringify({id:elevenVoiceId,name:elevenVoiceName})); },[elevenVoiceId,elevenVoiceName]);
  useEffect(()=>saveUsage(usage),[usage]);
  useEffect(()=>{ if(azureKey) localStorage.setItem(LSK_AZURE_KEY, azureKey); },[azureKey]);
  useEffect(()=>{ if(azureRegion) localStorage.setItem(LSK_AZURE_REGION, azureRegion); },[azureRegion]);
  useEffect(()=>{ localStorage.setItem(LSK_AZURE_VOICE, JSON.stringify({shortName:azureVoiceShortName})); },[azureVoiceShortName]);
  useEffect(()=>saveStats(stats),[stats]);

  useEffect(()=>{ setDraft(d=>({...d, Sheet: tab })); },[tab]);

  const filtered=useMemo(()=>rows.filter(r=>r.Sheet===tab).filter(r=>{
    if(!q) return true;
    const hay=`${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  }),[rows,tab,q]);

  const groups=useMemo(()=>{
    const buckets={"🔴":[],"🟠":[],"🟢":[],"":[]};
    for(const r of filtered) buckets[normalizeRag(r["RAG Icon"])||""].push(r);
    const order=["🔴","🟠","🟢",""];
    const keys = ragPriority && order.includes(ragPriority) ? [ragPriority,...order.filter(x=>x!==ragPriority)] : order;
    return keys.map(k=>({key:k,items:buckets[k]}));
  },[filtered,ragPriority]);

  const primaryOf=(r)=> direction==="EN2LT" ? r.Lithuanian : r.English;
  const secondaryOf=(r)=> direction==="EN2LT" ? r.English : r.Lithuanian;

  async function playText(text,{slow=false}={}){
    try{
      if(ttsProvider==="elevenlabs" && elevenKey && elevenVoiceId){
        setUsage(u=>({ ...((u.month===monthKey())?u:{month:monthKey(),requests:0}), requests:(u.requests||0)+1 }));
        const url=await speakElevenLabsHTTP(text, elevenVoiceId, elevenKey);
        const a=new Audio(url); a.onended=()=>URL.revokeObjectURL(url); await a.play();
      }else if(ttsProvider==="azure" && azureKey && azureRegion && azureVoiceShortName){
        const rate = slow ? "65%" : "85%";
        const url=await speakAzureHTTP(text, azureVoiceShortName, azureKey, azureRegion, rate);
        const a=new Audio(url); a.onended=()=>URL.revokeObjectURL(url); await a.play();
      }else{
        const rate = slow ? 0.65 : 0.85;
        speakBrowser(text, voice, rate);
      }
    }catch(e){ console.error(e); alert("Voice error: "+(e?.message||e)); }
  }
  function attachPressHandlers(text){
    return {
      onMouseDown: ()=>{ longPressRef.current=setTimeout(()=>{ playText(text,{slow:true}); longPressRef.current="played"; },500); },
      onMouseUp: ()=>{ if(longPressRef.current && longPressRef.current!=="played"){ clearTimeout(longPressRef.current); playText(text,{slow:false}); } longPressRef.current=null; },
      onMouseLeave: ()=>{ if(longPressRef.current && longPressRef.current!=="played"){ clearTimeout(longPressRef.current); } longPressRef.current=null; },
      onTouchStart: ()=>{ longPressRef.current=setTimeout(()=>{ playText(text,{slow:true}); longPressRef.current="played"; },500); },
      onTouchEnd: ()=>{ if(longPressRef.current && longPressRef.current!=="played"){ clearTimeout(longPressRef.current); playText(text,{slow:false}); } longPressRef.current=null; },
    };
  }

  /* Edit/Delete */
  const [editIdx,setEditIdx]=useState(null);
  const [editDraft,setEditDraft]=useState(null);
  function startEdit(i){ setEditIdx(i); setEditDraft({...rows[i]}); }
  function saveEdit(i){ const clean={...editDraft,"RAG Icon":normalizeRag(editDraft["RAG Icon"])}; ensureSR(clean); setRows(prev=>prev.map((r,idx)=>idx===i?clean:r)); setEditIdx(null); }
  function cancelEdit(){ setEditIdx(null); }
  function remove(i){ if(!confirm("Delete this entry?")) return; setRows(prev=>prev.filter((_,idx)=>idx!==i)); }

  /* Import / Clear */
  async function onImportFile(e){ const f=e.target.files?.[0]; if(!f) return;
    try{ const newRows=await importXlsx(f); setRows(newRows.map(ensureSR)); setTab("Phrases"); setQ(""); }
    catch(err){ console.error(err); alert("Failed to import .xlsx (see console)"); }
    finally{ e.target.value=""; }
  }
  function clearAll(){ if(!confirmClear){ setConfirmClear(true); setTimeout(()=>setConfirmClear(false),3000); return; }
    localStorage.removeItem(LS_KEY); setRows([]); setQ(""); setTab("Phrases"); setConfirmClear(false);
  }

  /* Quiz helpers */
  const [recent,setRecent]=useState(loadRecent());
  useEffect(()=>saveRecent(recent),[recent]);

  function shuffle(a){ const arr=[...a]; for(let i=arr.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
  function idOf(r){ return `${(r.English||"").trim()}|${(r.Lithuanian||"").trim()}|${r.Sheet||""}`; }

  function pickQuizSet(){
    const all = rows.filter(r => r.English && r.Lithuanian);
    // Split by RAG
    const reds   = shuffle(all.filter(r=>normalizeRag(r["RAG Icon"])==="🔴" && !recent.includes(idOf(r))));
    const ambers = shuffle(all.filter(r=>normalizeRag(r["RAG Icon"])==="🟠" && !recent.includes(idOf(r))));
    const greens = shuffle(all.filter(r=>normalizeRag(r["RAG Icon"])==="🟢" && !recent.includes(idOf(r))));
    // Targets: 4 red, 5 amber, 1 green
    let pick = [];
    const take = (src,n)=>{ const got=src.splice(0,n); pick.push(...got); };
    take(reds,4); take(ambers,5); take(greens,1);
    // Fallback if we’re short
    if(pick.length<10){
      const leftovers = shuffle(all.filter(r=>!recent.includes(idOf(r)) && !pick.includes(r)));
      pick.push(...leftovers.slice(0, 10-pick.length));
    }
    // If still short (everything was in recent), fall back to full pool
    if(pick.length<10){
      const leftovers2 = shuffle(all.filter(r=>!pick.includes(r)));
      pick.push(...leftovers2.slice(0, 10-pick.length));
    }
    pick = pick.slice(0,10);

    // Build items
    const items = pick.map((r)=>{
      const sameCat = all.filter(x=>x!==r && (x.Sheet===r.Sheet || (x.Category && x.Category===r.Category)));
      const wrongsPool = sameCat.length ? sameCat : all.filter(x=>x!==r);
      const wrongs = shuffle(wrongsPool).slice(0,3).map(x=>primaryOf(x)).filter(Boolean);
      const correct = primaryOf(r);
      const choices = shuffle([{text:correct,isCorrect:true}, ...wrongs.slice(0,3).map(t=>({text:t,isCorrect:false}))]);
      return { rowIdx: rows.indexOf(r), prompt: secondaryOf(r), choices, id: idOf(r) };
    }).filter(x=>x.choices.length>=2);

    return items;
  }

  function startQuiz(){
    const items=pickQuizSet();
    if(!items.length){ alert("Nothing to review. Add items or import data."); return; }
    setQuizItems(items); setQuizCursor(0);
    setSelectedIdx(null); setCorrectIdx(null); setAnswered(false); setWasCorrect(false);
    setScore(0); setFinishOpen(false);
    setQuizOpen(true);
  }

  function answerChoice(i){
    if(answered) return;
    const item=quizItems[quizCursor];
    const idxCorrect = item.choices.findIndex(c=>c.isCorrect);
    const isCorrect = i===idxCorrect;

    setSelectedIdx(i); setCorrectIdx(idxCorrect); setAnswered(true); setWasCorrect(isCorrect);
    if(isCorrect) setScore(s=>s+1);

    // schedule + update row
    const rowIdx=item.rowIdx;
    setRows(prev=>{ const copy=[...prev]; schedule(isCorrect?"correct":"wrong", copy[rowIdx]); return copy; });

    // Play the correct answer (normal speed)
    const row = rows[rowIdx];
    const correctText = primaryOf(row);
    playText(correctText, { slow:false });
  }

  function nextQuestion(){
    const next=quizCursor+1;
    if(next>=quizItems.length){
      // Finish quiz
      setQuizOpen(false);
      setFinishOpen(true);

      // Streak: increment once per day on completion of a 10Q quiz
      setStats(prev=>{
        const d=todayDays();
        if(prev.lastCompletedDay!==d){
          return { ...prev, streak:(prev.streak||0)+1, lastCompletedDay:d };
        }
        return prev;
      });

      // Update recent history
      setRecent(prev=>{
        const ids = quizItems.map(it=>it.id);
        return [...prev, ...ids].slice(-80);
      });

      return;
    }
    setQuizCursor(next);
    setSelectedIdx(null); setCorrectIdx(null); setAnswered(false); setWasCorrect(false);
  }

  function quitQuiz(){
    if(confirm("Quit quiz? You won’t add to your streak until you complete a full set today.")){
      setQuizOpen(false);
    }
  }

  /* Add form */
  const [draft,setDraft]=useState({English:"",Lithuanian:"",Phonetic:"",Category:"",Usage:"",Notes:"","RAG Icon":"🟠",Sheet:"Phrases"});
  function addRow(){
    if(!draft.English || !draft.Lithuanian){ alert("English & Lithuanian are required"); return; }
    const row={...draft,"RAG Icon":normalizeRag(draft["RAG Icon"])};
    ensureSR(row);
    setRows(prev=>[row,...prev]);
    setDraft({...draft,English:"",Lithuanian:"",Phonetic:"",Category:"",Usage:"",Notes:""});
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-[180px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">LT</div>
            <div className="leading-tight">
              <div className="text-lg font-semibold">Lithuanian Trainer</div>
              <div className="text-xs text-zinc-400">Tap to play (85%) • Long‑press (65%).</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1" value={voiceName} onChange={(e)=>setVoiceName(e.target.value)} disabled={ttsProvider!=="browser"} title={ttsProvider==="browser"?"Browser voice (rate control)":"Cloud voice"}>
              <option value="">Auto voice</option>
              {useVoices().map(v=><option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
            <div className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300">🔥 {stats.streak}</div>
            {ttsProvider==="elevenlabs" && <div className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300">{usage.requests||0} plays</div>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImportFile} className="hidden"/>
            <button onClick={()=>fileRef.current?.click()} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">📥 XLSX</button>
            <button onClick={()=>exportJson(rows)} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">📤 JSON</button>
            <button onClick={clearAll} className="bg-zinc-900 border border-red-600 text-red-400 rounded-md text-xs px-2 py-1">{confirmClear?"Tap again":"Clear"}</button>
            <button onClick={startQuiz} className="bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs px-3 py-1 font-semibold">Quiz</button>
            <button onClick={()=>window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})} className="bg-zinc-800 rounded-md text-xs px-2 py-1">Add</button>
            <button onClick={()=>setSettingsOpen(true)} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">⚙️</button>
          </div>
        </div>

        {/* Search / Mode / RAG */}
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-2 sm:pb-3 flex items-center gap-2 flex-wrap">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search…" className="flex-1 min-w-[180px] bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"/>
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-300">Mode:</span>
            {["EN2LT","LT2EN"].map(m=>(
              <button key={m} onClick={()=>setDirection(m)} className={cn("px-2 py-1 rounded-md text-xs border", direction===m?"bg-emerald-600 border-emerald-600":"bg-zinc-900 border-zinc-700")}>
                {m==="EN2LT"?"EN→LT":"LT→EN"}
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-300">Sort RAG first:</div>
          <div className="flex items-center gap-1">
            {["","🔴","🟠","🟢"].map((x,i)=>(
              <button key={i} onClick={()=>setRagPriority(x)} className={cn("px-2 py-1 rounded-md text-xs border", ragPriority===x?"bg-emerald-600 border-emerald-600":"bg-zinc-900 border-zinc-700")}>
                {x||"All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs (for browsing only) */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sticky top-[78px] bg-zinc-950/90 backdrop-blur z-10 border-b border-zinc-900">
        {["Phrases","Questions","Words"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={cn("mr-2 mb-2 px-3 py-1.5 rounded-full text-sm border", tab===t?"bg-emerald-600 border-emerald-600":"bg-zinc-900 border-zinc-800")}>{t}</button>
        ))}
      </div>

      {/* Lists */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
        {["🔴","🟠","🟢",""].map(key=>{
          const items = filtered.filter(r=>normalizeRag(r["RAG Icon"])===(key||""));
          return (
            <div key={key||"none"} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">{key||"⬤"}</span>
                <div className="text-sm text-zinc-400">{items.length} item(s)</div>
              </div>
              <div className="space-y-2">
                {items.map(r=>{
                  const idx=rows.indexOf(r);
                  const isEditing=editIdx===idx;
                  const primary=primaryOf(r);
                  const secondary=secondaryOf(r);
                  return (
                    <div key={`${r.English}-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                      {!isEditing ? (
                        <div className="flex items-start gap-2">
                          <button {...attachPressHandlers(primary)} className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition flex items-center justify-center font-semibold" title="Tap: play (85%) • Long‑press: 65%">►</button>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-zinc-400 truncate">{secondary}</div>
                            <div className="text-lg leading-tight font-medium break-words">{primary}</div>
                            {(r.Phonetic||r.Usage||r.Notes)&&(
                              <div className="mt-1 text-xs text-zinc-500 space-y-1">
                                {r.Phonetic&&<div className="text-zinc-400">{r.Phonetic}</div>}
                                {r.Usage&&<div>{r.Usage}</div>}
                                {r.Notes&&<div className="opacity-80">{r.Notes}</div>}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button onClick={()=>startEdit(idx)} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">Edit</button>
                            <button onClick={()=>remove(idx)} className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md">Del</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                            <label className="col-span-2">English
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.English} onChange={(e)=>setEditDraft({...editDraft,English:e.target.value})}/>
                            </label>
                            <label className="col-span-2">Lithuanian
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Lithuanian} onChange={(e)=>setEditDraft({...editDraft,Lithuanian:e.target.value})}/>
                            </label>
                            <label>Phonetic
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Phonetic} onChange={(e)=>setEditDraft({...editDraft,Phonetic:e.target.value})}/>
                            </label>
                            <label>Category
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Category} onChange={(e)=>setEditDraft({...editDraft,Category:e.target.value})}/>
                            </label>
                            <label className="col-span-2">Usage
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Usage} onChange={(e)=>setEditDraft({...editDraft,Usage:e.target.value})}/>
                            </label>
                            <label className="col-span-2">Notes
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Notes} onChange={(e)=>setEditDraft({...editDraft,Notes:e.target.value})}/>
                            </label>
                            <label>RAG
                              <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft["RAG Icon"]} onChange={(e)=>setEditDraft({...editDraft,"RAG Icon":normalizeRag(e.target.value)})}>{"🔴 🟠 🟢".split(" ").map(x=><option key={x} value={x}>{x}</option>)}</select>
                            </label>
                            <label>Sheet
                              <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Sheet} onChange={(e)=>setEditDraft({...editDraft,Sheet:e.target.value})}>{["Phrases","Questions","Words"].map(s=><option key={s} value={s}>{s}</option>)}</select>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>saveEdit(idx)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold">Save</button>
                            <button onClick={cancelEdit} className="bg-zinc-800 px-3 py-2 rounded-md text-sm">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
            {/* Top bar: progress + Quit */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex-1 mr-2">
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Question {quizCursor+1}/{quizItems.length}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded">
                  <div className="h-1.5 bg-emerald-500 rounded" style={{width: `${((quizCursor)/Math.max(1,quizItems.length))*100}%`}} />
                </div>
              </div>
              <button onClick={quitQuiz} className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 hover:bg-zinc-700" title="Quit quiz">Quit</button>
            </div>

            {/* Prompt + Hear LT */}
            {(()=>{ 
              const item=quizItems[quizCursor];
              if(!item) return null;
              const row=rows[item.rowIdx];
              return (
                <>
                  <div className="text-sm text-zinc-400 mb-1">Prompt</div>
                  <div className="text-lg font-medium mb-2 break-words">{item.prompt}</div>
                  <button
                    className="mb-3 text-xs px-3 py-1 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                    onClick={()=> playText(rows[item.rowIdx].Lithuanian, {slow:false})}
                    title="Hear Lithuanian"
                  >
                    🔊 Hear Lithuanian
                  </button>
                </>
              );
            })()}

            {/* Choices */}
            <div className="space-y-2">
              {quizItems[quizCursor]?.choices.map((c,i)=>{
                const base="w-full text-left px-3 py-2 rounded-md border";
                const state = !answered
                  ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                  : i===correctIdx
                    ? "bg-emerald-700 border-emerald-600"
                    : i===selectedIdx && !wasCorrect
                      ? "bg-red-800 border-red-600"
                      : "bg-zinc-800 border-zinc-700 opacity-70";
                return (
                  <button
                    key={i}
                    onClick={()=>{ if(!answered) { /* first click */ } answerChoice(i); }}
                    disabled={answered}
                    className={`${base} ${state}`}
                  >
                    {c.text}
                  </button>
                );
              })}
            </div>

            {/* Feedback + Next */}
            <div className="mt-4 flex items-center justify-between">
              {answered ? (
                <div className={cn("text-xs px-2 py-1 rounded-md border",
                  wasCorrect ? "bg-emerald-900/40 border-emerald-600 text-emerald-300"
                             : "bg-red-900/40 border-red-600 text-red-300"
                )}>
                  {wasCorrect ? "Correct ✅" : "Incorrect ❌"}
                </div>
              ) : <div />}

              {answered ? (
                <button className="text-sm px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500" onClick={nextQuestion}>
                  {quizCursor+1>=quizItems.length ? "Finish" : "Next Question →"}
                </button>
              ) : (
                <button className="text-sm px-3 py-1 rounded-md bg-zinc-800 opacity-60 cursor-not-allowed">
                  Next Question
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FINISH MODAL */}
      {finishOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-2xl font-semibold mb-1">👏 Well done!</div>
            <div className="text-sm text-zinc-300 mb-4">You scored <span className="font-semibold">{score}</span> / 10</div>
            <div className="text-xs text-zinc-400 mb-4">
              {stats.lastCompletedDay === todayDays()
                ? "Streak updated for today. Keep it going tomorrow."
                : "Streak will update the next time you complete a set."}
            </div>
            <button className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500" onClick={()=>setFinishOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <details>
            <summary className="cursor-pointer text-sm text-zinc-300">+ Add entry</summary>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="English" value={draft.English} onChange={(e)=>setDraft({...draft,English:e.target.value})}/>
              <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Lithuanian" value={draft.Lithuanian} onChange={(e)=>setDraft({...draft,Lithuanian:e.target.value})}/>
              <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Phonetic" value={draft.Phonetic} onChange={(e)=>setDraft({...draft,Phonetic:e.target.value})}/>
              <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Category" value={draft.Category} onChange={(e)=>setDraft({...draft,Category:e.target.value})}/>
              <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Usage" value={draft.Usage} onChange={(e)=>setDraft({...draft,Usage:e.target.value})}/>
              <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Notes" value={draft.Notes} onChange={(e)=>setDraft({...draft,Notes:e.target.value})}/>
              <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft["RAG Icon"]} onChange={(e)=>setDraft({...draft,"RAG Icon":normalizeRag(e.target.value)})}>{"🔴 🟠 🟢".split(" ").map(x=><option key={x} value={x}>{x}</option>)}</select>
              <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft.Sheet} onChange={(e)=>setDraft({...draft,Sheet:e.target.value})}>{["Phrases","Questions","Words"].map(s=><option key={s} value={s}>{s}</option>)}</select>
              <button onClick={addRow} className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold">Add</button>
            </div>
          </details>
        </div>
      </div>

      {/* Settings (unchanged from previous) */}
      {settingsOpen && (
        <SettingsModal
          close={()=>setSettingsOpen(false)}
          ttsProvider={ttsProvider} setTtsProvider={setTtsProvider}
          elevenKey={elevenKey} setElevenKey={setElevenKey}
          elevenVoiceId={elevenVoiceId} setElevenVoiceId={setElevenVoiceId}
          elevenVoiceName={elevenVoiceName} setElevenVoiceName={setElevenVoiceName}
          elevenVoices={elevenVoices} setElevenVoices={setElevenVoices}
          azureKey={azureKey} setAzureKey={setAzureKey}
          azureRegion={azureRegion} setAzureRegion={setAzureRegion}
          azureVoiceShortName={azureVoiceShortName} setAzureVoiceShortName={setAzureVoiceShortName}
          azureVoices={azureVoices} setAzureVoices={setAzureVoices}
        />
      )}
    </div>
  );
}

/* Settings modal */
function SettingsModal(props){
  const {
    close, ttsProvider,setTtsProvider,
    elevenKey,setElevenKey, elevenVoiceId,setElevenVoiceId, elevenVoiceName,setElevenVoiceName, elevenVoices,setElevenVoices,
    azureKey,setAzureKey, azureRegion,setAzureRegion, azureVoiceShortName,setAzureVoiceShortName, azureVoices,setAzureVoices
  }=props;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[92%] max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
        <div className="text-lg font-semibold mb-2">Settings</div>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs mb-1">Voice provider</div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2"><input type="radio" name="ttsprov" checked={ttsProvider==="browser"} onChange={()=>setTtsProvider("browser")} /> Browser</label>
              <label className="flex items-center gap-2"><input type="radio" name="ttsprov" checked={ttsProvider==="elevenlabs"} onChange={()=>setTtsProvider("elevenlabs")} /> ElevenLabs</label>
              <label className="flex items-center gap-2"><input type="radio" name="ttsprov" checked={ttsProvider==="azure"} onChange={()=>setTtsProvider("azure")} /> Azure Speech</label>
            </div>
          </div>

          {ttsProvider==="elevenlabs" && (
            <div className="space-y-2">
              <div>
                <div className="text-xs mb-1">ElevenLabs API Key</div>
                <input type="password" value={elevenKey} onChange={(e)=>setElevenKey(e.target.value)} placeholder="paste your xi-api-key" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"/>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-xs mb-1">Voice</div>
                  <select className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2" value={elevenVoiceId} onChange={(e)=>{ const v=elevenVoices.find(vv=>vv.id===e.target.value); setElevenVoiceId(e.target.value); setElevenVoiceName(v?.name||""); }}>
                    <option value="">— choose —</option>
                    {elevenVoices.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <button onClick={async()=>{ try{ const vs=await fetchElevenVoicesHTTP(elevenKey); props.setElevenVoices(vs); if(!elevenVoiceId&&vs.length){ setElevenVoiceId(vs[0].id); setElevenVoiceName(vs[0].name);} } catch(e){ alert(e.message);} }} className="bg-zinc-800 px-3 py-2 rounded-md">Fetch</button>
              </div>
            </div>
          )}

          {ttsProvider==="azure" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-xs mb-1">Subscription Key</div><input type="password" value={azureKey} onChange={(e)=>setAzureKey(e.target.value)} placeholder="Azure key" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"/></div>
                <div><div className="text-xs mb-1">Region</div><input value={azureRegion} onChange={(e)=>setAzureRegion(e.target.value)} placeholder="e.g. westeurope" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"/></div>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-xs mb-1">Voice</div>
                  <select className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2" value={azureVoiceShortName} onChange={(e)=>setAzureVoiceShortName(e.target.value)}>
                    <option value="">— choose —</option>
                    {azureVoices.map(v=><option key={v.shortName} value={v.shortName}>{v.displayName} ({v.shortName})</option>)}
                  </select>
                </div>
                <button onClick={async()=>{ try{ const vs=await fetchAzureVoicesHTTP(azureKey,azureRegion); props.setAzureVoices(vs); if(!azureVoiceShortName&&vs.length) setAzureVoiceShortName(vs[0].shortName);} catch(e){ alert(e.message);} }} className="bg-zinc-800 px-3 py-2 rounded-md">Fetch</button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="bg-emerald-600 px-3 py-2 rounded-md">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
