// src/content/learning/section3/index.js
// Section 3 — Numbers, Prices, Time

import createModule_3_1 from "./module_3_1.js";
import createModule_3_2 from "./module_3_2.js";
import createModule_3_3 from "./module_3_3.js";
import createModule_3_4 from "./module_3_4.js";
import createCheckpoint3 from "./checkpoint_3.js";

export default function createSection3(profile = {}) {
  return {
    id: "section_3",
    code: "3",
    title: "Numbers, Prices, Time",
    description: "Handle prices, transactions, times, and quantities in everyday situations.",
    status: "active",
    moduleCount: 4,
    checkpointCount: 1,
    modules: [
      createModule_3_1(profile),
      createModule_3_2(profile),
      createModule_3_3(profile),
      createModule_3_4(profile),
      createCheckpoint3(profile),
    ],
  };
}
