import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkRetiredCodeGraph } from "./check-retired-code-graph.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-retired-graph-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "package.json"), "{}\n");
  return root;
}

test("[AB-DISC-008] retirement gate rejects ignored native artifacts and an optional provider", (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "build/providers/codebase-memory"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    optionalDependencies: { "codebase-memory-mcp": "0.10.8" },
    scripts: { "build:graph": "node scripts/upstream/prepare-codebase-memory.mjs" },
  }));
  assert.deepEqual(checkRetiredCodeGraph(root), [
    "retired code graph path exists: build/providers/codebase-memory",
    "retired code graph or benchmark package script: build:graph",
    "retired code graph dependency: codebase-memory-mcp",
  ]);
});

test("[AB-DISC-008] retirement gate rejects static and dynamic graph imports", (t) => {
  const root = fixture(t), app = path.join(root, "src/app/agentbase-mcp");
  fs.mkdirSync(app, { recursive: true });
  for (const [index, source] of [
    'import { provider } from "../../providers/codebase-memory/index.ts";',
    'import "codebase-memory-mcp";',
    'await import("../../providers/codebase-memory/index.ts");',
    'require("codebase-memory-mcp");',
    'export { contract } from "../../core/code-intelligence/index.ts";',
  ].entries()) {
    fs.writeFileSync(path.join(app, "server.ts"), source);
    assert.deepEqual(checkRetiredCodeGraph(root), ["retired code graph import: src/app/agentbase-mcp/server.ts"], `case ${index}`);
  }
});

test("[AB-DISC-008] retirement gate allows source imports and historical receipt or upgrade metadata", (t) => {
  const root = fixture(t), app = path.join(root, "src/app/hub-okf");
  fs.mkdirSync(app, { recursive: true });
  fs.writeFileSync(path.join(app, "runtime-actions.ts"), [
    'import { discoverRepositorySourceState } from "../repository-source/index.ts";',
    'const legacyEngine = "codebase-memory-mcp";',
    'const retiredSkill = "use-codebase-memory";',
  ].join("\n"));
  assert.deepEqual(checkRetiredCodeGraph(root), []);
});
