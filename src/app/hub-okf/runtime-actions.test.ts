import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { globalHubConfigurationPath } from "./configuration-file.ts";
import { createHubRuntimeActions } from "./runtime-actions.ts";

test("[AB-HUB-SETUP-001..003][AB-HUB-SETUP-006] runtime defers Hub setup and reloads it after explicit local creation", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-runtime-test-"));
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
  const actions = createHubRuntimeActions(environment, path.join(root, "state"));
  try {
    assert.deepEqual(await actions.status(), { kind: "unconfigured", setupChoices: ["existing", "new"] });
    await assert.rejects(actions.prepare({ mode: "new", sourceRepository: root,
      evidenceDigest: `sha256:${"a".repeat(64)}`, subjectDirectory: "repositories/acme", signals: ["repository"] }), /two explicit setup choices|choose attach-existing/);
    assert.equal(fs.existsSync(globalHubConfigurationPath(environment)), false);
    const configured = await actions.configure({ mode: "new" }) as { kind: string; localRoot: string };
    assert.equal(configured.kind, "local-only");
    const status = await actions.status() as { kind: string; pendingCount: number; localRoot: string };
    assert.equal(status.kind, "local-only");
    assert.equal(status.pendingCount, 0);
    assert.equal(status.localRoot, configured.localRoot);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
