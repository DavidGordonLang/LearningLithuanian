// Prevent a blank first frame on Android when changing AVIF animation sheets.
export const FOX_WALK_ATLAS_NAMES=["up-left","up","left","down-left","down"];
export async function preloadFoxWalkAtlases(){
  return Promise.all(FOX_WALK_ATLAS_NAMES.map(async name=>{
    const img=new Image();
    img.src="/assets/journey/fox-walk-"+name+"-fixed-probe.avif";
    try {await img.decode();return {name,ready:true};}
    catch {return {name,ready:false};}
  }));
}
