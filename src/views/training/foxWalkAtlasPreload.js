// Prevent a blank first frame on Android when changing AVIF animation sheets.
export const FOX_WALK_ATLAS_NAMES=["up-left","up","left","down-left","down"];
export async function preloadFoxWalkAtlases(){
  return Promise.all(FOX_WALK_ATLAS_NAMES.map(async name=>{
    const img=new Image();
    img.src="/assets/journey/fox-walk-"+name+"-fixed-probe.avif";
    try {
      await img.decode();
      let valid=true;
      if(typeof document!=="undefined" && img.naturalWidth && img.naturalHeight){
        const c=document.createElement("canvas");
        c.width=img.naturalWidth;c.height=img.naturalHeight;
        const ctx=c.getContext("2d",{willReadFrequently:true});
        if(ctx){ctx.drawImage(img,0,0);
          const pixels=ctx.getImageData(0,0,c.width,c.height).data;
          valid=false;
          for(let i=3;i<pixels.length;i+=40){
            if(pixels[i]>35){valid=true;break;}
          }
        }
      }
      return {name,ready:valid};
    }
    catch {return {name,ready:false};}
  }));
}
