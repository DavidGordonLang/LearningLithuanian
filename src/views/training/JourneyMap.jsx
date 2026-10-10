import React, { useEffect, useRef, useState } from "react";
import { FullBodyCompanion } from "./JourneyCompanion";
import { clampCamera, fitMapScale, pinchView } from "./journeyMapGestures";

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
  { x: 183, y: 925 }, // Village Gate: Hello and Goodbye
  { x: 617, y: 638 }, // Fountain: Yes, No, Please, Thank You
  { x: 254, y: 526 }, // Bakery: Sorry and Excuse Me
  { x: 654, y: 325 }, // Lantern Corner: Polite Mini Exchanges
  { x: 310, y: 204 }, // Town Hall: module checkpoint
];
const FIRST_CONTACT_LANDMARKS = [
  "Village Gate", "Village Fountain", "The Bakery",
  "Lantern Corner", "Town Hall",
];
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
export default function JourneyMap({ module, completed, targetId, companion, onOpenLesson }) {
  const stops = module?.isSectionCheckpoint ? [module] : (module?.lessons || []);
  const illustrated = module?.id === FIRST_CONTACT_GREETING;
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

  const updateView = (nextCamera, nextScale = scaleRef.current) => {
    cameraRef.current = nextCamera;
    scaleRef.current = nextScale;
    setCamera(nextCamera);
    setScale(nextScale);
  };

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const recenter = () => {
      const bounds = element.getBoundingClientRect();
      const point = points[focusIndex] || POINTS[0];
      const zoom = scaleRef.current;
      updateView(clampCamera(bounds.width/2 - point.x*zoom, bounds.height/2 - point.y*zoom,
        bounds.width, bounds.height, zoom), zoom);
    };
    recenter();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(recenter) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [module?.id, focusIndex, defaultScale]);

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
        suppressPinchClick.current = true;
        for (const id of pointers.current.keys()) {
          try { e.currentTarget.setPointerCapture(id); } catch { /* pointer already released */ }
        }
        return;
      }
    }
    if (e.target.closest("button")) return;
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
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const current = stops[focusIndex];
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
        {stops.map((stop,i)=>{
          const point=points[i];
          const done=completed.has(stop.id), here=stop.id===targetId;
          const available=done||here;
          return <button type="button" key={stop.id} disabled={!available} onClick={()=>onOpenLesson?.(stop.id)}
            className={"z-local-map-stop "+(done?"is-done ":"")+(here?"is-current ":"")+(available?"":"is-locked")}
            style={{left:point.x,top:point.y,minHeight:Math.max(70,48/scale),minWidth:Math.max(80,48/scale)}}
            aria-label={(done?"Review ":here?"Start ":"Locked ") + stop.title}>
            <span className="z-local-map-stop-circle" aria-hidden="true">{done?"✓":here?(stop.isCheckpoint?"★":i+1):"🔒"}</span>
            <span className="z-local-map-stop-name">
              {illustrated && <span className="z-local-map-stop-landmark">{FIRST_CONTACT_LANDMARKS[i]}</span>}
              {stop.title}
            </span>
          </button>;
        })}
        {current && <span className="z-local-map-character" style={{left:points[focusIndex].x,top:points[focusIndex].y-112}} aria-label={"Your "+companion.name+" at "+current.title}>
          <FullBodyCompanion companion={companion}/>
        </span>}
      </div>
      <div className="z-local-map-top-label" aria-hidden="true">Drag to explore · Pinch to zoom</div>
      <button type="button" className="z-local-map-recenter" onClick={()=>{
        const b=viewport.current.getBoundingClientRect(),p=points[focusIndex];
        const zoom=scaleRef.current;
        updateView(clampCamera(b.width/2-p.x*zoom,b.height/2-p.y*zoom,b.width,b.height,zoom),zoom);
      }}>⌖ Find me</button>
    </div>
    <div className="z-local-map-footer">
      <span>{stops.filter(s=>completed.has(s.id)).length} of {stops.length} stops completed</span>
      <span>{stops.length === 5 ? "Five-stop village trail" : "Your lesson route"}</span>
    </div>
  </div>;
}
