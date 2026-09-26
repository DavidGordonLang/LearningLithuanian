// Defer build replacement until the learner leaves the lesson. A lesson includes
// its loading, recording, scenario and completion screens, not just pointer input.
export function createLearningUpdateGuard({ schedule = fn => setTimeout(fn, 0), cancel = clearTimeout } = {}) {
  let active = 0, unsafe = false, pending = null, timer = null;
  const apply = () => { timer = null; if (!active && !unsafe && pending) { const action=pending;pending=null;action(); } };
  const check = () => { if(timer!==null)cancel(timer);timer=schedule(apply); };
  return {
    hold() { active++; if(timer!==null){cancel(timer);timer=null;} let released=false;
      return () => { if(!released){released=true;active--;check();} }; },
    request(action) { pending=action;if(!active && !unsafe)apply(); },
    setUnsafe(value) { unsafe=value;if(!unsafe)check(); },
  };
}
export const learningUpdateGuard = createLearningUpdateGuard();
