import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { activateBundledCodebaseMemory } from "./provider-bundle.mjs";

function digest(value) { return createHash("sha256").update(value).digest("hex"); }

function fixture(t) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-bundled-provider-"));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  const bundleRoot = path.join(projectRoot, "vendor/codebase-memory/artifacts/linux-x64");
  fs.mkdirSync(bundleRoot, { recursive: true });
  fs.writeFileSync(path.join(bundleRoot, "codebase-memory-mcp"), "release-binary", { mode: 0o755 });
  fs.writeFileSync(path.join(bundleRoot, "artifact-manifest.json"), "release-manifest");
  const verifyBundle = async ({ runtimeRoot }) => {
    const executable = path.join(runtimeRoot, "codebase-memory-mcp");
    const manifest = path.join(runtimeRoot, "artifact-manifest.json");
    if (!fs.existsSync(executable) || fs.readFileSync(manifest, "utf8") !== "release-manifest") {
      throw new Error("invalid test bundle");
    }
    return { runtimeRoot, executable, identity: { executableSha256: digest(fs.readFileSync(executable)),
      packageIntegrity: "test-owned-source" } };
  };
  return { projectRoot, bundleRoot, verifyBundle,
    activeRoot: path.join(projectRoot, "build/providers/codebase-memory/linux-x64") };
}

test("[AB-INSTALL-032..036] activates the matching verified local provider bundle and exact rerun is a no-op", async (t) => {
  const value = fixture(t);
  const first = await activateBundledCodebaseMemory({ ...value, platform: "linux", architecture: "x64" });
  assert.equal(first.status, "activated");
  assert.equal(fs.readFileSync(path.join(value.activeRoot, "codebase-memory-mcp"), "utf8"), "release-binary");
  let switched = false;
  const second = await activateBundledCodebaseMemory({ ...value, platform: "linux", architecture: "x64",
    activate() { switched = true; } });
  assert.equal(second.status, "already-active");
  assert.equal(switched, false);
});

test("[AB-INSTALL-032..036] missing or corrupt bundles preserve the previous active provider", async (t) => {
  const value = fixture(t);
  fs.mkdirSync(value.activeRoot, { recursive: true });
  fs.writeFileSync(path.join(value.activeRoot, "identity"), "previous");
  fs.rmSync(path.join(value.bundleRoot, "codebase-memory-mcp"));
  await assert.rejects(activateBundledCodebaseMemory({ ...value, platform: "linux", architecture: "x64" }),
    /invalid test bundle/);
  assert.equal(fs.readFileSync(path.join(value.activeRoot, "identity"), "utf8"), "previous");
  await assert.rejects(activateBundledCodebaseMemory({ ...value, platform: "win32", architecture: "x64" }),
    /unsupported platform/);
});

test("[AB-INSTALL-032..036] interrupted activation restores the previous provider", async (t) => {
  const value = fixture(t);
  fs.mkdirSync(value.activeRoot, { recursive: true });
  fs.writeFileSync(path.join(value.activeRoot, "codebase-memory-mcp"), "previous", { mode: 0o755 });
  fs.writeFileSync(path.join(value.activeRoot, "artifact-manifest.json"), "old-manifest");
  let calls = 0;
  await assert.rejects(activateBundledCodebaseMemory({ ...value, platform: "linux", architecture: "x64",
    activate(from, to) {
      const backup = path.join(path.dirname(to), ".interrupted-backup");
      fs.renameSync(to, backup);
      calls++;
      fs.renameSync(backup, to);
      throw new Error("interrupted activation");
    } }), /interrupted activation/);
  assert.equal(calls, 1);
  assert.equal(fs.readFileSync(path.join(value.activeRoot, "codebase-memory-mcp"), "utf8"), "previous");
});
