import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { executeCli } from "./cli.ts";
import { createHubIdentity, hubProfileId } from "./core/hub/index.ts";
import {
  loadExactHubProfileToken, loadGlobalHubToken, loadHubProfileToken, writeGlobalHubToken, writeHubProfileToken,
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

test("[AB-CLI-001][AB-INSTALL-008] CLI and checkout installer execute through symbolic links", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-symlink-entrypoints-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.join(root, "abs.ts");
  fs.symlinkSync(fileURLToPath(new URL("./cli.ts", import.meta.url)), cli);
  const result = spawnSync(process.execPath, [cli, "status"], {
    encoding: "utf8", env: { ...process.env, AGENTBASE_HOME: path.join(root, "state") },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).kind, "unconfigured");

  const checkout = path.join(root, "checkout");
  fs.symlinkSync(path.resolve(import.meta.dirname, ".."), checkout);
  const installed = spawnSync("bash", [path.join(checkout, "install.sh"), "--invalid"], {
    encoding: "utf8", env: { ...process.env, AGENTBASE_HOME: path.join(root, "state") },
  });
  assert.equal(installed.status, 1, installed.stderr);
  assert.match(installed.stderr, /installer accepts no arguments/);
  assert.equal(fs.existsSync(path.join(root, "state")), false);
});

test("abs help exposes only the small public surface", async () => {
  const output: string[] = [];
  const code = await executeCli(["--help"], undefined, { writeOutput: (value) => output.push(value) });
  assert.equal(code, 0);
  assert.match(output.join(""), /abs status/);
  assert.match(output.join(""), /abs hub connect/);
  assert.match(output.join(""), /abs hub sync/);
  assert.match(output.join(""), /abs hub policy/);
  assert.match(output.join(""), /abs hub publish/);
  assert.doesNotMatch(output.join(""), /okf|benchmark|mcp/);
});

test("[AB-DISC-008][AB-CLI-003..005] retired graph and repository-local CLI routes expose no workflow", async (t) => {
  const env = environment();
  t.after(() => fs.rmSync(env.AGENTBASE_HOME!, { recursive: true, force: true }));
  const forbidden = actions({
    status: async () => { throw new Error("retired routes must not inspect a Hub"); },
    configure: async () => { throw new Error("retired routes must not connect a Hub"); },
    synchronize: async () => { throw new Error("retired routes must not synchronize a Hub"); },
  });
  for (const command of ["codebase-memory:integration", "codebase-memory:benchmark", "observe", "foundation-demo", "okf"]) {
    assert.equal(await executeCli([command, "prepare"], forbidden, { environment: env }), 2);
  }
  assert.deepEqual(fs.readdirSync(env.AGENTBASE_HOME!), []);
});

test("[AB-DIRECT-008] public Publish binds confirmation and reports split outcomes without Accept", async () => {
  const env = environment();
  try {
    let calls = 0;
    const args = ["hub", "publish", "--proposal", "a".repeat(24), "--digest", `sha256:${"b".repeat(64)}`, "--mode", "direct"];
    const output: string[] = [];
    for (const remote of ["published", "unknown"] as const) {
      for (const local of ["recognized", "pending"] as const) {
        const code = await executeCli(args, actions(), { environment: env, writeOutput: (s) => output.push(s),
          publishHub: async (input, environment) => {
            calls += 1;
            assert.equal(environment, env);
            assert.deepEqual(input, { proposalId: "a".repeat(24), diffDigest: `sha256:${"b".repeat(64)}`, mode: "direct" });
            return { proposalId: input.proposalId, commit: "c".repeat(40), remote, local };
          } });
        assert.equal(code, remote === "published" && local === "recognized" ? 0 : 1);
      }
    }
    assert.equal(calls, 4);
    for (const bad of [args.slice(0, -2), [...args.slice(0, -1), "invalid"], [...args, "--mode", "direct"]]) {
      assert.equal(await executeCli(bad, actions(), { environment: env, writeError: () => {}, publishHub: async () => {
        throw new Error("must not execute malformed Publish");
      } }), 1);
    }
    assert.match(output.join(""), /unknown/);
  } finally { fs.rmSync(env.AGENTBASE_HOME!, { recursive: true, force: true }); }
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

test("[AB-HUB-SETUP-030][AB-HUB-SETUP-033][AB-HUB-SETUP-037] hub connect stores tokens by Hub profile and preserves the shared token", async () => {
  const env = environment();
  writeGlobalHubToken("shared-default-token", env);
  const firstProfile = hubProfileId(createHubIdentity("acme/hub", "main"));
  const secondProfile = hubProfileId(createHubIdentity("acme/other-hub", "main"));
  let calls = 0;
  const connect = actions({ configure: async () => { calls += 1; return { connected: true }; } });
  const firstIo = io(env, async () => "profile-token-canary");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/hub.git", "--branch", "main"], connect, firstIo), 0);
  assert.equal(loadGlobalHubToken(env), "shared-default-token");
  assert.equal(loadExactHubProfileToken(firstProfile, env), "profile-token-canary");

  const secondIo = io(env, async () => "");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/other-hub.git", "--branch", "main"], connect, secondIo), 0);
  assert.equal(loadGlobalHubToken(env), "shared-default-token");
  assert.equal(loadExactHubProfileToken(secondProfile, env), "shared-default-token");
  assert.equal(calls, 2);
  assert.doesNotMatch(firstIo.output.join("") + firstIo.errors.join(""), /profile-token-canary/);
});

test("[AB-HUB-SETUP-031][AB-HUB-SETUP-037] hub connect restores the previous shared token after a reported failure", async () => {
  const env = environment();
  const profileId = hubProfileId(createHubIdentity("acme/hub", "main"));
  writeGlobalHubToken("old-token-canary", env);
  const connect = actions({ configure: async () => { throw new Error("destination rejected"); } });
  const connectIo = io(env, async () => "new-token-canary");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/hub.git", "--branch", "main"], connect, connectIo), 1);
  assert.equal(loadGlobalHubToken(env), "old-token-canary");
  assert.equal(loadExactHubProfileToken(profileId, env), undefined);
  assert.match(connectIo.errors.join(""), /destination rejected/);
  assert.doesNotMatch(connectIo.errors.join(""), /new-token-canary|old-token-canary/);
});

test("[AB-HUB-SETUP-038] empty Hub connect retains the entered token and directs the owner to bootstrap", async () => {
  const env = environment();
  const profileId = hubProfileId(createHubIdentity("acme/empty", "main"));
  writeGlobalHubToken("old-shared-token", env);
  const connect = actions({ configure: async () => {
    throw new Error("The Hub remote has no branches; preview and confirm bootstrap before attaching it");
  } });
  const connectIo = io(env, async () => "empty-hub-token-canary");
  assert.equal(await executeCli(["hub", "connect", "--url", "https://github.com/acme/empty.git", "--branch", "main"], connect, connectIo), 1);
  assert.equal(loadGlobalHubToken(env), "old-shared-token");
  assert.equal(loadExactHubProfileToken(profileId, env), "empty-hub-token-canary");
  assert.match(connectIo.errors.join(""), /token was retained.*\$agentbase-hub|bootstrap/i);
  assert.doesNotMatch(connectIo.errors.join(""), /empty-hub-token-canary/);
});

test("[AB-HUB-SETUP-033][AB-HUB-SETUP-037] the shared token is the default credential for every Hub profile", () => {
  const env = environment();
  const profileId = "a".repeat(24);
  writeHubProfileToken(profileId, "legacy-profile-token", env);
  writeGlobalHubToken("shared-default-token", env);
  assert.equal(loadHubProfileToken(profileId, env), "legacy-profile-token");
});
