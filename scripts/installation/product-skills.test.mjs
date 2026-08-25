import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { connectSelectedClients, runInstaller } from "./install.mjs";
import {
  installProductSkills,
  INTERNAL_PRODUCT_SKILL_NAMES,
  PRODUCT_SKILL_NAMES,
  PUBLIC_PRODUCT_SKILL_NAMES,
  rollbackProductSkills,
} from "./product-skills.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

function skillNames(root) {
  return fs.existsSync(root) ? fs.readdirSync(root).filter((name) => !name.startsWith(".")) : [];
}

test("[AB-INSTALL-025..031][AB-QUESTION-006] installs only product skills with safe rerun, preflight and rollback", async (context) => {
  const temporaryRoots = [];
  context.after(() => temporaryRoots.forEach((root) => fs.rmSync(root, { recursive: true, force: true })));
  const environment = () => {
    const HOME = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-skills-"));
    temporaryRoots.push(HOME);
    return { HOME, CODEX_HOME: path.join(HOME, "custom-codex") };
  };

  const both = environment();
  const first = installProductSkills({ clients: ["codex", "claude-code"], repositoryRoot, environment: both });
  assert.deepEqual(first.clients, { codex: "installed", "claude-code": "installed" });
  assert.deepEqual(PUBLIC_PRODUCT_SKILL_NAMES, [
    "agentbase-query", "agentbase-scan", "agentbase-ingest", "agentbase-refresh",
    "agentbase-batch-ingest", "agentbase-domain-enrichment", "agentbase-hub",
  ]);
  assert.deepEqual(INTERNAL_PRODUCT_SKILL_NAMES, ["use-codebase-memory", "agentbase-okf"]);
  assert.equal(PRODUCT_SKILL_NAMES.length, 9);
  const hubSkill = fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", "agentbase-hub", "SKILL.md"), "utf8");
  assert.match(hubSkill, /`list_hub_questions`/);
  assert.match(hubSkill, /`answer_hub_question`/);
  assert.deepEqual(skillNames(path.join(both.CODEX_HOME, "skills")), [...PRODUCT_SKILL_NAMES].sort());
  assert.deepEqual(skillNames(path.join(both.HOME, ".claude", "skills")), [...PRODUCT_SKILL_NAMES].sort());
  assert.equal(skillNames(path.join(both.CODEX_HOME, "skills")).some((name) => name.startsWith("speckit-")), false);
  assert.equal(PRODUCT_SKILL_NAMES.some((name) => name.startsWith("abs-")), false);
  assert.deepEqual(installProductSkills({ clients: ["codex", "claude-code"], repositoryRoot, environment: both }).clients,
    { codex: "already-installed", "claude-code": "already-installed" });

  const codexOnly = environment();
  installProductSkills({ clients: ["codex"], repositoryRoot, environment: codexOnly });
  assert.equal(fs.existsSync(path.join(codexOnly.HOME, ".claude", "skills")), false);

  const conflicted = environment();
  const conflict = path.join(conflicted.HOME, ".claude", "skills", "agentbase-hub");
  fs.mkdirSync(conflict, { recursive: true });
  fs.writeFileSync(path.join(conflict, "SKILL.md"), "different\n");
  assert.throws(() => installProductSkills({ clients: ["codex", "claude-code"], repositoryRoot, environment: conflicted }),
    (error) => error.code === "SKILL_CONFLICT" && error.client === "claude-code");
  assert.equal(fs.existsSync(path.join(conflicted.CODEX_HOME, "skills")), false);

  const rolledBack = environment();
  installProductSkills({ clients: ["codex"], repositoryRoot, environment: rolledBack });
  for (const name of PRODUCT_SKILL_NAMES.slice(1)) fs.rmSync(path.join(rolledBack.CODEX_HOME, "skills", name), { recursive: true });
  await assert.rejects(() => connectSelectedClients({
    clients: ["codex"], repositoryRoot, environment: rolledBack, nodeExecutable: process.execPath,
    runClientRegistration: async () => { throw new Error("registration failed"); },
  }), /registration failed/);
  assert.deepEqual(skillNames(path.join(rolledBack.CODEX_HOME, "skills")), [PRODUCT_SKILL_NAMES[0]]);

  const preserved = environment();
  const initial = installProductSkills({ clients: ["codex"], repositoryRoot, environment: preserved });
  rollbackProductSkills(initial);
  assert.deepEqual(skillNames(path.join(preserved.CODEX_HOME, "skills")), []);

  let skillInstallCalled = false;
  const preparationOrder = [];
  const preparedEnvironment = environment();
  const preparedOnly = await runInstaller({
    args: [], input: { isTTY: false }, output: { isTTY: false, write() {} }, environment: preparedEnvironment,
    runRegistryResolution: async () => { preparationOrder.push("registry"); return "https://registry.company.example/"; },
    runDependencyInstall: async () => { preparationOrder.push("dependencies"); },
    runProviderPreparation: async () => { preparationOrder.push("provider"); },
    runProductSkillInstallation: async () => { skillInstallCalled = true; },
  });
  assert.deepEqual(preparationOrder, ["registry", "dependencies", "provider"]);
  assert.equal(skillInstallCalled, false);
  assert.equal(preparedOnly.registration, "skipped");
  assert.equal("credential" in preparedOnly, false);
  assert.equal(fs.existsSync(path.join(preparedEnvironment.HOME, ".config", "agentbase-mcp")), false);
  let mutationAfterFailure = false;
  await assert.rejects(runInstaller({
    args: [], input: { isTTY: false }, output: { isTTY: false, write() {} }, environment: environment(),
    runRegistryResolution: async () => "https://registry.company.example/",
    runDependencyInstall: async () => {},
    runProviderPreparation: async () => { throw new Error("provider preparation failed"); },
    runProductSkillInstallation: async () => { mutationAfterFailure = true; },
  }), /provider preparation failed/);
  assert.equal(mutationAfterFailure, false);
  let registryChecked = false;
  await assert.rejects(runInstaller({
    args: [], nodeVersion: "22.22.3", input: { isTTY: false }, output: { isTTY: false, write() {} },
    environment: environment(), runRegistryResolution: async () => { registryChecked = true; return "https://registry.company.example/"; },
  }), /Node >=24\.12 <25/);
  assert.equal(registryChecked, false);
  await assert.rejects(runInstaller({
    args: [], input: { isTTY: false }, output: { isTTY: false, write() {} }, environment: environment(),
    runRegistryResolution: async () => "https://registry.npmjs.org/",
  }), /internal npm registry/);
  await assert.rejects(runInstaller({
    args: ["--replace-token"], input: { isTTY: false }, output: { isTTY: false, write() {} },
    environment: environment(), runRegistryResolution: async () => "https://registry.company.example/",
    runDependencyInstall: async () => {}, runProviderPreparation: async () => {},
  }), /accepts no arguments/);
});
