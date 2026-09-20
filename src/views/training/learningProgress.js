// src/views/training/learningProgress.js
// Pure progression helpers shared by learner-facing course browser views.

function completedSet(completedLessonIds) {
  return new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);
}

export function getTeachingLessons(module) {
  return Array.isArray(module?.lessons)
    ? module.lessons.filter((lesson) => !lesson?.isCheckpoint)
    : [];
}

export function getModuleCheckpoint(module) {
  return Array.isArray(module?.lessons)
    ? module.lessons.find((lesson) => lesson?.isCheckpoint) || null
    : null;
}

export function getModuleProgress(module, completedLessonIds) {
  const completed = completedSet(completedLessonIds);

  if (module?.isSectionCheckpoint) {
    const done = !!module?.id && completed.has(module.id);
    return {
      teachingCompleted: 0,
      teachingTotal: 0,
      checkpointCompleted: done,
      teachingDone: true,
      complete: done,
    };
  }

  const teachingLessons = getTeachingLessons(module);
  const checkpoint = getModuleCheckpoint(module);
  const teachingCompleted = teachingLessons.filter((lesson) => completed.has(lesson.id)).length;
  const teachingTotal = teachingLessons.length;
  const teachingDone = teachingTotal === 0 || teachingCompleted === teachingTotal;
  const checkpointCompleted = checkpoint ? completed.has(checkpoint.id) : true;

  return {
    teachingCompleted,
    teachingTotal,
    checkpointCompleted,
    teachingDone,
    complete: teachingDone && checkpointCompleted,
  };
}

export function getSectionBrowseState(section, completedLessonIds) {
  const modules = Array.isArray(section?.modules) ? section.modules : [];
  const teachingModules = modules.filter((module) => !module?.isSectionCheckpoint);
  const sectionCheckpoint = modules.find((module) => module?.isSectionCheckpoint) || null;
  const progress = teachingModules.map((module) => getModuleProgress(module, completedLessonIds));
  const firstIncompleteIndex = progress.findIndex((item) => !item.complete);

  const moduleStates = teachingModules.map((module, index) => {
    const item = progress[index];
    return {
      module,
      progress: item,
      status: item.complete
        ? "completed"
        : index === firstIncompleteIndex
        ? "current"
        : "locked",
    };
  });

  const completed = completedSet(completedLessonIds);
  const allTeachingModulesComplete = progress.every((item) => item.complete);
  const sectionCheckpointStatus = !sectionCheckpoint
    ? "missing"
    : completed.has(sectionCheckpoint.id)
    ? "completed"
    : allTeachingModulesComplete
    ? "unlocked"
    : "locked";

  return {
    moduleStates,
    sectionCheckpoint,
    sectionCheckpointStatus,
    allTeachingModulesComplete,
  };
}
