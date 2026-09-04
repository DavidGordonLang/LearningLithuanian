// src/content/learning/section5/index.js
// Section 5 — Directions and Places

import createModule_5_1 from "./module_5_1";
import createModule_5_2 from "./module_5_2";
import createModule_5_3 from "./module_5_3";
import createModule_5_4 from "./module_5_4";
import createCheckpoint5 from "./checkpoint_5";

export default function createSection5(profile = {}) {
  return {
    id: "section_5",
    code: "5",
    title: "Directions and Places",
    description: "Ask where things are, understand directions, identify key places, and navigate simple real-world location exchanges.",
    moduleCount: 4,
    checkpointCount: 1,
    modules: [
      createModule_5_1(profile),
      createModule_5_2(profile),
      createModule_5_3(profile),
      createModule_5_4(profile),
      createCheckpoint5(profile),
    ],
  };
}
