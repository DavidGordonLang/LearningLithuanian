import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const pwa = fs.readFileSync(new URL("../src/pwa.js", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

test("PWA checks for a newly deployed Vite bundle when the app resumes", () => {
  assert.match(pwa, /__zodis_build_check/);
  assert.match(pwa, /cache:\s*"no-store"/);
  assert.match(pwa, /visibilitychange/);
  assert.match(pwa, /window\.addEventListener\("focus"/);
  assert.match(pwa, /window\.location\.reload\(\)/);
  assert.match(pwa, /\/assets\\\/index-/);
});

test("service worker update and cache policy avoid stale non-hashed content", () => {
  assert.match(pwa, /updateViaCache:\s*"none"/);
  assert.match(sw, /zodis-3beta-20260925-freshness1/);
  assert.match(sw, /url\.pathname\.startsWith\("\/assets\/"\)/);
  assert.match(sw, /fetch\(request, \{ cache: "no-store" \}\)/);
});
