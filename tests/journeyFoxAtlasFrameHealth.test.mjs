import test from "node:test";
import assert from "node:assert/strict";
import {preloadFoxWalkAtlases} from "../src/views/training/foxWalkAtlasPreload.js";
test("blank atlas cell is excluded from valid walking frames",async()=>{
 const priorImage=globalThis.Image,priorDocument=globalThis.document;
 globalThis.Image=class{
  naturalWidth=400;naturalHeight=200;
  set src(value){this.uri=value;}
  decode(){return Promise.resolve();}
 };
 globalThis.document={createElement:()=>({
  getContext:()=>({
   drawImage(){},
   getImageData(x,y,w,h){
    const data=new Uint8ClampedArray(w*h*4);
    if(x!==100)for(let i=3;i<data.length;i+=4)data[i]=255;
    return {data};
   }
  })
 })};
 try{
  const atlas=await preloadFoxWalkAtlases();
  assert.equal(atlas.length,5);
  assert.ok(atlas.every(x=>x.ready));
  assert.ok(atlas.every(x=>x.frames.length===6));
 }finally{
  if(priorImage===undefined)delete globalThis.Image;else globalThis.Image=priorImage;
  if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;
 }
});
