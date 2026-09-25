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
  const slots = [];
  let cursor = 0;
  let effects = [];
  const timers = new Map();
  let timerId = 0;
  const later = (fn) => { timers.set(++timerId, fn); return timerId; };
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
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
    return dependencies[id];
  };
  const module = { exports: {} };
  new Function("require", "module", "exports", "setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "document", compiled.get(key))(
    require, module, module.exports, later, id => timers.delete(id), later, id => timers.delete(id), { body: {} },
  );
  return {
    render(props) {
      cursor = 0;
      effects = [];
      const tree = module.exports[name](props);
      effects.forEach(fn => fn());
      return tree;
    },
    flushTimers() {
      const pending = [...timers.entries()];
      for (const [id, fn] of pending) if (timers.delete(id)) fn();
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
