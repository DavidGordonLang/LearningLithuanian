// Development-only map-route draft geometry. Approved lesson markers stay immutable.
export const ROUTE_DRAFT_VERSION = 1;
export const ROUTE_WIDTH = 1024;
export const ROUTE_HEIGHT = 1536;
export const MAX_ROUTE_POINTS = 500;

export const routeStorageKey = (accountId, mapId) =>
  `zodis:journey:route:stage2:portrait-v1:${accountId || 'local'}:${mapId}`;
export const validRoutePoint = (p) =>
  Number.isFinite(p?.x) && Number.isFinite(p?.y) &&
  p.x >= 0 && p.x <= ROUTE_WIDTH && p.y >= 0 && p.y <= ROUTE_HEIGHT;

export function buildRouteDraft(mapId, points) {
  return {
    version: ROUTE_DRAFT_VERSION,
    mapId,
    dimensions: {width: ROUTE_WIDTH, height: ROUTE_HEIGHT},
    // Copy coordinates to avoid mutating the live route from exported objects.
    points: points.filter(validRoutePoint).slice(0, MAX_ROUTE_POINTS)
      .map(({x,y}) => ({x:Math.round(x), y:Math.round(y)})),
  };
}

export function restoreRouteDraft(raw, mapId) {
  try {
    const value = JSON.parse(raw || 'null');
    if (value?.version !== ROUTE_DRAFT_VERSION || value.mapId !== mapId ||
        value.dimensions?.width !== ROUTE_WIDTH ||
        value.dimensions?.height !== ROUTE_HEIGHT ||
        !Array.isArray(value.points) || value.points.length > MAX_ROUTE_POINTS ||
        !value.points.every(validRoutePoint)) return [];
    return value.points.map(({x,y}) => ({x:Math.round(x),y:Math.round(y)}));
  } catch { return []; }
}

function clamp(n, min, max) {return Math.max(min, Math.min(max, n));}
export function nearestRouteProgress(points, marker) {
  if (!points.length) return null;
  let distance = Infinity;
  let progress = 0;
  let elapsed = 0;
  if(points.length === 1) return {distance:Math.hypot(marker.x-points[0].x,marker.y-points[0].y), progress:0};
  for(let i=1;i<points.length;i++) {
    const a=points[i-1], b=points[i], dx=b.x-a.x, dy=b.y-a.y;
    const sizeSquared=dx*dx+dy*dy;
    const segmentLength=Math.sqrt(sizeSquared);
    const t=sizeSquared>0 ? clamp(((marker.x-a.x)*dx+(marker.y-a.y)*dy)/sizeSquared,0,1) : 0;
    const d=Math.hypot(marker.x-a.x-t*dx,marker.y-a.y-t*dy);
    if(d<distance) {distance=d;progress=elapsed+t*segmentLength;}
    elapsed+=segmentLength;
  }
  return {distance,progress};
}

// Advisory only: marker artwork often floats above the actual walkable road.
export function routeStopReview(points, markers, tolerance=95) {
  if(points.length<2) return {near:0,total:markers.length,outOfOrder:false};
  let near=0, previous=-Infinity, outOfOrder=false;
  for(const marker of markers) {
    const closest=nearestRouteProgress(points, marker);
    if(closest.distance>tolerance) continue;
    near++;
    if(closest.progress < previous-5) outOfOrder=true;
    previous=closest.progress;
  }
  return {near,total:markers.length,outOfOrder};
}