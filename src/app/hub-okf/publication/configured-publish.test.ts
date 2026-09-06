import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, hubProfileId } from "../../../core/hub/index.ts";
import { executeCli } from "../../../cli.ts";
import { activatePersistedHubConfiguration, readPersistedHubConfiguration, readPersistedHubProfile,
  type PersistedRemoteHubConfiguration } from "../configuration/configuration-file.ts";
import { writeGlobalHubToken, loadGlobalHubToken } from "../configuration/credential-file.ts";
import { hubPublicationPolicy, publishConfiguredHubProposal } from "./configured-publish.ts";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-publication-policy-test-"));
  const environment = { AGENTBASE_HOME: root };
  const configuration = (repository: string): PersistedRemoteHubConfiguration => ({
    formatVersion: 1, kind: "remote", localHubId: hubProfileId(createHubIdentity(repository, "main")),
    localRoot: path.join(root, repository), baseCommit: "a".repeat(40), catalogVersion: "7.0.0",
    host: "github.com", repository, targetBranch: "main",
  });
  return { root, environment, first: configuration("fixture/first"), second: configuration("fixture/second"),
    close: () => fs.rmSync(root, { recursive: true, force: true }) };
}

test("[AB-DIRECT-007] policy defaults visibly, remains per Hub and never touches credentials or Published", async () => {
  const f = fixture();
  try {
    activatePersistedHubConfiguration(f.first, f.environment);
    writeGlobalHubToken("fixture-value", f.environment);
    assert.equal(hubPublicationPolicy(f.environment).publication_policy, "direct");
    assert.equal(readPersistedHubConfiguration(f.environment)?.kind, "remote");
    const output: string[] = [];
    assert.equal(await executeCli(["hub", "policy", "--mode", "pr"], undefined,
      { environment: f.environment, writeOutput: (s) => output.push(s) }), 0);
    assert.equal(hubPublicationPolicy(f.environment).publication_policy, "pr");
    activatePersistedHubConfiguration(f.second, f.environment);
    assert.equal(hubPublicationPolicy(f.environment).publication_policy, "direct");
    const saved = readPersistedHubProfile(f.first.localHubId, f.environment)!;
    assert.equal(saved.kind === "remote" && saved.publicationPolicy, "pr");
    activatePersistedHubConfiguration(saved, f.environment);
    assert.equal(hubPublicationPolicy(f.environment).publication_policy, "pr");
    assert.equal(loadGlobalHubToken(f.environment), "fixture-value");
    assert.equal(fs.existsSync(f.first.localRoot), false);
    assert.match(output.join(""), /fixture\/first/);
    assert.doesNotMatch(output.join(""), /fixture-value/);
    assert.equal(await executeCli(["hub", "policy", "--mode", "invalid"], undefined,
      { environment: f.environment, writeError: () => {} }), 1);
    assert.throws(() => activatePersistedHubConfiguration({ ...f.first, publicationPolicy: "invalid" as "direct" }, f.environment), /policy/);
    assert.equal(hubPublicationPolicy(f.environment).publication_policy, "pr");
  } finally { f.close(); }
});

test("[AB-DIRECT-008] configured Publish rejects PR policy before Git or direct mutation", async () => {
  const f = fixture();
  try {
    activatePersistedHubConfiguration({ ...f.first, publicationPolicy: "pr" }, f.environment);
    let calls = 0;
    await assert.rejects(publishConfiguredHubProposal({ proposalId: "b".repeat(24), diffDigest: `sha256:${"c".repeat(64)}`, mode: "direct" },
      f.environment, { git: async () => { calls += 1; throw new Error("unexpected Git"); } }), /policy is pr/);
    assert.equal(calls, 0);
    hubPublicationPolicy(f.environment, "direct");
    assert.equal(hubPublicationPolicy(f.environment).publication_policy, "direct");
  } finally { f.close(); }
});

test("[AB-DIRECT-008] configured Publish pins profile and redacts failures while holding activation ownership", async () => {
  const f = fixture();
  try {
    fs.mkdirSync(f.first.localRoot, { recursive: true });
    activatePersistedHubConfiguration(f.first, f.environment);
    writeGlobalHubToken("fixture-value", f.environment);
    let called = false;
    await assert.rejects(publishConfiguredHubProposal({ proposalId: "b".repeat(24), diffDigest: `sha256:${"c".repeat(64)}`, mode: "direct" },
      f.environment, { git: async (request) => {
        const operation = request.operation;
        if (operation.includes("config") || operation.includes("tree")) return { stdout: "", stderr: "" };
        if (operation === "inspect local Hub remote") return { stdout: "https://github.com/fixture/first.git\n", stderr: "" };
        if (operation === "inspect local Hub branch") return { stdout: "main\n", stderr: "" };
        return { stdout: `${"a".repeat(40)}\n`, stderr: "" };
      }, publish: async (options) => {
        called = true;
        assert.equal(options.authorization, "direct");
        assert.equal(options.localHub.hub.repository, "fixture/first");
        assert.equal(options.proposalRoot, path.join(f.root, "state/hub-runtime/proposals", "b".repeat(24)));
        assert.throws(() => hubPublicationPolicy(f.environment, "pr"), /activation is in progress/);
        assert.throws(() => activatePersistedHubConfiguration(f.second, f.environment), /activation is in progress/);
        throw new Error("failed using fixture-value");
      } }), /^Error: failed using \[REDACTED\]$/);
    assert.equal(called, true);
    hubPublicationPolicy(f.environment, "pr");
  } finally { f.close(); }
});
