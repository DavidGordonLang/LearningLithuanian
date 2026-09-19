// src/content/learning/section4/index.js
// Section 4 — Food and Drink

import createModule_4_1 from "./module_4_1";
import createModule_4_2 from "./module_4_2";
import createModule_4_3 from "./module_4_3";
import createModule_4_4 from "./module_4_4";
import createCheckpoint4 from "./checkpoint_4";

export default function createSection4(profile = {}) {
  return {
    id: "section_4",
    code: "4",
    title: "Food and Drink",
    description: "Order, customise, pay, and interact socially around food and drink.",
    moduleCount: 4,
    checkpointCount: 1,
    modules: [
      createModule_4_1(profile),
      createModule_4_2(profile),
      createModule_4_3(profile),
      createModule_4_4(profile),
      createCheckpoint4(profile),
    ],
  };
}
