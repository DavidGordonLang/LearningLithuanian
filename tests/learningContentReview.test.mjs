import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("reviewed learning content no longer authors legacy repair-result options", () => {
  const files = fs.readdirSync("src/content/learning", { recursive: true })
    .filter((name) => /section[1-5].*\.js$/.test(String(name)));
  for (const name of files) {
    const src = fs.readFileSync(`src/content/learning/${name}`, "utf8");
    assert.equal(/result:\s*["']repair["']/.test(src), false, name);
  }
});
