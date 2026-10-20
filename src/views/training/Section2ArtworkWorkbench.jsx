// DEV-only placement studio: image, blue landmarks and draft road vertices.
// Does not change learner progression, approved Section 1 data or production.
import React,{useEffect,useState} from 'react';
import {routeStopReview} from './journeyRouteTraceDraft';
import {SECTION2_ARTWORK_MAPS,SECTION2_ARTWORK_DIMENSIONS,
  validateSection2ArtworkDraft,emptySection2ArtworkDraft,
  section2ArtworkStorageKey} from './section2ArtworkMaps';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const localDraft=(userId,mapId)=>{
  try {
    const raw=localStorage.getItem(section2ArtworkStorageKey(userId,mapId));
    return validateSection2ArtworkDraft(mapId,JSON.parse(raw||'null'))||
      emptySection2ArtworkDraft(mapId);
  } catch {return emptySection2ArtworkDraft(mapId);}
};
const labelFor=(id,index)=>id==='section_2_checkpoint'?'Section checkpoint':
  id.endsWith('_checkpoint')?'Module checkpoint':'Lesson '+(index+1);

export default function Section2ArtworkWorkbench({allSections=[],userId,onBack}){
  const [mapId,setMapId]=useState('module_2_1');
  const [draft,setDraft]=useState(()=>localDraft(userId,'module_2_1'));
  const [mode,setMode]=useState('marker');
  const [selected,setSelected]=useState(0);
  const [zoom,setZoom]=useState(0.55);
  const [message,setMessage]=useState('Artwork loaded. Select a blue marker and tap its landmark.');
  const [showJson,setShowJson]=useState(false);
  const map=SECTION2_ARTWORK_MAPS.find(m=>m.id===mapId)||SECTION2_ARTWORK_MAPS[0];
  const liveSection=allSections.find(s=>s.id==='section_2');
  const liveModule=liveSection?.modules?.find(m=>m.id===mapId);
  const finalCheckpoint=liveSection?.modules?.find(m=>m.isSectionCheckpoint);
  const liveIds=[...(liveModule?.lessons||[]),
    ...(mapId==='module_2_4'&&finalCheckpoint?[finalCheckpoint]:[])].map(s=>s.id);
  const curriculumValid=liveIds.length===map.stopIds.length&&liveIds.every((id,i)=>id===map.stopIds[i]);
  const markers=map.stopIds.map(id=>draft.markers.find(p=>p.id===id)).filter(Boolean);
  const review=routeStopReview(draft.route,markers);
  const dimensions=SECTION2_ARTWORK_DIMENSIONS;
  useEffect(()=>{
    try{localStorage.setItem(section2ArtworkStorageKey(userId,mapId),JSON.stringify(draft));}
    catch { /* The draft remains on screen and can still be exported. */ }
  },[mapId,userId,draft]);
  const changeMap=id=>{
    setMapId(id);setDraft(localDraft(userId,id));setMode('marker');
    setSelected(0);setShowJson(false);
    setMessage('Map changed. Draft points are stored separately on this device.');
  };
  const tap=e=>{
    const b=e.currentTarget.getBoundingClientRect();
    const p={x:clamp(Math.round((e.clientX-b.left)/zoom),0,1024),
      y:clamp(Math.round((e.clientY-b.top)/zoom),0,1536)};
    if(mode==='marker'){
      const id=map.stopIds[selected];
      setDraft(old=>({...old,markers:[...old.markers.filter(m=>m.id!==id),{id,...p}]}));
      setSelected(n=>Math.min(map.stopIds.length-1,n+1));
      setMessage('Blue landmark placed at ('+p.x+', '+p.y+'). Review all '+map.stopIds.length+' positions.');
    }else{
      setDraft(old=>({...old,route:[...old.route,p]}));
      setMessage('Road point '+(draft.route.length+1)+' placed. Continue to the map exit.');
    }
  };
  const clearSelected=()=>{
    const id=map.stopIds[selected];
    setDraft(old=>({...old,markers:old.markers.filter(p=>p.id!==id)}));
    setMessage('Selected landmark removed from this local draft.');
  };
  const copy=async()=>{
    const json=JSON.stringify(draft,null,2);
    try{await navigator.clipboard.writeText(json);setMessage('Draft JSON copied.');}
    catch{setShowJson(true);setMessage('Copy the JSON from the field below.');}
  };
  return <main className="z-marker-workbench mx-auto w-full min-w-0 max-w-2xl px-3 pb-10 pt-3" data-swipe-block="true">
    <header className="flex items-center gap-3">
      <button className="z-marker-tool" type="button" onClick={onBack}>← Back</button>
      <div>
        <div className="text-xs font-bold tracking-wider">DEV · SECTION 2 · ARTWORK AUTHORING</div>
        <h1 className="font-serif text-xl font-bold">The Amber Coast</h1>
      </div>
    </header>
    <label htmlFor="z-s2-map" className="mt-3 block text-sm font-semibold">Choose map</label>
    <select id="z-s2-map" className="z-marker-select mt-1 w-full" value={mapId}
      onChange={e=>changeMap(e.target.value)}>
      {SECTION2_ARTWORK_MAPS.map(m=><option key={m.id} value={m.id}>{m.title} · {m.stopIds.length} points</option>)}
    </select>
    <p className="mt-2 text-xs">
      {markers.length}/{map.stopIds.length} blue landmarks positioned · {draft.route.length} road waypoints.
      All positions are DRAFTS until approved and banked to DEV.
    </p>
    {!curriculumValid&&<p className="mt-2 text-sm" role="alert">
      Curriculum data has not matched the expected stop IDs. Placement remains a draft; verify the course before banking.
    </p>}
    <div className="z-size-companion-row mt-3" role="group" aria-label="Artwork authoring mode">
      <button type="button" className={'z-marker-tool '+(mode==='marker'?'z-size-active':'')}
        aria-pressed={mode==='marker'} onClick={()=>setMode('marker')}>Blue landmarks</button>
      <button type="button" className={'z-marker-tool '+(mode==='route'?'z-size-active':'')}
        aria-pressed={mode==='route'} onClick={()=>setMode('route')}>Trace road</button>
    </div>
    {mode==='marker'
      ? <><label htmlFor="z-s2-stop" className="mt-3 block text-sm font-semibold">Place landmark</label>
        <select id="z-s2-stop" value={selected} className="z-marker-select mt-1 w-full"
          onChange={e=>setSelected(Number(e.target.value))}>
          {map.stopIds.map((id,i)=><option value={i} key={id}>
            {i+1}. {labelFor(id,i)} {draft.markers.some(m=>m.id===id)?'✓':''}
          </option>)}
        </select>
        <button type="button" className="z-marker-tool mt-2" onClick={clearSelected}>
          Remove selected landmark</button></>
      : <div className="flex gap-2 mt-3">
          <button className="z-marker-tool" type="button"
            disabled={!draft.route.length} onClick={()=>
              setDraft(old=>({...old,route:old.route.slice(0,-1)}))}>Undo last road point</button>
          <button className="z-marker-tool" type="button" disabled={!draft.route.length}
            onClick={()=>{if(window.confirm('Clear the entire locally traced road?'))
              setDraft(old=>({...old,route:[]}));}}>Clear road</button>
        </div>}
    <div className="flex items-center gap-2 mt-3">
      <label htmlFor="z-s2-zoom" className="text-xs font-semibold">Image zoom</label>
      <input id="z-s2-zoom" type="range" min="0.32" max="1.6" step="0.02"
        value={zoom} onChange={e=>setZoom(Number(e.target.value))}
        style={{flex:1}}/>
      <span className="text-xs">{Math.round(zoom*100)}%</span>
    </div>
    <p className="mt-1 text-xs">Tap a landmark to place its blue pin, or switch to Trace road and tap the
      centre of the walkable path from entry to exit. Scroll/pan to inspect the full portrait.</p>
    <div className="z-marker-viewport mt-2" style={{overflow:'auto',touchAction:'pan-x pan-y',
      height:'min(67dvh,700px)'}} aria-label={map.title+' map drafting surface'}>
      <div onClick={tap} style={{width:dimensions.width*zoom,height:dimensions.height*zoom,
        position:'relative',cursor:'crosshair'}}>
        <img src={map.asset} alt={map.title+' approved scenery'} draggable={false}
          style={{display:'block',width:'100%',height:'100%',userSelect:'none'}}/>
        <svg viewBox="0 0 1024 1536" width={dimensions.width*zoom} height={dimensions.height*zoom}
          style={{position:'absolute',top:0,left:0,pointerEvents:'none'}}>
          <polyline points={draft.route.map(p=>p.x+','+p.y).join(' ')}
            stroke="#f5bd4d" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round"
            fill="none" opacity="0.95"/>
          {draft.route.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="9" stroke="white"
            strokeWidth="3" fill="#bc6d13"/>)}
        </svg>
        {map.stopIds.map((id,i)=>{
          const p=draft.markers.find(m=>m.id===id);
          return p?<span key={id} className="z-marker-pin" aria-label={'Landmark '+(i+1)}
            style={{left:p.x*zoom,top:p.y*zoom,transform:'translate(-50%,-100%)',
              outline:i===selected&&mode==='marker'?'3px solid #ffcc48':undefined}}>
            {i+1}</span>:null;
        })}
      </div>
    </div>
    {draft.route.length>=2&&markers.length>0&&<p className="mt-2 text-xs">
      Route review: {review.near}/{review.total} placed landmarks near the traced path
      {review.outOfOrder?' · CHECK LANDMARK ORDER':''}. Blue pins can stand beside the road.</p>}
    <p className="mt-2 text-xs" role="status">{message}</p>
    <button className="z-marker-tool mt-2 w-full" type="button"
      onClick={copy}>Copy this map's marker and road JSON</button>
    <button className="mt-2 w-full min-h-[44px] text-xs underline" type="button"
      onClick={()=>setShowJson(x=>!x)}>{showJson?'Hide':'Show'} JSON</button>
    {showJson&&<textarea className="z-marker-json w-full rounded-lg p-2" rows={12}
      readOnly aria-label="Section 2 artwork draft JSON" value={JSON.stringify(draft,null,2)}/>}
    <p className="mt-2 text-xs opacity-75">Drafts save to this browser only. No Fox/Wolf playback
      or learner journey is activated until route, marker and gold-paw stop positions are
      checked and approved. Section 1 remains unchanged.</p>
  </main>;
}
