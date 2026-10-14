// DEV preview only: approved portrait routes, automatic facing & perspective.
// Not wired to learner navigation, lessons or production journey state.
import React,{useEffect,useRef,useState} from 'react';
import './JourneyMapWorkbench.css';
import FoxWalkSprite from './FoxWalkSprite';
import {approvedPortraitMarkerPositions} from './section1PortraitMarkers';
import {approvedPortraitRoutePoints} from './section1PortraitRoutes';
import {gateRouteAt} from './journeyGateRouteEditor';
import {nearestRouteProgress} from './journeyRouteTraceDraft';
import {foxRouteTotalDistance} from './journeyFoxRoutePlayback';
import {storageKey,seed,move,locations,exportDraft,restore} from './journeyLessonStops';
import {foxRouteFrame} from './journeyFoxRoutePlayback';
import {automaticPreviewScale,automaticJourneyFrame,
  automaticJourneyFacing} from './journeyAutoPreview';

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
const clamp=(n,minimum,maximum)=>Math.max(minimum,Math.min(maximum,n));

export default function JourneyMapWorkbench({allSections=[],userId,onBack}){
  const [mapId,setMapId]=useState('module_1_1');
  const [companion,setCompanion]=useState('fox');
  const map=MAPS.find(item=>item.id===mapId)||MAPS[0];
  const route=approvedPortraitRoutePoints(mapId);
  const routeLength=foxRouteTotalDistance(route);
  const section=allSections.find(item=>item.id==='section_1');
  const module=section?.modules?.find(item=>item.id===mapId);
  const sectionCheckpoint=section?.modules?.find(item=>item.isSectionCheckpoint);
  const stops=[...(module?.lessons||[]),
    ...(mapId==='module_1_4'&&sectionCheckpoint?[sectionCheckpoint]:[])];
  const markerPositions=approvedPortraitMarkerPositions(mapId,stops.map(s=>s.id));
  const markers=stops.map(s=>markerPositions[s.id]).filter(Boolean);
  const stopIds=stops.map(s=>s.id);
  const [authored,setAuthored]=useState([]);
  const [selectedId,setSelectedId]=useState('');
  const [dragAt,setDragAt]=useState(null);
  const dragAtRef=useRef(null);
  const [note,setNote]=useState('');
  const [showJson,setShowJson]=useState(false);
  const stopLocations=locations(route,authored,stopIds);
  const selectedStop=stopLocations.find(stop=>stop.id===selectedId);
  const displayedStops=dragAt===null?stopLocations:locations(route,
    authored.map(s=>s.id===selectedId?{...s,at:dragAt}:s),stopIds);
  const holdSignature=stopLocations.map(stop=>stop.progress).join(',');
  const draftKey=storageKey(userId,mapId);
  const [progress,setProgress]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [idle,setIdle]=useState(true);
  const [finished,setFinished]=useState(false);
  const clock=useRef(0);
  const [zoom,setZoom]=useState(.5);
  const [pan,setPan]=useState({x:0,y:0});
  const viewport=useRef(null);
  const view=useRef({zoom:.5,pan:{x:0,y:0}});
  const touches=useRef(new Map());
  const gesture=useRef(null);
  const [imageFailed,setImageFailed]=useState(false);

  const characterPoint=gateRouteAt(route,progress);
  // IMPORTANT: derive facing from the actual route segment. A custom sprite
  // paw position has no segmentIndex and caused the former stuck 'up' bug.
  const facing=automaticJourneyFacing(route,progress);
  const frame=foxRouteFrame(route,progress);
  const scale=automaticPreviewScale(companion,progress);
  const facingCamera=(progress===0&&!playing)||idle;
  const activeStop=idle&&playing?stopLocations.find(stop=>
    Math.abs(stop.progress-progress)<0.00001):null;
  const image=companion==='wolf'?'/assets/journey/wolf-idle.webp':
    '/assets/journey/fox-idle.webp';

  const setCamera=(value,p)=>{
    view.current={zoom:value,pan:p};
    setZoom(value);setPan(p);
  };
  const fit=()=>{
    const rect=viewport.current?.getBoundingClientRect();
    if(!rect?.width||!rect?.height)return;
    const nextZoom=Math.min(rect.width/map.w,rect.height/map.h);
    setCamera(nextZoom,{x:(rect.width-map.w*nextZoom)/2,
      y:(rect.height-map.h*nextZoom)/2});
  };
  const clampCamera=(point,z)=>{
    const b=viewport.current?.getBoundingClientRect();
    if(!b)return point;
    const axis=(value,dimension,available)=>dimension*z<=available
      ?(available-dimension*z)/2:clamp(value,available-dimension*z,0);
    return {x:axis(point.x,map.w,b.width),y:axis(point.y,map.h,b.height)};
  };
  useEffect(()=>{
    setPlaying(false);setProgress(0);setIdle(true);setFinished(false);
    clock.current=0;
  },[mapId,companion]);
  useEffect(()=>{
    let draft=null;
    try{draft=restore(localStorage.getItem(draftKey),mapId,route,stopIds);}catch{}
    const next=draft||seed(route,stopIds,markerPositions);
    setAuthored(next);setSelectedId(next[0]?.id||'');
    dragAtRef.current=null;setDragAt(null);setShowJson(false);
    setNote(draft?'Saved positions restored.':'Estimated stops loaded. Adjust each gold pin.');
    setProgress(0);setIdle(true);setPlaying(false);
  },[mapId,userId]);
  useEffect(()=>{
    setImageFailed(false);touches.current.clear();gesture.current=null;
    const id=requestAnimationFrame(fit);
    return()=>cancelAnimationFrame(id);
  },[mapId]);
  useEffect(()=>{
    if(!playing)return undefined;
    const holds=holdSignature?holdSignature.split(',').map(Number):[];
    let raf=0,last=null;
    const tick=now=>{
      if(last===null)last=now;
      const dt=Math.min(100,Math.max(0,now-last));
      last=now;
      clock.current+=dt;
      const state=automaticJourneyFrame(clock.current,holds);
      setProgress(state.progress);setIdle(state.facingCamera);
      if(state.complete){
        setPlaying(false);setFinished(true);
        return;
      }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[playing,mapId,companion,holdSignature]);
  const play=()=>{
    clock.current=0;
    setProgress(0);setIdle(true);setFinished(false);setPlaying(true);
  };
  const selectStop=id=>{
    setSelectedId(id);
    const stop=stopLocations.find(item=>item.id===id);
    if(stop){setPlaying(false);setFinished(false);setIdle(true);setProgress(stop.progress);}
    dragAtRef.current=null;setDragAt(null);
  };
  const saveStop=(id,at)=>{
    const updated=move(authored,stopIds,id,at);
    if(!updated){
      setNote('Stops must stay in lesson order. Move the adjacent stop first.');
      return false;
    }
    setPlaying(false);setFinished(false);setIdle(true);
    setAuthored(updated);setSelectedId(id);
    setProgress(updated.find(item=>item.id===id).at/10000);
    try{
      localStorage.setItem(draftKey,JSON.stringify(exportDraft(mapId,route,updated,stopIds)));
      setNote('Stop saved. Copy the JSON when you approve all '+stopIds.length+' stops.');
    }catch{setNote('Browser storage unavailable. Copy the JSON before leaving.');}
    return true;
  };
  const toWorld=e=>{
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    return {x:(e.clientX-b.left-v.pan.x)/v.zoom,
      y:(e.clientY-b.top-v.pan.y)/v.zoom};
  };
  const roadCandidate=e=>{
    const closest=nearestRouteProgress(route,toWorld(e));
    return closest&&routeLength?{at:Math.round(closest.progress/routeLength*10000),
      distance:closest.distance*view.current.zoom}:null;
  };
  const hitStop=e=>{
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    const hits=displayedStops.map(stop=>({id:stop.id,
      distance:Math.hypot(e.clientX-b.left-v.pan.x-stop.x*v.zoom,
        e.clientY-b.top-v.pan.y-stop.y*v.zoom)}));
    hits.sort((a,b)=>a.distance-b.distance);
    return hits[0]?.distance<=30?hits[0].id:null;
  };
  const copy=async()=>{
    const json=JSON.stringify(exportDraft(mapId,route,authored,stopIds),null,2);
    try{await navigator.clipboard.writeText(json);setNote('All stop positions copied.');}
    catch{setShowJson(true);setNote('Select and copy the JSON shown below.');}
  };
  const pointerDown=e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const points=touches.current;
    points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
    if(points.size===1){
      const pin=hitStop(e);
      if(pin)selectStop(pin);
      gesture.current={mode:pin?'stop':'pan',id:e.pointerId,stopId:pin,
        start:{x:e.clientX,y:e.clientY},pan:view.current.pan,
        moved:false,canPlace:!pin};
    }else if(points.size===2){
      const [a,b]=[...points.values()];
      const bounds=viewport.current.getBoundingClientRect();
      const mid={x:(a.x+b.x)/2-bounds.left,y:(a.y+b.y)/2-bounds.top};
      gesture.current={mode:'pinch',startDistance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
        startZoom:view.current.zoom,
        anchor:{x:(mid.x-view.current.pan.x)/view.current.zoom,
          y:(mid.y-view.current.pan.y)/view.current.zoom}};
    }else gesture.current=null;
  };
  const pointerMove=e=>{
    const pointers=touches.current;
    if(!pointers.has(e.pointerId))return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const g=gesture.current;
    if(!g)return;
    if(g.mode==='pinch'&&pointers.size===2){
      const [a,b]=[...pointers.values()];
      const rect=viewport.current.getBoundingClientRect();
      const minimum=Math.min(rect.width/map.w,rect.height/map.h);
      const nextZoom=clamp(g.startZoom*Math.hypot(a.x-b.x,a.y-b.y)/g.startDistance,
        minimum,2.6);
      const middle={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
      setCamera(nextZoom,clampCamera({x:middle.x-g.anchor.x*nextZoom,
        y:middle.y-g.anchor.y*nextZoom},nextZoom));
    }else if(g.mode==='stop'&&g.id===e.pointerId){
      if(Math.hypot(e.clientX-g.start.x,e.clientY-g.start.y)>6)g.moved=true;
      if(!g.moved)return;
      const point=roadCandidate(e);
      if(!point||!move(authored,stopIds,g.stopId,point.at))return;
      dragAtRef.current=point.at;setDragAt(point.at);
      setPlaying(false);setFinished(false);setIdle(true);
      setProgress(point.at/10000);
    }else if(g.mode==='pan'&&g.id===e.pointerId){
      const x=e.clientX-g.start.x,y=e.clientY-g.start.y;
      if(Math.hypot(x,y)>8)g.moved=true;
      if(g.moved)setCamera(view.current.zoom,clampCamera({
        x:g.pan.x+x,y:g.pan.y+y},view.current.zoom));
    }
  };
  const pointerEnd=e=>{
    const pointers=touches.current,g=gesture.current;
    pointers.delete(e.pointerId);
    if(g?.mode==='pinch'&&pointers.size===1){
      const [id,p]=[...pointers.entries()][0];
      gesture.current={mode:'pan',id,start:{x:p.x,y:p.y},pan:view.current.pan,
        moved:true,canPlace:false};
      return;
    }
    gesture.current=null;
    if(g?.mode==='stop'){
      if(g.moved&&e.type!=='pointercancel'&&dragAtRef.current!==null)
        saveStop(g.stopId,dragAtRef.current);
      dragAtRef.current=null;setDragAt(null);
      return;
    }
    if(g?.mode==='pan'&&!g.moved&&g.canPlace&&e.type!=='pointercancel'&&selectedId){
      const point=roadCandidate(e);
      if(point?.distance<=43)saveStop(selectedId,point.at);
      else setNote('Tap the road or drag the selected gold stop pin.');
    }
  };

  return <div data-swipe-block="true"
      className="z-marker-workbench mx-auto w-full min-w-0 max-w-2xl px-3 pb-10 pt-3">
    <header className="flex items-center gap-3">
      <button className="z-marker-tool" type="button" onClick={onBack}>← Back</button>
      <div className="min-w-0">
        <div className="text-xs font-bold tracking-wider">DEV · SECTION 1 · BETA JOURNEY</div>
        <h1 className="font-serif text-xl font-bold">Automatic journey preview</h1>
      </div>
    </header>
    <label htmlFor="z-journey-map" className="mt-3 block text-sm font-semibold">Map</label>
    <select id="z-journey-map" className="z-marker-select mt-1 w-full" value={mapId}
      onChange={e=>setMapId(e.target.value)}>
      {MAPS.map(item=><option value={item.id} key={item.id}>{item.title}</option>)}
    </select>
    <div className="z-size-companion-row mt-3" role="group" aria-label="Companion preview">
      <button className={'z-marker-tool '+(companion==='fox'?'z-size-active':'')}
        type="button" aria-pressed={companion==='fox'} onClick={()=>setCompanion('fox')}>Fox</button>
      <button className={'z-marker-tool '+(companion==='wolf'?'z-size-active':'')}
        type="button" aria-pressed={companion==='wolf'} onClick={()=>setCompanion('wolf')}>Wolf</button>
    </div>
    <label htmlFor="z-lesson-stop" className="mt-3 block text-sm font-semibold">
      Choose the lesson or checkpoint to position
    </label>
    <select id="z-lesson-stop" className="z-marker-select mt-1 w-full"
      value={selectedId} onChange={e=>selectStop(e.target.value)}>
      {stopLocations.map(stop=><option value={stop.id} key={stop.id}>
        {stop.label} · {(stop.progress*100).toFixed(1)}% of journey
      </option>)}
    </select>
    <p className="mt-2 text-xs">Gold pins are the Fox/Wolf stopping positions,
      independent of the blue lesson markers. Select a lesson and tap its new
      stopping place on the road, or drag that gold pin along the road.
      The companion faces you at every saved stop. Pan empty space and pinch to zoom.</p>
    <div ref={viewport} data-swipe-block="true" className="z-marker-viewport mt-2"
      onPointerDown={pointerDown} onPointerMove={pointerMove}
      onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
      aria-label={'Journey preview for '+map.title}>
      <div className="z-marker-world" style={{width:map.w,height:map.h,
        transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
        <img src={map.url} alt="" draggable={false} className="z-marker-art"
          style={{top:0,width:map.w,height:map.h}}
          onError={()=>setImageFailed(true)}/>
        {markers.map((point,i)=><span key={i}
          className="z-marker-pin z-size-locked-marker" aria-hidden="true"
          style={{left:point.x,top:point.y,
            transform:`translate(-50%,-100%) scale(${1/zoom})`}}>{i+1}</span>)}
        {displayedStops.map(stop=><span key={stop.id}
          className={'z-preview-checkpoint '+((activeStop?.id===stop.id||selectedId===stop.id)
            ?'z-preview-checkpoint-active':'')}
          style={{left:stop.x,top:stop.y,transform:`scale(${1/zoom})`}}
          aria-label={stop.label+' paw stop at '+stop.x+', '+stop.y}
          title={stop.label+' — drag or select and tap the road'}>
          <span className="z-preview-checkpoint-dot"/>
          <span className="z-preview-checkpoint-label">{stop.shortLabel}</span>
        </span>)}
        {characterPoint&&<span className="z-size-avatar-anchor"
          aria-label={companion+(facingCamera?' facing you':' walking '+facing)}
          style={{left:characterPoint.x,top:characterPoint.y}}>
          <span className="z-size-avatar-body"
            style={{transform:`scale(${scale})`}}>
            {facingCamera
              ? <img src={image} alt="" draggable={false} decoding="async"
                  className="z-size-idle-sprite"/>
              : <FoxWalkSprite frame={frame} facing={facing}
                  companionId={companion} scale={1}/>}
          </span>
        </span>}
      </div>
      {imageFailed&&<p className="z-marker-error" role="alert">
        Map image unavailable. Please refresh the DEV preview.</p>}
    </div>
    <p className="z-preview-checkpoint-legend mt-2 text-xs">
      <strong>Gold M CP / S CP</strong> = where the sprite actually pauses on
      the road (module / section checkpoint). Blue numbers = approved lesson icons.
      These checkpoint road positions are provisional.
    </p>
    {checkpointStops.length>0&&<div className="z-preview-checkpoint-coordinates mt-1">
      {checkpointStops.map(stop=><span key={stop.id}>
        {stop.label}: ({stop.x}, {stop.y}) · {(stop.progress*100).toFixed(1)}% of journey
      </span>)}
    </div>}
    <button type="button" className="z-marker-export-button mt-3 w-full"
      onClick={play}>▶ Play Journey</button>
    <p className="mt-2 text-center text-xs" role="status">
      {finished?'Journey complete — press Play Journey to watch again'
        :playing?(idle?(activeStop?'Paused at '+activeStop.label+' — facing you':'Facing you at the start'):'Journey playing…')
          :'Ready to play'}
    </p>
    <p className="mt-2 text-xs opacity-75">
      This is a visual beta only. Existing size and placement drafts remain stored,
      but are not applied. The approved maps, markers, walking routes and real
      lesson progression are unchanged.
    </p>
  </div>;
}
