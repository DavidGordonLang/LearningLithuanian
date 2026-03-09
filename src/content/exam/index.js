import { readingTrueFalse } from "./ii_kategorija/reading_true_false";
import { listeningTrueFalse } from "./ii_kategorija/listening_true_false";
import { writingGuidedLetter } from "./ii_kategorija/writing_guided_letter";

export const examContent = {
  ii_kategorija: {
    reading: {
      true_false: readingTrueFalse,
    },
    listening: {
      true_false: listeningTrueFalse,
    },
    writing: {
      guided_letter: writingGuidedLetter,
    },
  },
};