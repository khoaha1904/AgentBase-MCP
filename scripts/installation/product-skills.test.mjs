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
import { HUB_OKF_TOOLS } from "../../src/app/hub-okf/mcp/mcp-tools.ts";
import { OKF_SCHEMA_TOOLS } from "../../src/app/codebase-memory-mcp/okf-schema-tools.ts";
import { SAFE_TOOLS } from "../../src/app/codebase-memory-mcp/tool-manifest.ts";
import { TRUSTED_ENTERPRISE_CAPABILITY_POLICY } from "../../src/app/codebase-memory-mcp/capability-policy.ts";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

function skillNames(root) {
  return fs.existsSync(root) ? fs.readdirSync(root).filter((name) => !name.startsWith(".")) : [];
}

function skillDescription(skill) {
  const match = /^---\r?\n[\s\S]*?^description:\s*(.+)$/m.exec(skill);
  assert.ok(match, "skill frontmatter must contain a description");
  return match[1];
}

test("[AB-QUERY-021][AB-INSTALL-043] keeps the AgentBase catalog explicit-only", () => {
  const skillsRoot = path.join(repositoryRoot, ".agents", "skills");

  for (const name of PRODUCT_SKILL_NAMES) {
    const metadata = fs.readFileSync(path.join(skillsRoot, name, "agents", "openai.yaml"), "utf8");
    assert.match(metadata, /^policy:\s*$[\s\S]*?^\s+allow_implicit_invocation: false$/m, `${name} must disable implicit invocation`);
  }

  for (const name of PUBLIC_PRODUCT_SKILL_NAMES) {
    const skill = fs.readFileSync(path.join(skillsRoot, name, "SKILL.md"), "utf8");
    const description = skillDescription(skill);
    assert.match(description, /^Explicit-only /, `${name} must advertise an explicit-only boundary`);
    assert.match(description, /Use only when the user names /, `${name} must require a user invocation`);
    assert.ok(description.includes(`$${name}`), `${name} must name its exact invocation`);
  }

  for (const name of INTERNAL_PRODUCT_SKILL_NAMES) {
    const skill = fs.readFileSync(path.join(skillsRoot, name, "SKILL.md"), "utf8");
    const description = skillDescription(skill);
    assert.match(description, /^Internal explicit delegation only\./, `${name} must be delegation-only`);
    assert.ok(description.includes(`$${name}`), `${name} must name its exact internal invocation`);
  }

  const atlasRequest = "Read this shared trading chat and inspect .archived/Atlas, then summarize and suggest next steps.";
  assert.equal(PUBLIC_PRODUCT_SKILL_NAMES.some((name) => atlasRequest.includes(`$${name}`) || atlasRequest.includes(`/${name}`)), false);
  const query = fs.readFileSync(path.join(skillsRoot, "agentbase-query", "SKILL.md"), "utf8");
  assert.match(skillDescription(query), /Never select it merely because an ordinary request asks to inspect or explain a repository\./);
  assert.match(query, /only when the user explicitly names `\$agentbase-query`/);
});

test("[AB-SURFACE-001..005] freezes an owned release skill and tool surface", () => {
  const skillsRoot = path.join(repositoryRoot, ".agents", "skills");
  const skills = new Map(PRODUCT_SKILL_NAMES.map((name) => [name,
    fs.readFileSync(path.join(skillsRoot, name, "SKILL.md"), "utf8")]));
  const tools = [
    ...HUB_OKF_TOOLS.map((tool) => ({ name: tool.name, capability: "hub" })),
    ...OKF_SCHEMA_TOOLS.map((tool) => ({ name: tool.name, capability: "schema" })),
    ...SAFE_TOOLS.map((tool) => ({ name: tool.name, capability: "graph" })),
  ];

  assert.equal(PUBLIC_PRODUCT_SKILL_NAMES.length, 10);
  assert.equal(INTERNAL_PRODUCT_SKILL_NAMES.length, 3);
  assert.equal(tools.length, 44);
  assert.equal(new Set(tools.map((tool) => tool.name)).size, tools.length, "advertised tool names must be unique");
  for (const tool of tools) {
    const owners = [...skills].filter(([, skill]) => skill.includes(`\`${tool.name}\``)).map(([name]) => name);
    assert.ok(owners.length > 0, `${tool.name} must be named by a shipped workflow skill`);
    assert.equal(TRUSTED_ENTERPRISE_CAPABILITY_POLICY.allows(tool), true,
      `${tool.name} must remain in trusted-enterprise composition`);
  }

  assert.deepEqual([...skills].filter(([, skill]) => skill.includes("`preflight_hub_ingest`")).map(([name]) => name),
    ["agentbase-ingest", "agentbase-refresh", "agentbase-batch-ingest"]);
  assert.deepEqual([...skills].filter(([, skill]) => skill.includes("`inspect_hub_okf_proposal`")).map(([name]) => name),
    ["agentbase-ingest", "agentbase-refresh", "agentbase-batch-ingest", "agentbase-domain-enrichment", "agentbase-hub"]);
});

test("[AB-INSTALL-025..031][AB-QUESTION-006][AB-FRESH-010][AB-USE-001..005] installs shared read guidance and product skills with safe rerun, preflight and rollback", async (context) => {
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
    "agentbase-query", "agentbase-context", "agentbase-scan", "agentbase-ingest", "agentbase-refresh",
    "agentbase-batch-ingest", "agentbase-domain-enrichment", "agentbase-diagram", "agentbase-domain-site", "agentbase-hub",
  ]);
  assert.deepEqual(INTERNAL_PRODUCT_SKILL_NAMES, ["use-codebase-memory", "agentbase-okf", "use-diagram-design"]);
  assert.equal(PRODUCT_SKILL_NAMES.length, 13);
  const contextSkill = fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", "agentbase-context", "SKILL.md"), "utf8");
  const contextMetadata = fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", "agentbase-context", "agents", "openai.yaml"), "utf8");
  const sharedLink = /\]\((\.\.\/agentbase-query\/SKILL\.md)\)/.exec(contextSkill)?.[1];
  assert.ok(sharedLink, "compatibility entry must link the shared installed owner");
  assert.match(contextMetadata, /allow_implicit_invocation: false/);
  const querySkill = fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", "agentbase-query", "SKILL.md"), "utf8");
  for (const installedRoot of [path.join(both.CODEX_HOME, "skills"), path.join(both.HOME, ".claude", "skills")]) {
    for (const [owner, target] of [["agentbase-ingest", "agentbase-refresh"],
      ["agentbase-refresh", "agentbase-ingest"], ["agentbase-refresh", "agentbase-domain-enrichment"]]) {
      const ownerPath = path.join(installedRoot, owner, "SKILL.md");
      const relative = `../${target}/SKILL.md`;
      assert.ok(fs.readFileSync(ownerPath, "utf8").includes(`](${relative})`),
        `Add/Update handoff must resolve an installed owner: ${owner} -> ${target}`);
      assert.equal(fs.readFileSync(path.resolve(path.dirname(ownerPath), relative), "utf8"),
        fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", target, "SKILL.md"), "utf8"));
      assert.equal(fs.readFileSync(path.join(installedRoot, owner, "agents", "openai.yaml"), "utf8"),
        fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", owner, "agents", "openai.yaml"), "utf8"));
    }
    const sharedPath = path.resolve(installedRoot, "agentbase-context", sharedLink);
    assert.equal(fs.readFileSync(sharedPath, "utf8"), querySkill,
      "each client must resolve the same shipped read instructions, not a checkout path");
    assert.equal(fs.readFileSync(path.join(installedRoot, "agentbase-context", "SKILL.md"), "utf8"), contextSkill);
    for (const target of ["agentbase-ingest", "agentbase-refresh", "agentbase-domain-enrichment", "agentbase-hub"]) {
      const relative = `../${target}/SKILL.md`;
      assert.ok(querySkill.includes(`](${relative})`), `repair must route to installed owner ${target}`);
      assert.equal(fs.readFileSync(path.resolve(installedRoot, "agentbase-query", relative), "utf8"),
        fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", target, "SKILL.md"), "utf8"));
    }
  }
  assert.match(querySkill, /report its `status`,\s+`published_commit`, `current_source_verified` and `reason`/i);
  assert.match(querySkill, /age alone never means stale or fresh/i);
  assert.match(querySkill, /equal is `fresh`, different is\s+`stale`/i);
  const hubSkill = fs.readFileSync(path.join(repositoryRoot, ".agents", "skills", "agentbase-hub", "SKILL.md"), "utf8");
  assert.match(hubSkill, /`list_hub_questions`/);
  assert.match(hubSkill, /`answer_hub_question`/);
  assert.deepEqual(skillNames(path.join(both.CODEX_HOME, "skills")), [...PRODUCT_SKILL_NAMES].sort());
  assert.deepEqual(skillNames(path.join(both.HOME, ".claude", "skills")), [...PRODUCT_SKILL_NAMES].sort());
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
    runProviderActivation: async () => { preparationOrder.push("provider"); },
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
    runProviderActivation: async () => { throw new Error("provider activation failed"); },
    runProductSkillInstallation: async () => { mutationAfterFailure = true; },
  }), /provider activation failed/);
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
    runDependencyInstall: async () => {}, runProviderActivation: async () => {},
  }), /accepts no arguments/);
});
