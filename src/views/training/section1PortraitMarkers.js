// Approved Section 1 portrait Journey map marker positions supplied by David
// on 13 October 2026. Gameplay's live route remains unchanged until approved.
// Coordinates are ORIGINAL 1024 x 1536 image pixels; no viewport scaling.
// Keep these baselines immutable. Browser-only editor drafts may override them.
export const SECTION1_PORTRAIT_MARKERS = {
  module_1_1: {
    version: 2, mapId: "module_1_1",
    dimensions: { width: 1024, height: 1536 },
    markers: [
      { id: "section_1_module_1_lesson_1", x: 535, y: 1271 },
      { id: "section_1_module_1_lesson_2", x: 577, y: 898 },
      { id: "section_1_module_1_lesson_3", x: 793, y: 648 },
      { id: "section_1_module_1_lesson_4", x: 92, y: 445 },
      { id: "section_1_module_1_checkpoint", x: 693, y: 186 },
    ],
  },
  module_1_2: {
    version: 2, mapId: "module_1_2",
    dimensions: { width: 1024, height: 1536 },
    markers: [
      { id: "section_1_module_2_lesson_1", x: 937, y: 1252 },
      { id: "section_1_module_2_lesson_2", x: 576, y: 948 },
      { id: "section_1_module_2_lesson_3", x: 762, y: 714 },
      { id: "section_1_module_2_lesson_4", x: 229, y: 462 },
      { id: "section_1_module_2_lesson_5", x: 566, y: 279 },
      { id: "section_1_module_2_checkpoint", x: 279, y: 82 },
    ],
  },
  module_1_3: {
    version: 2, mapId: "module_1_3",
    dimensions: { width: 1024, height: 1536 },
    markers: [
      { id: "section_1_module_3_lesson_1", x: 209, y: 1076 },
      { id: "section_1_module_3_lesson_2", x: 733, y: 786 },
      { id: "section_1_module_3_lesson_3", x: 345, y: 509 },
      { id: "section_1_module_3_lesson_4", x: 602, y: 257 },
      { id: "section_1_module_3_checkpoint", x: 874, y: 115 },
    ],
  },
  module_1_4: {
    version: 2, mapId: "module_1_4",
    dimensions: { width: 1024, height: 1536 },
    markers: [
      { id: "section_1_module_4_lesson_1", x: 654, y: 1362 },
      { id: "section_1_module_4_lesson_2", x: 411, y: 1100 },
      { id: "section_1_module_4_lesson_3", x: 799, y: 889 },
      { id: "section_1_module_4_lesson_4", x: 237, y: 650 },
      { id: "section_1_module_4_lesson_5", x: 789, y: 535 },
      { id: "section_1_module_4_checkpoint", x: 443, y: 263 },
      { id: "section_1_checkpoint", x: 789, y: 148 },
    ],
  },
};

export function approvedPortraitMarkerPositions(mapId, lessonIds) {
  const source = SECTION1_PORTRAIT_MARKERS[mapId];
  if (!source) return {};
  const allowed = new Set(lessonIds);
  return Object.fromEntries(source.markers
    .filter(({id}) => allowed.has(id))
    .map(({id,x,y}) => [id,{x,y}]));
}
