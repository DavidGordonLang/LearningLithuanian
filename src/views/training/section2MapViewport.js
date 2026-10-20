// Pure geometry for the DEV Section 2 map editor, original 1024 × 1536 pixels.
// Center a fitted portrait; preserve the exact image-space point coordinates.
export function section2FitScale(width,height,mapWidth=1024,mapHeight=1536){
  if(!(width>0&&height>0&&mapWidth>0&&mapHeight>0)) return 0.25;
  return Math.min(width/mapWidth,height/mapHeight);
}
export function section2StageLayout(width,height,zoom,mapWidth=1024,mapHeight=1536){
  const imageWidth=mapWidth*zoom,imageHeight=mapHeight*zoom;
  const stageWidth=Math.max(width,imageWidth),stageHeight=Math.max(height,imageHeight);
  return {imageWidth,imageHeight,stageWidth,stageHeight,
    left:(stageWidth-imageWidth)/2,top:(stageHeight-imageHeight)/2};
}
