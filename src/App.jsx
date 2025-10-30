import React, {
  useEffect, useMemo, useRef, useState, forwardRef, memo,
  startTransition, useImperativeHandle, useSyncExternalStore
} from "react";
import Header from "./components/Header";
import EntryCard from "./components/EntryCard";
import AddForm from "./components/AddForm";
import SearchDock from "./components/SearchDock";
import { searchStore } from "./searchStore";

/* ----------------------------- constants ----------------------------- */
const LS_KEY = "lt_phrasebook_v3";
const LSK_TTS_PROVIDER = "lt_tts_provider";
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice";
const LSK_STREAK = "lt_quiz_streak_v1";
const LSK_XP = "lt_xp_v1";
const LSK_SORT = "lt_sort_v1";
const LSK_DIR = "lt_direction_v1";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
  LT2EN: "/data/starter_lt_to_en.json",
  COMBINED_OPTIONAL: "/data/starter_combined_dedup.json",
};

const LEVEL_STEP = 2500;
const XP_PER_CORRECT = 50;

/* ----------------------------- strings ----------------------------- */
const STR = { /* ——— unchanged: your EN2LT / LT2EN objects ——— */ };
// (For brevity here, keep the same STR content you pasted; not modified.)

/* ----------------------------- helpers (unchanged) ----------------------------- */
const saveRows = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows));
const loadRows = () => {
  try { const raw = localStorage.getItem(LS_KEY); const arr = raw ? JSON.parse(raw) : []; return Array.isArray(arr) ? arr : []; }
  catch { return []; }
};
const loadXP = () => {
  try { const v = Number(localStorage.getItem(LSK_XP) ?? "0"); return Number.isFinite(v) ? v : 0; }
  catch { return 0; }
};
const saveXP = (xp) => localStorage.setItem(LSK_XP, String(Number.isFinite(xp) ? xp : 0));
const todayKey = () => new Date().toISOString().slice(0, 10);
const loadStreak = () => {
  try { const s = JSON.parse(localStorage.getItem(LSK_STREAK) || "null"); return s && typeof s.streak === "number" ? s : { streak: 0, lastDate: "" }; }
  catch { return { streak: 0, lastDate: "" }; }
};
const saveStreak = (s) => localStorage.setItem(LSK_STREAK, JSON.stringify(s));

const nowTs = () => Date.now();
const genId = () => Math.random().toString(36).slice(2);
const cn = (...xs) => xs.filter(Boolean).join(" ");
function normalizeRag(icon = "") {
  const s = String(icon).trim().toLowerCase();
  if (["🔴", "red"].includes(icon) || s === "red") return "🔴";
  if (["🟠", "amber", "orange", "yellow"].includes(icon) ||
      ["amber", "orange", "yellow"].includes(s)) return "🟠";
  if (["🟢", "green"].includes(icon) || s === "green") return "🟢";
  return "🟠";
}
function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00"), b = new Date(d2 + "T00:00:00");
  return Math.round((b - a) / 86400000);
}
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]];} return a; }
function sample(arr,n){ if(!arr.length||n<=0)return[]; if(n>=arr.length)return shuffle(arr); const idxs=new Set(); while(idxs.size<n) idxs.add((Math.random()*arr.length)|0); return [...idxs].map(i=>arr[i]); }
function sim2(a="",b=""){ const s1=(a+"").toLowerCase().trim(); const s2=(b+"").toLowerCase().trim(); if(!s1||!s2) return 0; if(s1===s2) return 1; const grams=(s)=>{const g=[]; for(let i=0;i<s.length-1;i++) g.push(s.slice(i,i+2)); return g;}; const g1=grams(s1), g2=grams(s2); const map=new Map(); g1.forEach(x=>map.set(x,(map.get(x)||0)+1)); let inter=0; g2.forEach(x=>{ if(map.get(x)){ inter++; map.set(x,map.get(x)-1);} }); return (2*inter)/(g1.length+g2.length); }

/* ----------------------------- TTS (unchanged) ----------------------------- */
function useVoices(){
  const [voices,setVoices]=useState([]);
  useEffect(()=>{ const refresh=()=>{ const v=window.speechSynthesis?.getVoices?.()||[]; setVoices([...v].sort((a,b)=>a.name.localeCompare(b.name))); };
    refresh(); window.speechSynthesis?.addEventListener?.("voiceschanged",refresh);
    return ()=>window.speechSynthesis?.removeEventListener?.("voiceschanged",refresh);
  },[]); return voices;
}
function escapeXml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function speakBrowser(text,voice,rate=1){ if(!window.speechSynthesis){ alert("Speech synthesis not supported."); return; }
  window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); if(voice) u.voice=voice; u.lang=voice?.lang||"lt-LT"; u.rate=rate; window.speechSynthesis.speak(u); }
async function speakAzureHTTP(text, shortName, key, region, rateDelta="0%"){
  const url=`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml=`<speak version="1.0" xml:lang="lt-LT"><voice name="${shortName}"><prosody rate="${rateDelta}">${escapeXml(text)}</prosody></voice></speak>`;
  const res=await fetch(url,{method:"POST",headers:{"Ocp-Apim-Subscription-Key":key,"Content-Type":"application/ssml+xml","X-Microsoft-OutputFormat":"audio-24khz-48kbitrate-mono-mp3"},body:ssml});
  if(!res.ok) throw new Error("Azure TTS failed");
  const blob=await res.blob(); return URL.createObjectURL(blob);
}

/* ----------------------------- focus guard ----------------------------- */
function allowSearchBlurFor(ms=800){ window.__allowSearchBlurUntil=Date.now()+ms; }

/* ----------------------------- SearchBox (unchanged except sr-only label) ----------------------------- */
const SearchBox = memo(forwardRef(function SearchBox({ placeholder="Search…" }, ref){
  const composingRef=useRef(false);
  const inputRef=useRef(null);
  useImperativeHandle(ref,()=>inputRef.current);
  const flush=(value)=>{ startTransition(()=>searchStore.setRaw(value)); };

  useEffect(()=>{ const el=inputRef.current; if(!el) return; const raw=searchStore.getRaw();
    if(raw && el.value!==raw){ el.value=raw; try{ el.setSelectionRange(raw.length,raw.length);}catch{} } },[]);
  useEffect(()=>{ const onVis=()=>{ if(document.visibilityState!=="visible") return;
      const el=inputRef.current; if(!el) return; const raw=searchStore.getRaw(); if(raw && el.value!==raw) el.value=raw; };
    document.addEventListener("visibilitychange",onVis);
    return ()=>document.removeEventListener("visibilitychange",onVis);
  },[]);

  const refocusSafely=()=>{ const el=inputRef.current; if(!el) return;
    requestAnimationFrame(()=>{ if(document.activeElement!==el){ el.focus({preventScroll:true}); const len=el.value?.length??0; try{ el.setSelectionRange(len,len);}catch{} }});
  };

  return (
    <div className="relative flex-1">
      <label htmlFor="main-search" className="sr-only">Search phrases</label>
      <input
        id="main-search"
        ref={inputRef}
        defaultValue=""
        type="text"
        inputMode="search"
        enterKeyHint="search"
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
        onCompositionStart={()=>{composingRef.current=true;}}
        onCompositionEnd={(e)=>{composingRef.current=false; flush(e.currentTarget.value);}}
        onInput={(e)=>{ if(composingRef.current) return; flush(e.currentTarget.value); }}
        onBlur={(e)=>{ const until=window.__allowSearchBlurUntil||0; const allow=until>Date.now();
          const isClear=e.relatedTarget?.getAttribute?.("data-role")==="clear-btn";
          if(!allow && !isClear && !e.relatedTarget){ refocusSafely(); } }}
      />
      <button
        type="button" data-role="clear-btn" tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
        onMouseDown={(e)=>e.preventDefault()} onTouchStart={(e)=>e.preventDefault()}
        onClick={()=>{ const el=inputRef.current; if(el){ el.value=""; el.focus(); startTransition(()=>searchStore.clear()); }}}
        aria-label="Clear"
      >
        ×
      </button>
    </div>
  );
}));

/* ============================== APP ============================== */
export default function App(){
  // layout
  const [page,setPage]=useState("home");
  const [width,setWidth]=useState(()=>window.innerWidth);
  useEffect(()=>{ const onR=()=>setWidth(window.innerWidth); window.addEventListener("resize",onR); return ()=>window.removeEventListener("resize",onR); },[]);
  const WIDE = width>=1024;

  const HEADER_H = 56;
  const DOCK_H   = 112;

  // data + prefs
  const [rows,setRows]=useState(loadRows());
  useEffect(()=>saveRows(rows),[rows]);

  useEffect(()=>{ let changed=false;
    const migrated=rows.map(r=>{ if(!r._id||typeof r._id!=="string"){ changed=true; return {...r,_id:genId(),_ts:r._ts||nowTs()}; }
      return r; });
    if(changed) setRows(migrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const [tab,setTab]=useState("Phrases");

  const qFilter=useSyncExternalStore(searchStore.subscribe,searchStore.getSnapshot,searchStore.getServerSnapshot);

  const [sortMode,setSortMode]=useState(()=>localStorage.getItem(LSK_SORT)||"RAG");
  useEffect(()=>localStorage.setItem(LSK_SORT,sortMode),[sortMode]);

  const [direction,setDirection]=useState(()=>localStorage.getItem(LSK_DIR)||"EN2LT");
  useEffect(()=>localStorage.setItem(LSK_DIR,direction),[direction]);
  const T = STR[direction];

  const [xp,setXp]=useState(loadXP());
  useEffect(()=>saveXP(xp),[xp]);
  useEffect(()=>{ if(!Number.isFinite(xp)) setXp(0); },[]);
  const level = Math.floor((Number.isFinite(xp)?xp:0)/LEVEL_STEP)+1;
  const levelProgress = (Number.isFinite(xp)?xp:0) % LEVEL_STEP;

  const [streak,setStreak]=useState(loadStreak());
  useEffect(()=>saveStreak(streak),[streak]);

  // TTS
  const [ttsProvider,setTtsProvider]=useState(()=>localStorage.getItem(LSK_TTS_PROVIDER)||"azure");
  useEffect(()=>localStorage.setItem(LSK_TTS_PROVIDER,ttsProvider),[ttsProvider]);
  const [azureKey,setAzureKey]=useState(()=>localStorage.getItem(LSK_AZURE_KEY)||"");
  const [azureRegion,setAzureRegion]=useState(()=>localStorage.getItem(LSK_AZURE_REGION)||"");
  const [azureVoices,setAzureVoices]=useState([]);
  const [azureVoiceShortName,setAzureVoiceShortName]=useState(()=>{ try{
    return JSON.parse(localStorage.getItem(LSK_AZURE_VOICE)||"null")?.shortName||""; }catch{ return ""; }});
  useEffect(()=>{ if(azureKey !== null) localStorage.setItem(LSK_AZURE_KEY,azureKey); },[azureKey]);
  useEffect(()=>{ if(azureRegion !== null) localStorage.setItem(LSK_AZURE_REGION,azureRegion); },[azureRegion]);
  useEffect(()=>{ localStorage.setItem(LSK_AZURE_VOICE,JSON.stringify({shortName:azureVoiceShortName})); },[azureVoiceShortName]);

  const voices=useVoices();
  const [browserVoiceName,setBrowserVoiceName]=useState("");
  const browserVoice=useMemo(()=>voices.find(v=>v.name===browserVoiceName)||voices[0],[voices,browserVoiceName]);

  // ui
  const [expanded,setExpanded]=useState(new Set());
  const [editIdx,setEditIdx]=useState(null);
  const [editDraft,setEditDraft]=useState({ English:"", Lithuanian:"", Phonetic:"", Category:"", Usage:"", Notes:"", "RAG Icon":"🟠", Sheet:"Phrases" });

  // audio
  const audioRef=useRef(null);
  async function playText(text,{slow=false}={}){
    try{
      if(audioRef.current){
        try{ audioRef.current.pause(); const src=audioRef.current.src||""; if(src.startsWith("blob:")) URL.revokeObjectURL(src);}catch{}
        audioRef.current=null;
      }
      if(ttsProvider==="azure" && azureKey && azureRegion && azureVoiceShortName){
        const delta = slow ? "-40%" : "0%";
        const url=await speakAzureHTTP(text,azureVoiceShortName,azureKey,azureRegion,delta);
        const a=new Audio(url); audioRef.current=a;
        a.onended=()=>{ try{ URL.revokeObjectURL(url);}catch{} if(audioRef.current===a) audioRef.current=null; };
        await a.play();
      } else { speakBrowser(text,browserVoice,slow?0.6:1.0); }
    }catch(e){ console.error(e); alert("Voice error: "+(e?.message||e)); }
  }

  function pressHandlers(text){
    let timer=null, firedSlow=false, pressed=false;
    const start=(e)=>{ e.preventDefault(); e.stopPropagation();
      try{ allowSearchBlurFor(1200); const ae=document.activeElement; if(ae && typeof ae.blur==="function") ae.blur(); }catch{}
      firedSlow=false; pressed=true;
      timer=setTimeout(()=>{ if(!pressed) return; firedSlow=true; playText(text,{slow:true}); },550);
    };
    const finish=(e)=>{ e?.preventDefault?.(); e?.stopPropagation?.(); if(!pressed) return; pressed=false; if(timer) clearTimeout(timer); timer=null; if(!firedSlow) playText(text); };
    const cancel=(e)=>{ e?.preventDefault?.(); e?.stopPropagation?.(); pressed=false; if(timer) clearTimeout(timer); timer=null; };
    return { "data-press":"1", onPointerDown:start, onPointerUp:finish, onPointerLeave:cancel, onPointerCancel:cancel, onContextMenu:(e)=>e.preventDefault() };
  }

  useEffect(()=>{ const onPD=(e)=>{ const t=e.target, el=t instanceof Element ? t : null;
      const formy=el?.matches?.("input, textarea, select, [contenteditable=''], [contenteditable='true']");
      if(formy) allowSearchBlurFor(1000);
    };
    document.addEventListener("pointerdown",onPD,true);
    return ()=>document.removeEventListener("pointerdown",onPD,true);
  },[]);

  const qNorm=(qFilter||"").trim().toLowerCase();
  const entryMatchesQuery=(r)=>!!qNorm && (((r.English||"").toLowerCase().includes(qNorm)) || ((r.Lithuanian||"").toLowerCase().includes(qNorm)));
  const filtered=useMemo(()=>{ const base=qNorm ? rows.filter(entryMatchesQuery) : rows.filter((r)=>r.Sheet===tab);
    if(sortMode==="Newest") return [...base].sort((a,b)=>(b._ts||0)-(a._ts||0));
    if(sortMode==="Oldest") return [...base].sort((a,b)=>(a._ts||0)-(b._ts||0));
    const order={"🔴":0,"🟠":1,"🟢":2};
    return [...base].sort((a,b)=>(order[normalizeRag(a["RAG Icon"])]??1)-(order[normalizeRag(b["RAG Icon"])]??1));
  },[rows,qNorm,sortMode,tab]);

  function startEditRow(i){ setEditIdx(i); setEditDraft({...rows[i]}); }
  function saveEdit(i){ const clean={...editDraft,"RAG Icon":normalizeRag(editDraft["RAG Icon"])}; setRows(prev=>prev.map((r,idx)=>idx===i?clean:r)); setEditIdx(null); }
  function remove(i){ if(!confirm(STR[direction].confirm)) return; setRows(prev=>prev.filter((_,idx)=>idx!==i)); }

  async function mergeRows(newRows){
    const cleaned=newRows.map(r=>({ English:String(r.English||"").trim(), Lithuanian:String(r.Lithuanian||"").trim(),
      Phonetic:String(r.Phonetic||"").trim(), Category:String(r.Category||"").trim(), Usage:String(r.Usage||"").trim(),
      Notes:String(r.Notes||"").trim(), "RAG Icon":normalizeRag(r["RAG Icon"]||"🟠"),
      Sheet:["Phrases","Questions","Words","Numbers"].includes(r.Sheet)?r.Sheet:"Phrases", _id:r._id||genId(), _ts:r._ts||nowTs(),
      _qstat:r._qstat||{red:{ok:0,bad:0},amb:{ok:0,bad:0},grn:{ok:0,bad:0}} })).filter(r=>r.English||r.Lithuanian);
    setRows(prev=>[...cleaned,...prev]);
  }
  async function fetchStarter(kind){ try{ const url=STARTERS[kind]; if(!url) throw new Error("Starter not found");
      const res=await fetch(url); if(!res.ok) throw new Error("Failed to fetch starter"); await mergeRows(await res.json()); alert("Installed."); }
    catch(e){ alert("Starter error: "+e.message); } }
  async function installNumbersOnly(){
    const urls=[STARTERS.COMBINED_OPTIONAL,STARTERS.EN2LT,STARTERS.LT2EN].filter(Boolean); let found=[];
    for(const url of urls){ try{ const res=await fetch(url); if(!res.ok) continue; const data=await res.json(); if(Array.isArray(data)){ const nums=data.filter(r=>String(r.Sheet)==="Numbers"); found=found.concat(nums);} } catch{} }
    if(!found.length){ alert("No Numbers entries found in starter files."); return; }
    await mergeRows(found); alert(`Installed ${found.length} Numbers item(s).`);
  }
  async function importJsonFile(file){
    try{ const data=JSON.parse(await file.text()); if(!Array.isArray(data)) throw new Error("JSON must be an array"); await mergeRows(data); alert("Imported."); }
    catch(e){ alert("Import failed: "+e.message); }
  }
  function clearLibrary(){ if(!confirm(STR[direction].confirm)) return; setRows([]); }

  const [dupeResults,setDupeResults]=useState({exact:[],close:[]});
  function scanDupes(){
    const map=new Map();
    rows.forEach((r,i)=>{ const key=`${r.English}|||${r.Lithuanian}`.toLowerCase().trim(); map.set(key,(map.get(key)||[]).concat(i)); });
    const exact=[]; for(const arr of map.values()) if(arr.length>1) exact.push(arr);
    const close=[]; const bySheet=rows.reduce((acc,r,i)=>{ (acc[r.Sheet] ||= []).push({r,i}); return acc; },{});
    for(const list of Object.values(bySheet)){ for(let a=0;a<list.length;a++){ for(let b=a+1;b<list.length;b++){
      const A=list[a], B=list[b]; const s=(sim2(A.r.English,B.r.English)+sim2(A.r.Lithuanian,B.r.Lithuanian))/2; if(s>=0.85) close.push([A.i,B.i,s]); } } }
    setDupeResults({exact,close});
  }

  const [quizOn,setQuizOn]=useState(false);
  const [quizQs,setQuizQs]=useState([]);
  const [quizIdx,setQuizIdx]=useState(0);
  const [quizAnswered,setQuizAnswered]=useState(false);
  const [quizChoice,setQuizChoice]=useState(null);
  const [quizOptions,setQuizOptions]=useState([]);

  function computeQuizPool(allRows,targetSize=10){
    const withPairs=allRows.filter(r=>r.English&&r.Lithuanian);
    const red=withPairs.filter(r=>normalizeRag(r["RAG Icon"])==="🔴");
    const amb=withPairs.filter(r=>normalizeRag(r["RAG Icon"])==="🟠");
    const grn=withPairs.filter(r=>normalizeRag(r["RAG Icon"])==="🟢");
    const needR=Math.min(Math.max(5,Math.floor(targetSize*0.5)), red.length||0);
    const needA=Math.min(Math.max(4,Math.floor(targetSize*0.4)), amb.length||0);
    const needG=Math.min(Math.max(1,Math.floor(targetSize*0.1)), grn.length||0);
    let picked=[...sample(red,needR),...sample(amb,needA),...sample(grn,needG)];
    while(picked.length<targetSize){ const leftovers=withPairs.filter(r=>!picked.includes(r)); if(!leftovers.length) break; picked.push(leftovers[(Math.random()*leftovers.length)|0]); }
    return shuffle(picked).slice(0,targetSize);
  }
  function startQuiz(){
    if(rows.length<4) return alert("Add more entries first (need at least 4).");
    const pool=computeQuizPool(rows,10); if(!pool.length) return alert("No quiz candidates found.");
    setQuizQs(pool); setQuizIdx(0); setQuizAnswered(false); setQuizChoice(null);
    const first=pool[0];
    const correctLt=first.Lithuanian;
    const distractors=sample(pool.filter(r=>r!==first&&r.Lithuanian),3).map(r=>r.Lithuanian);
    setQuizOptions(shuffle([correctLt,...distractors])); setQuizOn(true);
  }
  function afterAnswerAdvance(){
    const nextIdx=quizIdx+1;
    if(nextIdx>=quizQs.length){
      const today=todayKey();
      if(streak.lastDate!==today){
        const inc=streak.lastDate && daysBetween(streak.lastDate,today)===1 ? streak.streak+1 : 1;
        setStreak({streak:inc,lastDate:today});
      }
      setQuizOn(false); return;
    }
    setQuizIdx(nextIdx); setQuizAnswered=false; setQuizChoice(null);
    const item=quizQs[nextIdx]; const correctLt=item.Lithuanian;
    const distractors=sample(quizQs.filter(r=>r!==item&&r.Lithuanian),3).map(r=>r.Lithuanian);
    setQuizOptions(shuffle([correctLt,...distractors]));
  }
  function bumpRagAfterAnswer(item,correct){
    const rag=normalizeRag(item["RAG Icon"]);
    const st=(item._qstat ||= { red:{ok:0,bad:0}, amb:{ok:0,bad:0}, grn:{ok:0,bad:0} });
    if(rag==="🔴"){
      if(correct){ st.red.ok=(st.red.ok||0)+1; if(st.red.ok>=5){ item["RAG Icon"]="🟠"; st.red.ok=st.red.bad=0; } }
      else { st.red.bad=(st.red.bad||0)+1; }
    } else if(rag==="🟠"){
      if(correct){ st.amb.ok=(st.amb.ok||0)+1; if(st.amb.ok>=5){ item["RAG Icon"]="🟢"; st.amb.ok=st.amb.bad=0; } }
      else { st.amb.bad=(st.amb.bad||0)+1; if(st.amb.bad>=3){ item["RAG Icon"]="🔴"; st.amb.ok=st.amb.bad=0; } }
    } else if(rag==="🟢"){
      if(!correct){ st.grn.bad=(st.grn.bad||0)+1; item["RAG Icon"]="🟠"; st.grn.ok=st.grn.bad=0; }
      else { st.grn.ok=(st.grn.ok||0)+1; }
    }
  }
  async function answerQuiz(option){
    if(quizAnswered) return;
    const item=quizQs[quizIdx]; const correct=option===item.Lithuanian;
    setQuizChoice(option); setQuizAnswered(true);
    if(correct) setXp(x=>(Number.isFinite(x)?x:0)+XP_PER_CORRECT);
    await playText(item.Lithuanian,{slow:false});
    setRows(prev=>prev.map(r=>{ if(r===item || (r._id&&item._id&&r._id===item._id)){ const clone={...r}; bumpRagAfterAnswer(clone,correct); return clone; } return r; }));
  }

  const [addOpen,setAddOpen]=useState(false);
  const [justAddedId,setJustAddedId]=useState(null);
  const setRowsFromAddForm=React.useCallback((updater)=>{
    setRows(prev=>{ const next=typeof updater==="function"?updater(prev):updater;
      return next;
    });
  },[]);

  // Lock body scroll when modal open
  useEffect(()=>{
    if(!addOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  },[addOpen]);

  // NEW: Close on ESC when modal open
  useEffect(()=>{
    if(!addOpen) return;
    const onKey = (e) => { if(e.key === "Escape") setAddOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  },[addOpen]);

  /* ----------------------------- Views ----------------------------- */
  // (LibraryView and HomeView identical to your previous file — omitted for brevity)
  // Keep your previous LibraryView() and HomeView() bodies exactly as they were.

  // --------- SettingsView remains as in previous replacement we sent ---------
  // (No changes needed here for the modal behavior.)

  /* ----------------------------- render ----------------------------- */
  // Wrap the whole app content so we can disable pointer events behind the modal.
  const appShellClass = cn(
    "min-h-screen bg-zinc-950 text-zinc-100",
    addOpen ? "pointer-events-none select-none" : ""
  );

  return (
    <>
      <div className={appShellClass} aria-hidden={addOpen || undefined}>
        <Header T={T} cn={cn} />
        <SearchDock
          SearchBox={SearchBox}
          sortMode={sortMode}
          setSortMode={setSortMode}
          placeholder={T.search}
          T={T}
          offsetTop={HEADER_H}
          page={page}
          setPage={setPage}
          streak={streak}
          level={level}
          levelProgress={levelProgress}
          levelStep={LEVEL_STEP}
          tab={tab}
          setTab={setTab}
        />

        {page === "library" ? <LibraryView /> : page === "settings" ? <SettingsView /> : <HomeView />}

        {/* Floating Add (+) Button */}
        <button
          aria-label="Add entry"
          className={cn(
            "fixed bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-xl flex items-center justify-center text-3xl font-bold",
            addOpen ? "pointer-events-none opacity-50" : ""
          )}
          onClick={()=>setAddOpen(true)}
        >
          +
        </button>
      </div>

      {/* Modal overlay is outside of app shell so it can receive pointer events while shell is blocked */}
      {addOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add entry"
          onPointerDown={(e)=> {
            // click outside closes; inside panel is stopped below
            setAddOpen(false);
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 pointer-events-auto"
            onPointerDown={(e)=>e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">{STR[direction].addEntry}</div>
              <button
                className="px-2 py-1 rounded-md bg-zinc-800"
                onClick={()=>setAddOpen(false)}
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <AddForm
              tab={tab}
              setRows={setRowsFromAddForm}
              T={STR[direction]}
              genId={genId}
              nowTs={nowTs}
              normalizeRag={normalizeRag}
              direction={direction}
              onSave={(id)=>{ setSortMode("Newest"); window.scrollTo({ top: 0, behavior: "smooth" }); setJustAddedId(id); setTimeout(()=>setJustAddedId(null),1400); }}
              onCancel={()=>setAddOpen(false)}  // NEW: wires Cancel to close
            />
          </div>
        </div>
      )}
    </>
  );
}
