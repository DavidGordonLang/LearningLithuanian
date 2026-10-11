// Visual-only fox traversal proof for the illustrated village gate.
// All positions are feet/ground contact coordinates in the 850 x 1120 world.
// B is the accepted under-arch position; this helper never moves the artwork.
export const GATE_ROUTE_POINTS = [
  { x: 170, y: 1100 }, // A · approach
  { x: 184, y: 1087 },
  { x: 200, y: 1067 },
  { x: 220, y: 1044 },
  { x: 240, y: 1022 }, // B · approved under-arch pose
  { x: 219, y: 995 }, // veer left into the arch opening, on the paving
  { x: 201, y: 972 },
  { x: 204, y: 947 },
  { x: 214, y: 922 },
  { x: 237, y: 892 },
  { x: 268, y: 866 }, // behind right-hand pier / arch
  { x: 300, y: 844 }, // rejoin the upper cobblestones
  { x: 346, y: 833 },
  { x: 395, y: 827 },
  { x: 450, y: 832 }, // C · emerge
];
export const GATE_STAGE_WAYPOINT = { approach: 0, passage: 4, emerge: 14 };
const segmentLengths = GATE_ROUTE_POINTS.slice(1).map((p,i) =>
  Math.hypot(p.x-GATE_ROUTE_POINTS[i].x,p.y-GATE_ROUTE_POINTS[i].y)
);
export const GATE_ROUTE_LENGTH = segmentLengths.reduce((sum,length)=>sum+length,0);
function distanceToWaypoint(index) {
  return segmentLengths.slice(0,index).reduce((sum,length)=>sum+length,0);
}
export const GATE_STAGE_PROGRESS = Object.fromEntries(
  Object.entries(GATE_STAGE_WAYPOINT).map(([stage,index]) =>
    [stage,distanceToWaypoint(index)/GATE_ROUTE_LENGTH])
);

// Uniform distance interpolation, not linear X/Y or waypoint-by-waypoint timing.
// The small rhythmic lean/squash is anchored at the PAWS: no airborne jump.
export function gateTraverseAt(progress) {
  const t = Number.isFinite(progress) ? Math.max(0,Math.min(1,progress)) : 0;
  const travel = t*GATE_ROUTE_LENGTH;
  let passed = 0;
  for(let i=0;i<segmentLengths.length;i++) {
    const length=segmentLengths[i];
    if(passed+length>=travel || i===segmentLengths.length-1) {
      const a=GATE_ROUTE_POINTS[i], b=GATE_ROUTE_POINTS[i+1];
      const ratio=length ? Math.max(0,Math.min(1,(travel-passed)/length)) : 0;
      const afterGate=Math.max(0,Math.min(1,
        (t-GATE_STAGE_PROGRESS.passage)/(1-GATE_STAGE_PROGRESS.passage)));
      const anchor=Object.values(GATE_STAGE_PROGRESS).some(p=>Math.abs(t-p)<1e-8);
      const stride=anchor ? 0 : Math.sin(travel*0.16);
      return {
        point: { x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio },
        dimensions: { width:82-4*afterGate,height:112-6*afterGate },
        direction: b.x<a.x ? "up-left" : "up-right",
        tilt: anchor ? 0 : 1.35*stride,
        squash: anchor ? 1 : 1-0.01*Math.abs(stride),
        distance: travel,
      };
    }
    passed+=length;
  }
  throw new Error("Gate traversal has no segments");
}
