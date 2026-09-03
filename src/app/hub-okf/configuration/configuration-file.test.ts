import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { globalHubConfigurationPath, migratePersistedHubConfiguration, readPersistedHubConfiguration } from "./configuration-file.ts";

test("[AB-MIGRATION-005] legacy XDG Hub configuration remains readable", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-legacy-config-"));
  try {
    const directory = path.join(home, ".config", "agentbase-mcp");
    const localHubId = "a".repeat(24), legacyHub = path.join(home, ".local", "share", "agentbase-mcp", "hubs", localHubId);
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.chmodSync(directory, 0o700);
    fs.mkdirSync(legacyHub, { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(legacyHub, "index.md"), "# Legacy Hub\n");
    fs.writeFileSync(path.join(directory, "hub.json"), `${JSON.stringify({ formatVersion: 1, kind: "local-only",
      localHubId, localRoot: legacyHub, baseCommit: "b".repeat(40), catalogVersion: "7.0.0" })}\n`, { mode: 0o600 });
    assert.equal(readPersistedHubConfiguration({ HOME: home })?.localHubId, localHubId);
    assert.deepEqual(migratePersistedHubConfiguration({ HOME: home }), { previousId: localHubId, currentId: localHubId });
    const migrated = readPersistedHubConfiguration({ HOME: home });
    assert.equal(migrated?.localRoot, path.join(home, ".agentbase", "hubs", localHubId));
    assert.equal(fs.readFileSync(path.join(migrated!.localRoot, "index.md"), "utf8"), "# Legacy Hub\n");
    assert.equal(fs.existsSync(globalHubConfigurationPath({ HOME: home })), true);
    assert.equal(fs.existsSync(path.join(legacyHub, "index.md")), true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
