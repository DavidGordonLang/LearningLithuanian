import React, { useEffect, useRef, useState } from "react";
import { FullBodyCompanion } from "./JourneyCompanion";

// Each module uses the same five-stop coordinate contract. New illustrated
// regions can supply different scenery without changing curriculum IDs.
const POINTS = [
  { x: 164, y: 1010 }, { x: 635, y: 850 }, { x: 240, y: 635 },
  { x: 655, y: 405 }, { x: 325, y: 168 }, { x: 615, y: 90 },
];
const WIDTH = 850;
const HEIGHT = 1120;
const SCALE = 0.72;
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
function clampCamera(x, y, width, height) {
  const scaledW = WIDTH * SCALE, scaledH = HEIGHT * SCALE;
  return { x: Math.min(0, Math.max(width - scaledW, x)), y: Math.min(0, Math.max(height - scaledH, y)) };
}
export default function JourneyMap({ module, completed, targetId, companion, onOpenLesson }) {
  const stops = module?.isSectionCheckpoint ? [module] : (module?.lessons || []);
  const points = stops.map((_, i) => POINTS[i] || POINTS[POINTS.length-1]);
  const active = Math.max(0, stops.findIndex(s => s.id === targetId));
  const lastDone = stops.reduce((index, stop, i) => completed.has(stop.id) ? i : index, 0);
  const focusIndex = targetId && stops.some(s => s.id === targetId) ? active : lastDone;
  const viewport = useRef(null);
  const drag = useRef(null);
  const [camera, setCamera] = useState({x: -160, y: -420});
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const recenter = () => {
      const bounds = element.getBoundingClientRect();
      const point = points[focusIndex] || POINTS[0];
      setCamera(clampCamera(bounds.width / 2 - point.x * SCALE, bounds.height / 2 - point.y * SCALE, bounds.width, bounds.height));
    };
    recenter();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(recenter) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [module?.id, focusIndex]);
  const onPointerDown = (e) => {
    if (e.target.closest("button")) return;
    drag.current = {id:e.pointerId,x:e.clientX,y:e.clientY,camera};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const {width,height} = viewport.current.getBoundingClientRect();
    setCamera(clampCamera(drag.current.camera.x + e.clientX - drag.current.x, drag.current.camera.y + e.clientY - drag.current.y, width, height));
  };
  const current = stops[focusIndex];
  return <div className="z-local-map-shell z-journey-dark">
    <div data-swipe-block="true" className="z-local-map-viewport" ref={viewport} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} aria-label="Illustrated village lesson route">
      <div className="z-local-map-world" style={{width:WIDTH,height:HEIGHT,transform:"translate("+camera.x+"px,"+camera.y+"px) scale("+SCALE+")"}}>
        <Scene points={points}/>
        {stops.map((stop,i)=>{
          const point=points[i];
          const done=completed.has(stop.id), here=stop.id===targetId;
          const available=done||here;
          return <button type="button" key={stop.id} disabled={!available} onClick={()=>onOpenLesson?.(stop.id)}
            className={"z-local-map-stop "+(done?"is-done ":"")+(here?"is-current ":"")+(available?"":"is-locked")}
            style={{left:point.x,top:point.y}}
            aria-label={(done?"Review ":here?"Start ":"Locked ") + stop.title}>
            <span className="z-local-map-stop-circle" aria-hidden="true">{done?"✓":here?(stop.isCheckpoint?"★":i+1):"🔒"}</span>
            <span className="z-local-map-stop-name">{stop.title}</span>
          </button>;
        })}
        {current && <span className="z-local-map-character" style={{left:points[focusIndex].x,top:points[focusIndex].y-112}} aria-label={"Your "+companion.name+" at "+current.title}>
          <FullBodyCompanion companion={companion}/>
        </span>}
      </div>
      <div className="z-local-map-top-label" aria-hidden="true">Drag to explore · Follow your companion</div>
      <button type="button" className="z-local-map-recenter" onClick={()=>{
        const b=viewport.current.getBoundingClientRect();const p=points[focusIndex];setCamera(clampCamera(b.width/2-p.x*SCALE,b.height/2-p.y*SCALE,b.width,b.height));
      }}>⌖ Find me</button>
    </div>
    <div className="z-local-map-footer">
      <span>{stops.filter(s=>completed.has(s.id)).length} of {stops.length} stops completed</span>
      <span>{stops.length === 5 ? "Five-stop village trail" : "Your lesson route"}</span>
    </div>
  </div>;
}