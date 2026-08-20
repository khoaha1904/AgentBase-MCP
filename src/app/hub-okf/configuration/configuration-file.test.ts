import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  globalHubConfigurationPath,
  readPersistedHubConfiguration,
  replacePersistedHubConfiguration,
  writePersistedHubConfiguration,
  type PersistedLocalHubConfiguration,
} from "./configuration-file.ts";

function fixture(): Readonly<{ root: string; environment: NodeJS.ProcessEnv; local: PersistedLocalHubConfiguration }> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-config-test-"));
  return {
    root,
    environment: { XDG_CONFIG_HOME: path.join(root, "config"), HOME: root },
    local: { formatVersion: 1, kind: "local-only", localHubId: "a".repeat(24), localRoot: path.join(root, "hub"),
      baseCommit: "b".repeat(40), catalogVersion: "2.0.0" },
  };
}

test("[AB-HUB-SETUP-001][AB-HUB-SETUP-002][AB-HUB-SETUP-016] Hub configuration absence and atomic mode transition are private", () => {
  const current = fixture();
  try {
    assert.equal(readPersistedHubConfiguration(current.environment), undefined);
    writePersistedHubConfiguration(current.local, current.environment);
    const file = globalHubConfigurationPath(current.environment);
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
    assert.equal(fs.statSync(path.dirname(file)).mode & 0o777, 0o700);
    assert.deepEqual(readPersistedHubConfiguration(current.environment), current.local);
    const remote = { ...current.local, kind: "remote" as const, repository: "acme/AgentBase-Hub", targetBranch: "main" as const };
    replacePersistedHubConfiguration(current.local, remote, current.environment);
    assert.deepEqual(readPersistedHubConfiguration(current.environment), remote);
    assert.throws(() => writePersistedHubConfiguration(current.local, current.environment), /already configured/);
  } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
});

test("[AB-HUB-SETUP-005][AB-HUB-SETUP-016] malformed, permissive and symlink configuration fails closed", () => {
  for (const variant of ["malformed", "permissive", "symlink"] as const) {
    const current = fixture();
    try {
      writePersistedHubConfiguration(current.local, current.environment);
      const file = globalHubConfigurationPath(current.environment);
      if (variant === "malformed") fs.writeFileSync(file, "{broken\n", { mode: 0o600 });
      if (variant === "permissive") fs.chmodSync(file, 0o644);
      if (variant === "symlink") {
        fs.rmSync(file);
        fs.symlinkSync(path.join(current.root, "missing"), file);
      }
      assert.throws(() => readPersistedHubConfiguration(current.environment), /unsafe|invalid/);
    } finally { fs.rmSync(current.root, { recursive: true, force: true }); }
  }
});
