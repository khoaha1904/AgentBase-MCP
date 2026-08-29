import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { executeCli } from "./cli.ts";
import {
  loadGlobalHubToken, loadHubProfileToken, writeGlobalHubToken, writeHubProfileToken,
} from "./app/hub-okf/configuration/credential-file.ts";
import type { HubToolActions } from "./app/hub-okf/mcp/mcp-tool-actions.ts";

function environment(): NodeJS.ProcessEnv {
  return { AGENTBASE_HOME: fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-cli-test-")) };
}

function actions(overrides: Partial<HubToolActions> = {}): HubToolActions {
  return {
    status: async () => ({ kind: "unconfigured" }),
    configure: async () => ({ kind: "remote" }),
    synchronize: async () => ({ synchronized: true }),
    ...overrides,
  } as HubToolActions;
}

function io(environment: NodeJS.ProcessEnv, promptToken: (existing: string | undefined) => Promise<string>) {
  const output: string[] = [], errors: string[] = [];
  return {
    environment, promptToken,
    writeOutput: (value: string) => output.push(value),
    writeError: (value: string) => errors.push(value),
    output, errors,
  };
}

test("abs help exposes only the small public surface", async () => {
  const output: string[] = [];
  const code = await executeCli(["--help"], undefined, { writeOutput: (value) => output.push(value) });
  assert.equal(code, 0);
  assert.match(output.join(""), /abs status/);
  assert.match(output.join(""), /abs hub connect/);
  assert.match(output.join(""), /abs hub sync/);
  assert.doesNotMatch(output.join(""), /okf|benchmark|proposal|mcp/);
});

test("abs status and sync dispatch bounded owner actions", async () => {
  const env = environment();
  const status = actions({ status: async () => ({ state: "ready" }) });
  const statusIo = io(env, async () => "");
  assert.equal(await executeCli(["status"], status, statusIo), 0);
  assert.match(statusIo.output.join(""), /ready/);

  const syncIo = io(env, async () => "");
  assert.equal(await executeCli(["hub", "sync"], actions(), syncIo), 0);
  assert.match(syncIo.output.join(""), /synchronized/);
});

test("hub connect stores one shared token and reuses it on blank input", async () => {
  const env = environment();
  let calls = 0;
  const connect = actions({ configure: async () => { calls += 1; return { connected: true }; } });
  const firstIo = io(env, async () => "shared-token-canary");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/hub.git", "--branch", "main"], connect, firstIo), 0);
  assert.equal(loadGlobalHubToken(env), "shared-token-canary");

  const secondIo = io(env, async () => "");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/other-hub.git", "--branch", "main"], connect, secondIo), 0);
  assert.equal(loadGlobalHubToken(env), "shared-token-canary");
  assert.equal(calls, 2);
  assert.doesNotMatch(firstIo.output.join("") + firstIo.errors.join(""), /shared-token-canary/);
});

test("hub connect restores the previous shared token after a reported failure", async () => {
  const env = environment();
  writeGlobalHubToken("old-token-canary", env);
  const connect = actions({ configure: async () => { throw new Error("destination rejected"); } });
  const connectIo = io(env, async () => "new-token-canary");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/hub.git", "--branch", "main"], connect, connectIo), 1);
  assert.equal(loadGlobalHubToken(env), "old-token-canary");
  assert.match(connectIo.errors.join(""), /destination rejected/);
  assert.doesNotMatch(connectIo.errors.join(""), /new-token-canary|old-token-canary/);
});

test("the shared token is the default credential for every Hub profile", () => {
  const env = environment();
  const profileId = "a".repeat(24);
  writeHubProfileToken(profileId, "legacy-profile-token", env);
  writeGlobalHubToken("shared-default-token", env);
  assert.equal(loadHubProfileToken(profileId, env), "shared-default-token");
});
