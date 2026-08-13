import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { loadHubConfiguration } from "./configuration.ts";

test("[AB-LOCAL-HUB-001] Hub configuration derives its only admitted remote and local clone", () => {
  const configuration = loadHubConfiguration({
    AGENTBASE_HUB_REPOSITORY: "agentbase/hub",
    AGENTBASE_HUB_TARGET_BRANCH: "main",
    AGENTBASE_HUB_LOCAL_ROOT: "/private/AgentBase-Hub",
    AGENTBASE_HUB_GITHUB_TOKEN: "secret",
  });
  assert.equal(configuration.hub.canonicalHttpsUrl, "https://github.com/agentbase/hub.git");
  assert.equal(configuration.token, "secret");
  assert.equal(configuration.localRoot, "/private/AgentBase-Hub");
});

test("Hub configuration is complete and operator-owned", () => {
  assert.throws(() => loadHubConfiguration({}), /must be configured/);
  assert.throws(() => loadHubConfiguration({
    AGENTBASE_HUB_REPOSITORY: "elsewhere",
    AGENTBASE_HUB_TARGET_BRANCH: "main",
    AGENTBASE_HUB_LOCAL_ROOT: "/private/AgentBase-Hub",
  }), /repository/);
});

test("[AB-INSTALL-006] Hub configuration admits the global credential fallback", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-configuration-credential-"));
  try {
    const directory = path.join(root, "agentbase-mcp");
    fs.mkdirSync(directory, { mode: 0o700 });
    fs.writeFileSync(path.join(directory, "env"), "AGENTBASE_HUB_GITHUB_TOKEN=global-secret\n", { mode: 0o600 });
    const configuration = loadHubConfiguration({
      XDG_CONFIG_HOME: root,
      AGENTBASE_HUB_REPOSITORY: "agentbase/hub",
      AGENTBASE_HUB_TARGET_BRANCH: "main",
      AGENTBASE_HUB_LOCAL_ROOT: "/private/AgentBase-Hub",
    });
    assert.equal(configuration.token, "global-secret");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
