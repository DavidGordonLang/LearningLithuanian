// Stage 3 (DEV only): adjust Fox/Wolf size on locked portrait routes.
// Previous lesson-marker and route-tracing tools are deliberately hidden.
// Learner routes, completed lessons and production gameplay are untouched.
import React,{useEffect,useRef,useState} from 'react';
import './JourneyMapWorkbench.css';
import FoxWalkSprite from './FoxWalkSprite';
import {approvedPortraitMarkerPositions} from './section1PortraitMarkers';
import {approvedPortraitRoutePoints} from './section1PortraitRoutes';
import {gateRouteAt,gateAutomaticDirection} from './journeyGateRouteEditor';
import {foxRouteTotalDistance,foxRouteFrame} from './journeyFoxRoutePlayback';
import {defaultSizeAnchors,sizeAtProgress,setSizeAnchor,removeSizeAnchor,
  sizeStorageKey,buildSizeDraft,restoreSizeDraft,
  SIZE_MIN_PERCENT,SIZE_MAX_PERCENT} from './journeyPortraitSizeDraft';

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
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export default function JourneyMapWorkbench({allSections=[],userId,onBack}){
  const [mapId,setMapId]=useState('module_1_1');
  const map=MAPS.find(m=>m.id===mapId)||MAPS[0];
  const section=allSections.find(s=>s.id==='section_1');
  const module=section?.modules?.find(m=>m.id===mapId);
  const checkpoint=section?.modules?.find(m=>m.isSectionCheckpoint);
  const stops=[...(module?.lessons||[]),...(mapId==='module_1_4'&&checkpoint?[checkpoint]:[])];
  const pins=approvedPortraitMarkerPositions(mapId,stops.map(s=>s.id));
  const markers=stops.map(s=>pins[s.id]).filter(Boolean);
  // These are the EXACT approved routes. Sizing cannot edit any route point.
  const route=approvedPortraitRoutePoints(mapId);
  const routeLength=foxRouteTotalDistance(route);
  const [anchors,setAnchors]=useState(defaultSizeAnchors);
  const [position,setPosition]=useState(0);
  const positionRef=useRef(0);
  const [trialSize,setTrialSize]=useState(null);
  const [companion,setCompanion]=useState('fox');
  const [playing,setPlaying]=useState(false);
  const [zoom,setZoom]=useState(.5);
  const [pan,setPan]=useState({x:0,y:0});
  const view=useRef({zoom:.5,pan:{x:0,y:0}});
  const viewport=useRef(null),pointers=useRef(new Map()),gesture=useRef(null);
  const [status,setStatus]=useState('');
  const [showJson,setShowJson]=useState(false);
  const [imageFailed,setImageFailed]=useState(false);
  const key=sizeStorageKey(userId,mapId);
  const selectedAnchor=anchors.find(a=>a.at===position);
  const renderedPercent=trialSize??Math.round(sizeAtProgress(anchors,position));
  const spritePoint=gateRouteAt(route,position/1000);
  const segmentIndex=Math.min(spritePoint?.segmentIndex??0,Math.max(0,route.length-2));
  const facing=route.length>1?
    gateAutomaticDirection(route[segmentIndex],route[segmentIndex+1]):'up';
  const frame=foxRouteFrame(route,position/1000);

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
    const axis=(v,size,available)=>size*z<=available
      ?(available-size*z)/2:clamp(v,available-size*z,0);
    return {x:axis(p.x,map.w,b.width),y:axis(p.y,map.h,b.height)};
  };
  const seek=(at)=>{
    const target=clamp(Math.round(Number(at)||0),0,1000);
    positionRef.current=target;
    setPosition(target);
    setTrialSize(null);
  };
  const save=(next)=>{
    const draft=buildSizeDraft(mapId,route,next);
    setAnchors(draft.anchors);
    try{
      localStorage.setItem(key,JSON.stringify(draft));
      setStatus('Size profile saved on this device.');
    }catch{setStatus('Browser storage unavailable; copy your size JSON before leaving.');}
  };
  useEffect(()=>{
    let next=null;
    try{next=restoreSizeDraft(localStorage.getItem(key),mapId,route);}catch{}
    setAnchors(next||defaultSizeAnchors());
    setPlaying(false);positionRef.current=0;setPosition(0);
    setTrialSize(null);setStatus('');setShowJson(false);setImageFailed(false);
    pointers.current.clear();gesture.current=null;
    const raf=requestAnimationFrame(fit);
    return()=>cancelAnimationFrame(raf);
    // Map/account alone resets camera and position; slider movement must not.
  },[mapId,userId]);
  useEffect(()=>{
    if(!playing)return undefined;
    let raf=0,last=null;
    const tick=(now)=>{
      if(last===null)last=now;
      const step=Math.min(100,now-last);
      last=now;
      const next=Math.min(1000,positionRef.current+step*1000/22000);
      positionRef.current=next;
      setPosition(Math.round(next));
      if(next>=1000){setPlaying(false);return;}
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[playing,mapId]);
  const touchStart=(e)=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const active=pointers.current;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
    if(active.size===1){
      gesture.current={kind:'single',id:e.pointerId,x:e.clientX,y:e.clientY,
        pan:view.current.pan,moved:false,canSeek:true};
    }else if(active.size===2){
      const [a,b]=[...active.values()],bounds=viewport.current.getBoundingClientRect();
      const mid={x:(a.x+b.x)/2-bounds.left,y:(a.y+b.y)/2-bounds.top};
      gesture.current={kind:'pinch',
        startDistance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
        startZoom:view.current.zoom,
        anchor:{x:(mid.x-view.current.pan.x)/view.current.zoom,
          y:(mid.y-view.current.pan.y)/view.current.zoom}};
    }else gesture.current=null;
  };
  const touchMove=(e)=>{
    const active=pointers.current;
    if(!active.has(e.pointerId))return;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const g=gesture.current;
    if(!g)return;
    if(g.kind==='pinch'&&active.size===2){
      const [a,b]=[...active.values()],rect=viewport.current.getBoundingClientRect();
      const z=clamp(g.startZoom*(Math.hypot(a.x-b.x,a.y-b.y)/g.startDistance),
        Math.min(rect.width/map.w,rect.height/map.h),2.6);
      const mid={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
      updateView(z,boundCamera({x:mid.x-g.anchor.x*z,y:mid.y-g.anchor.y*z},z));
    }else if(g.kind==='single'&&g.id===e.pointerId){
      const dx=e.clientX-g.x,dy=e.clientY-g.y;
      if(Math.hypot(dx,dy)>8)g.moved=true;
      if(g.moved)updateView(view.current.zoom,
        boundCamera({x:g.pan.x+dx,y:g.pan.y+dy},view.current.zoom));
    }
  };
  const touchEnd=(e)=>{
    const active=pointers.current,g=gesture.current;
    if(!active.has(e.pointerId))return;
    active.delete(e.pointerId);
    if(g?.kind==='pinch'){
      const item=[...active.entries()][0];
      gesture.current=item?{kind:'single',id:item[0],x:item[1].x,y:item[1].y,
        pan:view.current.pan,moved:true,canSeek:false}:null;
      return;
    }
    gesture.current=null;
    if(!g||g.kind!=='single'||g.id!==e.pointerId||
      g.moved||!g.canSeek||e.type==='pointercancel')return;
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    const world={x:(e.clientX-b.left-v.pan.x)/v.zoom,
      y:(e.clientY-b.top-v.pan.y)/v.zoom};
    let best={distance:Infinity,walked:0},travelled=0;
    for(let i=1;i<route.length;i++){
      const a=route[i-1],c=route[i],dx=c.x-a.x,dy=c.y-a.y,len=Math.hypot(dx,dy);
      const t=len>0?clamp(((world.x-a.x)*dx+(world.y-a.y)*dy)/(len*len),0,1):0;
      const distance=Math.hypot(world.x-a.x-dx*t,world.y-a.y-dy*t);
      if(distance<best.distance)best={distance,walked:travelled+t*len};
      travelled+=len;
    }
    if(best.distance<Math.max(45,25/v.zoom)&&routeLength>0){
      setPlaying(false);seek(best.walked/routeLength*1000);
    }
  };
  const saveAt=()=>{
    if(trialSize===null&&!selectedAnchor)return;
    const next=setSizeAnchor(anchors,position,renderedPercent);
    save(next);setTrialSize(null);setStatus('Size point saved. It blends smoothly into the journey.');
  };
  const removeAt=()=>{
    if(!selectedAnchor||position===0||position===1000)return;
    save(removeSizeAnchor(anchors,position));
    setTrialSize(null);setStatus('Intermediate size point removed.');
  };
  const reset=()=>{
    if(!window.confirm('Reset size profile on this map to the initial near/far settings?'))return;
    save(defaultSizeAnchors());setTrialSize(null);seek(0);
  };
  const exportJson=JSON.stringify(buildSizeDraft(mapId,route,anchors),null,2);
  const copy=async()=>{
    try{await navigator.clipboard.writeText(exportJson);setStatus('Size profile JSON copied.');}
    catch{setShowJson(true);setStatus('Select and copy the JSON below.');}
  };
  return <div data-swipe-block="true"
    className="z-marker-workbench mx-auto w-full min-w-0 max-w-2xl px-3 pb-10 pt-3">
    <header className="flex items-center gap-3">
      <button type="button" className="z-marker-tool" onClick={onBack}>← Back</button>
      <div className="min-w-0">
        <div className="text-xs font-bold tracking-wider">DEV · SECTION 1 · SIZE STAGE</div>
        <h1 className="font-serif text-xl font-bold">Adjust companion size</h1>
      </div>
    </header>
    <label htmlFor="z-size-map-select" className="mt-3 block text-sm font-semibold">Map</label>
    <select id="z-size-map-select" className="z-marker-select mt-1 w-full"
      value={mapId} onChange={e=>setMapId(e.target.value)}>
      {MAPS.map(m=><option value={m.id} key={m.id}>{m.title}</option>)}
    </select>
    <div className="mt-2 flex justify-between text-xs gap-3">
      <span>{markers.length} locked markers · {route.length} locked route points</span>
      <span>1024 × 1536</span>
    </div>
    <p className="mt-2 text-xs">Drag the map to pan, pinch to zoom, or tap near
      the walking path to position your companion. The artwork, markers and
      route are locked during sizing.</p>
    <div className="z-marker-viewport mt-2" ref={viewport} data-swipe-block="true"
      onPointerDown={touchStart} onPointerMove={touchMove}
      onPointerUp={touchEnd} onPointerCancel={touchEnd}
      aria-label={'Sprite size preview for '+map.title}>
      <div className="z-marker-world" style={{width:map.w,height:map.h,
        transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}>
        <img src={map.url} alt="" draggable={false} className="z-marker-art"
          style={{top:0,width:map.w,height:map.h}} onError={()=>setImageFailed(true)}/>
        <svg className="z-route-lines" width={map.w} height={map.h}
          viewBox={`0 0 ${map.w} ${map.h}`} aria-hidden="true">
          <polyline points={route.map(p=>p.x+','+p.y).join(' ')}
            fill="none" stroke="#fcdf8d" strokeWidth="9" strokeOpacity=".5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {markers.map((p,i)=><span key={i} className="z-marker-pin z-size-locked-marker"
          aria-hidden="true" style={{left:p.x,top:p.y,
          transform:`translate(-50%,-100%) scale(${1/zoom})`}}>{i+1}</span>)}
        {spritePoint&&<span className="z-size-avatar-anchor" aria-hidden="true"
          style={{left:spritePoint.x,top:spritePoint.y}}>
          <span className="z-size-avatar-body"
            style={{transform:`scale(${renderedPercent/100})`}}>
            <FoxWalkSprite frame={frame} facing={facing} companionId={companion} scale={1}/>
          </span>
          <span className="z-size-paw-marker"/>
        </span>}
      </div>
      {imageFailed&&<p className="z-marker-error">Map image unavailable. Your size draft remains intact.</p>}
    </div>
    <section className="z-size-controls mt-3 rounded-xl border p-3">
      <div className="z-size-companion-row" role="group" aria-label="Companion preview">
        <button type="button" className={'z-marker-tool '+(companion==='fox'?'z-size-active':'')}
          aria-pressed={companion==='fox'} onClick={()=>setCompanion('fox')}>Fox</button>
        <button type="button" className={'z-marker-tool '+(companion==='wolf'?'z-size-active':'')}
          aria-pressed={companion==='wolf'} onClick={()=>setCompanion('wolf')}>Wolf</button>
      </div>
      <div className="mt-3 flex justify-between text-sm font-semibold">
        <label htmlFor="z-size-position">Position along walking route</label>
        <span>{(position/10).toFixed(1)}%</span>
      </div>
      <input id="z-size-position" className="z-size-range" type="range" min="0" max="1000"
        step="1" value={position} onChange={e=>{setPlaying(false);seek(e.target.value);}}/>
      <div className="z-size-ends">
        <button type="button" onClick={()=>{setPlaying(false);seek(0);}}>Entrance</button>
        <button type="button" onClick={()=>{setPlaying(false);seek(1000);}}>Far exit</button>
      </div>
      <div className="mt-3 flex justify-between text-sm font-semibold">
        <label htmlFor="z-size-value">Size at this position</label>
        <span>{renderedPercent}%</span>
      </div>
      <input id="z-size-value" className="z-size-range" type="range"
        min={SIZE_MIN_PERCENT} max={SIZE_MAX_PERCENT} step="1" value={renderedPercent}
        onChange={e=>{setPlaying(false);setTrialSize(Number(e.target.value));}}/>
      <div className="z-size-scale-ends"><span>12% · distant</span><span>240% · close</span></div>
      <div className="z-size-action-row mt-3">
        <button type="button" className="z-marker-export-button"
          disabled={trialSize===null&&!selectedAnchor} onClick={saveAt}>Save size point</button>
        <button type="button" className="z-marker-tool"
          onClick={()=>{if(positionRef.current>=1000)seek(0);setTrialSize(null);setPlaying(p=>!p);}}>
          {playing?'Pause preview':'▶ Play walk'}
        </button>
      </div>
      <div className="mt-3 text-xs">Saved size points ({anchors.length}) — tap one to review</div>
      <div className="z-size-anchor-list">
        {anchors.map(a=><button type="button" key={a.at}
          className={'z-size-anchor-chip '+(a.at===position?'selected':'')}
          onClick={()=>{setPlaying(false);seek(a.at);}}>
          {(a.at/10).toFixed(1)}% · {a.size}%
        </button>)}
      </div>
      <div className="z-size-secondary-actions mt-3">
        <button type="button" className="z-marker-tool"
          disabled={!selectedAnchor||position===0||position===1000} onClick={removeAt}>
          Remove size point
        </button>
        <button type="button" className="z-marker-tool" onClick={reset}>Reset sizes</button>
      </div>
    </section>
    {status&&<p className="mt-3 text-xs" role="status">{status}</p>}
    <button type="button" className="z-marker-export-button mt-3 w-full" onClick={copy}>
      Copy sizing JSON</button>
    <button type="button" className="mt-2 w-full min-h-[44px] text-sm underline"
      onClick={()=>setShowJson(x=>!x)}>{showJson?'Hide':'Show'} saved sizes</button>
    {showJson&&<textarea className="z-marker-json w-full rounded-lg p-2" readOnly
      aria-label="Companion sizing JSON" rows={12} value={exportJson}/>}
    <p className="mt-2 text-xs opacity-75">
      This is one shared perspective profile for Fox and Wolf on this map.
      Adjust size from 12–240% along the approved route and save extra size points
      wherever perspective changes. Local edits are separate for each map.
      Copy the sizing JSON when you're happy so it can be banked.
      Nothing changes the approved gameplay or learner progress yet.
    </p>
  </div>;
}
