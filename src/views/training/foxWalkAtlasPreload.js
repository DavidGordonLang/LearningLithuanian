// Decode each directional atlas before an animated heading change on Android.
// Examine the eight atlas cells as well: transparent frames cannot be used.
export const FOX_WALK_ATLAS_NAMES=["up-left","up","left","down-left","down"];
export const WOLF_WALK_ATLAS_NAMES=["up-left","up","left","down-left","down","down-right"];
export async function preloadJourneyWalkAtlases(companionId="fox"){
  const isWolf=companionId==="wolf";
  const names=isWolf?WOLF_WALK_ATLAS_NAMES:FOX_WALK_ATLAS_NAMES;
  return Promise.all(names.map(async name=>{
    const img=new Image();
    img.src=isWolf
      ? "/assets/journey/wolf-walk-"+name+"-fixed.avif"
      : "/assets/journey/fox-walk-"+name+"-fixed-probe.avif";
    try {
      await img.decode();
      let frames=[0,1,2,3,4,5,6,7];
      const w=Math.floor((img.naturalWidth||0)/4);
      const h=Math.floor((img.naturalHeight||0)/2);
      if(typeof document!=="undefined" && w>0 && h>0){
        try{
          const canvas=document.createElement("canvas");
          canvas.width=img.naturalWidth;
          canvas.height=img.naturalHeight;
          const ctx=canvas.getContext("2d",{willReadFrequently:true});
          if(ctx){
            ctx.drawImage(img,0,0);
            frames=frames.filter(i=>{
              const {data}=ctx.getImageData((i%4)*w,Math.floor(i/4)*h,w,h);
              let count=0;
              for(let k=3;k<data.length;k+=4*10){
                if(data[k]>35 && ++count>=8)return true;
              }
              return false;
            });
          }
        }catch{/* Decoded image is valid even if canvas inspection fails. */}
      }
      return {name,ready:frames.length>0,frames};
    } catch {
      return {name,ready:false,frames:[]};
    }
  }));
}

// Retained for existing fox-only callers and tests.
export function preloadFoxWalkAtlases(){return preloadJourneyWalkAtlases("fox");}
