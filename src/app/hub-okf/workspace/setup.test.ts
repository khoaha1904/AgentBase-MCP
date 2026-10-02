import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { GitHubApiError } from "../../../providers/github-hub/index.ts";
import { readPersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { writeGlobalHubToken } from "../configuration/credential-file.ts";
import { attachExistingHub } from "./setup.ts";

const credential = "fixture-credential-sentinel";

function fixture(t: TestContext) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-attach-errors-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = { AGENTBASE_HOME: root };
  writeGlobalHubToken(credential, environment);
  return environment;
}

for (const [status, expected] of [[401, /rejected.*invalid, expired or issued by another host/],
  [403, /insufficient.*repository read access/]] as const) {
  test(`[AB-HUB-SETUP-038][AB-HUB-SETUP-015] attach identifies HTTP ${status} without exposing credentials`, async (t) => {
    const environment = fixture(t);
    await assert.rejects(attachExistingHub("https://github.com/fixtures/hub.git", "main", environment,
      async () => { throw new GitHubApiError("HTTP", `request failed with status ${status}: ${credential}`, status); }),
    (error: Error) => {
      assert.match(error.message, expected);
      assert.equal(error.message.includes(credential), false);
      return true;
    });
    assert.equal(readPersistedHubConfiguration(environment), undefined);
  });
}

test("[AB-HUB-SETUP-038][AB-HUB-SETUP-015] attach retains redacted Git details without blaming the token", async (t) => {
  const environment = fixture(t);
  await assert.rejects(attachExistingHub("https://github.com/fixtures/hub.git", "main", environment,
    async () => { throw new Error(`attach: Git exited with status 128: network unavailable ${credential}`); }),
  (error: Error) => {
    assert.match(error.message, /remote, target branch and network.*Git exited with status 128: network unavailable/);
    assert.match(error.message, /\[REDACTED\]/);
    assert.doesNotMatch(error.message, /insufficient|update.*token/i);
    assert.equal(error.message.includes(credential), false);
    return true;
  });
  assert.equal(readPersistedHubConfiguration(environment), undefined);
});
