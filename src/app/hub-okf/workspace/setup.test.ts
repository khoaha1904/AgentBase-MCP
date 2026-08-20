import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadOkfBundle } from "../../../core/knowledge/index.ts";
import { runGit, type GitRequest } from "../../../providers/github-hub/index.ts";
import { readPersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { attachExistingHub, createLocalHub, normalizeGitHubHubUrl } from "./setup.ts";

function environment(root: string): NodeJS.ProcessEnv {
  return { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
}

test("[AB-HUB-SETUP-004][AB-HUB-SETUP-015] only exact credential-free GitHub URLs are admitted", () => {
  assert.deepEqual(normalizeGitHubHubUrl("https://github.com/acme/AgentBase-Hub"), {
    repository: "acme/AgentBase-Hub", canonicalHttpsUrl: "https://github.com/acme/AgentBase-Hub.git",
  });
  for (const invalid of [
    "git@github.com:acme/hub.git", "http://github.com/acme/hub", "https://gitlab.com/acme/hub",
    "https://token@github.com/acme/hub", "https://github.com/acme/hub/issues", "https://github.com/acme/hub?x=1",
  ]) assert.throws(() => normalizeGitHubHubUrl(invalid), /Hub URL/);
});

test("[AB-HUB-SETUP-006][AB-HUB-SETUP-007] new Hub is a private local base with no remote", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-setup-local-")), env = environment(root);
  try {
    const created = await createLocalHub(env, runGit, "2026-08-13T00:00:00.000Z");
    assert.equal(created.kind, "local-only");
    assert.equal(fs.statSync(path.dirname(created.localRoot)).mode & 0o777, 0o700);
    assert.equal(fs.readFileSync(path.join(created.localRoot, "README.md"), "utf8").includes("AgentBase-MCP"), true);
    assert.equal(loadOkfBundle(created.localRoot, { requireAgentBaseRootIndex: true }).okfVersion, "0.2");
    const remotes = await runGit({ args: ["remote"], cwd: created.localRoot, operation: "test local Hub remotes" });
    assert.equal(remotes.stdout, "");
    const message = await runGit({ args: ["show", "-s", "--format=%B", created.baseCommit], cwd: created.localRoot, operation: "test base identity" });
    assert.match(message.stdout, /AgentBase-Hub-Kind: base/);
    assert.match(message.stdout, new RegExp(`AgentBase-Hub-ID: ${created.localHubId}`));
    assert.deepEqual(readPersistedHubConfiguration(env)?.kind, "local-only");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-HUB-SETUP-004][AB-HUB-SETUP-005] existing attach stages validation and leaves no partial configuration", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-setup-attach-"));
  const sourceEnv = environment(path.join(root, "source-home"));
  const targetEnv: NodeJS.ProcessEnv = { ...environment(path.join(root, "target-home")), AGENTBASE_HUB_GITHUB_TOKEN: "token-canary" };
  try {
    const source = await createLocalHub(sourceEnv, runGit, "2026-08-13T00:00:00.000Z");
    const cloning = async (request: GitRequest) => {
      if (request.args[0] !== "clone") return runGit(request);
      const destination = String(request.args.at(-1));
      fs.cpSync(source.localRoot, destination, { recursive: true });
      await runGit({ args: ["remote", "add", "origin", "https://github.com/acme/AgentBase-Hub.git"], cwd: destination, operation: "fixture origin" });
      return { stdout: "", stderr: "" };
    };
    const attached = await attachExistingHub("https://github.com/acme/AgentBase-Hub", targetEnv, cloning);
    assert.equal(attached.kind, "remote");
    assert.equal(attached.repository, "acme/AgentBase-Hub");
    assert.equal(readPersistedHubConfiguration(targetEnv)?.kind, "remote");
    await assert.rejects(attachExistingHub("https://github.com/acme/Other-Hub", targetEnv, cloning), /already configured/);

    const failedEnv: NodeJS.ProcessEnv = { ...environment(path.join(root, "failed-home")), AGENTBASE_HUB_GITHUB_TOKEN: "token-canary" };
    const failure = await attachExistingHub("https://github.com/acme/AgentBase-Hub", failedEnv, async (request) => {
      if (request.args[0] === "clone") {
        fs.mkdirSync(String(request.args.at(-1)), { recursive: true });
        throw new Error("simulated interruption token-canary");
      }
      return runGit(request);
    }).then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));
    assert.match(failure, /simulated interruption/);
    assert.doesNotMatch(failure, /token-canary/);
    assert.equal(readPersistedHubConfiguration(failedEnv), undefined);
    assert.equal(fs.readdirSync(path.join(failedEnv.XDG_DATA_HOME!, "agentbase-mcp", "hubs")).length, 0);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-HUB-SETUP-005][AB-HUB-SETUP-006] interrupted local initialization admits nothing", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-setup-init-failure-")), env = environment(root);
  try {
    await assert.rejects(createLocalHub(env, async (request) => {
      if (request.args.includes("commit")) throw new Error("simulated base commit interruption");
      return runGit(request);
    }, "2026-08-13T00:00:00Z"), /commit interruption/);
    assert.equal(readPersistedHubConfiguration(env), undefined);
    assert.equal(fs.readdirSync(path.join(env.XDG_DATA_HOME!, "agentbase-mcp", "hubs")).length, 0);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-HUB-SETUP-005][AB-HUB-SETUP-015] attach permission guidance redacts the global token", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-setup-permission-"));
  const env = { ...environment(root), AGENTBASE_HUB_GITHUB_TOKEN: "token-canary" };
  try {
    const message = await attachExistingHub("https://github.com/acme/AgentBase-Hub", env, async () => {
      throw new Error("attach existing AgentBase-Hub: Git exited with status 128 token-canary");
    }).then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));
    assert.match(message, /repository read access/);
    assert.doesNotMatch(message, /token-canary/);
    assert.equal(readPersistedHubConfiguration(env), undefined);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
