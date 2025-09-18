// Tiny external store to decouple the search input from the rest of the app.
// - raw: immediate keystrokes
// - debounced: value used for filtering
let raw = "";
let debounced = "";
let delay = 200;
let timer = null;
const listeners = new Set();

function publish() {
  for (const l of listeners) l();
}

function setRaw(next) {
  raw = String(next ?? "");
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    debounced = raw;
    publish();
  }, delay);
}

function clear() {
  raw = "";
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    debounced = "";
    publish();
  }, delay);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const searchStore = {
  // writer api
  setRaw,
  clear,
  setDelay(ms) {
    delay = Math.max(0, Number(ms) || 0);
  },

  // reader api for useSyncExternalStore
  subscribe,
  getSnapshot() {
    return debounced;
  },
  getServerSnapshot() {
    return "";
  },

  // optional reads
  getRaw() {
    return raw;
  },
};
