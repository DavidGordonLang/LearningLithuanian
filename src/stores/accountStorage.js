// Keep legacy keys untouched until the user explicitly recovers their data.
export function createAccountStorage(legacyKey) {
  let userId = null;
  let generation = 0;
  let ready = false;
  const keyFor = (id) => `${legacyKey}:account:${id}`;

  return {
    keyFor,
    select(id) {
      userId = id || null;
      generation += 1;
      ready = false;
      if (!userId) return [];
      const raw = localStorage.getItem(keyFor(userId));
      const rows = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(rows)) throw new Error("The saved library could not be read. Your stored copy has been preserved.");
      ready = true;
      return rows;
    },
    capture() {
      const owner = userId;
      const version = generation;
      return () => {
        if (!owner || owner !== userId || version !== generation || !ready) {
          throw new Error("Your account changed or its data is unavailable. Please retry from the current account.");
        }
      };
    },
    save(rows) {
      this.capture()();
      // A failed write must not be presented as a successful save in memory.
      localStorage.setItem(keyFor(userId), JSON.stringify(rows));
    },
  };
}

export function bindAccountActions(actions, storage) {
  const check = storage.capture();
  return Object.fromEntries(Object.entries(actions).map(([name, action]) => [
    name,
    (...args) => { check(); return action(...args); },
  ]));
}
