import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { clientEntriesEqual, stableClientEntry } from "./client-registration.mjs";
import { MANAGED_PRODUCT_SKILL_NAMES, PRODUCT_SKILL_NAMES, productSkillRoot } from "./product-skills.mjs";
import { parseClients } from "./release-control.mjs";
import { readReleaseIntegrationState, releaseIntegrationPaths } from "./release-integration.mjs";
import { lifecyclePaths, runApplicationLifecycle } from "./release-lifecycle.mjs";
import { RELEASE_CONTROL_FILES } from "./release-bundle.mjs";

const sourceControl = import.meta.dirname;

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function fakeClientAdapter(initial = {}) {
  const entries = new Map(Object.entries(initial).map(([client, entry]) => [client, clone(entry)]));
  const transitions = [];
  let failure;
  return {
    entries,
    transitions,
    failNext(error = new Error("injected client failure")) { failure = error; },
    async inspect(client) { return clone(entries.get(client)); },
    async transition(client, from, to, options = {}) {
      const actual = entries.get(client);
      const intermediate = options.allowIntermediateAbsent && actual === undefined && from !== undefined && to !== undefined;
      if (!clientEntriesEqual(actual, from) && !clientEntriesEqual(actual, to) && !intermediate) {
        throw new Error(`${client} fake entry conflict`);
      }
      transitions.push({ client, from: clone(from), to: clone(to) });
      if (failure) {
        const error = failure;
        failure = undefined;
        throw error;
      }
      if (to === undefined) entries.delete(client);
      else entries.set(client, clone(to));
    },
  };
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-release-integration-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const environment = {
    ...process.env,
    HOME: path.join(root, "home"),
    CODEX_HOME: path.join(root, "codex"),
    AGENTBASE_HOME: path.join(root, "agentbase"),
  };
  fs.mkdirSync(environment.HOME, { recursive: true });
  const paths = lifecyclePaths(environment);
  const releases = path.join(root, "candidates");
  const createRelease = (version, skillVersion = version, catalog = PRODUCT_SKILL_NAMES) => {
    const releaseId = `agentbase-mcp-${version}-${process.platform}-${process.arch}`;
    const releaseRoot = path.join(releases, releaseId);
    fs.mkdirSync(path.join(releaseRoot, "src"), { recursive: true });
    fs.mkdirSync(path.join(releaseRoot, "scripts", "installation"), { recursive: true });
    fs.writeFileSync(path.join(releaseRoot, "fixture.json"), `${JSON.stringify({ release_id: releaseId, skills: catalog })}\n`);
    fs.writeFileSync(path.join(releaseRoot, "src", "cli.ts"), `process.stdout.write(${JSON.stringify(`${releaseId}\n`)});\n`);
    for (const name of RELEASE_CONTROL_FILES) {
      fs.copyFileSync(path.join(sourceControl, name), path.join(releaseRoot, "scripts", "installation", name));
    }
    for (const name of catalog) {
      const skill = path.join(releaseRoot, ".agents", "skills", name);
      fs.mkdirSync(skill, { recursive: true });
      fs.writeFileSync(path.join(skill, "SKILL.md"), `# ${name}\n\nrelease: ${skillVersion}\n`);
    }
    return releaseRoot;
  };
  const verifyRelease = async (releaseRoot, expected = {}) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(releaseRoot, "fixture.json"), "utf8"));
    if (expected.releaseId && expected.releaseId !== manifest.release_id) throw new Error("fixture release identity changed");
    return { ...manifest, runtime: { lifecycle_api: 1, integration_state_schema: 1 } };
  };
  const createLegacyEntry = () => {
    const checkout = path.join(root, "legacy-checkout");
    const entrypoint = path.join(checkout, "src", "cli.ts");
    fs.mkdirSync(path.dirname(entrypoint), { recursive: true });
    fs.writeFileSync(entrypoint, "// legacy AgentBase entrypoint\n");
    fs.writeFileSync(path.join(checkout, "package.json"), `${JSON.stringify({
      name: "agentbase-mcp", type: "module", bin: { abs: "./src/cli.ts" },
    })}\n`);
    return {
      transport: "stdio",
      command: fs.realpathSync(process.execPath),
      args: [entrypoint, "mcp"],
      env: {},
      envVars: [],
    };
  };
  return { root, environment, paths, createRelease, createLegacyEntry, verifyRelease };
}

function installedSkill(environment, client, name) {
  return path.join(productSkillRoot(client, environment), name, "SKILL.md");
}

test("[AB-INTEGRATION-015] retires the owned graph skill on upgrade and restores it on rollback", async (t) => {
  const value = fixture(t);
  const first = value.createRelease("0.1.0", "legacy", MANAGED_PRODUCT_SKILL_NAMES);
  const second = value.createRelease("0.2.0", "source-only");
  const adapter = fakeClientAdapter();
  const options = { environment: value.environment, verifyRelease: value.verifyRelease, clientAdapter: adapter };
  await runApplicationLifecycle("install", { ...options, releaseRoot: first, clients: ["codex"] });
  const retired = installedSkill(value.environment, "codex", "use-codebase-memory");
  assert.equal(fs.existsSync(retired), true);
  const original = fs.readFileSync(retired, "utf8");
  fs.appendFileSync(retired, "owner changes\n");
  await assert.rejects(runApplicationLifecycle("upgrade", { ...options, releaseRoot: second }), /skill drifted/);
  assert.equal(readReleaseIntegrationState(value.paths).releaseId, path.basename(first));
  fs.writeFileSync(retired, original);
  await runApplicationLifecycle("upgrade", { ...options, releaseRoot: second });
  assert.equal(fs.existsSync(retired), false);
  assert.deepEqual(Object.keys(readReleaseIntegrationState(value.paths).skills.codex).sort(), [...PRODUCT_SKILL_NAMES].sort());
  await runApplicationLifecycle("rollback", options);
  assert.equal(fs.readFileSync(retired, "utf8"), original);
  await runApplicationLifecycle("uninstall", options);
  assert.deepEqual(fs.readdirSync(productSkillRoot("codex", value.environment)), []);
});

test("[AB-INTEGRATION-001..010][AB-INTEGRATION-013..014] migrates once and versions skills with the application", async (t) => {
  const value = fixture(t);
  const first = value.createRelease("0.1.0", "one"), second = value.createRelease("0.2.0", "two");
  const legacy = value.createLegacyEntry();
  const adapter = fakeClientAdapter({ codex: legacy });
  const options = { environment: value.environment, verifyRelease: value.verifyRelease, clientAdapter: adapter };

  const adopted = installedSkill(value.environment, "codex", PRODUCT_SKILL_NAMES[0]);
  fs.mkdirSync(path.dirname(adopted), { recursive: true });
  fs.copyFileSync(path.join(first, ".agents", "skills", PRODUCT_SKILL_NAMES[0], "SKILL.md"), adopted);

  const installed = await runApplicationLifecycle("install", { ...options, releaseRoot: first, clients: ["codex"] });
  assert.equal(installed.status, "installed");
  assert.equal(clientEntriesEqual(adapter.entries.get("codex"), stableClientEntry(value.paths.launcher)), true);
  assert.equal(adapter.transitions.length, 1);
  assert.match(fs.readFileSync(installedSkill(value.environment, "codex", "agentbase-query"), "utf8"), /release: one/);
  assert.equal(readReleaseIntegrationState(value.paths).releaseId, path.basename(first));

  const rerun = await runApplicationLifecycle("install", { ...options, releaseRoot: first, clients: ["codex"] });
  assert.equal(rerun.status, "already-installed");
  assert.equal(adapter.transitions.length, 1);

  await runApplicationLifecycle("upgrade", { ...options, releaseRoot: second });
  assert.equal(adapter.transitions.length, 1, "upgrade must not rewrite the stable MCP entry");
  assert.match(fs.readFileSync(installedSkill(value.environment, "codex", "agentbase-query"), "utf8"), /release: two/);
  assert.equal(readReleaseIntegrationState(value.paths).releaseId, path.basename(second));

  await runApplicationLifecycle("rollback", options);
  assert.equal(adapter.transitions.length, 1, "rollback must not rewrite the stable MCP entry");
  assert.match(fs.readFileSync(installedSkill(value.environment, "codex", "agentbase-query"), "utf8"), /release: one/);
  assert.equal(readReleaseIntegrationState(value.paths).releaseId, path.basename(first));

  await runApplicationLifecycle("uninstall", options);
  assert.equal(adapter.entries.has("codex"), false);
  assert.equal(adapter.transitions.length, 2);
  assert.equal(fs.existsSync(productSkillRoot("codex", value.environment)), true);
  assert.deepEqual(fs.readdirSync(productSkillRoot("codex", value.environment)), []);
  assert.equal(fs.existsSync(releaseIntegrationPaths(value.paths).state), false);
  assert.equal(fs.existsSync(value.paths.launcher), false);
});

test("[AB-INTEGRATION-003..005][AB-INTEGRATION-008..014] preflights conflicts and restores injected failure", async (t) => {
  const conflictFixture = fixture(t), release = conflictFixture.createRelease("0.1.0");
  const unknown = { transport: "stdio", command: "/company/other-agent", args: ["mcp"], env: {}, envVars: [] };
  const conflictAdapter = fakeClientAdapter({ codex: unknown });
  await assert.rejects(runApplicationLifecycle("install", {
    environment: conflictFixture.environment,
    verifyRelease: conflictFixture.verifyRelease,
    clientAdapter: conflictAdapter,
    releaseRoot: release,
    clients: ["codex"],
  }), /unknown agentbase entry/);
  assert.equal(fs.existsSync(conflictFixture.paths.launcher), false);
  assert.equal(conflictAdapter.transitions.length, 0);

  const skillConflictFixture = fixture(t), skillConflictRelease = skillConflictFixture.createRelease("0.1.0");
  const skillConflictAdapter = fakeClientAdapter();
  const conflictingSkill = installedSkill(skillConflictFixture.environment, "codex", "agentbase-query");
  fs.mkdirSync(path.dirname(conflictingSkill), { recursive: true });
  fs.writeFileSync(conflictingSkill, "different owner content\n");
  await assert.rejects(runApplicationLifecycle("install", {
    environment: skillConflictFixture.environment,
    verifyRelease: skillConflictFixture.verifyRelease,
    clientAdapter: skillConflictAdapter,
    releaseRoot: skillConflictRelease,
    clients: ["codex"],
  }), /different skill named agentbase-query/);
  assert.equal(fs.existsSync(skillConflictFixture.paths.launcher), false);
  assert.equal(skillConflictAdapter.transitions.length, 0);

  const failureFixture = fixture(t), failureRelease = failureFixture.createRelease("0.1.0");
  const failureAdapter = fakeClientAdapter();
  failureAdapter.failNext();
  await assert.rejects(runApplicationLifecycle("install", {
    environment: failureFixture.environment,
    verifyRelease: failureFixture.verifyRelease,
    clientAdapter: failureAdapter,
    releaseRoot: failureRelease,
    clients: ["codex"],
  }), /injected client failure/);
  assert.equal(fs.existsSync(failureFixture.paths.launcher), false);
  assert.equal(fs.existsSync(failureFixture.paths.releases), true);
  assert.deepEqual(fs.readdirSync(failureFixture.paths.releases), []);
  assert.equal(fs.existsSync(productSkillRoot("codex", failureFixture.environment)), true);
  assert.deepEqual(fs.readdirSync(productSkillRoot("codex", failureFixture.environment)), []);
  assert.equal(fs.existsSync(releaseIntegrationPaths(failureFixture.paths).receipt), false);
});

test("[AB-INTEGRATION-009..014] blocks managed drift and resumes committed uninstall", async (t) => {
  const driftFixture = fixture(t), driftRelease = driftFixture.createRelease("0.1.0");
  const driftAdapter = fakeClientAdapter();
  const driftOptions = { environment: driftFixture.environment, verifyRelease: driftFixture.verifyRelease,
    clientAdapter: driftAdapter };
  await runApplicationLifecycle("install", { ...driftOptions, releaseRoot: driftRelease, clients: ["codex"] });
  fs.appendFileSync(installedSkill(driftFixture.environment, "codex", "agentbase-query"), "owner drift\n");
  await assert.rejects(runApplicationLifecycle("uninstall", driftOptions), /skill drifted/);
  assert.equal(fs.existsSync(driftFixture.paths.launcher), true);
  assert.equal(driftAdapter.entries.has("codex"), true);

  const recoveryFixture = fixture(t), recoveryRelease = recoveryFixture.createRelease("0.1.0");
  const recoveryAdapter = fakeClientAdapter();
  const recoveryOptions = { environment: recoveryFixture.environment, verifyRelease: recoveryFixture.verifyRelease,
    clientAdapter: recoveryAdapter };
  await runApplicationLifecycle("install", { ...recoveryOptions, releaseRoot: recoveryRelease, clients: ["codex"] });
  await assert.rejects(runApplicationLifecycle("uninstall", {
    ...recoveryOptions,
    afterPhase(phase) { if (phase === "committed") throw new Error("injected committed interruption"); },
  }), /injected committed interruption/);
  assert.equal(fs.existsSync(recoveryFixture.paths.receipt), true);
  assert.equal(recoveryAdapter.entries.has("codex"), false);
  const resumed = await runApplicationLifecycle("uninstall", recoveryOptions);
  assert.equal(resumed.status, "already-uninstalled");
  assert.equal(fs.existsSync(recoveryFixture.paths.receipt), false);
  assert.equal(fs.existsSync(recoveryFixture.paths.launcher), false);
});

test("[AB-INTEGRATION-001][AB-INTEGRATION-014] parses only explicit supported release client selections", () => {
  assert.deepEqual(parseClients("1"), ["codex"]);
  assert.deepEqual(parseClients("2"), ["claude-code"]);
  assert.deepEqual(parseClients("3"), ["codex", "claude-code"]);
  assert.deepEqual(parseClients("claude-code,codex"), ["codex", "claude-code"]);
  assert.throws(() => parseClients(""), /clients must be/);
  assert.throws(() => parseClients("codex,other"), /clients must be/);
  assert.throws(() => parseClients("codex,codex"), /clients must be/);
});
