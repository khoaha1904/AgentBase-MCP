import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runGit } from "../../../providers/github-hub/index.ts";
import { readPersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { writeGlobalHubToken } from "../configuration/credential-file.ts";
import { executeHubBootstrap, previewHubBootstrap, type BootstrapGit } from "./bootstrap.ts";

for (const scope of ["workflow", "`workflow`", "'workflow'"]) {
  test(`[AB-HUB-SETUP-040][AB-HUB-SETUP-015] ${scope} scope refusal names the permission and keeps the bootstrap checkpoint`, async (t) => {
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-bootstrap-scope-")));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const environment = { AGENTBASE_HOME: root };
    const credential = "fixture-workflow-credential-sentinel";
    writeGlobalHubToken(credential, environment);
    let pushes = 0;
    const git: BootstrapGit = async (request) => {
      if (request.args[0] === "ls-remote") return { stdout: "", stderr: "" };
      if (request.args[0] === "push") {
        pushes++;
        throw new Error(`push: Git exited with status 1: refusing workflow write without ${scope} scope ${credential}`);
      }
      assert.notEqual(request.args[0], "fetch");
      return runGit(request);
    };
    const url = "https://github.com/fixtures/bootstrap-hub.git";
    const preview = await previewHubBootstrap(url, "main", environment, git);
    await assert.rejects(executeHubBootstrap(url, "main", environment, { git }), (error: Error) => {
      assert.match(error.message, /lacks the 'workflow' scope.*CI initialization or upgrade/);
      assert.equal(error.message.includes(credential), false);
      return true;
    });
    assert.equal(pushes, 1);
    assert.equal(readPersistedHubConfiguration(environment), undefined);
    const retry = await previewHubBootstrap(url, "main", environment, git);
    assert.equal(retry.id, preview.id);
    assert.equal(retry.baseCommit, preview.baseCommit);
    assert.equal(retry.remoteState, "empty");
  });
}
