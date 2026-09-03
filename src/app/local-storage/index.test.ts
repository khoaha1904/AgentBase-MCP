import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { agentBaseStorage, copyLegacyDirectory, ensureAgentBaseDirectory, legacyAgentBaseStorage } from "./index.ts";

test("[AB-MIGRATION-003..006] storage uses one root and isolates overrides", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-storage-"));
  try {
    const storage = agentBaseStorage({ HOME: home });
    assert.equal(storage.root, path.join(home, ".agentbase"));
    assert.equal(storage.config, path.join(storage.root, "config"));
    assert.equal(storage.hubs, path.join(storage.root, "hubs"));
    assert.equal(storage.state, path.join(storage.root, "state"));
    assert.equal(storage.cache, path.join(storage.root, "cache"));
    assert.equal(storage.tmp, path.join(storage.root, "tmp"));
    assert.equal(agentBaseStorage({ HOME: home, AGENTBASE_HOME: path.join(home, "isolated"), XDG_CONFIG_HOME: "/ignored" }).root,
      path.join(home, "isolated"));
    assert.equal(legacyAgentBaseStorage({ HOME: home })?.config, path.join(home, ".config", "agentbase-mcp"));
    assert.equal(legacyAgentBaseStorage({ HOME: home, AGENTBASE_HOME: path.join(home, "isolated") }), undefined);
    ensureAgentBaseDirectory(storage.root);
    assert.equal((fs.statSync(storage.root).mode & 0o777), 0o700);
    assert.throws(() => agentBaseStorage({ HOME: home, AGENTBASE_HOME: "relative" }), /must be absolute/);

    const oldState = path.join(home, "old-runtime"), newState = path.join(storage.state, "hub-runtime");
    ensureAgentBaseDirectory(oldState);
    fs.writeFileSync(path.join(oldState, "receipt.json"), "{}\n");
    copyLegacyDirectory(oldState, newState);
    assert.equal(fs.readFileSync(path.join(newState, "receipt.json"), "utf8"), "{}\n");
    assert.equal(fs.existsSync(path.join(oldState, "receipt.json")), true);
    const unsafeTarget = path.join(storage.state, "unsafe-target");
    fs.writeFileSync(unsafeTarget, "not a directory\n");
    assert.throws(() => copyLegacyDirectory(oldState, unsafeTarget), /target is unsafe/);

  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
