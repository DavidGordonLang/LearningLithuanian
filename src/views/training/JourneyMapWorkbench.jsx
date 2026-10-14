// DEV-only Journey stage 2: one route editor, no marker editing or sprite sizing.
// This tool does not touch learner XP, lesson progress, the approved legacy route,
// or production gameStore. Routes are local drafts until separately reviewed.
import React, {useEffect, useRef, useState} from 'react';
import './JourneyMapWorkbench.css';
import {approvedPortraitMarkerPositions} from './section1PortraitMarkers';
import {buildRouteDraft,restoreRouteDraft,routeStorageKey,routeStopReview,
  MAX_ROUTE_POINTS} from './journeyRouteTraceDraft';

const MAPS=[
  {id:'module_1_1',title:'1.1 · Greeting and Politeness',w:1024,h:1536,
    url:'/assets/journey/section-1-map-1.1-portrait.avif'},
  {id:'module_1_2',title:'1.2 · Who I Am',w:1024,h:1536,
    url:'/assets/journey/section-1-map-1.2-portrait.avif'},
  {id:'module_1_3',title:"1.3 · I Don't Understand",w:1024,h:1536,
    url:'/assets/journey/section-1-map-1.3-portrait.avif'},
  {id:'module_1_4',title:'1.4 · Help and Contact',w:1024,h:1536,
    url:'/assets/journey/section-1-map-1.4-portrait.avif'},
];
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));

export default function JourneyMapWorkbench({allSections=[],userId,onBack}) {
  const [mapId,setMapId]=useState('module_1_1');
  const map=MAPS.find(x=>x.id===mapId)||MAPS[0];
  const section=allSections.find(x=>x.id==='section_1');
  const module=section?.modules?.find(x=>x.id===map.id);
  const sectionCheckpoint=section?.modules?.find(x=>x.isSectionCheckpoint);
  const stops=[...(module?.lessons||[]),
    ...(map.id==='module_1_4'&&sectionCheckpoint?[sectionCheckpoint]:[])];
  const ids=stops.map(x=>x.id);
  const pins=approvedPortraitMarkerPositions(map.id,ids);
  const markers=ids.filter(id=>pins[id]).map(id=>({...pins[id],id}));
  const [points,setPoints]=useState([]);
  const pointsRef=useRef([]);
  const [selectedPoint,setSelectedPoint]=useState(null);
  const [zoom,setZoom]=useState(.5);
  const [pan,setPan]=useState({x:0,y:0});
  const view=useRef({zoom:.5,pan:{x:0,y:0}});
  const viewport=useRef(null),pointers=useRef(new Map()),gesture=useRef(null);
  const [message,setMessage]=useState('');
  const [showJson,setShowJson]=useState(false);
  const [imageFailed,setImageFailed]=useState(false);
  const key=routeStorageKey(userId,mapId);

  const updateView=(z,p)=>{view.current={zoom:z,pan:p};setZoom(z);setPan(p);};
  const fit=()=>{
    const b=viewport.current?.getBoundingClientRect();
    if(!b?.width||!b?.height)return;
    const z=Math.min(b.width/map.w,b.height/map.h);
    updateView(z,{x:(b.width-map.w*z)/2,y:(b.height-map.h*z)/2});
  };
  const boundCamera=(p,z)=>{
    const b=viewport.current?.getBoundingClientRect();
    if(!b)return p;
    const bounded=(origin,size,available)=>size*z<=available
      ? (available-size*z)/2 : clamp(origin,available-size*z,0);
    return {x:bounded(p.x,map.w,b.width),y:bounded(p.y,map.h,b.height)};
  };
  const screenToWorld=(clientX,clientY)=>{
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    return {x:Math.round(clamp((clientX-b.left-v.pan.x)/v.zoom,0,map.w)),
      y:Math.round(clamp((clientY-b.top-v.pan.y)/v.zoom,0,map.h))};
  };
  const save=(next,msg='Route draft saved on this device.')=>{
    const clean=buildRouteDraft(mapId,next).points;
    pointsRef.current=clean;
    setPoints(clean);
    setMessage(msg);
    try{localStorage.setItem(key,JSON.stringify(buildRouteDraft(mapId,clean)));}
    catch{setMessage('Storage unavailable. Copy your route JSON before leaving.');}
  };

  useEffect(()=>{
    let saved=[];
    try{saved=restoreRouteDraft(localStorage.getItem(key),mapId);}catch{}
    pointsRef.current=saved;setPoints(saved);setSelectedPoint(null);
    pointers.current.clear();gesture.current=null;
    setMessage('');setShowJson(false);setImageFailed(false);
    const raf=requestAnimationFrame(fit);
    return ()=>cancelAnimationFrame(raf);
    // The camera resets only when the map or user changes.
  },[mapId,userId]);

  const nearestPoint=(clientX,clientY)=>{
    const rect=viewport.current.getBoundingClientRect(),v=view.current;
    const x=clientX-rect.left,y=clientY-rect.top;
    const items=pointsRef.current;
    let best=-1,distance=22;
    for(let i=0;i<items.length;i++){
      const d=Math.hypot(v.pan.x+items[i].x*v.zoom-x,v.pan.y+items[i].y*v.zoom-y);
      if(d<distance){distance=d;best=i;}
    }
    return best;
  };
  const start=(e)=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const active=pointers.current;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
    if(active.size===1){
      const index=nearestPoint(e.clientX,e.clientY);
      gesture.current={kind:index>=0?'vertex':'single',id:e.pointerId,
        index,x:e.clientX,y:e.clientY,pan:view.current.pan,
        originalPoints:pointsRef.current.map(p=>({...p})),
        moved:false,canAdd:true};
    } else if(active.size===2){
      const [a,b]=[...active.values()],rect=viewport.current.getBoundingClientRect();
      const mid={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
      gesture.current={kind:'pinch',
        startDistance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
        startZoom:view.current.zoom,
        anchor:{x:(mid.x-view.current.pan.x)/view.current.zoom,
          y:(mid.y-view.current.pan.y)/view.current.zoom}};
    } else gesture.current=null;
  };
  const move=(e)=>{
    const active=pointers.current;
    if(!active.has(e.pointerId))return;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const g=gesture.current;
    if(!g)return;
    if(g.kind==='pinch'&&active.size===2){
      const [a,b]=[...active.values()],rect=viewport.current.getBoundingClientRect();
      const z=clamp(g.startZoom*(Math.hypot(a.x-b.x,a.y-b.y)/g.startDistance),
        Math.min(rect.width/map.w,rect.height/map.h),2.6);
      const center={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
      updateView(z,boundCamera({x:center.x-g.anchor.x*z,y:center.y-g.anchor.y*z},z));
    } else if(g.id===e.pointerId&&(g.kind==='single'||g.kind==='vertex')){
      const dx=e.clientX-g.x,dy=e.clientY-g.y;
      if(Math.hypot(dx,dy)>8)g.moved=true;
      if(!g.moved)return;
      if(g.kind==='vertex'){
        const next=[...pointsRef.current];
        next[g.index]=screenToWorld(e.clientX,e.clientY);
        pointsRef.current=next;setPoints(next);
      } else updateView(view.current.zoom,boundCamera({x:g.pan.x+dx,
        y:g.pan.y+dy},view.current.zoom));
    }
  };
  const end=(e)=>{
    const active=pointers.current,g=gesture.current;
    if(!active.has(e.pointerId))return;
    active.delete(e.pointerId);
    if(g?.kind==='pinch'){
      const remaining=[...active.entries()][0];
      // A pinch ending must never create or move a route vertex.
      gesture.current=remaining?{kind:'single',id:remaining[0],
        x:remaining[1].x,y:remaining[1].y,pan:view.current.pan,
        moved:true,canAdd:false}:null;
      return;
    }
    gesture.current=null;
    if(!g||g.id!==e.pointerId)return;
    if(g.kind==='vertex'){
      setSelectedPoint(g.index);
      if(e.type==='pointercancel'){
        pointsRef.current=g.originalPoints;setPoints(g.originalPoints);
      } else if(g.moved){save(pointsRef.current,'Route bend adjusted and saved.');}
      return;
    }
    if(g.kind!=='single'||g.moved||!g.canAdd||e.type==='pointercancel')return;
    if(pointsRef.current.length>=MAX_ROUTE_POINTS){setMessage('Route limit reached.');return;}
    const next=[...pointsRef.current,screenToWorld(e.clientX,e.clientY)];
    setSelectedPoint(next.length-1);
    save(next,'Route waypoint added and saved.');
  };
  const undo=()=>{
    if(!pointsRef.current.length)return;
    save(pointsRef.current.slice(0,-1),'Last route waypoint removed.');
    setSelectedPoint(null);
  };
  const deleteSelected=()=>{
    if(selectedPoint===null||!pointsRef.current[selectedPoint])return;
    save(pointsRef.current.filter((_,i)=>i!==selectedPoint),'Selected bend removed.');
    setSelectedPoint(null);
  };
  const clear=()=>{
    if(!pointsRef.current.length||!window.confirm('Clear the traced route on this map?'))return;
    save([],'This map route was cleared. Other map routes are untouched.');
    setSelectedPoint(null);
  };
  const exportData=JSON.stringify(buildRouteDraft(mapId,points),null,2);
  const copy=async()=>{
    try{await navigator.clipboard.writeText(exportData);setMessage('Route JSON copied.');}
    catch{setShowJson(true);setMessage('Select and copy the route JSON below.');}
  };
  const review=routeStopReview(points,markers);
  return <div data-swipe-block="true"
      className="z-marker-workbench mx-auto w-full min-w-0 max-w-2xl px-3 pb-10 pt-3">
    <header className="flex items-center gap-3">
      <button type="button" className="z-marker-tool" onClick={onBack}>← Back</button>
      <div className="min-w-0">
        <div className="text-xs font-bold tracking-wider">DEV · SECTION 1 · ROUTE STAGE</div>
        <h1 className="font-serif text-xl font-bold">Trace walking route</h1>
      </div>
    </header>
    <label htmlFor="z-route-map-choice" className="mt-4 block text-sm font-semibold">Map</label>
    <select id="z-route-map-choice" className="z-marker-select mt-1 w-full"
      value={mapId} onChange={e=>setMapId(e.target.value)}>
      {MAPS.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}
    </select>
    <div className="mt-2 flex justify-between gap-2 text-xs">
      <span><b>{points.length}</b> route bends · {markers.length} markers locked</span>
      <span>1024 × 1536 portrait</span>
    </div>
    <p className="mt-3 text-xs">Starting at the <b>entrance</b>, tap along the open road through
      lesson markers <b>1 → {markers.length}</b> and finish at the <b>exit</b>.
      Drag the background to pan; pinch to zoom. Drag a gold route dot to adjust it.
      A tap adds a bend; a drag does not.</p>
    <div className="z-marker-viewport mt-2" ref={viewport} data-swipe-block="true"
      style={{cursor:'crosshair'}} onPointerDown={start} onPointerMove={move}
      onPointerUp={end} onPointerCancel={end}
      aria-label={'Route tracing canvas for '+map.title}>
      <div className="z-marker-world" style={{width:map.w,height:map.h,
        transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
        <img src={map.url} alt="" draggable={false} className="z-marker-art"
          style={{top:0,width:map.w,height:map.h}} onError={()=>setImageFailed(true)}/>
        {points.length>0&&<svg aria-hidden="true" className="z-route-lines"
          width={map.w} height={map.h} viewBox={'0 0 '+map.w+' '+map.h}>
          <polyline points={points.map(p=>p.x+','+p.y).join(' ')}
            fill="none" stroke="#fff8e4" strokeWidth="19"
            strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points={points.map(p=>p.x+','+p.y).join(' ')}
            fill="none" stroke="#e97815" strokeWidth="10"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        {points.map((p,i)=><span key={i} aria-hidden="true"
          className={'z-route-point '+(i===selectedPoint?'selected':'')}
          style={{left:p.x,top:p.y,transform:`translate(-50%,-50%) scale(${1/zoom})`}}>
          {i===0?'IN':i===points.length-1?'END':''}</span>)}
        {markers.map((p,i)=><span key={p.id} aria-hidden="true"
          className="z-marker-pin z-route-locked-marker" style={{left:p.x,top:p.y,
            transform:`translate(-50%,-100%) scale(${1/zoom})`}}>{i+1}</span>)}
      </div>
      {imageFailed&&<p className="z-marker-error">Map image unavailable; saved route is intact.</p>}
    </div>
    <section className="z-route-controls mt-3 rounded-xl border p-3">
      <div className="text-xs mb-2">{points.length<2
        ? 'Place the entrance and your next bend to begin the route.'
        : `${review.near}/${review.total} lesson markers near the traced line (guide only).`}
        {review.outOfOrder&&' Check route order — some stops may be reached backwards.'}</div>
      <div className="z-route-action-row">
        <button type="button" className="z-marker-tool" onClick={undo}
          disabled={!points.length}>Undo last</button>
        <button type="button" className="z-marker-tool" onClick={deleteSelected}
          disabled={selectedPoint===null||!points[selectedPoint]}>Remove bend</button>
        <button type="button" className="z-marker-tool" onClick={clear}
          disabled={!points.length}>Clear route</button>
      </div>
      <p className="mt-2 text-xs opacity-75">Lesson markers are fixed and cannot be edited here.
        The completed trace should start and end at the map edges and follow every numbered stop in order.</p>
    </section>
    {message&&<p role="status" className="mt-3 text-xs">{message}</p>}
    <button type="button" className="z-marker-export-button mt-3 w-full"
      onClick={copy}>Copy route JSON</button>
    <button type="button" className="mt-2 w-full min-h-[44px] text-sm underline"
      onClick={()=>setShowJson(v=>!v)}>{showJson?'Hide':'Show'} route coordinates</button>
    {showJson&&<textarea readOnly value={exportData} rows={10}
      className="z-marker-json w-full rounded-lg p-2" aria-label="Route JSON"/>}
    <p className="mt-2 text-xs opacity-75">Each route draft saves locally on this device.
      Copy the JSON when the route is complete so it can be banked in DEV.
      The approved 23 marker coordinates and earlier drafts are preserved.
      Sprite sizing will be a separate editing stage.</p>
  </div>;
}