import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { prepareProviderWorkspace } from "./provider-workspace.ts";

test("[AB-REFRESH-001][AB-REFRESH-002] workspace separates provider cache from opaque AgentBase receipt metadata", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-provider-workspace-"));
  const repository = path.join(temporary, "repository");
  const state = path.join(temporary, "state");
  fs.mkdirSync(repository);
  try {
    const workspace = prepareProviderWorkspace(repository, "repository-fixture-123456789abc", state, "feature-a");
    assert.equal(workspace.allowedRoot, fs.realpathSync(repository));
    assert.equal(workspace.receiptPath.startsWith(workspace.cacheRoot), false);
    assert.equal(workspace.receiptPath.startsWith(repository), false);
    assert.match(workspace.namespaceId, /^[a-f0-9]{64}$/);
    assert.equal(workspace.namespaceId.includes(repository), false);
    assert.equal(fs.statSync(path.dirname(workspace.receiptPath)).mode & 0o777, 0o700);
    assert.equal(fs.statSync(workspace.cacheRoot).mode & 0o777, 0o700);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
