// src/content/learning/section2/index.js
// Section 2 — Core Conversation Patterns

import createModule_2_1 from "./module_2_1.js";
import createModule_2_2 from "./module_2_2.js";
import createModule_2_3 from "./module_2_3.js";
import createModule_2_4 from "./module_2_4.js";
import createCheckpoint2 from "./checkpoint_2.js";

export default function createSection2(profile = {}) {
  return {
    id: "section_2",
    code: "2",
    title: "Core Conversation Patterns",
    description: "Essential sentence frames for wants, needs, ability, and basic questions.",
    status: "active",
    moduleCount: 4,
    checkpointCount: 1,
    modules: [
      createModule_2_1(profile),
      createModule_2_2(profile),
      createModule_2_3(profile),
      createModule_2_4(profile),
      createCheckpoint2(profile),
    ],
  };
}
