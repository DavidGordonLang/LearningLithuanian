import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — Gameified (client-only)
 * - Multiple-choice Quiz (no typing)
 * - XP, streak, daily goal, combo
 * - Spaced repetition (light)
 * - Long-press "savor" playback (slow): Azure SSML prosody + browser rate
 * - Works with Browser, ElevenLabs, Azure TTS providers
 * - Direction toggle EN→LT / LT→EN respected in quiz and playback
 */

/* -------------------- KEYS & CONSTANTS -------------------- */
const LS_KEY = "lt_phrasebook_v2";
const LSK_TTS_PROVIDER = "lt_tts_provider"; // 'browser' | 'elevenlabs' | 'azure'
const LSK_ELEVEN_KEY = "lt_eleven_key";
const LSK_ELEVEN_VOICE = "lt_eleven_voice"; // {id,name}
const LSK_USAGE = "lt_eleven_usage_v1";     // {month:"YYYY-MM", requests:number}
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice";   // {shortName}
const LSK_STATS = "lt_gamestats_v1";

/* -------------------- BASIC HELPERS -------------------- */
const saveData = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows));
const loadData = () => {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
};

const monthKey = () => new Date().toISOString().slice(0,7);
const loadUsage = () => {
  try { const u = JSON.parse(localStorage.getItem(LSK_USAGE)||"null"); 
        if (!u || u.month!==monthKey()) return { month: monthKey(), requests: 0 }; 
        return u;
  } catch { return { month: monthKey(), requests: 0 }; }
};
const saveUsage = (u)=>localStorage.setItem(LSK_USAGE, JSON.stringify(u));

function normalizeRag(icon="") {
  const s = String(icon).trim();
  const low = s.toLowerCase();
  if (["🔴","🟥","red"].includes(s)||low==="red") return "🔴";
  if (["🟠","🟧","🟨","🟡"].includes(s) || ["amber","orange","yellow"].includes(low)) return "🟠";
  if (["🟢","🟩","green"].includes(s)||low==="green") return "🟢";
  return "";
}
const cn = (...xs)=>xs.filter(Boolean).join(" ");
const todayDays = ()=>Math.floor(Date.now()/86400000);
const now = ()=>Date.now();

/* -------------------- XLSX (UMD) -------------------- */
async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  const urls = [
    "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.19.3/xlsx.full.min.js",
    "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js",
    "https://unpkg.com/xlsx@0.19.3/dist/xlsx.full.min.js",
  ];
  let lastErr;
  for (const src of urls) {
    try {
      await new Promise((res, rej)=>{
        const s=document.createElement("script");
        s.src=src; s.async=true; s.onload=()=>res(); s.onerror=(e)=>rej(e);
        document.head.appendChild(s);
      });
      if (window.XLSX) return window.XLSX;
    } catch(e){ lastErr=e; }
  }
  throw lastErr || new Error("Failed to load XLSX");
}
async function importXlsx(file) {
  const XLSX = await loadXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf,{type:"array"});
  const merged=[]; const tabs=new Set(["Phrases","Questions","Words"]);
  for (const name of wb.SheetNames) {
    const ws=wb.Sheets[name]; if(!ws) continue;
    const json=XLSX.utils.sheet_to_json(ws,{defval:""});
    for (const r of json) {
      const row = {
        English: r.English ?? r.english ?? "",
        Lithuanian: r.Lithuanian ?? r.lithuanian ?? "",
        Phonetic: r.Phonetic ?? r.phonetic ?? "",
        Category: r.Category ?? r.category ?? "",
        Usage: r.Usage ?? r.usage ?? "",
        Notes: r.Notes ?? r.notes ?? "",
        "RAG Icon": normalizeRag(r["RAG Icon"] ?? r.RAG ?? r.rag ?? ""),
        Sheet: tabs.has(name) ? name : r.Sheet || "Phrases",
        ease: 2.5, intervalDays: 0, due: 0, correctStreak: 0,
      };
      if (row.English || row.Lithuanian) merged.push(row);
    }
  }
  return merged;
}
function exportJson(rows) {
  const blob = new Blob([JSON.stringify(rows,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="lt-phrasebook.json"; a.click();
  URL.revokeObjectURL(url);
}

/* -------------------- VOICES -------------------- */
function useVoices() {
  const [voices,setVoices]=useState([]);
  useEffect(()=>{
    function refresh(){
      const v = window.speechSynthesis?.getVoices?.() || [];
      const sorted=[...v].sort((a,b)=>{
        const aLt=(a.lang||"").toLowerCase().startsWith("lt");
        const bLt=(b.lang||"").toLowerCase().startsWith("lt");
        if(aLt&&!bLt) return -1; if(bLt&&!aLt) return 1; return a.name.localeCompare(b.name);
      });
      setVoices(sorted);
    }
    refresh();
    window.speechSynthesis?.addEventListener?.("voiceschanged",refresh);
    return ()=>window.speechSynthesis?.removeEventListener?.("voiceschanged",refresh);
  },[]);
  return voices;
}
function speakBrowser(text, voice, rate=1){
  if(!window.speechSynthesis){ alert("Speech synthesis not supported."); return; }
  const u = new SpeechSynthesisUtterance(text);
  if(voice) u.voice=voice; u.lang=voice?.lang||"lt-LT"; u.rate=rate;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}
// ElevenLabs
async function fetchElevenVoicesHTTP(key){
  const res=await fetch("https://api.elevenlabs.io/v1/voices",{headers:{"xi-api-key":key}});
  if(!res.ok) throw new Error("Failed to fetch voices");
  const data=await res.json();
  return (data.voices||[]).map(v=>({id:v.voice_id,name:v.name}));
}
async function speakElevenLabsHTTP(text, voiceId, key){
  const res=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,{
    method:"POST",
    headers:{ "xi-api-key":key,"Content-Type":"application/json", Accept:"audio/mpeg" },
    body: JSON.stringify({
      text, model_id:"eleven_multilingual_v2",
      voice_settings:{stability:0.4, similarity_boost:0.7, style:0.2, use_speaker_boost:true},
    }),
  });
  if(!res.ok) throw new Error("ElevenLabs TTS failed: "+res.status+" "+res.statusText);
  const blob=await res.blob(); return URL.createObjectURL(blob);
}
// Azure
async function fetchAzureVoicesHTTP(key, region){
  const url=`https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
  const res=await fetch(url,{headers:{"Ocp-Apim-Subscription-Key":key}});
  if(!res.ok) throw new Error("Failed to fetch Azure voices");
  const data=await res.json();
  return data.map(v=>({ shortName:v.ShortName, locale:v.Locale, displayName:v.LocalName||v.FriendlyName||v.ShortName }));
}
async function speakAzureHTTP(text, shortName, key, region, ratePercent="100%"){
  const url=`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = `<speak version="1.0" xml:lang="lt-LT"><voice name="${shortName}"><prosody rate="${ratePercent}">${escapeXml(text)}</prosody></voice></speak>`;
  const res=await fetch(url,{
    method:"POST",
    headers:{
      "Ocp-Apim-Subscription-Key":key,
      "Content-Type":"application/ssml+xml",
      "X-Microsoft-OutputFormat":"audio-24khz-48kbitrate-mono-mp3",
    },
    body:ssml,
  });
  if(!res.ok) throw new Error("Azure TTS failed: "+res.status+" "+res.statusText);
  const blob=await res.blob(); return URL.createObjectURL(blob);
}
function escapeXml(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

/* -------------------- GAME STATS -------------------- */
const defaultStats = ()=>({
  xp: 0,
  dailyGoal: 100,
  lastDay: todayDays(),
  streak: 0,
  dailyXP: 0,
  combo: 0,
  badges: {}
});
function loadStats(){
  try{
    const s=JSON.parse(localStorage.getItem(LSK_STATS)||"null");
    return s ? rolloverIfNeeded(s) : defaultStats();
  }catch{ return defaultStats(); }
}
function saveStats(s){ localStorage.setItem(LSK_STATS, JSON.stringify(s)); }
function rolloverIfNeeded(s){
  const d=todayDays();
  if(s.lastDay!==d){
    if(s.dailyXP>=s.dailyGoal) s.streak = (s.streak||0)+1;
    else s.streak = 0;
    s.dailyXP=0; s.combo=0; s.lastDay=d;
  }
  return s;
}
function addXP(s, amount){
  s.xp += amount;
  s.dailyXP += amount;
  s.combo = Math.min(10, (s.combo||0)+1);
}

/* -------------------- SPACED REP -------------------- */
function ensureSR(row){
  if(row.ease==null) row.ease=2.5;
  if(row.intervalDays==null) row.intervalDays=0;
  if(row.due==null) row.due=0;
  if(row.correctStreak==null) row.correctStreak=0;
  return row;
}
function schedule(result, row){
  ensureSR(row);
  const td = todayDays();
  if(result==="correct"){
    row.ease = Math.max(1.3, row.ease + 0.1);
    row.intervalDays = row.intervalDays ? Math.round(row.intervalDays * row.ease) : 1;
    row.correctStreak = (row.correctStreak||0)+1;
  } else {
    row.ease = Math.max(1.3, row.ease - 0.2);
    row.intervalDays = 0;
    row.correctStreak = 0;
  }
  row.due = (td + row.intervalDays) * 86400000;
  // auto RAG glide
  if (row.correctStreak>=3 && row["RAG Icon"]==="🟠") row["RAG Icon"]="🟢";
  if (result==="wrong" && row["RAG Icon"]==="🟢") row["RAG Icon"]="🟠";
}

/* -------------------- MAIN APP -------------------- */
export default function App(){
  const fileRef = useRef(null);
  const longPressRef = useRef(null); // <-- single declaration here

  const [rows, setRows] = useState(loadData().map(ensureSR));
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState("EN2LT"); // EN2LT | LT2EN

  const [ttsProvider, setTtsProvider] = useState(()=>localStorage.getItem(LSK_TTS_PROVIDER)||"browser");
  const [voiceName, setVoiceName] = useState("");

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
  const [quizFirstTry,setQuizFirstTry]=useState(true);
  const [confirmClear,setConfirmClear]=useState(false);
  const [ragPriority,setRagPriority]=useState("");

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* voices */
  const voices=useVoices();
  const voice = useMemo(
    ()=>voices.find(v=>v.name===voiceName) || voices.find(v=>(v.lang||"").toLowerCase().startsWith("lt")) || voices[0],
    [voices,voiceName]
  );

  /* persist core stuff */
  useEffect(()=>saveData(rows),[rows]);
  useEffect(()=>localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider),[ttsProvider]);
  useEffect(()=>{ if(elevenKey) localStorage.setItem(LSK_ELEVEN_KEY, elevenKey); },[elevenKey]);
  useEffect(()=>{ localStorage.setItem(LSK_ELEVEN_VOICE, JSON.stringify({id:elevenVoiceId,name:elevenVoiceName})); },[elevenVoiceId,elevenVoiceName]);
  useEffect(()=>saveUsage(usage),[usage]);
  useEffect(()=>{ if(azureKey) localStorage.setItem(LSK_AZURE_KEY, azureKey); },[azureKey]);
  useEffect(()=>{ if(azureRegion) localStorage.setItem(LSK_AZURE_REGION, azureRegion); },[azureRegion]);
  useEffect(()=>{ localStorage.setItem(LSK_AZURE_VOICE, JSON.stringify({shortName:azureVoiceShortName})); },[azureVoiceShortName]);
  useEffect(()=>saveStats(stats),[stats]);

  /* filtering & grouping */
  const filtered = useMemo(()=>{
    return rows
      .filter(r=>r.Sheet===tab)
      .filter(r=>{
        if(!q) return true;
        const hay = `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
  },[rows,tab,q]);

  const groups = useMemo(()=>{
    const buckets={"🔴":[],"🟠":[],"🟢":[],"":[]};
    for(const r of filtered) buckets[normalizeRag(r["RAG Icon"])||""].push(r);
    const order=["🔴","🟠","🟢",""];
    const keys = ragPriority && order.includes(ragPriority) ? [ragPriority,...order.filter(x=>x!==ragPriority)] : order;
    return keys.map(k=>({key:k, items:buckets[k]}));
  },[filtered,ragPriority]);

  /* text by mode */
  const primaryOf = (r)=> direction==="EN2LT" ? r.Lithuanian : r.English;
  const secondaryOf = (r)=> direction==="EN2LT" ? r.English : r.Lithuanian;

  /* -------------------- PLAYBACK (tap = normal, long-press = slow) -------------------- */
  async function playText(text, {slow=false}={}){
    try{
      if(ttsProvider==="elevenlabs" && elevenKey && elevenVoiceId){
        setUsage(u=>({ ...((u.month===monthKey())?u:{month:monthKey(),requests:0}), requests:(u.requests||0)+1 }));
        const url=await speakElevenLabsHTTP(text, elevenVoiceId, elevenKey);
        const audio=new Audio(url); audio.onended=()=>URL.revokeObjectURL(url); await audio.play();
      } else if(ttsProvider==="azure" && azureKey && azureRegion && azureVoiceShortName){
        const rate = slow ? "80%" : "100%";
        const url=await speakAzureHTTP(text, azureVoiceShortName, azureKey, azureRegion, rate);
        const audio=new Audio(url); audio.onended=()=>URL.revokeObjectURL(url); await audio.play();
      } else {
        speakBrowser(text, voice, slow ? 0.85 : 1);
      }
    }catch(e){ console.error(e); alert("Voice error: "+(e?.message||e)); }
  }
  function attachPressHandlers(text){
    return {
      onMouseDown: ()=>{ longPressRef.current = setTimeout(()=>{ playText(text,{slow:true}); longPressRef.current="played"; }, 500); },
      onMouseUp: ()=>{ if(longPressRef.current && longPressRef.current!=="played"){ clearTimeout(longPressRef.current); playText(text,{slow:false}); } longPressRef.current=null; },
      onMouseLeave: ()=>{ if(longPressRef.current && longPressRef.current!=="played"){ clearTimeout(longPressRef.current); } longPressRef.current=null; },
      onTouchStart: ()=>{ longPressRef.current = setTimeout(()=>{ playText(text,{slow:true}); longPressRef.current="played"; }, 500); },
      onTouchEnd: ()=>{ if(longPressRef.current && longPressRef.current!=="played"){ clearTimeout(longPressRef.current); playText(text,{slow:false}); } longPressRef.current=null; },
    };
  }

  /* -------------------- EDIT/DELETE -------------------- */
  const [editIdx,setEditIdx]=useState(null);
  const [editDraft,setEditDraft]=useState(null);
  function startEdit(i){ setEditIdx(i); setEditDraft({...rows[i]}); }
  function saveEdit(i){
    const clean={...editDraft, "RAG Icon": normalizeRag(editDraft["RAG Icon"])};
    ensureSR(clean);
    setRows(prev=>prev.map((r,idx)=>idx===i?clean:r));
    setEditIdx(null);
  }
  function cancelEdit(){ setEditIdx(null); }
  function remove(i){
    if(!confirm("Delete this entry?")) return;
    setRows(prev=>prev.filter((_,idx)=>idx!==i));
  }

  /* -------------------- IMPORT / CLEAR -------------------- */
  async function onImportFile(e){
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const newRows = await importXlsx(f);
      setRows(newRows.map(ensureSR));
      setTab("Phrases"); setQ("");
    }catch(err){ console.error(err); alert("Failed to import .xlsx (see console)"); }
    finally{ e.target.value=""; }
  }
  function clearAll(){
    if(!confirmClear){ setConfirmClear(true); setTimeout(()=>setConfirmClear(false),3000); return; }
    localStorage.removeItem(LS_KEY);
    setRows([]); setQ(""); setTab("Phrases"); setConfirmClear(false);
  }

  /* -------------------- QUIZ (multiple-choice) -------------------- */
  function shuffle(a){ const arr=[...a]; for(let i=arr.length-1;i>0;i--){const j=(Math.random()*(i+1))|0; [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
  function pickQuizSet(){
    const due = rows.map((r,idx)=>({r,idx})).filter(({r})=> (r.due && r.due<=now()));
    const byRag = (emoji)=> rows.map((r,idx)=>({r,idx})).filter(x=>normalizeRag(x.r["RAG Icon"])===emoji);
    const pool = [...due, ...byRag("🔴"), ...byRag("🟠"), ...byRag("🟢")];
    const uniq = []; const seen=new Set();
    for (const x of pool){ if(!seen.has(x.idx)){ uniq.push(x); seen.add(x.idx); } }
    const pick = uniq.slice(0,10);
    const items = pick.map(({r,idx})=>{
      const same = rows.filter((x,i)=> i!==idx && (x.Sheet===r.Sheet || (x.Category && x.Category===r.Category)));
      const shuffled = shuffle(same).slice(0,3);
      const correctText = primaryOf(r);
      const wrongs = shuffled.map(x=>primaryOf(x)).filter(t=>t && t!==correctText);
      const choices = shuffle([{text:correctText, isCorrect:true}, ...wrongs.slice(0,3).map(t=>({text:t,isCorrect:false}))]);
      const prompt = secondaryOf(r);
      return { rowIdx:idx, choices, prompt };
    }).filter(x=> x.choices.length>=2);
    return items;
  }
  function startQuiz(){
    const items = pickQuizSet();
    if(!items.length){ alert("Nothing to review. Try adding items or changing tab."); return; }
    setQuizItems(items); setQuizCursor(0); setQuizFirstTry(true); setQuizOpen(true);
  }
  function answerChoice(isCorrect){
    const current = quizItems[quizCursor];
    const idx = current.rowIdx;
    setRows(prev=>{
      const copy=[...prev]; schedule(isCorrect ? "correct":"wrong", copy[idx]); return copy;
    });
    setStats(prev=>{
      const s=rolloverIfNeeded({...prev});
      const base = isCorrect ? (quizFirstTry?10:5) : 0;
      const bonus = direction==="LT2EN" ? 1 : 0;
      const comboBoost = Math.min(5, Math.floor((s.combo||0)/3));
      addXP(s, base+bonus+comboBoost);
      if(!isCorrect) s.combo=0;
      return {...s};
    });
    if(isCorrect || !quizFirstTry){
      const next = quizCursor+1;
      if(next>=quizItems.length){ setQuizOpen(false); }
      else { setQuizCursor(next); setQuizFirstTry(true); }
    } else {
      setQuizFirstTry(false);
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-[180px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">LT</div>
            <div className="leading-tight">
              <div className="text-lg font-semibold">Lithuanian Trainer</div>
              <div className="text-xs text-zinc-400">Tap to play. Long‑press to savor.</div>
            </div>
          </div>

          {/* Voice + XP/Streak */}
          <div className="flex items-center gap-2">
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={voiceName}
              onChange={(e)=>setVoiceName(e.target.value)}
              disabled={ttsProvider!=="browser"}
              title={ttsProvider==="browser" ? "Browser voice" : "Using cloud voice"}
            >
              <option value="">Auto voice</option>
              {useVoices().map(v=><option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>

            <div className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300">XP {stats.xp}</div>
            <div className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300">🔥 {stats.streak}</div>

            {ttsProvider==="elevenlabs" && (
              <div className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300">{usage.requests||0} plays</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImportFile} className="hidden" />
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

      {/* Tabs */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sticky top-[78px] bg-zinc-950/90 backdrop-blur z-10 border-b border-zinc-900">
        {["Phrases","Questions","Words"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={cn("mr-2 mb-2 px-3 py-1.5 rounded-full text-sm border", tab===t?"bg-emerald-600 border-emerald-600":"bg-zinc-900 border-zinc-800")}>{t}</button>
        ))}
      </div>

      {/* List */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
        {groups.map(({key,items})=>(
          <div key={key||"none"} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">{key||"⬤"}</span>
              <div className="text-sm text-zinc-400">{items.length} item(s)</div>
            </div>
            <div className="space-y-2">
              {items.map(r=>{
                const idx=rows.indexOf(r);
                const isEditing=editIdx===idx;
                const primary = direction==="EN2LT" ? r.Lithuanian : r.English;
                const secondary = direction==="EN2LT" ? r.English : r.Lithuanian;

                return (
                  <div key={`${r.English}-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                    {!isEditing ? (
                      <div className="flex items-start gap-2">
                        <button
                          {...attachPressHandlers(primary)}
                          className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition flex items-center justify-center font-semibold"
                          title="Tap: play • Long‑press: slow"
                        >►</button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-zinc-400 truncate">{secondary}</div>
                          <div className="text-lg leading-tight font-medium break-words">{primary}</div>
                          {(r.Phonetic || r.Usage || r.Notes) && (
                            <div className="mt-1 text-xs text-zinc-500 space-y-1">
                              {r.Phonetic && <div className="text-zinc-400">{r.Phonetic}</div>}
                              {r.Usage && <div>{r.Usage}</div>}
                              {r.Notes && <div className="opacity-80">{r.Notes}</div>}
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
                            <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft["RAG Icon"]} onChange={(e)=>setEditDraft({...editDraft,"RAG Icon":normalizeRag(e.target.value)})}>
                              {"🔴 🟠 🟢".split(" ").map(x=><option key={x} value={x}>{x}</option>)}
                            </select>
                          </label>
                          <label>Sheet
                            <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Sheet} onChange={(e)=>setEditDraft({...editDraft,Sheet:e.target.value})}>
                              {["Phrases","Questions","Words"].map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
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
        ))}
      </div>

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
            <div className="text-xs text-zinc-400 mb-1">Question {quizCursor+1}/{quizItems.length}</div>
            <div className="text-lg font-medium mb-3 break-words">{quizItems[quizCursor]?.prompt}</div>
            <div className="space-y-2">
              {quizItems[quizCursor]?.choices.map((c,i)=>(
                <button key={i} onClick={()=>answerChoice(c.isCorrect)} className="w-full text-left bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-md">
                  {c.text}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-xs text-zinc-400">XP today: {stats.dailyXP}/{stats.dailyGoal} • Combo x{(stats.combo||0)+1}</div>
              <button className="text-sm px-3 py-1 rounded-md bg-zinc-800" onClick={()=>setQuizOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS (provider + keys/voices) */}
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
          startQuiz={startQuiz}
        />
      )}
    </div>
  );
}

/* -------------------- SETTINGS MODAL -------------------- */
function SettingsModal(props){
  const {
    close, ttsProvider,setTtsProvider,
    elevenKey,setElevenKey, elevenVoiceId,setElevenVoiceId, elevenVoiceName,setElevenVoiceName, elevenVoices,setElevenVoices,
    azureKey,setAzureKey, azureRegion,setAzureRegion, azureVoiceShortName,setAzureVoiceShortName, azureVoices,setAzureVoices,
    startQuiz
  } = props;
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
                  <select className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2" value={elevenVoiceId} onChange={(e)=>{const v=elevenVoices.find(vv=>vv.id===e.target.value); setElevenVoiceId(e.target.value); setElevenVoiceName(v?.name||"");}}>
                    <option value="">— choose —</option>
                    {elevenVoices.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <button onClick={async()=>{ try{ const vs=await fetchElevenVoicesHTTP(elevenKey); setElevenVoices(vs); if(!elevenVoiceId&&vs.length){ setElevenVoiceId(vs[0].id); setElevenVoiceName(vs[0].name);} }catch(e){ alert(e.message);} }} className="bg-zinc-800 px-3 py-2 rounded-md">Fetch</button>
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
                <button onClick={async()=>{ try{ const vs=await fetchAzureVoicesHTTP(azureKey,azureRegion); setAzureVoices(vs); if(!azureVoiceShortName&&vs.length) setAzureVoiceShortName(vs[0].shortName);}catch(e){ alert(e.message);} }} className="bg-zinc-800 px-3 py-2 rounded-md">Fetch</button>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <button onClick={startQuiz} className="bg-emerald-600 px-3 py-2 rounded-md">Start Quiz</button>
            <button onClick={close} className="bg-zinc-800 px-3 py-2 rounded-md">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
