// Stage 3 (DEV only): held sprite sizes on user-approved portrait routes.
// Previous lesson-marker and route-tracing tools are deliberately hidden.
// Learner routes, completed lessons and production gameplay are untouched.
import React,{useEffect,useRef,useState} from 'react';
import './JourneyMapWorkbench.css';
import FoxWalkSprite from './FoxWalkSprite';
import {approvedPortraitMarkerPositions} from './section1PortraitMarkers';
import {approvedPortraitRoutePoints} from './section1PortraitRoutes';
import {gateRouteAt,gateAutomaticDirection} from './journeyGateRouteEditor';
import {foxRouteTotalDistance,foxRouteFrame} from './journeyFoxRoutePlayback';
import {nearestRouteProgress} from './journeyRouteTraceDraft';
import {directionPlanSignature} from './journeyPortraitDirectionDraft';
import {companionStorageKey,buildCompanionDraft,restoreCompanionDraft,
  savePlacement,clearPlacement,previewPlacement} from './journeyPortraitCompanionDraft';
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
  const checkpointStops=stops.filter(s=>s.id?.endsWith('checkpoint')&&pins[s.id]).map(s=>{
    const projection=nearestRouteProgress(approvedPortraitRoutePoints(mapId),pins[s.id]);
    const length=foxRouteTotalDistance(approvedPortraitRoutePoints(mapId));
    return {id:s.id,at:Math.max(1,Math.min(1000,Math.round((projection?.progress||0)*1000/(length||1)))),
      offset:Math.round(projection?.distance||0),label:s.id==='section_1_checkpoint'?'Section checkpoint':'Module checkpoint'};
  }).sort((a,b)=>a.at-b.at);
  // These are the EXACT approved routes. Sizing cannot edit any route point.
  const route=approvedPortraitRoutePoints(mapId);
  const routeLength=foxRouteTotalDistance(route);
  // David accepted the automatic eight-direction facing for every segment.
  // Bind sizing drafts to that exact facing plan, without enabling overrides.
  const facingSignature=directionPlanSignature(route,{});
  const [anchors,setAnchors]=useState(defaultSizeAnchors);
  const [placements,setPlacements]=useState([]);
  const placementsRef=useRef([]);
  const [trialPlacement,setTrialPlacement]=useState(null);
  const trialPlacementRef=useRef(null);
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
  const key=companionStorageKey(userId,mapId,companion);
  const selectedAnchor=anchors.find(a=>a.at===position);
  const selectedPlacement=placements.find(a=>a.at===position);
  const renderedPercent=trialSize??Math.round(sizeAtProgress(anchors,position));
  const currentCheckpoint=checkpointStops.find(stop=>stop.at===position);
  const facingCamera=position===0||Boolean(currentCheckpoint);
  const spritePoint=trialPlacement||previewPlacement(route,placements,position);
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
    setTrialSize(null);trialPlacementRef.current=null;setTrialPlacement(null);
  };
  const save=(nextSizes,nextPlacements,message='Companion profile saved on this device.')=>{
    const draft=buildCompanionDraft(mapId,route,companion,
      nextSizes,nextPlacements,facingSignature);
    setAnchors(draft.anchors);setPlacements(draft.placements);
    placementsRef.current=draft.placements;setStatus(message);
    try{localStorage.setItem(key,JSON.stringify(draft));}
    catch{setStatus('Browser storage unavailable; copy your JSON before leaving.');}
  };
  useEffect(()=>{
    let next=null;
    try{
      const raw=localStorage.getItem(key);
      next=restoreCompanionDraft(raw,mapId,route,companion,facingSignature);
      if(!next&&raw===null&&companion==='fox'){
        // Preserve the old shared v2 draft and migrate only to Fox's private copy.
        const earlier=restoreSizeDraft(localStorage.getItem(sizeStorageKey(userId,mapId)),
          mapId,route,facingSignature);
        if(earlier){
          next={anchors:earlier,placements:[]};
          localStorage.setItem(key,JSON.stringify(
            buildCompanionDraft(mapId,route,companion,earlier,[],facingSignature)));
        }
      }
    }catch{}
    const draft=next||{anchors:defaultSizeAnchors(),placements:[]};
    setAnchors(draft.anchors);setPlacements(draft.placements);
    placementsRef.current=draft.placements;trialPlacementRef.current=null;
    setTrialPlacement(null);setTrialSize(null);setPlaying(false);
    setStatus('');setShowJson(false);
  },[mapId,userId,companion]);
  useEffect(()=>{
    positionRef.current=0;setPosition(0);setImageFailed(false);
    pointers.current.clear();gesture.current=null;
    const raf=requestAnimationFrame(fit);
    return()=>cancelAnimationFrame(raf);
  },[mapId,userId]);
  useEffect(()=>{
    if(!playing)return undefined;
    let raf=0,last=null;
    const tick=(now)=>{
      if(last===null)last=now;
      const step=Math.min(100,now-last);
      last=now;
      const next=Math.min(1000,positionRef.current+step*1000/22000);
      // Hold the original front-facing idle when reaching a checkpoint.
      // These are preview-only projections; stop anchors need later approval.
      const checkpoint=checkpointStops.find(stop=>stop.at>positionRef.current+0.01&&stop.at<=next);
      if(checkpoint){
        positionRef.current=checkpoint.at;setPosition(checkpoint.at);
        setPlaying(false);setStatus(checkpoint.label+' reached — facing the camera.');return;
      }
      positionRef.current=next;
      setPosition(Math.round(next));
      if(next>=1000){setPlaying(false);return;}
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[playing,mapId]);
  const worldAt=(clientX,clientY)=>{
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    return {x:(clientX-b.left-v.pan.x)/v.zoom,
      y:(clientY-b.top-v.pan.y)/v.zoom};
  };
  const hitSprite=(clientX,clientY)=>{
    const b=viewport.current.getBoundingClientRect(),v=view.current;
    const paw=trialPlacementRef.current||
      previewPlacement(route,placementsRef.current,positionRef.current);
    const x=b.left+v.pan.x+paw.x*v.zoom,y=b.top+v.pan.y+paw.y*v.zoom;
    const factor=(trialSize??sizeAtProgress(anchors,positionRef.current))/100;
    const halfWidth=Math.max(28,45*factor*v.zoom);
    const spriteHeight=Math.max(48,112*factor*v.zoom);
    return Math.abs(clientX-x)<=halfWidth&&clientY>=y-spriteHeight-12&&clientY<=y+20;
  };
  const touchStart=(e)=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const active=pointers.current;
    active.set(e.pointerId,{x:e.clientX,y:e.clientY});
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
    if(active.size===1){
      const hit=hitSprite(e.clientX,e.clientY);
      const grab=worldAt(e.clientX,e.clientY);
      const paw=trialPlacementRef.current||
        previewPlacement(route,placementsRef.current,positionRef.current);
      gesture.current={kind:hit?'sprite':'single',id:e.pointerId,
        x:e.clientX,y:e.clientY,pan:view.current.pan,moved:false,
        canSeek:!hit,startAt:positionRef.current,
        offset:{x:grab.x-paw.x,y:grab.y-paw.y}};
      if(hit)setPlaying(false);
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
    }else if(g.kind==='sprite'&&g.id===e.pointerId){
      if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>5)g.moved=true;
      if(!g.moved)return;
      const p=worldAt(e.clientX,e.clientY);
      const paw={x:Math.round(clamp(p.x-g.offset.x,0,map.w)),
        y:Math.round(clamp(p.y-g.offset.y,0,map.h))};
      // Keep travel progress tied to the approved road while preview paw position
      // can be freely adjusted. No route coordinate or marker is modified.
      const closest=nearestRouteProgress(route,paw);
      const at=routeLength>0
        ?clamp(Math.round(closest.progress/routeLength*1000),0,1000):0;
      positionRef.current=at;setPosition(at);
      trialPlacementRef.current=paw;setTrialPlacement(paw);
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
    if(g?.kind==='sprite'&&g.id===e.pointerId){
      if(g.moved&&e.type!=='pointercancel'&&trialPlacementRef.current){
        const next=savePlacement(placementsRef.current,positionRef.current,
          trialPlacementRef.current);
        save(anchors,next,companion+' placement saved — adjust the size as needed.');
      }else if(e.type==='pointercancel'){
        positionRef.current=g.startAt;setPosition(g.startAt);
      }
      trialPlacementRef.current=null;setTrialPlacement(null);
      return;
    }
    if(!g||g.kind!=='single'||g.id!==e.pointerId||
      g.moved||!g.canSeek||e.type==='pointercancel')return;
    const v=view.current;
    const world=worldAt(e.clientX,e.clientY);
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
    save(next,placements,'Size saved for '+companion+' until the next size point.');setTrialSize(null);
  };
  const removeAt=()=>{
    if(!selectedAnchor||position===0)return;
    save(removeSizeAnchor(anchors,position),placements);
    setTrialSize(null);setStatus('Intermediate size point removed.');
  };
  const reset=()=>{
    if(!window.confirm('Reset this map to one starting size, with no automatic shrinking?'))return;
    save(defaultSizeAnchors(),[],'Reset '+companion+' on this map.');setTrialSize(null);seek(0);
  };
  const removePlacementAt=()=>{
    if(!selectedPlacement)return;
    save(anchors,clearPlacement(placements,position),companion+' placement removed.');
  };
  const exportJson=JSON.stringify(
    buildCompanionDraft(mapId,route,companion,anchors,placements,facingSignature),null,2);
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
        <h1 className="font-serif text-xl font-bold">Adjust companion size &amp; position</h1>
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
    <p className="mt-2 text-xs">Drag the visible Fox or Wolf to reposition its paws.
      Drag empty scenery to pan; pinch to zoom. Size and placement are recorded
      separately for each companion, with the markers and route locked.</p>
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
            {facingCamera
              ? <img className="z-size-idle-sprite" draggable={false} decoding="async"
                  src={companion==='wolf'?'/assets/journey/wolf-idle.webp':'/assets/journey/fox-idle.webp'}
                  alt="" />
              : <FoxWalkSprite frame={frame} facing={facing} companionId={companion} scale={1}/>}
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
        <button type="button" onClick={()=>{setPlaying(false);seek(0);}}>Start · face camera</button>
        <button type="button" onClick={()=>{setPlaying(false);seek(1000);}}>Far exit</button>
      </div>
      <div className="z-size-checkpoint-actions" aria-label="Checkpoint facing previews">
        {checkpointStops.map(stop=><button type="button" key={stop.id}
          className={'z-marker-tool '+(stop.at===position?'z-size-active':'')}
          onClick={()=>{setPlaying(false);seek(stop.at);}}
          aria-pressed={stop.at===position}>{stop.label} · face camera</button>)}
      </div>
      {currentCheckpoint&&<p className="mt-1 text-xs">Checkpoint preview on the traced road.
        Final lesson stopping anchors still need approval.</p>}
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
      <div className="mt-3 text-xs">Saved {companion} size points ({anchors.length}) — tap one to review</div>
      <div className="z-size-anchor-list">
        {anchors.map(a=><button type="button" key={a.at}
          className={'z-size-anchor-chip '+(a.at===position?'selected':'')}
          onClick={()=>{setPlaying(false);seek(a.at);}}>
          {(a.at/10).toFixed(1)}% · {a.size}%
        </button>)}
      </div>
      <div className="mt-3 text-xs">Saved {companion} placements ({placements.length}).
        Drag the character on the map to adjust and save its paw position.</div>
      <div className="z-size-anchor-list">
        {placements.map(p=><button type="button" key={p.at}
          className={'z-size-anchor-chip '+(p.at===position?'selected':'')}
          onClick={()=>{setPlaying(false);seek(p.at);}}>
          {(p.at/10).toFixed(1)}% · {p.x}, {p.y}
        </button>)}
      </div>
      <div className="z-size-secondary-actions mt-3">
        <button type="button" className="z-marker-tool"
          disabled={!selectedAnchor||position===0} onClick={removeAt}>Remove size point</button>
        <button type="button" className="z-marker-tool"
          disabled={!selectedPlacement} onClick={removePlacementAt}>Remove placement</button>
        <button type="button" className="z-marker-tool" onClick={reset}>Reset {companion}</button>
      </div>
    </section>
    {status&&<p className="mt-3 text-xs" role="status">{status}</p>}
    <button type="button" className="z-marker-export-button mt-3 w-full" onClick={copy}>
      Copy {companion} size + placement JSON</button>
    <button type="button" className="mt-2 w-full min-h-[44px] text-sm underline"
      onClick={()=>setShowJson(x=>!x)}>{showJson?'Hide':'Show'} saved sizes</button>
    {showJson&&<textarea className="z-marker-json w-full rounded-lg p-2" readOnly
      aria-label="Companion sizing JSON" rows={12} value={exportJson}/>}
    <p className="mt-2 text-xs opacity-75">
      The automatic walking directions are approved. At the start and checkpoints,
      Fox and Wolf use the original front-facing idle image. Checkpoint locations
      here are visual road projections, not final game stop anchors.
      Fox and Wolf each have their own size and placement settings for every map.
      Saved sizes hold until the next size point; placements are saved as
      absolute 1024×1536 paw coordinates and blended into route playback.
      Neither the route nor the locked lesson markers are changed. Copy each
      companion's combined JSON when you're happy with it.
      Nothing changes the approved gameplay or learner progress yet.
    </p>
  </div>;
}
