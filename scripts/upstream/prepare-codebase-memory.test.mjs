import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { activatePreparedDirectory } from "./prepare-codebase-memory.mjs";
import { packagePreparedRuntime } from "./package-codebase-memory.mjs";

function directories(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-provider-activation-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const current = path.join(root, "linux-x64");
  const next = path.join(root, ".linux-x64-next");
  fs.mkdirSync(current);
  fs.mkdirSync(next);
  fs.writeFileSync(path.join(current, "identity"), "previous");
  fs.writeFileSync(path.join(next, "identity"), "next");
  return { current, next };
}

test("activates a completely prepared provider directory", (t) => {
  const value = directories(t);
  activatePreparedDirectory(value.next, value.current);
  assert.equal(fs.readFileSync(path.join(value.current, "identity"), "utf8"), "next");
  assert.equal(fs.existsSync(value.next), false);
});

test("restores the previous provider when activation is interrupted", (t) => {
  const value = directories(t);
  let calls = 0;
  const interruptedRename = (from, to) => {
    calls++;
    if (calls === 2) throw new Error("interrupted activation");
    fs.renameSync(from, to);
  };
  assert.throws(() => activatePreparedDirectory(value.next, value.current, interruptedRename), /interrupted/);
  assert.equal(fs.readFileSync(path.join(value.current, "identity"), "utf8"), "previous");
});

test("[AB-INSTALL-039..041] packages only the verified current target and preserves sibling platforms", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-provider-package-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const preparedRoot = path.join(root, "prepared");
  const sibling = path.join(root, "vendor/codebase-memory/artifacts/darwin-arm64");
  fs.mkdirSync(preparedRoot, { recursive: true });
  fs.mkdirSync(sibling, { recursive: true });
  fs.writeFileSync(path.join(preparedRoot, "codebase-memory-mcp"), "linux-release", { mode: 0o755 });
  fs.writeFileSync(path.join(preparedRoot, "artifact-manifest.json"), "manifest");
  fs.writeFileSync(path.join(sibling, "identity"), "mac-release");
  const verifyBundle = async ({ runtimeRoot }) => ({ runtimeRoot,
    executable: path.join(runtimeRoot, "codebase-memory-mcp"),
    identity: { executableSha256: fs.readFileSync(path.join(runtimeRoot, "codebase-memory-mcp"), "utf8"),
      packageIntegrity: "owned-source" } });
  const result = await packagePreparedRuntime({ projectRoot: root, preparedRoot,
    platform: "linux", architecture: "x64", verifyBundle });
  assert.equal(fs.readFileSync(path.join(result.bundleRoot, "codebase-memory-mcp"), "utf8"), "linux-release");
  assert.equal(fs.readFileSync(path.join(sibling, "identity"), "utf8"), "mac-release");
});
