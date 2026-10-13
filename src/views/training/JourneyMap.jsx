import React, { useEffect, useRef, useState } from "react";
import {useAuthStore} from "../../stores/authStore";
import { FullBodyCompanion } from "./JourneyCompanion";
import FoxWalkSprite, { FOX_WALK_DIRECTIONS } from "./FoxWalkSprite";
import {preloadFoxWalkAtlases} from "./foxWalkAtlasPreload";
import "./foxGapReplay.css";
import {FOX_ROUTE_WORLD_PX_PER_SECOND,foxRouteAdvance,foxRouteFrame,
  foxRouteTotalDistance} from "./journeyFoxRoutePlayback";
import {readFoxSizeDraft,saveFoxSizeDraft,
  FOX_APPROVED_FAR_SIZE,FOX_APPROVED_SIZE_STOPS} from "./foxSizeDraftStorage";
import {readFoxLessonStopDraft,saveFoxLessonStopDraft,
  foxLessonStopPlan,foxLessonStopOrderProblem,
  foxLessonRouteAdvance,FOX_APPROVED_LESSON_STOPS} from "./foxLessonStopDraft";
import { clampCamera, fitMapScale, pinchView } from "./journeyMapGestures";
import { GATE_ROUTE_POINTS, GATE_STAGE_PROGRESS, gateTraverseAt } from "./journeyGateTraverse";
import { gateWorldPoint, gateInsertPoint, gateMovePoint, gateRouteJson,
  USER_TRACED_VILLAGE_ROUTE, gateRouteAt, gateDirectionPlan,
  gateSegmentMidpointProgress, gateFoxDepthScale,
  gateFoxScaleWithStops, gateFoxSizePlan } from "./journeyGateRouteEditor";


// Each module uses the same five-stop coordinate contract. New illustrated
// regions can supply different scenery without changing curriculum IDs.
const POINTS = [
  { x: 164, y: 1010 }, { x: 635, y: 850 }, { x: 240, y: 635 },
  { x: 655, y: 405 }, { x: 325, y: 168 }, { x: 615, y: 90 },
];
const WIDTH = 850;
const HEIGHT = 1120;
const SCALE = 0.72;
// First Contact 1.1 is a distinct illustrated local route; all other
// modules retain their existing scene and coordinate contract.
const FIRST_CONTACT_GREETING = "module_1_1";
const FIRST_CONTACT_TILES = [
  "/assets/journey/first-contact-greeting-tile-1.avif",
  "/assets/journey/first-contact-greeting-tile-2.avif",
  "/assets/journey/first-contact-greeting-tile-3.avif",
  "/assets/journey/first-contact-greeting-tile-4.avif",
];
const FIRST_CONTACT_POINTS = [
  { x: 183, y: 880 }, // Village Gate: marker lifted above first-stop fox
  { x: 575, y: 725 }, // Fountain: lower, at foot of fountain near dry cobbles
  { x: 254, y: 526 }, // Bakery: Sorry and Excuse Me
  { x: 654, y: 325 }, // Lantern Corner: Polite Mini Exchanges
  { x: 310, y: 204 }, // Town Hall: module checkpoint
];
const FIRST_CONTACT_LANDMARKS = [
  "Village Gate", "Village Fountain", "The Bakery",
  "Lantern Corner", "Town Hall",
];
// Companion waits on the approaching cobbled path, *behind* the next stop.
// Coordinates anchor the sprite's feet and do not alter lesson marker geometry.
// Directional idle / rear-view animation will be handled as a separate asset pass.
const FIRST_CONTACT_APPROACH_POINTS = [
  { x: 145, y: 1090 }, // Village gate: cobbles outside the arch
  { x: 450, y: 610 },  // Fountain: dry paved lane WEST of the stream
  { x: 350, y: 605 },  // Bakery: cobbled lane beside the front steps
  { x: 568, y: 468 },  // Lantern corner: paved lane below terrace steps
  { x: 425, y: 333 },  // Town hall: cobblestone plaza approach
];
// Gate-only depth proof. Position is the location of the fox's feet.
const GATE_TEST_POSITIONS = {
  // All coordinates are PAW/ground contact points, not head/roof positions.
  approach: { x: 170, y: 1100 },
  passage: { x: 240, y: 1022 },
  emerge: { x: 450, y: 832 }, // Center of the curving cobblestone lane, clear of the bank
};
// Keep the same apparent size from A to B (short physical distance).
// Reduce only slightly as the fox follows the lane farther into the village.
const GATE_TEST_DIMENSIONS = {
  approach: { width: 82, height: 112 },
  passage: { width: 82, height: 112 },
  emerge: { width: 78, height: 106 },
};
// Fixed arch 2 supplies the *occlusion shape* only. Reuse the exact original
// native-resolution illustrated tiles for masonry pixels; scaling a small Canva
// thumbnail here produced blurred, doubled stonework on Android.
const GATE_FOREGROUND_CUTOUT = {
  mask: "/assets/journey/gate-foreground-fixed-arch-2-mask.png",
  left: 121, top: 721, width: 377, height: 399,
};
// Two independently drawn fox idle candidates. Other companions and all
// non-illustrated modules retain their previously approved idle artwork.
const FOX_DIRECTIONAL_PREVIEW = {
  "up-left": "/assets/journey/fox-idle-up-left-candidate.avif",
  "up-right": "/assets/journey/fox-idle-up-right-candidate.avif",
};
const TREES = [
  [50,100,1.2],[125,140,.8],[740,82,1.3],[785,244,1.1],[80,390,1.1],
  [145,480,.75],[740,575,1.4],[805,760,.85],[60,755,1.25],[740,1035,1.3],
  [105,1080,.95],[395,1000,.7],[540,300,.65],[35,620,.85],[445,90,.8],
];
const FLOWERS = [[85,925],[320,880],[735,890],[450,700],[90,230],[725,275],[480,1020],[395,540]];
function curve(points) {
  if (!points.length) return "";
  return points.slice(1).reduce((d, p, index) => {
    const prev = points[index];
    const offset = index % 2 ? -80 : 70;
    const middle = (prev.y + p.y) / 2;
    return d + " C " + (prev.x + offset) + " " + middle + " " +
      (p.x - offset) + " " + middle + " " + p.x + " " + p.y;
  }, "M " + points[0].x + " " + points[0].y);
}
function Scene({ points }) {
  const route = curve(points);
  return (
    <svg className="z-local-map-art" width={WIDTH} height={HEIGHT} viewBox="0 0 850 1120" aria-hidden="true">
      <defs>
        <linearGradient id="z-village-grass" x2=".4" y2="1"><stop stopColor="#b7d0a0"/><stop offset=".55" stopColor="#7fae83"/><stop offset="1" stopColor="#54846e"/></linearGradient>
        <linearGradient id="z-village-water" x2=".5" y2="1"><stop stopColor="#8bd5d9"/><stop offset="1" stopColor="#356c83"/></linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#z-village-grass)"/>
      <path d="M-80 25 Q175 115 365 20 T930 30 V260 Q640 220 435 268 T-80 230Z" fill="#4b8a6f" opacity=".35"/>
      <path d="M-100 935 Q120 848 280 996 T860 920 V1140 H-100Z" fill="#427c64" opacity=".4"/>
      <path d="M-100 100 Q70 160 50 312 T-42 625 M910 655 Q700 720 830 875 T930 1080" stroke="#b5d4b1" strokeWidth="75" fill="none" opacity=".6"/>
      <path d="M-45 1110 Q170 1050 190 1115 T475 1148 L510 1190" fill="none" stroke="url(#z-village-water)" strokeWidth="96"/>
      <path d={route} stroke="#795b45" strokeOpacity=".22" strokeWidth="42" strokeLinecap="round" fill="none"/>
      <path d={route} stroke="#e7c998" strokeWidth="36" strokeLinecap="round" fill="none"/>
      <path d={route} stroke="#f9e3b6" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 16" fill="none"/>
      {[[180,400,96],[590,230,86],[470,960,75],[90,665,66]].map(([x,y,r],i)=>(
        <g key={i} transform={"translate("+x+" "+y+")"}>
          <ellipse cy="47" rx={r*.8} ry="25" fill="#214d3c" opacity=".18"/>
          <rect x={-r*.49} y={-r*.22} width={r*.98} height={r*.69} rx="6" fill="#f4deb4" stroke="#d7b780" strokeWidth="4"/>
          <path d={"M"+(-r*.59)+" "+(-r*.2)+" L0 "+(-r*.8)+" L"+(r*.59)+" "+(-r*.2)+"Z"} fill={i%2?"#aa6557":"#c57b5f"} stroke="#824b43" strokeWidth="5"/>
          <rect x="-13" y="8" width="26" height="39" rx="4" fill="#8c7062"/>
          <rect x={-r*.37} y="-9" width="21" height="20" rx="3" fill="#b1dae0" stroke="#e3b780" strokeWidth="3"/>
          <rect x={r*.16} y="-9" width="21" height="20" rx="3" fill="#b1dae0" stroke="#e3b780" strokeWidth="3"/>
        </g>
      ))}
      <g transform="translate(635 850)">
        <ellipse cy="37" rx="76" ry="29" fill="#42685d" opacity=".32"/>
        <ellipse cy="27" rx="66" ry="32" fill="#a6b4a1" stroke="#e6d0a5" strokeWidth="7"/>
        <ellipse cy="22" rx="48" ry="22" fill="url(#z-village-water)"/>
        <path d="M0 24 V-22" stroke="#e8d7ac" strokeWidth="12" strokeLinecap="round"/>
        <ellipse cy="-20" rx="23" ry="12" fill="#d9c89e"/>
        <path d="M0-30 Q-38-12-27 3 M0-30 Q38-12 27 3" stroke="#d0f0ed" strokeWidth="4" fill="none"/>
      </g>
      <path d="M92 950 L92 1048 M62 973 L122 973" stroke="#70593f" strokeWidth="14" strokeLinecap="round"/>
      <g transform="translate(325 168)">
        <rect x="-67" y="-52" width="134" height="106" rx="9" fill="#eddfb6" stroke="#c2ac82" strokeWidth="5"/>
        <path d="M-80-52 L0-116 L80-52Z" fill="#875a5b" stroke="#6a4850" strokeWidth="5"/>
        <rect x="-22" y="3" width="44" height="51" rx="5" fill="#8d6955"/>
        <circle cx="0" cy="-67" r="14" fill="#f4ce83"/>
      </g>
      <g transform="translate(655 405)">
        <path d="M-50 40V-30 M0 45V-25 M46 40V-30" stroke="#5c513d" strokeWidth="8" strokeLinecap="round"/>
        <path d="M-50-30L-63-51L-37-51Z M0-25L-13-46L13-46Z M46-30L33-51L59-51Z" fill="#eec86d" stroke="#7d684c" strokeWidth="4"/>
        <circle cx="-50" cy="-54" r="12" fill="#fff3ba" opacity=".85"/>
        <circle cx="0" cy="-49" r="12" fill="#fff3ba" opacity=".85"/>
        <circle cx="46" cy="-54" r="12" fill="#fff3ba" opacity=".85"/>
      </g>
      {TREES.map(([x,y,scale],i)=><g key={i} transform={"translate("+x+" "+y+") scale("+scale+")"}>
        <ellipse cy="34" rx="45" ry="15" fill="#1d604c" opacity=".28"/>
        <rect x="-8" y="-9" width="16" height="47" rx="5" fill="#795e45"/>
        <circle cx="-19" cy="-21" r="32" fill="#316d52"/>
        <circle cx="13" cy="-40" r="36" fill="#397f5f"/>
        <circle cx="34" cy="-14" r="26" fill="#4c946f"/>
        <circle cx="-10" cy="-47" r="22" fill="#63a27d"/>
      </g>)}
      {FLOWERS.map(([x,y],i)=><g key={i} transform={"translate("+x+" "+y+")"}>
        <circle r="16" fill="#508e60"/>
        {[0,72,144,216,288].map(a=><ellipse key={a} transform={"rotate("+a+") translate(0 -10)"} rx="5" ry="8" fill={i%2?"#f8e5b1":"#f8d5ae"}/>)}
        <circle r="4" fill="#e6b34e"/>
      </g>)}
    </svg>
  );
}
export default function JourneyMap({
  module, completed, targetId, companion, onOpenLesson, userId,
  exitToNextMap=false, onExitComplete, onExitProgress, replayFoxGap=false
}) {
  const stops = module?.isSectionCheckpoint ? [module] : (module?.lessons || []);
  const illustrated = module?.id === FIRST_CONTACT_GREETING;
  const foxGapReplay = replayFoxGap || (illustrated && typeof window!=="undefined" &&
    new URLSearchParams(window.location.search).get("journeyQA")==="fox-gap");
  const defaultScale = illustrated ? 0.87 : SCALE;
  const pathPoints = illustrated ? FIRST_CONTACT_POINTS : POINTS;
  const points = stops.map((_, i) => pathPoints[i] || pathPoints[pathPoints.length-1]);
  const active = Math.max(0, stops.findIndex(s => s.id === targetId));
  const lastDone = stops.reduce((index, stop, i) => completed.has(stop.id) ? i : index, 0);
  const focusIndex = targetId && stops.some(s => s.id === targetId) ? active : lastDone;
  const viewport = useRef(null);
  const drag = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const suppressPinchClick = useRef(false);
  const [camera, setCamera] = useState({x: -160, y: -420});
  const cameraRef = useRef(camera);
  const [scale, setScale] = useState(defaultScale);
  const scaleRef = useRef(defaultScale);
  // Gate-only visual frame review: no learner progress or persistence changes.
  const [gateProgress, setGateProgress] = useState(0);
  const [gateShowPath, setGateShowPath] = useState(false);
  const [gateShowMarker, setGateShowMarker] = useState(false);
  // A temporary visual path authoring mode, isolated to the fox's first illustrated map.
  // Draft lives only in component state. Nothing is written to learner persistence.
  // Keep tools intact at ?journeyDev=1. Default preview is the learner view.
  const showMapDevTools = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("journeyDev")==="1";
  const [gateEditorEnabled, setGateEditorEnabled] = useState(showMapDevTools);
  const [gateEditMode, setGateEditMode] = useState("preview");
  const [gateRoutePoints, setGateRoutePoints] = useState(
    ()=>USER_TRACED_VILLAGE_ROUTE.map(p=>({...p})));
  const [gateRouteHistory, setGateRouteHistory] = useState([]);
  const [gateSelectedPoint, setGateSelectedPoint] = useState(null);
  const [gateCopyStatus, setGateCopyStatus] = useState("");
  const [gateMarkerProgress, setGateMarkerProgress] = useState(0);
  // Editor-only artistic far-end perspective: 65% of near-path sprite size.
  const [gateFoxFarScale, setGateFoxFarScale] = useState(
    ()=>readFoxSizeDraft(gateRouteJson(USER_TRACED_VILLAGE_ROUTE))?.far ?? FOX_APPROVED_FAR_SIZE);
  const [gateFoxSizeStops, setGateFoxSizeStops] = useState(
    ()=>readFoxSizeDraft(gateRouteJson(USER_TRACED_VILLAGE_ROUTE))?.stops ??
      FOX_APPROVED_SIZE_STOPS.map(stop=>({...stop})));
  const [gateFoxSizeDraft, setGateFoxSizeDraft] = useState(null);
  const [gateFoxSizeCopyStatus, setGateFoxSizeCopyStatus] = useState("");
  const [gateLessonStops,setGateLessonStops] = useState(()=>
    readFoxLessonStopDraft(gateRouteJson(USER_TRACED_VILLAGE_ROUTE),
      stops.map(stop=>stop.id)) ?? FOX_APPROVED_LESSON_STOPS.map(stop=>({...stop})));
  const [gateSelectedLessonId,setGateSelectedLessonId] = useState(stops[0]?.id||"");
  const [gateLessonCopyStatus,setGateLessonCopyStatus] = useState("");
  const [gateDepthShowFox, setGateDepthShowFox] = useState(true);
  const [gateDepthShowGuide, setGateDepthShowGuide] = useState(false);
  // Isolated eight-frame sprite QA at the editor's existing stationary paw marker.
  const [gateDepthAnimateFox, setGateDepthAnimateFox] = useState(false);
  const [gateSegmentDirections, setGateSegmentDirections] = useState({});
  const [gateDirectionCopyStatus, setGateDirectionCopyStatus] = useState("");
  const [gateWalkFrame, setGateWalkFrame] = useState(0);
  const [gateWalkPlaying, setGateWalkPlaying] = useState(true);
  const [gateRoutePlaying, setGateRoutePlaying] = useState(false);
  const [gateRoutePlaybackEnabled, setGateRoutePlaybackEnabled] = useState(false);
  const [gateGuidedMode,setGateGuidedMode] = useState(false);
  const [gateGuidedArrived,setGateGuidedArrived] = useState(false);
  const gateRouteProgressRef = useRef(0);
  const accountId = useAuthStore(state=>state.user?.id);
  const routeGesture = useRef(null);
  const editingGate = illustrated && companion?.id === "fox" && gateEditorEnabled;
  const isLearnerFox = illustrated && companion?.id==="fox";
  const [foxAtlasState,setFoxAtlasState]=useState({complete:false,ready:[],frames:{}});
  useEffect(()=>{
    if(!isLearnerFox)return;
    let active=true;
    preloadFoxWalkAtlases().then(results=>{
      if(active)setFoxAtlasState({complete:true,
        ready:results.filter(item=>item.ready).map(item=>item.name),
        frames:Object.fromEntries(results.map(item=>[item.name,item.frames]))});
    });
    return ()=>{active=false;};
  },[isLearnerFox]);
  const isExitingVillage = isLearnerFox && exitToNextMap && !showMapDevTools;
  const journeyStopIndex = stops.findIndex(stop=>stop.id===targetId);
  const journeyStop = foxGapReplay ? {at:673}
    : isExitingVillage ? {at:1000}
    : journeyStopIndex>=0
      ? FOX_APPROVED_LESSON_STOPS.find(stop=>stop.lessonId===targetId)
      : FOX_APPROVED_LESSON_STOPS.at(-1);
  const journeyPreviousStop = journeyStopIndex>0
    ? FOX_APPROVED_LESSON_STOPS[journeyStopIndex-1] : null;
  const journeySessionKey = "zodis:journey-fox:last-target:module_1_1:"+(accountId||userId||"anonymous");
  const [journeyInitial] = useState(()=>{
    let lastTarget=null;
    try {lastTarget=window.sessionStorage.getItem(journeySessionKey);} catch {}
    const shouldTravel = !showMapDevTools && isLearnerFox && journeyStopIndex>0 &&
      completed.has(journeyPreviousStop?.lessonId) &&
      lastTarget===journeyPreviousStop?.lessonId;
    return foxGapReplay
      ? {start:0.395,moving:true}
      : isExitingVillage
        ? {start:FOX_APPROVED_LESSON_STOPS.at(-1).at/1000,moving:true}
        : {
          start:shouldTravel ? journeyPreviousStop.at/1000 : (journeyStop?.at??0)/1000,
          moving:shouldTravel,
        };
  });
  const [journeyProgress,setJourneyProgress] = useState(journeyInitial.start);
  const [journeyMoving,setJourneyMoving] = useState(journeyInitial.moving);
  const journeyProgressRef=useRef(journeyInitial.start);
  // Transition is deliberately blended while the fox is still moving. The
  // new module map reaches full opacity slightly before the path endpoint.
  // Quantise callbacks so the parent only redraws ~25 times, not every frame.
  const departureBlend= isExitingVillage
    ? Math.round(25*Math.max(0,Math.min(1,(journeyProgress-0.885)/0.103)))/25
    : 0;
  useEffect(()=>{
    if(isExitingVillage)onExitProgress?.(departureBlend);
  },[isExitingVillage,departureBlend]);
  useEffect(()=>{
    if(!isLearnerFox || showMapDevTools || foxGapReplay || !targetId) return;
    try {window.sessionStorage.setItem(journeySessionKey,targetId);} catch {}
  },[isLearnerFox,showMapDevTools,targetId,journeySessionKey]);
  useEffect(()=>{
    if(!isLearnerFox || editingGate || !foxAtlasState.complete ||
       !journeyMoving || !journeyStop) return;
    let raf=0,last=null;
    const tick=now=>{
      if(last===null)last=now;
      const seconds=Math.min(Math.max((now-last)/1000,0),.08);
      last=now;
      const result=foxLessonRouteAdvance(USER_TRACED_VILLAGE_ROUTE,
        journeyProgressRef.current,seconds,journeyStop.at,FOX_ROUTE_WORLD_PX_PER_SECOND);
      journeyProgressRef.current=result.progress;
      setJourneyProgress(result.progress);
      if(result.arrived){
        setJourneyMoving(false);
        // Trigger normal next-module navigation only AFTER the fox has
        // physically finished the approved final 15.2% of the village path.
        if(isExitingVillage) onExitComplete?.();
        return;
      }
      raf=window.requestAnimationFrame(tick);
    };
    raf=window.requestAnimationFrame(tick);
    return ()=>window.cancelAnimationFrame(raf);
  },[isLearnerFox,editingGate,journeyMoving,journeyStop?.at,isExitingVillage,
     foxAtlasState.complete]);
  useEffect(() => {
    if (!editingGate || gateEditMode !== "preview" ||
        !gateDepthShowFox || !gateDepthAnimateFox || !gateWalkPlaying ||
        gateRoutePlaybackEnabled ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const timer = window.setInterval(() => setGateWalkFrame(f => (f + 1) % 8), 140);
    return () => window.clearInterval(timer);
  }, [editingGate, gateEditMode, gateDepthShowFox, gateDepthAnimateFox,
      gateWalkPlaying, gateRoutePlaybackEnabled]);
  useEffect(()=>{
    gateRouteProgressRef.current=gateMarkerProgress;
  },[gateMarkerProgress]);
  const guidedNextIndex = stops.findIndex(stop=>!completed.has(stop.id));
  const guidedNextLesson = guidedNextIndex<0 ? null : stops[guidedNextIndex];
  const guidedNextStop = guidedNextLesson
    ? FOX_APPROVED_LESSON_STOPS.find(stop=>stop.lessonId===guidedNextLesson.id) : null;
  const guidedDestination = guidedNextStop?.at ?? 1000;
  const guidedDeparture = guidedNextIndex<0
    ? FOX_APPROVED_LESSON_STOPS.at(-1)?.at ?? 0
    : guidedNextIndex===0 ? 0 : FOX_APPROVED_LESSON_STOPS[guidedNextIndex-1]?.at ?? 0;
  const guidedRouteMatches = gateRouteJson(gateRoutePoints)===
    gateRouteJson(USER_TRACED_VILLAGE_ROUTE);
  const guidedStopsMatch = !foxLessonStopOrderProblem(gateLessonStops,
      stops.map(stop=>stop.id)) &&
    FOX_APPROVED_LESSON_STOPS.length===gateLessonStops.length &&
    FOX_APPROVED_LESSON_STOPS.every(approved=>
      gateLessonStops.some(item=>item.lessonId===approved.lessonId && item.at===approved.at));
  useEffect(()=>{
    if(!editingGate || gateEditMode!=="preview" || !gateDepthShowFox ||
       !gateDepthAnimateFox || !gateRoutePlaying || gateRoutePoints.length<2 ||
       !foxRouteTotalDistance(gateRoutePoints)) return;
    let raf=0,last=null;
    const tick=(now)=>{
      if(last===null)last=now;
      const seconds=Math.min(Math.max((now-last)/1000,0),.08);
      last=now;
      const result=gateGuidedMode
        ? foxLessonRouteAdvance(gateRoutePoints,gateRouteProgressRef.current,
            seconds,guidedDestination,FOX_ROUTE_WORLD_PX_PER_SECOND)
        : {progress:foxRouteAdvance(gateRoutePoints,gateRouteProgressRef.current,
            seconds,FOX_ROUTE_WORLD_PX_PER_SECOND),arrived:false};
      const next=result.progress;
      gateRouteProgressRef.current=next;
      setGateMarkerProgress(next);
      if(result.arrived && gateGuidedMode){
        setGateGuidedArrived(true);
        setGateRoutePlaying(false);
        return;
      }
      if(next>=1){setGateRoutePlaying(false);return;}
      raf=window.requestAnimationFrame(tick);
    };
    raf=window.requestAnimationFrame(tick);
    return ()=>window.cancelAnimationFrame(raf);
  },[editingGate,gateEditMode,gateDepthShowFox,gateDepthAnimateFox,
     gateRoutePlaying,gateRoutePoints,gateGuidedMode,guidedDestination]);
  const gateMarkerPoint = editingGate && gateEditMode==="preview"
    ? gateRouteAt(gateRoutePoints,gateMarkerProgress) : null;
  const gateSizeMarker = Math.round(gateMarkerProgress*1000);
  const gateFoxSavedScale = gateFoxScaleWithStops(gateRoutePoints,gateMarkerProgress,
    gateFoxFarScale/100,gateFoxSizeStops);
  const gateFoxScale = gateFoxSizeDraft?.at===gateSizeMarker
    ? gateFoxSizeDraft.size/100 : gateFoxSavedScale;
  const gateFoxSizeExport = JSON.stringify(gateFoxSizePlan(gateRoutePoints,
    gateFoxFarScale,gateFoxSizeStops),null,2);
  const gateSizeStop = gateFoxSizeStops.find(stop=>stop.at===gateSizeMarker);
  const gateLessonIds = stops.map(stop=>stop.id);
  const gateSelectedLesson = stops.find(stop=>stop.id===gateSelectedLessonId);
  const gateSelectedLessonSaved = gateLessonStops.find(stop=>stop.lessonId===gateSelectedLessonId);
  const gateLessonIssue = foxLessonStopOrderProblem(gateLessonStops,gateLessonIds);
  const gateLessonExport = JSON.stringify(foxLessonStopPlan(gateRoutePoints,
    stops,gateLessonStops,FIRST_CONTACT_LANDMARKS),null,2);
  const saveLessonPositions = (positions) => {
    setGateGuidedMode(false);
    setGateGuidedArrived(false);
    setGateRoutePlaying(false);
    setGateLessonStops(positions);
    saveFoxLessonStopDraft(gateRouteJson(gateRoutePoints),gateLessonIds,positions);
    setGateLessonCopyStatus("");
  };
  useEffect(()=>{
    saveFoxSizeDraft(gateRouteJson(gateRoutePoints),gateFoxFarScale,gateFoxSizeStops);
  },[gateRoutePoints,gateFoxFarScale,gateFoxSizeStops]);
  const gateSectionIndex = gateMarkerPoint?.segmentIndex ?? 0;
  const gateDirectionAssignments = gateDirectionPlan(gateRoutePoints,gateSegmentDirections);
  const gateSection = gateDirectionAssignments[gateSectionIndex];
  const gateWalkFacing = gateSection?.direction || "up-left";
  const gateRenderedFrame = gateRoutePlaybackEnabled
    ? foxRouteFrame(gateRoutePoints,gateMarkerProgress) : gateWalkFrame;
  const gateDirectionExport = JSON.stringify(gateDirectionAssignments);
  const seekGateSection = (index) => {
    setGateRoutePlaying(false);
    setGateRoutePlaybackEnabled(true);
    const next=gateSegmentMidpointProgress(gateRoutePoints,index);
    gateRouteProgressRef.current=next;
    setGateMarkerProgress(next);
    setGateFoxSizeDraft(null);
    setGateDirectionCopyStatus("");
  };
  const checkpointRoute = () => {
    setGateRouteHistory(h=>[...h.slice(-29),gateRoutePoints.map(p=>({...p}))]);
    setGateSegmentDirections({});
    setGateRoutePlaying(false);
    setGateRoutePlaybackEnabled(false);
    setGateGuidedMode(false);
    setGateGuidedArrived(false);
    setGateFoxSizeStops([]);
    setGateFoxSizeDraft(null);
    setGateLessonStops([]);
    setGateLessonCopyStatus("");
    setGateDirectionCopyStatus("");
    setGateCopyStatus("");
  };
  const editorWorldPoint = (e) => gateWorldPoint(e.clientX,e.clientY,
    viewport.current?.getBoundingClientRect(),cameraRef.current,scaleRef.current);

  const updateView = (nextCamera, nextScale = scaleRef.current) => {
    cameraRef.current = nextCamera;
    scaleRef.current = nextScale;
    setCamera(nextCamera);
    setScale(nextScale);
  };
  // End-user-only camera follow. Route-editor camera and manual QA are unchanged.
  useEffect(()=>{
    if(!isLearnerFox || editingGate || !journeyMoving) return;
    const el=viewport.current;
    if(!el)return;
    const point=gateRouteAt(USER_TRACED_VILLAGE_ROUTE,journeyProgress);
    if(!point)return;
    const bounds=el.getBoundingClientRect(), zoom=scaleRef.current;
    const next=clampCamera(bounds.width/2-point.x*zoom,
      bounds.height/2-point.y*zoom,bounds.width,bounds.height,zoom);
    updateView(next,zoom);
  },[isLearnerFox,editingGate,journeyMoving,journeyProgress]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const recenter = () => {
      const bounds = element.getBoundingClientRect();
      const point = illustrated && companion?.id === "fox"
        ? (editingGate ? GATE_TEST_POSITIONS.approach :
          gateRouteAt(USER_TRACED_VILLAGE_ROUTE,journeyProgressRef.current))
        : (points[focusIndex] || POINTS[0]);
      const zoom = scaleRef.current;
      updateView(clampCamera(bounds.width/2 - point.x*zoom, bounds.height/2 - point.y*zoom,
        bounds.width, bounds.height, zoom), zoom);
    };
    recenter();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(recenter) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [module?.id, focusIndex, defaultScale, companion?.id, editingGate]);

  useEffect(() => {
    setGateProgress(0);
    setGateShowPath(false);
    setGateShowMarker(false);
    setGateEditorEnabled(showMapDevTools);
    setGateEditMode("preview");
    setGateRoutePoints(USER_TRACED_VILLAGE_ROUTE.map(p=>({...p})));
    setGateMarkerProgress(0);
    setGateDepthShowFox(true);
    setGateDepthShowGuide(false);
    setGateDepthAnimateFox(false);
    setGateSegmentDirections({});
    setGateDirectionCopyStatus("");
    setGateLessonStops(readFoxLessonStopDraft(
      gateRouteJson(USER_TRACED_VILLAGE_ROUTE),stops.map(stop=>stop.id)) ??
        FOX_APPROVED_LESSON_STOPS.map(stop=>({...stop})));
    setGateGuidedMode(false);
    setGateGuidedArrived(false);
    setGateSelectedLessonId(stops[0]?.id||"");
    setGateLessonCopyStatus("");
    setGateWalkFrame(0);
    setGateWalkPlaying(true);
    setGateRouteHistory([]);
    setGateSelectedPoint(null);
    setGateCopyStatus("");
    routeGesture.current=null;
  }, [module?.id, companion?.id]);

  const recenterOnWorldPoint = (point) => {
    const el=viewport.current;
    if (!el || !point) return;
    const bounds=el.getBoundingClientRect(), zoom=scaleRef.current;
    updateView(clampCamera(bounds.width/2-point.x*zoom,bounds.height/2-point.y*zoom,
      bounds.width,bounds.height,zoom),zoom);
  };

  const onPointerDown = (e) => {
    // Native buttons still receive ordinary single-finger taps.
    if (e.target.closest(".z-local-map-recenter")) return;
    if (e.pointerType === "touch") {
      if (!pointers.current.size) suppressPinchClick.current = false;
      pointers.current.set(e.pointerId, {x:e.clientX, y:e.clientY});
      if (pointers.current.size >= 2 && !pinch.current) {
        const [a,b] = [...pointers.current.values()];
        const bounds = viewport.current.getBoundingClientRect();
        const midX = (a.x+b.x)/2 - bounds.left;
        const midY = (a.y+b.y)/2 - bounds.top;
        pinch.current = {
          distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
          startScale:scaleRef.current,
          anchor:{x:(midX-cameraRef.current.x)/scaleRef.current,
            y:(midY-cameraRef.current.y)/scaleRef.current},
        };
        drag.current = null;
        routeGesture.current = null;
        suppressPinchClick.current = true;
        for (const id of pointers.current.keys()) {
          try { e.currentTarget.setPointerCapture(id); } catch { /* pointer already released */ }
        }
        return;
      }
    }
    if (e.target.closest("button")) return;
    if (editingGate && gateEditMode !== "pan" && gateEditMode !== "preview") {
      const target=e.target.closest?.("[data-gate-point-index]");
      const index=target ? Number(target.getAttribute("data-gate-point-index")) : null;
      if(gateEditMode==="move" && index===null) return;
      if(gateEditMode==="move") {
        checkpointRoute();
        setGateSelectedPoint(index);
      }
      routeGesture.current={id:e.pointerId,mode:gateEditMode,index,
        startX:e.clientX,startY:e.clientY,moved:false};
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    drag.current = {id:e.pointerId,x:e.clientX,y:e.clientY,camera:cameraRef.current};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (e.pointerType === "touch" && pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, {x:e.clientX,y:e.clientY});
      if (pinch.current && pointers.current.size >= 2) {
        const [a,b] = [...pointers.current.values()];
        const bounds = viewport.current.getBoundingClientRect();
        const next = pinchView({
          startScale:pinch.current.startScale,
          startDistance:pinch.current.distance,
          distance:Math.hypot(a.x-b.x,a.y-b.y),
          anchor:pinch.current.anchor,
          midpoint:{x:(a.x+b.x)/2-bounds.left,y:(a.y+b.y)/2-bounds.top},
          width:bounds.width,height:bounds.height,
          minScale:fitMapScale(bounds.width,bounds.height,defaultScale),
        });
        updateView(next.camera,next.scale);
        return;
      }
    }
    const edit=routeGesture.current;
    if(edit && edit.id===e.pointerId) {
      const distance=Math.hypot(e.clientX-edit.startX,e.clientY-edit.startY);
      if(distance>7) edit.moved=true;
      if(edit.mode==="move" && edit.moved) {
        const world=editorWorldPoint(e);
        if(world)setGateRoutePoints(points=>gateMovePoint(points,edit.index,world));
      }
      return;
    }
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const bounds = viewport.current.getBoundingClientRect();
    const zoom = scaleRef.current;
    updateView(clampCamera(drag.current.camera.x+e.clientX-drag.current.x,
      drag.current.camera.y+e.clientY-drag.current.y,bounds.width,bounds.height,zoom),zoom);
  };
  const onPointerEnd = (e) => {
    if (e.pointerType === "touch") {
      pointers.current.delete(e.pointerId);
      if (pinch.current) {
        if (pointers.current.size < 2) {
          pinch.current = null;
          const remaining = pointers.current.entries().next().value;
          drag.current = remaining
            ? {id:remaining[0],x:remaining[1].x,y:remaining[1].y,camera:cameraRef.current}
            : null;
        }
        return;
      }
    }
    const edit=routeGesture.current;
    if(edit?.id===e.pointerId) {
      routeGesture.current=null;
      if(e.type!=="pointercancel" && edit.mode!=="move" && !edit.moved) {
        const world=editorWorldPoint(e);
        if(world) {
          checkpointRoute();
          setGateRoutePoints(points=>gateInsertPoint(points,world,edit.mode));
          setGateSelectedPoint(null);
        }
      }
      return;
    }
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const current = stops[focusIndex];
  const companionPoint = illustrated
    ? (FIRST_CONTACT_APPROACH_POINTS[focusIndex] || points[focusIndex])
    : {x: points[focusIndex]?.x, y: points[focusIndex]?.y - 112};
  const foxPreviewEnabled = illustrated && companion?.id === "fox";
  const journeyPoint = isLearnerFox && !editingGate
    ? gateRouteAt(USER_TRACED_VILLAGE_ROUTE,journeyProgress) : null;
  const journeyDirection = journeyPoint
    ? (gateDirectionPlan(USER_TRACED_VILLAGE_ROUTE)[journeyPoint.segmentIndex]?.direction||"up")
    : "up";
  const journeyAtlas = FOX_WALK_DIRECTIONS.find(d=>d.value===journeyDirection)?.atlas;
  const journeyAtlasLoaded = foxAtlasState.ready.includes(journeyAtlas);
  // Never draw an empty background at a direction switch, including on
  // Android's first AVIF decode. Use the existing facing still if unavailable.
  const journeyFacing = !journeyMoving || !foxAtlasState.complete ||
    !journeyAtlasLoaded;
  const journeyFrame = foxRouteFrame(USER_TRACED_VILLAGE_ROUTE,journeyProgress);
  const healthyFrames=foxAtlasState.frames[journeyAtlas]||[];
  const journeyVisibleFrame=healthyFrames.includes(journeyFrame)
    ? journeyFrame : (healthyFrames.find(i=>i>=journeyFrame) ?? healthyFrames.at(-1) ?? journeyFrame);
  const journeyScale = gateFoxScaleWithStops(USER_TRACED_VILLAGE_ROUTE,
    journeyProgress,FOX_APPROVED_FAR_SIZE/100,FOX_APPROVED_SIZE_STOPS);
  const gateFrame = foxPreviewEnabled ? gateTraverseAt(gateProgress) : null;
  const visibleCompanionPoint = gateFrame ? gateFrame.point : companionPoint;
  const foxDirection = gateFrame?.direction || "up-right";
  const foxPreviewSrc = foxPreviewEnabled ? FOX_DIRECTIONAL_PREVIEW[foxDirection] : null;
  return <div className="z-local-map-shell z-journey-dark">
    <div data-swipe-block="true" className="z-local-map-viewport" ref={viewport}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}
      onClickCapture={(e)=>{
        if (suppressPinchClick.current && e.target.closest(".z-local-map-stop")) {
          e.preventDefault();e.stopPropagation();suppressPinchClick.current = false;
        }
      }} aria-label="Illustrated village lesson route. Drag to explore and pinch with two fingers to zoom.">
      <div className="z-local-map-world" style={{width:WIDTH,height:HEIGHT,transform:"translate("+camera.x+"px,"+camera.y+"px) scale("+scale+")"}}>
        {illustrated
          ? FIRST_CONTACT_TILES.map((src,i) => <img key={src} className="z-local-map-art z-local-map-illustrated"
              src={src} style={{top:i*280}} width={WIDTH} height={280}
              alt="" aria-hidden="true" draggable={false} decoding="async"/>)
          : <Scene points={points}/>}
        {foxPreviewEnabled && !editingGate && gateShowPath && <svg className="z-gate-route-guide" viewBox="0 0 850 1120"
          width={WIDTH} height={HEIGHT} aria-hidden="true">
          <polyline points={GATE_ROUTE_POINTS.map(p=>p.x+","+p.y).join(" ")}
            fill="none" stroke="#ffe7a2" strokeWidth="3" strokeDasharray="6 8"
            strokeLinecap="round" strokeLinejoin="round"/>
          {GATE_ROUTE_POINTS.map((p,i)=><circle key={i} cx={p.x} cy={p.y}
            r={i===0||i===4||i===10 ? 7 : 3} fill="#ffe7a2"
            stroke="#375c4b" strokeWidth="1.5"/>)}
        </svg>}
        {stops.map((stop,i)=>{
          const point=points[i];
          const done=completed.has(stop.id), here=stop.id===targetId;
          const available=done||here;
          const hideForGateProof=foxPreviewEnabled && showMapDevTools && (editingGate || (i===0 && !gateShowMarker));
          // Keep completed markers visible to show the full learning journey.
          return <button type="button" key={stop.id} disabled={!available}
            aria-hidden={hideForGateProof ? true : undefined}
            onClick={()=>onOpenLesson?.(stop.id)}
            className={"z-local-map-stop "+(done?"is-done ":"")+(here?"is-current ":"")+
              (available?"":"is-locked")+(hideForGateProof?" is-gate-marker-hidden":"")}
            style={{left:point.x,top:point.y,minHeight:Math.max(70,48/scale),minWidth:Math.max(80,48/scale)}}
            aria-label={(done?"Review ":here?"Start ":"Locked ") + stop.title}>
            <span className="z-local-map-stop-circle" aria-hidden="true">{done?"✓":here?(stop.isCheckpoint?"★":i+1):"🔒"}</span>
            <span className="z-local-map-stop-name">
              {illustrated && <span className="z-local-map-stop-landmark">{FIRST_CONTACT_LANDMARKS[i]}</span>}
              {stop.title}
            </span>
          </button>;
        })}
        {foxPreviewEnabled && showMapDevTools && !editingGate && <span className="z-gate-foot-shadow" aria-hidden="true"
          style={{left:visibleCompanionPoint.x,top:visibleCompanionPoint.y,
            width:(gateProgress<GATE_STAGE_PROGRESS.passage
              ? 36-11*gateProgress/GATE_STAGE_PROGRESS.passage : 25)+"px"}}/>}
        {current && !editingGate && !foxPreviewEnabled && <span className={"z-local-map-character"+(illustrated?" is-approaching":"")+
          (foxPreviewEnabled?" is-gate-test":"")}
          style={{left:visibleCompanionPoint.x,top:visibleCompanionPoint.y,
            "--gate-sprite-width":gateFrame ? gateFrame.dimensions.width+"px" : undefined,
            "--gate-sprite-height":gateFrame ? gateFrame.dimensions.height+"px" : undefined}}
          aria-label={"Your "+companion.name+" approaching "+current.title}>
          {foxPreviewSrc
            ? <img src={foxPreviewSrc} alt={"Your Fox companion facing "+foxDirection}
                className="z-companion-fullbody" draggable={false} decoding="async"
                style={{"--fox-jaunt-tilt":gateFrame?.tilt+"deg",
                  "--fox-jaunt-squash":gateFrame?.squash}}/>
            : <FullBodyCompanion companion={companion}/>}
        </span>}
        {journeyPoint && <span className="z-gate-depth-reference z-journey-learner-fox"
          aria-label={journeyFacing?"Fox facing you at the lesson":"Fox walking to the next lesson"}
          style={{left:journeyPoint.x,top:journeyPoint.y}}>
          {journeyFacing
            ? <img src="/assets/journey/fox-idle.webp" alt="Fox facing you"
                className="z-gate-depth-reference-fox z-fox-lesson-facing-still"
                draggable={false} decoding="async"
                style={{transform:"scale("+journeyScale+")"}}/>
            : <FoxWalkSprite frame={journeyVisibleFrame} facing={journeyDirection} scale={journeyScale}/>}
        </span>}
        {gateMarkerPoint && <span className="z-gate-depth-reference"
          style={{left:gateMarkerPoint.x,top:gateMarkerPoint.y}}
          aria-label="Static fox reference and paws at ground marker">
          {gateDepthShowFox && <img src={FOX_DIRECTIONAL_PREVIEW["up-right"]}
            className="z-gate-depth-reference-fox" alt=""
            draggable={false} decoding="async"
            style={{opacity:gateDepthAnimateFox ? 0 : 1}}/>}
          {gateDepthShowFox && gateDepthAnimateFox && gateGuidedMode &&
            gateGuidedArrived && guidedNextLesson &&
            <img src="/assets/journey/fox-idle.webp" alt="Fox stopped and facing you"
              className="z-gate-depth-reference-fox z-fox-lesson-facing-still"
              draggable={false} decoding="async"
              style={{transform:"scale("+gateFoxScale+")"}}/>}
          {gateDepthShowFox && gateDepthAnimateFox &&
            !(gateGuidedMode && gateGuidedArrived && guidedNextLesson) &&
            <FoxWalkSprite frame={gateRenderedFrame} facing={gateWalkFacing} scale={gateFoxScale}/>}

          <span className="z-gate-depth-paw-dot" aria-hidden="true"/>
        </span>}
        {foxPreviewEnabled && (!editingGate || gateEditMode==="preview") &&
          (editingGate || journeyProgress<0.25) &&
          <div className="z-gate-foreground-cutout" aria-hidden="true"
            style={{left:GATE_FOREGROUND_CUTOUT.left,top:GATE_FOREGROUND_CUTOUT.top,
              width:GATE_FOREGROUND_CUTOUT.width,height:GATE_FOREGROUND_CUTOUT.height,
              maskImage:`url(${GATE_FOREGROUND_CUTOUT.mask})`,
              WebkitMaskImage:`url(${GATE_FOREGROUND_CUTOUT.mask})`}}>
            {FIRST_CONTACT_TILES.slice(2).map((src,i)=>
              <img key={src} src={src} className="z-gate-foreground-tile"
                width={WIDTH} height={280} style={{
                  left:-GATE_FOREGROUND_CUTOUT.left,
                  top:(i+2)*280-GATE_FOREGROUND_CUTOUT.top}}
                alt="" aria-hidden="true" draggable={false} decoding="async"/>)}
          </div>}
        {editingGate && <svg className="z-gate-route-editor-art" viewBox="0 0 850 1120"
          width={WIDTH} height={HEIGHT} aria-label="Editable gate walking route">
          {(gateEditMode!=="preview" || gateDepthShowGuide) &&
            <polyline points={gateRoutePoints.map(p=>p.x+","+p.y).join(" ")}
              fill="none" stroke="#fde68a" strokeWidth={Math.max(3,3/scale)}
              strokeLinejoin="round" strokeLinecap="round"/>}
          {gateEditMode!=="preview" && gateRoutePoints.map((p,i)=><g key={i}
            data-gate-point-index={i} className="z-gate-route-handle"
            aria-label={"Route point "+(i+1)}>
            <circle cx={p.x} cy={p.y} r={Math.max(19,21/scale)}
              fill={gateSelectedPoint===i?"#facc15":"#0f5949"} fillOpacity=".83"
              stroke="#fff2bb" strokeWidth={Math.max(2,2/scale)}/>
            <text x={p.x} y={p.y+5/scale} fill={gateSelectedPoint===i?"#17382f":"white"}
              fontSize={Math.max(13,14/scale)} fontWeight="bold" textAnchor="middle"
              pointerEvents="none">{i+1}</text>
          </g>)}
        </svg>}
      </div>
      <div className="z-local-map-top-label" aria-hidden="true">
        {editingGate ? "Route editor · "+gateEditMode+" · pinch to zoom" : "Drag to explore · Pinch to zoom"}
      </div>
      <button type="button" className="z-local-map-recenter" onClick={()=>{
        recenterOnWorldPoint(foxPreviewEnabled
          ? (editingGate ? (gateMarkerPoint||gateRoutePoints.at(-1)||GATE_TEST_POSITIONS.approach) :
              (journeyPoint||visibleCompanionPoint))
          : points[focusIndex]);
      }}>⌖ Find me</button>
    </div>
    {editingGate && <div className="z-gate-editor-controls" role="group"
      aria-label="Gate visual path editor">
      <strong>Village route draft · {gateRoutePoints.length} points</strong>
      <span>Your updated 27-point route is loaded. Preview checks the existing STATIC fox and foot marker behind the approved gate foreground; this is not a walk animation. Pan/Preview allow dragging, pinch to zoom, and Move/Insert adjust the route.</span>
      <div className="z-gate-editor-buttons">
        {["preview","pan","add","move","insert"].map(mode=><button type="button" key={mode}
          aria-pressed={gateEditMode===mode} onClick={()=>{setGateRoutePlaying(false);setGateGuidedMode(false);setGateGuidedArrived(false);setGateEditMode(mode)}}>
          {mode[0].toUpperCase()+mode.slice(1)}</button>)}
      </div>
      {gateEditMode==="preview" && <div className="z-gate-editor-preview">
        <div className="z-gate-size-workbench" role="group"
          aria-label="Guided lesson fox walk preview">
          <strong>Guided lesson walk · approved lesson stops</strong>
          <span>After completing a lesson and returning to this map, restart this proof.
            The fox starts from the previous completed stop. Arrival alone never awards progress.
            The path after Town Hall leads towards a future map.</span>
          <div className="z-gate-editor-buttons">
            <button type="button"
              disabled={!guidedRouteMatches || !guidedStopsMatch || gateRoutePlaying}
              onClick={()=>{
                const start=guidedDeparture/1000;
                setGateRoutePlaying(false);
                setGateGuidedMode(true);
                setGateGuidedArrived(false);
                setGateDepthShowFox(true);
                setGateDepthAnimateFox(true);
                setGateRoutePlaybackEnabled(true);
                setGateWalkPlaying(false);
                setGateFoxSizeDraft(null);
                gateRouteProgressRef.current=start;
                setGateMarkerProgress(start);
              }}>Start guided lesson walk</button>
            <button type="button" disabled={!gateGuidedMode || gateRoutePlaying ||
                gateGuidedArrived || !guidedRouteMatches || !guidedStopsMatch}
              onClick={()=>{
                setGateWalkPlaying(false);
                setGateRoutePlaybackEnabled(true);
                setGateRoutePlaying(true);
              }}>{guidedNextLesson?"Walk to lesson":"Walk towards next map"}</button>
            <button type="button" disabled={!gateGuidedMode || !gateRoutePlaying}
              onClick={()=>setGateRoutePlaying(false)}>Pause guided walk</button>
            {gateGuidedMode && gateGuidedArrived && guidedNextLesson &&
              <button type="button" onClick={()=>onOpenLesson?.(guidedNextLesson.id)}>
                Open {guidedNextLesson.title}
              </button>}
            <button type="button" disabled={!gateGuidedMode} onClick={()=>{
              setGateRoutePlaying(false);
              setGateGuidedMode(false);
              setGateGuidedArrived(false);
            }}>Return to free walk</button>
          </div>
          <span role="status">{!guidedRouteMatches || !guidedStopsMatch
            ? "Restore the approved 27-point route and all five approved stop markers to try guided walking."
            : gateGuidedMode && gateRoutePlaying
              ? "Fox walking to "+(guidedNextLesson?.title||"future map boundary")
              : gateGuidedMode && gateGuidedArrived
                ? (guidedNextLesson
                  ? "Fox facing the learner at "+guidedNextLesson.title+". Open the lesson to continue."
                  : "End of first village route. Next map not built yet.")
                : gateGuidedMode
                  ? "Ready at previous stop. Press Walk to continue."
                  : "Guided walking preview ready."}</span>
        </div>
        {gateDepthAnimateFox && <div className="z-gate-editor-buttons"
          role="group" aria-label="Automated fox route playback">
          <button type="button" disabled={gateRoutePlaying || gateRoutePoints.length<2}
            onClick={()=>{
              setGateGuidedMode(false);
              setGateGuidedArrived(false);
              const start=gateMarkerProgress>=1?0:gateMarkerProgress;
              gateRouteProgressRef.current=start;
              setGateMarkerProgress(start);
              setGateWalkPlaying(false);
              setGateRoutePlaybackEnabled(true);
              setGateFoxSizeDraft(null);
              setGateRoutePlaying(true);
            }}>Play route</button>
          <button type="button" disabled={!gateRoutePlaying}
            onClick={()=>setGateRoutePlaying(false)}>Pause route</button>
          <button type="button" onClick={()=>{
            setGateRoutePlaying(false);
            setGateGuidedMode(false);
            setGateGuidedArrived(false);
            setGateRoutePlaybackEnabled(true);
            setGateWalkPlaying(false);
            gateRouteProgressRef.current=0;
            setGateMarkerProgress(0);
            setGateFoxSizeDraft(null);
          }}>Restart route</button>
          <span role="status">{gateRoutePlaying
            ? "Walking the route"
            : gateRoutePlaybackEnabled
              ? (gateMarkerProgress>=1 ? "Route finished" : "Route paused")
              : "Route ready"}</span>
        </div>}
        <div className="z-gate-size-workbench" role="group"
          aria-label="Place lesson stops on the fox route">
          <strong>Lesson stop placement · {gateLessonStops.length} of {stops.length} saved</strong>
          <span>Select a lesson below, then scrub the Ground marker to where the fox
            should stop. Save that position. This is authoring only: it does not
            open or complete lessons.</span>
          <div className="z-gate-editor-buttons" role="group"
            aria-label="Choose a lesson landmark">
            {stops.map((stop,i)=>{
              const saved=gateLessonStops.find(item=>item.lessonId===stop.id);
              return <button key={stop.id} type="button"
                aria-pressed={gateSelectedLessonId===stop.id}
                onClick={()=>{
                  setGateSelectedLessonId(stop.id);
                  setGateLessonCopyStatus("");
                  if(saved) {
                    setGateRoutePlaying(false);
                    setGateRoutePlaybackEnabled(true);
                    gateRouteProgressRef.current=saved.at/1000;
                    setGateMarkerProgress(saved.at/1000);
                    setGateFoxSizeDraft(null);
                  }
                }}>
                {i+1}. {FIRST_CONTACT_LANDMARKS[i]||stop.title}{saved?" ✓":""}
              </button>;
            })}
          </div>
          <span>Selected: {gateSelectedLesson?.title||"Choose a lesson"}.
            Current marker: {(gateMarkerProgress*100).toFixed(1)}%.</span>
          <div className="z-gate-editor-buttons">
            <button type="button" disabled={!gateSelectedLesson||!gateMarkerPoint}
              onClick={()=>{
                const marker=Math.round(gateMarkerProgress*1000);
                saveLessonPositions([...gateLessonStops.filter(
                  stop=>stop.lessonId!==gateSelectedLessonId),
                  {lessonId:gateSelectedLessonId,at:marker}]);
              }}>{gateSelectedLessonSaved?"Update lesson stop here":"Save lesson stop here"}</button>
            <button type="button" disabled={!gateSelectedLessonSaved}
              onClick={()=>saveLessonPositions(gateLessonStops.filter(
                stop=>stop.lessonId!==gateSelectedLessonId))}>Remove this stop</button>
          </div>
          {gateLessonStops.length>0 && <div className="z-gate-size-saved">
            {stops.map((lesson,i)=>{
              const saved=gateLessonStops.find(stop=>stop.lessonId===lesson.id);
              if(!saved)return null;
              return <button key={lesson.id} type="button"
                aria-pressed={gateSelectedLessonId===lesson.id && gateSizeMarker===saved.at}
                onClick={()=>{
                  setGateSelectedLessonId(lesson.id);
                  setGateRoutePlaying(false);
                  setGateRoutePlaybackEnabled(true);
                  gateRouteProgressRef.current=saved.at/1000;
                  setGateMarkerProgress(saved.at/1000);
                  setGateFoxSizeDraft(null);
                }}>{i+1}. {FIRST_CONTACT_LANDMARKS[i]} · {(saved.at/10).toFixed(1)}%</button>;
            })}
          </div>}
          <span role="status">{gateLessonCopyStatus||
            (gateLessonIssue||"All five stops are ordered and ready to copy for approval.")}</span>
          <button type="button" disabled={!gateLessonStops.length}
            onClick={async()=>{
              try {
                await navigator.clipboard.writeText(gateLessonExport);
                setGateLessonCopyStatus("Lesson stop plan copied. Paste it into the development chat.");
              } catch {
                setGateLessonCopyStatus("Select and copy the text below instead.");
              }
            }}>Copy lesson stop plan ({gateLessonStops.length}/{stops.length})</button>
          <details>
            <summary>Review or manually copy the lesson stop JSON</summary>
            <textarea readOnly aria-label="Lesson stop plan export" rows="5"
              onFocus={e=>e.target.select()} value={gateLessonExport}/>
          </details>
        </div>
        <label htmlFor="gate-route-marker">Ground marker · {Math.round(gateMarkerProgress*100)}%</label>
        <input id="gate-route-marker" type="range" min="0" max="1000" step="1"
          aria-label="Scrub ground marker on traced route"
          value={Math.round(gateMarkerProgress*1000)}
          onChange={e=>{setGateRoutePlaying(false);setGateGuidedMode(false);setGateGuidedArrived(false);setGateRoutePlaybackEnabled(true);gateRouteProgressRef.current=Number(e.target.value)/1000;setGateMarkerProgress(gateRouteProgressRef.current);
            setGateFoxSizeDraft(null);setGateFoxSizeCopyStatus("");}}/>
        {gateDepthAnimateFox && <div className="z-gate-size-workbench">
          <label htmlFor="gate-fox-size-here">
            Fox size here · {Math.round(gateFoxScale*100)}% {gateSizeStop?"(saved)":
              gateFoxSizeDraft?"(unsaved)":"(automatic)"}
          </label>
          <input id="gate-fox-size-here" type="range" min="40" max="100" step="1"
            aria-label="Adjust fox size at current route position"
            value={Math.round(gateFoxScale*100)}
            onChange={e=>{setGateFoxSizeDraft({at:gateSizeMarker,size:Number(e.target.value)});
              setGateFoxSizeCopyStatus("");}}/>
          <div className="z-gate-editor-buttons">
            <button type="button" onClick={()=>{
              const size=Math.round(gateFoxScale*100);
              setGateFoxSizeStops(xs=>[...xs.filter(x=>x.at!==gateSizeMarker),
                {at:gateSizeMarker,size}].sort((a,b)=>a.at-b.at));
              setGateFoxSizeDraft(null);
            }}>{gateSizeStop?"Update saved size":"Save size here"}</button>
            <button type="button" disabled={!gateSizeStop} onClick={()=>{
              setGateFoxSizeStops(xs=>xs.filter(x=>x.at!==gateSizeMarker));
              setGateFoxSizeDraft(null);
            }}>Remove saved size</button>
          </div>
          <button type="button" disabled={!gateFoxSizeStops.length} onClick={async()=>{
            try {await navigator.clipboard.writeText(gateFoxSizeExport);
              setGateFoxSizeCopyStatus("Size adjustments copied");}
            catch {setGateFoxSizeCopyStatus("Select and copy the text below");}
          }}>Copy size adjustments ({gateFoxSizeStops.length})</button>
          {gateFoxSizeStops.length>0 && <div className="z-gate-size-saved">
            {gateFoxSizeStops.map(({at,size})=>
              <button type="button" key={at} aria-pressed={gateSizeMarker===at}
                onClick={()=>{setGateMarkerProgress(at/1000);setGateFoxSizeDraft(null);}}>
                {(at/10).toFixed(1)}% route · {size}% fox
              </button>)}
          </div>}
          <textarea readOnly aria-label="Saved fox size adjustments" rows="2"
            onFocus={e=>e.target.select()} value={gateFoxSizeExport}/>
          {gateFoxSizeCopyStatus && <span role="status">{gateFoxSizeCopyStatus}</span>}
          <details className="z-gate-size-baseline">
            <summary>Adjust default perspective</summary>
            <label htmlFor="gate-fox-far-size">Far-end default · {gateFoxFarScale}%</label>
            <input id="gate-fox-far-size" aria-label="Set fox size at far end of route"
              type="range" min="40" max="100" step="1" value={gateFoxFarScale}
              onChange={e=>setGateFoxFarScale(Number(e.target.value))}/>
          </details>
        </div>}
        <span>{gateMarkerPoint
          ? "Paws at "+Math.round(gateMarkerPoint.x)+", "+Math.round(gateMarkerPoint.y)
          : "Add points to preview"} · Tap Find me to centre the marker</span>
        {gateSection && <div className="z-gate-section-author">
          <strong>Section {gateSection.segment} of {gateDirectionAssignments.length}
            {" · "} Point {gateSection.from} → {gateSection.to}</strong>
          <div className="z-gate-editor-buttons">
            <button type="button" disabled={gateSectionIndex===0}
              onClick={()=>seekGateSection(gateSectionIndex-1)}>← Previous section</button>
            <button type="button"
              disabled={gateSectionIndex===gateDirectionAssignments.length-1}
              onClick={()=>seekGateSection(gateSectionIndex+1)}>Next section →</button>
          </div>
          <span>Facing: {gateWalkFacing} ({gateSection.mode}).
            Choose a heading below to override this section, or use Auto to follow the drawn path.</span>
        </div>}
        <div className="z-gate-editor-buttons">
          <button type="button" aria-pressed={gateDepthShowFox}
            onClick={()=>{setGateRoutePlaying(false);setGateDepthShowFox(v=>!v);}}>
            {gateDepthShowFox?"Hide static fox":"Show static fox"}
          </button>
          <button type="button" aria-pressed={gateDepthShowGuide}
            onClick={()=>setGateDepthShowGuide(v=>!v)}>
            {gateDepthShowGuide?"Hide route guide":"Show route guide"}
          </button>
        </div>
        <div className="z-gate-editor-buttons" role="group" aria-label="Fixed-position fox animation proof">
          <button type="button" aria-pressed={gateDepthAnimateFox}
            onClick={() => {
              setGateRoutePlaying(false);
              setGateGuidedMode(false);
              setGateGuidedArrived(false);
              setGateRoutePlaybackEnabled(false);
              setGateDepthAnimateFox(v=>!v);
              setGateWalkPlaying(true);
              setGateWalkFrame(0);
            }}>{gateDepthAnimateFox ? "Return to static fox" : "Preview walking fox"}</button>
          {gateDepthAnimateFox && <>
            <div className="z-gate-editor-buttons z-gate-walk-direction-grid"
              role="group" aria-label="Change fox walking direction">
              {FOX_WALK_DIRECTIONS.map(({value,label})=>
                <button type="button" key={value}
                  aria-pressed={gateWalkFacing===value}
                  onClick={()=>{
                    setGateSegmentDirections(d=>({...d,[gateSectionIndex]:value}));
                    setGateDirectionCopyStatus("");
                  }}>{label}</button>)}
            </div>
            <button type="button" aria-label="Use automatic direction for selected section"
              disabled={!gateSection || gateSection.mode==="auto"}
              onClick={()=>{
                setGateSegmentDirections(d=>{
                  const next={...d};delete next[gateSectionIndex];return next;
                });
                setGateDirectionCopyStatus("");
              }}>Auto direction</button>
            <button type="button" aria-label={gateWalkPlaying?"Pause fox walk":"Play fox walk"}
              onClick={()=>setGateWalkPlaying(p=>!p)}>{gateWalkPlaying?"Pause":"Play"}</button>
            <button type="button" aria-label="Next fox walk pose" onClick={()=>{
              setGateRoutePlaying(false);
              setGateRoutePlaybackEnabled(false);
              setGateWalkPlaying(false);
              setGateWalkFrame(f=>(f+1)%8);
            }}>Next pose</button>
          </>}
        </div>
        {gateDepthAnimateFox && <div className="z-gate-section-author">
          <div className="z-gate-editor-buttons">
            <button type="button" disabled={!gateDirectionAssignments.length}
              onClick={async()=>{
                try {
                  await navigator.clipboard.writeText(gateDirectionExport);
                  setGateDirectionCopyStatus("Section direction plan copied");
                } catch {
                  setGateDirectionCopyStatus("Select and copy the field below");
                }
              }}>Copy all section directions</button>
          </div>
          <textarea readOnly aria-label="All route section directions" rows="3"
            onFocus={e=>e.target.select()} value={gateDirectionExport}/>
          {gateDirectionCopyStatus && <span role="status">{gateDirectionCopyStatus}</span>}
        </div>}
        <span>{gateDepthAnimateFox
          ? "Dev-only guided proof stops at each approved lesson. The fox faces the learner at arrival and the existing lesson UI opens via the normal progress gate. The route beyond Town Hall leads towards the next map, not yet built. Free walking still runs all 27 points."
          : "Fox and paw marker are below the arch foreground. Route guide, when shown, stays above it for editing."}</span>
      </div>}
      <div className="z-gate-editor-buttons">
        <button type="button" disabled={!gateRouteHistory.length} onClick={()=>{
          const previous=gateRouteHistory.at(-1);
          setGateRouteHistory(h=>h.slice(0,-1));
          setGateRoutePoints(previous);
          setGateSegmentDirections({});
          setGateSelectedPoint(null);setGateCopyStatus("");
        }}>Undo</button>
        <button type="button" disabled={gateSelectedPoint===null} onClick={()=>{
          checkpointRoute();setGateRoutePoints(points=>points.filter((_,i)=>i!==gateSelectedPoint));
          setGateSelectedPoint(null);
        }}>Delete selected</button>
        <button type="button" disabled={!gateRoutePoints.length} onClick={()=>{
          checkpointRoute();setGateRoutePoints([]);setGateSelectedPoint(null);
        }}>Clear draft</button>
        <button type="button" onClick={()=>{
          checkpointRoute();
          setGateRoutePoints(USER_TRACED_VILLAGE_ROUTE.map(p=>({...p})));
          setGateMarkerProgress(0);setGateSelectedPoint(null);
        }}>Restore your traced route</button>
      </div>
      <div className="z-gate-editor-buttons">
        <button type="button" disabled={!gateRoutePoints.length} onClick={async()=>{
          try {
            await navigator.clipboard.writeText(gateRouteJson(gateRoutePoints));
            setGateCopyStatus("Coordinates copied");
          } catch {
            setGateCopyStatus("Copy from the field below instead");
          }
        }}>Copy coordinates</button>
        <button type="button" onClick={()=>setGateEditorEnabled(false)}>
          View previous fox proof</button>
      </div>
      <textarea readOnly aria-label="Route coordinates" rows="2"
        onFocus={e=>e.target.select()} value={gateRouteJson(gateRoutePoints)}/>
      {gateCopyStatus && <span role="status">{gateCopyStatus}</span>}
      <span>Path is a visual candidate only. Changes are temporary and do not affect lesson progress. Copy any refinements before refreshing.</span>
    </div>}
    {foxPreviewEnabled && showMapDevTools && !editingGate && <div className="z-fox-pose-preview" role="group"
      aria-label="Gate traversal frame proof">
      <button type="button" onClick={()=>setGateEditorEnabled(true)}>Edit path</button>
      <span>Gate walk · frame {Math.round(gateProgress*24)+1}/25</span>
      {[["approach","A · Approach"],["passage","B · Under arch"],["emerge","C · Emerge"]].map(([stage,label])=>
        <button type="button" key={stage}
          aria-pressed={Math.abs(gateProgress-GATE_STAGE_PROGRESS[stage])<1e-8}
          onClick={()=>{setGateProgress(GATE_STAGE_PROGRESS[stage]);
            recenterOnWorldPoint(GATE_TEST_POSITIONS[stage]);}}>{label}</button>
      )}
      <button type="button" aria-label="Previous gate frame"
        onClick={()=>setGateProgress(p=>Math.max(0,(Math.ceil(p*24-1e-7)-1)/24))}>◀</button>
      <input className="z-gate-frame-scrubber" type="range" min="0" max="1000" step="1"
        value={Math.round(gateProgress*1000)}
        onChange={e=>setGateProgress(Number(e.target.value)/1000)}
        aria-label="Scrub fox through gate"/>
      <button type="button" aria-label="Next gate frame"
        onClick={()=>setGateProgress(p=>Math.min(1,(Math.floor(p*24+1e-7)+1)/24))}>▶</button>
      <button type="button" aria-pressed={gateShowPath}
        onClick={()=>setGateShowPath(v=>!v)}>
        {gateShowPath?"Hide cobble guide":"Show cobble guide"}
      </button>
      <button type="button" aria-pressed={gateShowMarker}
        onClick={()=>setGateShowMarker(v=>!v)}>
        {gateShowMarker?"Hide gate marker":"Show gate marker"}
      </button>
    </div>}
    {foxGapReplay && <div className="z-fox-route-gap-qa" role="group"
      aria-label="Replay Bakery to Lantern Corner without resetting lessons">
      <button type="button" onClick={()=>{
        journeyProgressRef.current=.395;
        setJourneyProgress(.395);
        setJourneyMoving(true);
      }}>Replay Bakery → Lantern Corner</button>
      <span role="status">Route {(journeyProgress*100).toFixed(1)}% ·
        segment {(journeyPoint?.segmentIndex??0)+1} · {journeyDirection} ·
        sheet {journeyAtlas} {journeyAtlasLoaded?"decoded":"loading / fallback"} ·
        frame {journeyVisibleFrame}{healthyFrames.length<8 ? " · "+healthyFrames.length+"/8 frames visible" : ""}</span>
    </div>}
    <div className="z-local-map-footer">
      <span>{stops.filter(s=>completed.has(s.id)).length} of {stops.length} stops completed</span>
      <span>{stops.length === 5 ? "Five-stop village trail" : "Your lesson route"}</span>
    </div>
  </div>;
}
