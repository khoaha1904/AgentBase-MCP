import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { discoverTests } from "./run-tests.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-tests-"));
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-FND-014] recursively discovers colocated script and capability tests", () => {
  const current = fixture();
  try {
    fs.mkdirSync(path.join(current.root, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(current.root, "src", "core", "example", "nested"), { recursive: true });
    fs.writeFileSync(path.join(current.root, "scripts", "check.test.mjs"), "");
    fs.writeFileSync(path.join(current.root, "src", "core", "example", "behavior.test.ts"), "");
    fs.writeFileSync(path.join(current.root, "src", "core", "example", "nested", "deep.test.ts"), "");
    fs.writeFileSync(path.join(current.root, "src", "core", "example", "behavior.ts"), "");

    assert.deepEqual(discoverTests(current.root), [
      "scripts/check.test.mjs",
      "src/core/example/behavior.test.ts",
      "src/core/example/nested/deep.test.ts",
    ]);
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-014] skips symlinks and generated or dependency directories", () => {
  const current = fixture();
  try {
    for (const directory of ["scripts", "src", "dist", "node_modules"]) {
      fs.mkdirSync(path.join(current.root, directory), { recursive: true });
    }
    fs.writeFileSync(path.join(current.root, "src", "owned.test.ts"), "");
    fs.writeFileSync(path.join(current.root, "dist", "generated.test.mjs"), "");
    fs.writeFileSync(path.join(current.root, "node_modules", "dependency.test.mjs"), "");
    fs.symlinkSync(path.join(current.root, "src", "owned.test.ts"), path.join(current.root, "scripts", "linked.test.mjs"));

    assert.deepEqual(discoverTests(current.root), ["src/owned.test.ts"]);
  } finally {
    current.cleanup();
  }
});

test("[AB-FND-015] discovers every focused foundation capability suite in the real tree", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const tests = discoverTests(root);
  for (const expected of [
    "src/core/code-intelligence/contract.test.ts",
    "src/providers/fake-code-intelligence/fake-provider.test.ts",
    "src/app/foundation-demo/run-demo.test.ts",
  ]) {
    assert.ok(tests.includes(expected), `missing focused test: ${expected}`);
  }
});
