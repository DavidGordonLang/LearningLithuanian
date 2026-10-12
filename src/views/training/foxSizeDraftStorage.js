// Only the fox map author's private draft is written, never learner progress.
export const FOX_SIZE_DRAFT_KEY = "zodis:journey-fox-size-draft:1.1:v1";
export function readFoxSizeDraft(expectedRoute) {
  try {
    const data = JSON.parse(window.localStorage.getItem(FOX_SIZE_DRAFT_KEY)||"null");
    if(data?.route!==expectedRoute)return null;
    if(!Number.isInteger(data.far)||data.far<40||data.far>100)return null;
    if(!Array.isArray(data.stops))return null;
    const stops=data.stops.filter(v=>Number.isInteger(v?.at)&&v.at>=0&&v.at<=1000&&
      Number.isInteger(v?.size)&&v.size>=40&&v.size<=100);
    return {far:data.far,stops:stops.slice(0,100)};
  } catch {return null;}
}
export function saveFoxSizeDraft(route,far,stops) {
  try {
    window.localStorage.setItem(FOX_SIZE_DRAFT_KEY,JSON.stringify({route,far,stops}));
  } catch { /* Storage can be disabled without breaking map. */ }
}
