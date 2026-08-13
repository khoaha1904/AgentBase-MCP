import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity } from "../../core/hub/index.ts";
import type { GitRequest } from "../../providers/github-hub/index.ts";
import { admitPersistentLocalHub } from "./local-hub.ts";

test("[AB-LOCAL-HUB-001] admits a persistent clean local main without fetching an existing clone", async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "local-hub-admit-"));
  const root = path.join(parent, "AgentBase-Hub");
  fs.mkdirSync(root);
  const calls: GitRequest[] = [];
  try {
    const state = await admitPersistentLocalHub({
      hub: createHubIdentity("acme/AgentBase-Hub", "main"), localRoot: root,
    }, async (request) => {
      calls.push(request);
      const command = request.args[0];
      const stdout = command === "remote" ? "https://github.com/acme/AgentBase-Hub.git\n"
        : command === "symbolic-ref" ? "main\n"
        : command === "rev-parse" && String(request.args[2]).startsWith("refs/remotes") ? `${"a".repeat(40)}\n`
        : command === "rev-parse" ? `${"b".repeat(40)}\n` : "";
      return { stdout, stderr: "" };
    });
    assert.equal(state.activeHead, "b".repeat(40));
    assert.equal(state.remoteBase, "a".repeat(40));
    assert.equal(calls.some((call) => call.args[0] === "fetch" || call.args[0] === "clone"), false);
  } finally { fs.rmSync(parent, { recursive: true, force: true }); }
});

test("[AB-LOCAL-HUB-001][AB-LOCAL-HUB-009] first clone needs token and dirty/wrong state fails closed", async () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "local-hub-first-"));
  const root = path.join(parent, "AgentBase-Hub");
  try {
    const hub = createHubIdentity("acme/AgentBase-Hub", "main");
    await assert.rejects(admitPersistentLocalHub({ hub, localRoot: root }, async () => ({ stdout: "", stderr: "" })), /requires.*token/);
    fs.mkdirSync(root);
    await assert.rejects(admitPersistentLocalHub({ hub, localRoot: root }, async (request) => ({
      stdout: request.args[0] === "remote" ? "https://github.com/evil/Hub.git\n" : "dirty\n",
      stderr: "",
    })), /remote/);
  } finally { fs.rmSync(parent, { recursive: true, force: true }); }
});
