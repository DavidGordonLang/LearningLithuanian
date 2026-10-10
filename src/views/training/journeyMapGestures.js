// Pure map-camera geometry: keep the scene, lesson buttons and companion
// under one transform, whether dragged or pinched.
export const MAP_WIDTH = 850;
export const MAP_HEIGHT = 1120;
export const MAP_MAX_ZOOM = 1.3;

export function clampCamera(x, y, width, height, scale) {
  const sceneWidth = MAP_WIDTH * scale;
  const sceneHeight = MAP_HEIGHT * scale;
  return {
    x: sceneWidth <= width ? (width - sceneWidth) / 2 : Math.min(0, Math.max(width - sceneWidth, x)),
    y: sceneHeight <= height ? (height - sceneHeight) / 2 : Math.min(0, Math.max(height - sceneHeight, y)),
  };
}

export function fitMapScale(width, height, defaultScale) {
  return Math.min(defaultScale, Math.max(0.3, Math.min(width / MAP_WIDTH, height / MAP_HEIGHT)));
}

export function pinchView({ startScale, startDistance, distance, anchor, midpoint, width, height, minScale }) {
  const scale = Math.min(MAP_MAX_ZOOM, Math.max(minScale, startScale * (distance / Math.max(1, startDistance))));
  return {
    scale,
    camera: clampCamera(midpoint.x - anchor.x * scale, midpoint.y - anchor.y * scale, width, height, scale),
  };
}
