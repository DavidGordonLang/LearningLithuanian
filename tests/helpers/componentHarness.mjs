// Exercise the actual JSX component's state, event handlers and returned tree.
// This is deliberately not a DOM/layout, browser audio or React lifecycle test.
// Imports and timers are explicit local doubles: no network, stores or APIs run.
import { readFile } from "node:fs/promises";
import { transformWithEsbuild } from "vite";

const compiled = new Map();
export async function componentHarness(path, name, imports = {}) {
  const key = `${path}:${name}`;
  if (!compiled.has(key)) {
    const source = await readFile(new URL(`../../${path}`, import.meta.url), "utf8");
    const exposed = name === "default" ? source : `${source}\nexport { ${name} };`;
    const { code } = await transformWithEsbuild(exposed, path, { loader: "jsx", format: "cjs", jsx: "transform" });
    compiled.set(key, code);
  }
  for (const entry of Object.values(imports)) {
    if (!entry?.source) continue;
    const dependencyKey = `${entry.source}:default`;
    if (!compiled.has(dependencyKey)) {
      const source = await readFile(new URL(`../../${entry.source}`, import.meta.url), "utf8");
      const { code } = await transformWithEsbuild(source, entry.source, { loader: "jsx", format: "cjs", jsx: "transform" });
      compiled.set(dependencyKey, code);
    }
  }
  const slots = [];
  let cursor = 0;
  let effects = [];
  const timers = new Map();
  let timerId = 0;
  let now = 0;
  const later = (fn, delay = 0) => { timers.set(++timerId, { fn, at: now + delay }); return timerId; };
  const clear = id => timers.delete(id);
  class ClockDate extends Date { static now() { return now; } }
  const advanceTime = ms => {
    const end = now + ms;
    for (;;) {
      const next = [...timers.entries()].filter(([,t]) => t.at <= end).sort((a,b) => a[1].at-b[1].at)[0];
      if (!next) break;
      const [id,timer] = next;
      timers.delete(id); now = timer.at; timer.fn();
    }
    now = end;
  };
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
    memo: component => component,
    Fragment: Symbol.for("react.fragment"),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ||= { current: initial };
    },
    useMemo(fn, deps) {
      const index = cursor++;
      if (!sameDeps(slots[index]?.deps, deps)) slots[index] = { deps, value: fn() };
      return slots[index].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) {
      const index = cursor++;
      if (!sameDeps(slots[index]?.deps, deps)) {
        effects.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
      }
    },
  };
  const dependencies = { react, "react-dom": { createPortal: node => node }, ...imports };
  const require = id => {
    if (!(id in dependencies)) throw new Error(`Undeclared test dependency: ${id}`);
    if (dependencies[id]?.source) dependencies[id] = evaluate(compiled.get(`${dependencies[id].source}:default`));
    return dependencies[id];
  };
  function evaluate(code) {
    const module = { exports: {} };
    new Function("require", "module", "exports", "setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "document", "window", "Date", code)(
      require, module, module.exports, later, clear, later, clear, { body: {} }, { setTimeout: later, clearTimeout: clear, addEventListener(){}, removeEventListener(){} }, ClockDate,
    );
    return module.exports;
  }
  const exports = evaluate(compiled.get(key));
  return {
    advanceTime,
    unmount() { slots.forEach(slot => slot?.cleanup?.()); timers.clear(); },
    render(props) {
      cursor = 0;
      effects = [];
      const tree = exports[name](props);
      effects.forEach(fn => fn());
      return tree;
    },
    flushTimers() {
      const pending = [...timers.entries()];
      for (const [id, timer] of pending) if (timers.delete(id)) { now = Math.max(now, timer.at); timer.fn(); }
    },
  };
}

export function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
  if (!tree || typeof tree !== "object") return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
export function textOf(tree) {
  if (Array.isArray(tree)) return tree.map(textOf).join("");
  if (tree == null || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  return textOf(tree.props?.children);
}
export const button = (tree, label) => nodes(tree, n => typeof n.props?.onClick === "function" && textOf(n) === label)[0];
