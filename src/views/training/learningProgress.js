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


export function getSectionCompletion(section, completedLessonIds) {
  const modules = Array.isArray(section?.modules) ? section.modules : [];
  const units = [];

  for (const module of modules) {
    if (module?.isSectionCheckpoint) {
      if (module.id) units.push(module.id);
      continue;
    }
    for (const lesson of (module?.lessons || [])) {
      if (lesson?.id) units.push(lesson.id);
    }
  }

  const completed = completedSet(completedLessonIds);
  const completedCount = units.filter((id) => completed.has(id)).length;
  const total = units.length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;

  return {
    completedCount,
    total,
    pct,
    complete: total > 0 && completedCount === total,
  };
}

export function getCourseBrowseState(sections, completedLessonIds) {
  const list = Array.isArray(sections) ? sections : [];
  const progress = list.map((section) => getSectionCompletion(section, completedLessonIds));
  const firstIncompleteIndex = progress.findIndex((item) => !item.complete);

  return list.map((section, index) => ({
    section,
    progress: progress[index],
    status: progress[index].complete
      ? "completed"
      : index === firstIncompleteIndex
      ? "current"
      : "locked",
  }));
}


export function findLatestInProgressLesson(sections, completedLessonIds, lessonProgress) {
  const list = Array.isArray(sections) ? sections : [];
  const completed = completedSet(completedLessonIds);
  const progressMap = lessonProgress && typeof lessonProgress === "object" ? lessonProgress : {};

  const candidates = Object.entries(progressMap)
    .filter(([lessonId, saved]) => (
      !!lessonId &&
      !completed.has(lessonId) &&
      saved &&
      typeof saved === "object" &&
      Number.isFinite(Number(saved.updatedAt))
    ))
    .sort((a, b) => Number(b[1].updatedAt) - Number(a[1].updatedAt));

  for (const [lessonId] of candidates) {
    for (const section of list) {
      for (const module of (section?.modules || [])) {
        if (module?.isSectionCheckpoint && module?.id === lessonId) {
          return { section, module, lesson: module, lessonIndex: 0 };
        }
        const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
        const lessonIndex = lessons.findIndex((lesson) => lesson?.id === lessonId);
        if (lessonIndex >= 0) {
          return { section, module, lesson: lessons[lessonIndex], lessonIndex };
        }
      }
    }
  }
  return null;
}
