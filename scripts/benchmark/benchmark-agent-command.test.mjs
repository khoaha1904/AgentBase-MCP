import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { isolateCodexEnvironment } from "./benchmark-agent-command.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

test("[AB-BENCH-096] real runners receive a disposable auth-only Codex home", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-codex-isolation-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sourceHome = path.join(root, "source-codex");
  const runtimeRoot = path.join(root, "runtime");
  fs.mkdirSync(path.join(sourceHome, "skills", "operator-skill"), { recursive: true });
  fs.mkdirSync(runtimeRoot);
  fs.writeFileSync(path.join(sourceHome, "auth.json"), "bounded-auth\n", { mode: 0o600 });
  fs.writeFileSync(path.join(sourceHome, "config.toml"), "operator = true\n");

  const environment = isolateCodexEnvironment(runtimeRoot,
    { MARKER: "preserved", HOME: path.join(runtimeRoot, "home") }, { CODEX_HOME: sourceHome });
  assert.equal(environment.MARKER, "preserved");
  assert.equal(environment.HOME, path.join(runtimeRoot, "home"));
  assert.equal(environment.CODEX_HOME, path.join(runtimeRoot, "codex"));
  assert.equal(fs.readFileSync(path.join(environment.CODEX_HOME, "auth.json"), "utf8"), "bounded-auth\n");
  assert.equal(fs.statSync(path.join(environment.CODEX_HOME, "auth.json")).mode & 0o777, 0o600);
  assert.deepEqual(fs.readdirSync(path.join(environment.CODEX_HOME, "skills")), []);
  assert.equal(fs.existsSync(path.join(environment.CODEX_HOME, "config.toml")), false);
});

test("[AB-BENCH-096] isolated runners reject missing or unbounded authentication", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-codex-auth-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const missingHome = path.join(root, "missing");
  fs.mkdirSync(missingHome);
  assert.throws(() => isolateCodexEnvironment(path.join(root, "runtime-missing"), {}, { CODEX_HOME: missingHome }),
    /authentication is unavailable/);

  const oversizedHome = path.join(root, "oversized");
  fs.mkdirSync(oversizedHome);
  fs.writeFileSync(path.join(oversizedHome, "auth.json"), Buffer.alloc(1024 * 1024 + 1));
  assert.throws(() => isolateCodexEnvironment(path.join(root, "runtime-oversized"), {}, { CODEX_HOME: oversizedHome }),
    /not a bounded regular file/);
});

test("[AB-BENCH-096] every real model runner applies Codex isolation", () => {
  const expectedCalls = new Map([
    ["benchmark-agent.mjs", 2],
    ["benchmark-context.mjs", 1],
    ["benchmark-task.mjs", 1],
    ["benchmark-e2e.mjs", 1],
  ]);
  for (const [name, expected] of expectedCalls) {
    const source = fs.readFileSync(path.join(repositoryRoot, "scripts", "benchmark", name), "utf8");
    assert.equal(source.match(/isolateCodexEnvironment\(runtimeRoot/g)?.length ?? 0, expected, name);
  }
});
