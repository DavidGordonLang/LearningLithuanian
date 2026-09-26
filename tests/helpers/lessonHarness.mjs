import { componentHarness } from "./componentHarness.mjs";
import * as feedback from "../../src/lib/buildPhraseFeedback.js";
import * as scoring from "../../src/lib/trainingScoring.js";
import * as speech from "../../src/lib/speechMatch.js";

const leaf = () => null;
export const lessonHarness = (name, overrides = {}) => componentHarness("src/views/training/LearningLessonView.jsx", name, {
  "../../hooks/useSpeechToTextHold": leaf,
  "../../stores/gameStore": {},
  "./matchPairs/matchPairsStyles": {},
  "../../components/audio/InteractivePhraseText": leaf,
  "./TrainingBackButton": leaf,
  "./ScenarioV2Block": leaf,
  "../../components/audio/AudioPlayButton": leaf,
  "../../lib/trainingScoring": scoring,
  "../../lib/buildPhraseFeedback": feedback,
  "../../lib/speechMatch": speech,
  ...overrides,
});
