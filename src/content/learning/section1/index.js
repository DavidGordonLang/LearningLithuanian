// src/content/learning/section1/index.js
// Section 1 — First Contact
// Assembles the section from individual module files.

import module_1_1 from "./module_1_1.js";
import module_1_2 from "./module_1_2.js";

const section1 = {
  id: "section_1",
  code: "1",
  title: "First Contact",
  description: "Essential greetings, polite responses, and survival phrases.",
  status: "active",
  moduleCount: 4,
  checkpointCount: 1,
  modules: [
    module_1_1,
    module_1_2,
  ],
};

export default section1;
