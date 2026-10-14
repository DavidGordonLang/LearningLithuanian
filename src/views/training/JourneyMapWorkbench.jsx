// DEV-only: direction authoring comes before perspective sizing.
// Four approved maps, their 23 landmarks and 69 route points are never edited here.
// Original learner journey, completion state and production remain unchanged.
import React,{useEffect,useRef,useState} from 'react';
import './JourneyMapWorkbench.css';
import './JourneyMapWorkbenchDirection.css';
import FoxWalkSprite from './FoxWalkSprite';
import {approvedPortraitMarkerPositions} from './section1PortraitMarkers';
import {approvedPortraitRoutePoints} from './section1PortraitRoutes';
import {gateRouteAt} from './journeyGateRouteEditor';
import {foxRouteTotalDistance,foxRouteFrame} from './journeyFoxRoutePlayback';
import {
  WALK_DIRECTIONS,directionStorageKey,automaticDirection,directionForSegment,
  buildDirectionDraft,restoreDirectionDraft,
} from './journeyPortraitDirectionDraft';

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
const LABELS={
  up:'↑ Away', 'up-right':'↗ Up-right',right:'→ Right',
  'down-right':'↘ Down-right',down:'↓ Towards',
  'down-left':'↙ Down-left',left:'← Left','up-left':'↖ Up-left',
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

export default function JourneyMapWorkbench({allSections=[],userId,onBack}){
  const [mapId,setMapId]=useState('module_1_1');
  const map=MAPS.find(m=>m.id===mapId)||MAPS[0];
  const route=approvedPortraitRoutePoints(mapId);
  const segmentCount=Math.max(0,route.length-1);
  const totalDistance=foxRouteTotalDistance(route);
  const section=allSections.find(s=>s.id==='section_1');
  const module=section?.modules?.find(m=>m.id===mapId);
  const checkpoint=section?.modules?.find(m=>m.isSectionCheckpoint);
  const stops=[...(module?.lessons||[]),...(mapId==='module_1_4'&&checkpoint?[checkpoint]:[])];
  const pins=approvedPortraitMarkerPositions(mapId,stops.map(s=>s.id));
  const markers=stops.map(s=>pins[s.id]).filter(Boolean);
  const [overrides,setOverrides]=useState({});
  const [position,setPosition]=useState(0);
  const positionRef=useRef(0);
  const [companion,setCompanion]=useState('fox');
  const [playing,setPlaying]=useState(false);
  const [zoom,setZoom]=useState(.5);
  const [pan,setPan]=useState({x:0,y:0});
  const view=useRef({zoom:.5,pan:{x:0,y:0}});
  const viewport=useRef(null),pointers=useRef(new Map()),gesture=useRef(null);
  const [message,setMessage]=useState('');
  const [showJson,setShowJson]=useState(false);
  const [imageFailed,setImageFailed]=useState(false);
  const key=directionStorageKey(userId,mapId);
  const point=gateRouteAt(route,position/1000);
  const segment=clamp(point?.segmentIndex??0,0,Math.max(0,segmentCount-1));
  const currentDirection=directionForSegment(route,segment,overrides);
  const auto=automaticDirection(route,segment);
  const overridden=Object.hasOwn(overrides,segment);
  const frame=foxRouteFrame(route,position/1000);

  const updateView=(z,p)=>{view.current={zoom:z,pan:p};setZoom(z);setPan(p);};
  const fit=()=>{
    const b=viewport.current?.getBoundingClientRect();
    if(!b?.width||!b?.height)return;
    const z=Math.min(b.width/map.w,b.height/map.h);
    updateView(z,{x:(b.width-map.w*z)/2,y:(b.height-map.h*z)/2});
  };
  const bounded=(p,z)=>{
    const b=viewport.current?.getBoundingClientRect();if(!b)return p;
    const axis=(x,w,s)=>w*z<=s?(s-w*z)/2:clamp(x,s-w*z,0);
    return {x:axis(p.x,map.w,b.width),y:axis(p.y,map.h,b.height)};
  };
  const seek=at=>{
    const value=clamp(Math.round(Number(at)||0),0,1000);
    positionRef.current=value;setPosition(value);
  };
  const seekSegment=index=>{
    const n=clamp(Math.round(index),0,segmentCount-1);
    const walked=route.slice(1,n+1).reduce((sum,p,i)=>
      sum+Math.hypot(p.x-route[i].x,p.y-route[i].y),0);
    const span=Math.hypot(route[n+1].x-route[n].x,route[n+1].y-route[n].y);
    seek(totalDistance>0?(walked+span*.45)/totalDistance*1000:0);
  };
  const save=next=>{
    setOverrides(next);
    try{
      localStorage.setItem(key,JSON.stringify(buildDirectionDraft(mapId,route,next)));
      setMessage('Direction draft saved on this device.');
    }catch{setMessage('Browser storage unavailable; copy the JSON before leaving.');}
  };
  useEffect(()=>{
    let saved={};
    try{saved=restoreDirectionDraft(localStorage.getItem(key),mapId,route);}catch{}
    setOverrides(saved);setPlaying(false);positionRef.current=0;setPosition(0);
    setMessage('');setShowJson(false);setImageFailed(false);
    pointers.current.clear();gesture.current=null;
    const raf=requestAnimationFrame(fit);
    return()=>cancelAnimationFrame(raf);
  },[mapId,userId]);
  useEffect(()=>{
    if(!playing)return undefined;
    let raf=0,last=null;
    const tick=now=>{
      if(last===null)last=now;
      const dt=Math.min(100,now-last);last=now;
      const next=Math.min(1000,positionRef.current+dt*1000/25000);
      positionRef.current=next;setPosition(Math.round(next));
      if(next>=1000){setPlaying(false);return;}
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[playing,mapId]);

  const pointerDown=e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const active=pointers.current;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
    if(active.size===1)gesture.current={kind:'single',id:e.pointerId,
      x:e.clientX,y:e.clientY,pan:view.current.pan,moved:false,canSeek:true};
    else if(active.size===2){
      const [a,b]=[...active.values()],rect=viewport.current.getBoundingClientRect();
      const mid={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
      gesture.current={kind:'pinch',distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
        startZoom:view.current.zoom,
        anchor:{x:(mid.x-view.current.pan.x)/view.current.zoom,
          y:(mid.y-view.current.pan.y)/view.current.zoom}};
    }else gesture.current=null;
  };
  const pointerMove=e=>{
    const active=pointers.current;if(!active.has(e.pointerId))return;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const g=gesture.current;if(!g)return;
    if(g.kind==='pinch'&&active.size===2){
      const [a,b]=[...active.values()],rect=viewport.current.getBoundingClientRect();
      const z=clamp(g.startZoom*Math.hypot(a.x-b.x,a.y-b.y)/g.distance,
        Math.min(rect.width/map.w,rect.height/map.h),2.6);
      const mid={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
      updateView(z,bounded({x:mid.x-g.anchor.x*z,y:mid.y-g.anchor.y*z},z));
    }else if(g.kind==='single'&&g.id===e.pointerId){
      const dx=e.clientX-g.x,dy=e.clientY-g.y;
      if(Math.hypot(dx,dy)>8)g.moved=true;
      if(g.moved)updateView(view.current.zoom,
        bounded({x:g.pan.x+dx,y:g.pan.y+dy},view.current.zoom));
    }
  };
  const pointerUp=e=>{
    const active=pointers.current,g=gesture.current;
    if(!active.has(e.pointerId))return;
    active.delete(e.pointerId);
    if(g?.kind==='pinch'){
      const last=[...active.entries()][0];
      gesture.current=last?{kind:'single',id:last[0],x:last[1].x,y:last[1].y,
        pan:view.current.pan,moved:true,canSeek:false}:null;
      return;
    }
    gesture.current=null;
    if(g?.kind!=='single'||g.id!==e.pointerId||g.moved||
      !g.canSeek||e.type==='pointercancel')return;
    // Tapping near the road seeks playback only. It never moves route geometry.
    const rect=viewport.current.getBoundingClientRect(),v=view.current;
    const p={x:(e.clientX-rect.left-v.pan.x)/v.zoom,
      y:(e.clientY-rect.top-v.pan.y)/v.zoom};
    let nearest={distance:Infinity,progress:0},walked=0;
    for(let i=1;i<route.length;i++){
      const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
      const t=len?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(len*len),0,1):0;
      const distance=Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);
      if(distance<nearest.distance)nearest={distance,progress:walked+len*t};
      walked+=len;
    }
    if(nearest.distance<Math.max(45,25/v.zoom)&&totalDistance>0){
      setPlaying(false);seek(nearest.progress/totalDistance*1000);
    }
  };

  const chooseDirection=value=>{
    if(!WALK_DIRECTIONS.includes(value))return;
    save({...overrides,[segment]:value});
  };
  const revertSegment=()=>{
    const next={...overrides};delete next[segment];save(next);
  };
  const resetAll=()=>{
    if(!Object.keys(overrides).length||!window.confirm('Reset all direction overrides for this map?'))return;
    save({});
  };
  const json=JSON.stringify(buildDirectionDraft(mapId,route,overrides),null,2);
  const copy=async()=>{
    try{await navigator.clipboard.writeText(json);setMessage('Direction JSON copied.');}
    catch{setShowJson(true);setMessage('Copy the JSON from the box below.');}
  };
  return <div data-swipe-block="true"
    className="z-marker-workbench mx-auto w-full min-w-0 max-w-2xl px-3 pb-10 pt-3">
    <header className="flex items-center gap-3">
      <button type="button" className="z-marker-tool" onClick={onBack}>← Back</button>
      <div className="min-w-0">
        <div className="text-xs font-bold tracking-wider">DEV · SECTION 1 · DIRECTION STAGE</div>
        <h1 className="font-serif text-xl font-bold">Choose walking directions</h1>
      </div>
    </header>
    <label htmlFor="z-direction-map" className="mt-3 block text-sm font-semibold">Map</label>
    <select id="z-direction-map" className="z-marker-select mt-1 w-full"
      value={mapId} onChange={e=>setMapId(e.target.value)}>
      {MAPS.map(m=><option value={m.id} key={m.id}>{m.title}</option>)}
    </select>
    <div className="mt-2 flex justify-between text-xs gap-3">
      <span>{markers.length} locked markers · {route.length} locked points</span>
      <span>{Object.keys(overrides).length} directions overridden</span>
    </div>
    <p className="mt-2 text-xs">Pick a route section, then choose the direction
      Fox or Wolf should face while walking there. Auto follows the road.
      Pan by dragging, pinch to zoom, or tap near the road to seek.</p>
    <div className="z-marker-viewport mt-2" ref={viewport} data-swipe-block="true"
      onPointerDown={pointerDown} onPointerMove={pointerMove}
      onPointerUp={pointerUp} onPointerCancel={pointerUp}
      aria-label={'Walk direction preview for '+map.title}>
      <div className="z-marker-world" style={{width:map.w,height:map.h,
        transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
        <img src={map.url} alt="" draggable={false} className="z-marker-art"
          style={{top:0,width:map.w,height:map.h}} onError={()=>setImageFailed(true)}/>
        <svg className="z-route-lines" width={map.w} height={map.h}
          viewBox={`0 0 ${map.w} ${map.h}`} aria-hidden="true">
          <polyline points={route.map(p=>p.x+','+p.y).join(' ')}
            fill="none" stroke="#fbe0a0" strokeWidth="9" strokeOpacity=".50"
            strokeLinecap="round" strokeLinejoin="round"/>
          {route.slice(1).map((p,i)=><line key={i}
            x1={route[i].x} y1={route[i].y} x2={p.x} y2={p.y}
            stroke={i===segment?'#f78e2b':'transparent'} strokeWidth="13"
            strokeLinecap="round"/>) }
        </svg>
        {markers.map((p,i)=><span key={i} className="z-marker-pin z-size-locked-marker"
          aria-hidden="true" style={{left:p.x,top:p.y,
          transform:`translate(-50%,-100%) scale(${1/zoom})`}}>{i+1}</span>)}
        {point&&<span className="z-size-avatar-anchor" aria-hidden="true"
          style={{left:point.x,top:point.y}}>
          <span className="z-size-avatar-body">
            <FoxWalkSprite frame={frame} facing={currentDirection}
              companionId={companion} scale={1}/>
          </span><span className="z-size-paw-marker"/>
        </span>}
      </div>
      {imageFailed&&<p className="z-marker-error">Map image unavailable. Saved drafts are intact.</p>}
    </div>
    <section className="z-size-controls mt-3 rounded-xl border p-3">
      <div className="z-size-companion-row" role="group" aria-label="Companion preview">
        <button type="button" className={'z-marker-tool '+(companion==='fox'?'z-size-active':'')}
          aria-pressed={companion==='fox'} onClick={()=>setCompanion('fox')}>Fox</button>
        <button type="button" className={'z-marker-tool '+(companion==='wolf'?'z-size-active':'')}
          aria-pressed={companion==='wolf'} onClick={()=>setCompanion('wolf')}>Wolf</button>
      </div>
      <div className="mt-3 flex justify-between text-sm font-semibold">
        <label htmlFor="z-direction-position">Position along route</label>
        <span>{(position/10).toFixed(1)}%</span>
      </div>
      <input id="z-direction-position" className="z-size-range" type="range"
        min="0" max="1000" step="1" value={position}
        onChange={e=>{setPlaying(false);seek(e.target.value);}}/>
      <div className="z-direction-step-row mt-2">
        <button type="button" className="z-marker-tool" disabled={segment===0}
          onClick={()=>{setPlaying(false);seekSegment(segment-1);}}>← Previous</button>
        <span><strong>{segment+1}</strong> / {segmentCount}</span>
        <button type="button" className="z-marker-tool"
          disabled={segment>=segmentCount-1}
          onClick={()=>{setPlaying(false);seekSegment(segment+1);}}>Next →</button>
      </div>
      <p className="mt-3 text-sm">Section {segment+1} faces <strong>{LABELS[currentDirection]}</strong>
        {' · '}{overridden?'Manual override':'Auto'}
        {' · '}Suggested: {LABELS[auto]}</p>
      <div className="z-direction-grid mt-2" role="group" aria-label="Direction for selected segment">
        {WALK_DIRECTIONS.map(value=><button key={value} type="button"
          aria-pressed={currentDirection===value}
          className={'z-marker-tool '+(currentDirection===value?'z-size-active':'')}
          onClick={()=>{setPlaying(false);chooseDirection(value);}}>
          {LABELS[value]}</button>)}
      </div>
      <div className="z-direction-step-row mt-3">
        <button type="button" className="z-marker-tool" disabled={!overridden}
          onClick={revertSegment}>Use automatic</button>
        <button type="button" className="z-marker-tool"
          onClick={()=>{if(positionRef.current>=1000)seek(0);setPlaying(p=>!p);}}>
          {playing?'Pause preview':'▶ Play walk'}</button>
        <button type="button" className="z-marker-tool" disabled={!Object.keys(overrides).length}
          onClick={resetAll}>Reset all</button>
      </div>
      <p className="mt-2 text-xs opacity-75">Only the walking direction for each segment can
        change here. The route, markers and sprite size are locked.</p>
    </section>
    {message&&<p role="status" className="mt-2 text-xs">{message}</p>}
    <button type="button" className="z-marker-export-button mt-3 w-full"
      onClick={copy}>Copy directions JSON</button>
    <button type="button" className="mt-2 w-full min-h-[44px] text-sm underline"
      onClick={()=>setShowJson(v=>!v)}>{showJson?'Hide':'Show'} directions JSON</button>
    {showJson&&<textarea className="z-marker-json w-full rounded-lg p-2"
      readOnly value={json} rows={12} aria-label="Direction JSON"/>}
    <p className="mt-2 text-xs opacity-75">Overrides save locally per account and map.
      Send the direction JSON once approved. Next, sizing will use held sizes:
      each chosen size stays constant until another size point is saved.
      The older experimental sizing drafts remain preserved separately.</p>
  </div>;
}