// Development-only, first stage of illustrated-map authoring.
// No calls to gameStore, no curriculum mutations and no learner XP/progression.
// Stage 1: marker positions. Stage 2: route. Stage 3: sprite size (later builds).
import React, { useEffect, useRef, useState } from 'react';
import './JourneyMapWorkbench.css';

const MAPS = [
  { id: 'module_1_1', title: '1.1 · Greeting and Politeness', w: 850, h: 1120,
    approved: [ [183,880], [575,725], [254,526], [654,325], [310,204] ],
    tiles: [1,2,3,4].map(n => `/assets/journey/first-contact-greeting-tile-${n}.avif`) },
  { id: 'module_1_2', title: '1.2 · Who I Am', w: 1536, h: 1024,
    url: '/assets/journey/section-1-map-1.2.avif' },
  { id: 'module_1_3', title: "1.3 · I Don't Understand", w: 1536, h: 1024,
    url: '/assets/journey/section-1-map-1.3.avif' },
  { id: 'module_1_4', title: '1.4 · Help and Contact', w: 1536, h: 1024,
    url: '/assets/journey/section-1-map-1.4.avif' },
];
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const storageKey = (userId,id) => `zodis:journey:markers:stage1:v1:${userId || 'local'}:${id}`;
function restore(key, ids, map) {
  try {
    const saved=JSON.parse(localStorage.getItem(key) || 'null');
    if(saved?.version!==1 || saved.mapId!==map.id || !Array.isArray(saved.markers)) return null;
    const allowed=new Set(ids);
    return Object.fromEntries(saved.markers.filter(p => allowed.has(p.id) &&
      Number.isFinite(p.x) && Number.isFinite(p.y)).map(p =>
      [p.id,{x:Math.round(clamp(p.x,0,map.w)),y:Math.round(clamp(p.y,0,map.h))}]));
  } catch { return null; }
}
export default function JourneyMapWorkbench({ allSections=[], userId, onBack }) {
  const [mapId,setMapId] = useState('module_1_2');
  const map = MAPS.find(m => m.id === mapId) || MAPS[1];
  const section = allSections.find(s => s.id === 'section_1');
  const module = section?.modules?.find(m => m.id === map.id);
  const sectionCheckpoint = section?.modules?.find(m => m.isSectionCheckpoint);
  // The section checkpoint is a 7th destination ON map 1.4; there is no extra artwork.
  const stops = [...(module?.lessons || []),
    ...(mapId === 'module_1_4' && sectionCheckpoint ? [sectionCheckpoint] : [])];
  const ids = stops.map(s => s.id);
  const [placed,setPlaced] = useState({});
  const [selectedId,setSelectedId] = useState(null);
  const [tool,setTool] = useState('place');
  const [zoom,setZoom] = useState(.5);
  const [pan,setPan] = useState({x:0,y:0});
  const [message,setMessage] = useState('');
  const [exportVisible,setExportVisible] = useState(false);
  const [imageFailed,setImageFailed] = useState(false);
  const viewport=useRef(null), pointer=useRef(null), view=useRef({zoom:.5,pan:{x:0,y:0}});
  const updateView=(z,p)=>{view.current={zoom:z,pan:p};setZoom(z);setPan(p);};
  const fit=()=>{
    if(!viewport.current)return;
    const b=viewport.current.getBoundingClientRect();
    if(!b.width||!b.height)return;
    const z=Math.min(b.width/map.w,b.height/map.h);
    updateView(z,{x:(b.width-map.w*z)/2,y:(b.height-map.h*z)/2});
  };
  useEffect(()=>{
    const saved=restore(storageKey(userId,mapId),ids,map);
    const approved=map.approved ? Object.fromEntries(ids
      .filter((_,i)=>!!map.approved[i]).map((id,i)=>[id,{x:map.approved[i][0],y:map.approved[i][1]}])) : {};
    setPlaced(saved || approved);
    setSelectedId(ids[0] || null);
    setTool('place');setExportVisible(false);setMessage('');setImageFailed(false);
    const raf=requestAnimationFrame(fit);
    return ()=>cancelAnimationFrame(raf);
    // Reset only on map/account change; changing marker values must not recenter the canvas.
  },[mapId,userId]);
  const record=(next)=>{
    setPlaced(next);
    try {
      localStorage.setItem(storageKey(userId,mapId),JSON.stringify({version:1,mapId,
        markers:ids.filter(id=>next[id]).map(id=>({id,...next[id]}))}));
      setMessage('Marker draft saved locally. Copy the JSON when you finish positioning.');
    } catch {setMessage('Browser storage unavailable. Copy the JSON before leaving.');}
  };
  const bounded=(p,z)=>{
    const b=viewport.current.getBoundingClientRect();
    const axis=(origin,world,screen)=>world*z<=screen?(screen-world*z)/2:clamp(origin,screen-world*z,0);
    return {x:axis(p.x,map.w,b.width),y:axis(p.y,map.h,b.height)};
  };
  const changeZoom=(factor)=>{
    if(!viewport.current)return;
    const b=viewport.current.getBoundingClientRect(),old=view.current;
    const min=Math.min(b.width/map.w,b.height/map.h);
    const z=clamp(old.zoom*factor,min,2.6);
    const worldCentre={x:(b.width/2-old.pan.x)/old.zoom,
      y:(b.height/2-old.pan.y)/old.zoom};
    const p=bounded({x:b.width/2-worldCentre.x*z,y:b.height/2-worldCentre.y*z},z);
    updateView(z,p);
  };
  const start=(e)=>{
    if(e.target.closest('button'))return;
    const v=view.current;
    pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY,pan:v.pan,moved:false};
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
  };
  const move=(e)=>{
    const p=pointer.current;
    if(!p||p.id!==e.pointerId)return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;
    if(Math.hypot(dx,dy)>7)p.moved=true;
    if(tool==='pan' && p.moved)
      updateView(view.current.zoom,bounded({x:p.pan.x+dx,y:p.pan.y+dy},view.current.zoom));
  };
  const end=(e)=>{
    const p=pointer.current;
    if(!p||p.id!==e.pointerId)return;
    pointer.current=null;
    if(tool!=='place'||p.moved||!selectedId||e.type==='pointercancel')return;
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    const x=Math.round(clamp((e.clientX-b.left-v.pan.x)/v.zoom,0,map.w));
    const y=Math.round(clamp((e.clientY-b.top-v.pan.y)/v.zoom,0,map.h));
    record({...placed,[selectedId]:{x,y}});
    const i=ids.indexOf(selectedId);
    if(i>=0&&i<ids.length-1)setSelectedId(ids[i+1]);
  };
  const selected=stops.find(s=>s.id===selectedId);
  const count=ids.filter(id=>placed[id]).length;
  const markerJson=JSON.stringify({version:1,mapId,
    dimensions:{width:map.w,height:map.h},
    markers:ids.filter(id=>placed[id]).map(id=>({id,...placed[id]}))},null,2);
  const copy=async()=>{
    try {await navigator.clipboard.writeText(markerJson);setMessage('Marker JSON copied.');}
    catch{setExportVisible(true);setMessage('Copy the JSON from the box below.');}
  };
  const clearSelected=()=>{
    if(!selectedId)return;
    const next={...placed};delete next[selectedId];record(next);
  };
  return <div className="z-marker-workbench mx-auto max-w-2xl px-3 pb-10 pt-3">
    <header className="flex items-center gap-3">
      <button type="button" className="z-marker-tool" onClick={onBack}>← Back</button>
      <div className="min-w-0"><div className="text-xs font-bold tracking-wider">DEV · SECTION 1</div>
        <h1 className="font-serif text-xl font-bold">Place lesson markers</h1></div>
    </header>
    <label htmlFor="z-marker-map-choice" className="mt-4 block text-sm font-semibold">Map</label>
    <select id="z-marker-map-choice" className="z-marker-select mt-1 w-full" value={mapId}
      onChange={e=>setMapId(e.target.value)}>
      {MAPS.map(m=><option value={m.id} key={m.id}>{m.title}</option>)}
    </select>
    <div className="mt-2 flex justify-between gap-2 text-xs">
      <span><b>{count}/{ids.length}</b> placed {mapId==='module_1_4'?'· Section checkpoint included':''}</span>
      <span>Original art preserved</span>
    </div>
    <div className="mt-3 flex gap-2" role="group" aria-label="Active map tool">
      <button type="button" className={'z-marker-tool '+(tool==='place'?'active':'')}
        aria-pressed={tool==='place'} onClick={()=>setTool('place')}>📍 Place</button>
      <button type="button" className={'z-marker-tool '+(tool==='pan'?'active':'')}
        aria-pressed={tool==='pan'} onClick={()=>setTool('pan')}>✋ Pan</button>
    </div>
    <p className="mt-2 text-xs">{tool==='place'
      ? 'Choose a lesson below and tap its position on the road. The next lesson selects automatically.'
      : 'Drag to move the map; use + and − to zoom.'}</p>
    <div className="z-marker-viewport mt-2" ref={viewport}
      style={{cursor:tool==='place'?'crosshair':'grab'}}
      onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      aria-label={'Map marker editor for '+map.title}>
      <div className="z-marker-world" style={{width:map.w,height:map.h,
        transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
        {map.tiles?map.tiles.map((url,i)=><img key={url} src={url} alt=""
          draggable={false} className="z-marker-art" style={{top:i*280,width:850,height:280}}/>) :
          <img src={map.url} alt="" draggable={false} className="z-marker-art"
            style={{top:0,width:map.w,height:map.h}} onError={()=>setImageFailed(true)}/>}
        {ids.filter(id=>placed[id]).map(id=><span key={id}
          className={'z-marker-pin '+(id===selectedId?'active':'')}
          style={{left:placed[id].x,top:placed[id].y,
            transform:`translate(-50%,-100%) scale(${1/zoom})`}}>
          {ids.indexOf(id)+1}</span>)}
      </div>
      {imageFailed&&<p className="z-marker-error">Map image did not load. Please refresh; saved markers are intact.</p>}
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button type="button" className="z-marker-tool" onClick={()=>changeZoom(1.4)}>＋ Zoom</button>
      <button type="button" className="z-marker-tool" onClick={()=>changeZoom(1/1.4)}>－ Zoom</button>
      <button type="button" className="z-marker-tool" onClick={fit}>Fit whole map</button>
      <span className="ml-auto text-xs">{Math.round(zoom*100)}%</span>
    </div>
    <section className="z-marker-lessons mt-4 rounded-xl border p-3">
      <h2 className="mb-2 text-sm font-bold">Lesson destinations, in order</h2>
      <div className="grid gap-2">
        {stops.map((s,i)=><button type="button" key={s.id}
          className={'z-marker-lesson '+(selectedId===s.id?'active':'')}
          aria-pressed={selectedId===s.id}
          onClick={()=>{setSelectedId(s.id);setTool('place');}}>
          <span className="z-marker-lesson-number">{i+1}</span>
          <span className="min-w-0 flex-1 text-left"><b className="block text-sm">{s.title}</b>
            <small className="block break-all">{s.id}</small></span>
          <span className="text-xs">{placed[s.id]?'✓ Placed':'Not placed'}</span>
        </button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex-1">Selected: <b>{selected?.title||'None'}</b>
          {placed[selectedId]&&` · ${placed[selectedId].x}, ${placed[selectedId].y}`}</span>
        <button type="button" className="z-marker-tool" onClick={clearSelected}
          disabled={!placed[selectedId]}>Clear selected</button>
      </div>
    </section>
    {message&&<p role="status" className="mt-2 text-xs">{message}</p>}
    <button type="button" className="z-marker-export-button mt-3 w-full" onClick={copy}>
      Copy marker draft JSON</button>
    <button type="button" className="mt-2 w-full min-h-[44px] text-sm underline"
      onClick={()=>setExportVisible(v=>!v)}>{exportVisible?'Hide':'Show'} coordinates</button>
    {exportVisible&&<textarea readOnly value={markerJson} rows={Math.max(7,stops.length+4)}
      className="z-marker-json w-full rounded-lg p-2" aria-label="Lesson coordinates JSON"/>}
    <p className="mt-2 text-xs opacity-75">Drafts save locally per account and map; they do not change lessons.
      Only marker controls appear at this stage. Route tracing and then sprite-size controls will replace this panel later.
      The approved Module 1.1 route and all lesson completion rules remain unchanged.</p>
  </div>;
}
