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
    let calls = 0;
    await assert.rejects(attachExistingHub("https://github.com/fixtures/hub.git", "main", environment,
      async () => { calls++; throw new GitHubApiError("HTTP", `request failed with status ${status}: ${credential}`, status); }),
    (error: Error) => {
      assert.match(error.message, expected);
      assert.equal(error.message.includes(credential), false);
      return true;
    });
    assert.equal(calls, 1);
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

for (const [scenario, heads, expected] of [
  ["empty remote", "", /no branches.*bootstrap/],
  ["missing target", `${"a".repeat(40)}\trefs/heads/other\n`, /no target branch 'main'/],
  ["existing target", `${"a".repeat(40)}\trefs/heads/main\n`, /Git exited with status 128/],
  ["failed probe", undefined, /Git exited with status 128/],
] as const) {
  test(`[AB-HUB-SETUP-038][AB-HUB-SETUP-015] attach diagnoses ${scenario} without changing configuration`, async (t) => {
    const environment = fixture(t);
    const calls: string[][] = [];
    await assert.rejects(attachExistingHub("https://github.com/fixtures/hub.git", "main", environment,
      async (request) => {
        calls.push([...request.args]);
        if (request.args[0] === "clone") throw new Error(`attach: Git exited with status 128: ${credential}`);
        assert.deepEqual(request.args, ["ls-remote", "--heads", "https://github.com/fixtures/hub.git"]);
        assert.equal(request.token, credential);
        if (heads === undefined) throw new Error(`probe failed: ${credential}`);
        return { stdout: heads, stderr: "" };
      }),
    (error: Error) => {
      assert.match(error.message, expected);
      assert.equal(error.message.includes(credential), false);
      assert.doesNotMatch(error.message, /probe failed/);
      return true;
    });
    assert.equal(calls.length, 2);
    assert.equal(readPersistedHubConfiguration(environment), undefined);
  });
}
