import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  loadOkfBundle, readRepositoryIdentityRecord, renderConceptDocument, resolveRepositoryIdentity,
} from "../../src/core/knowledge/index.ts";
import { createHubIdentity, hubProfileId } from "../../src/core/hub/index.ts";
import { discoverRepositorySourceState } from "../../src/app/repository-okf/index.ts";
import { activatePersistedHubConfiguration } from "../../src/app/hub-okf/configuration/configuration-file.ts";
import { resolveHubConfiguration } from "../../src/app/hub-okf/configuration/configuration.ts";
import { writeHubProfileToken } from "../../src/app/hub-okf/configuration/credential-file.ts";
import { renderHubCiBundle } from "../../src/app/hub-okf/ci/artifact.ts";
import { renderHubReadme } from "../../src/app/hub-okf/workspace/readme.ts";
import { PRODUCT_SKILL_NAMES } from "../installation/product-skills.mjs";
import { benchmarkRoot, projectRoot } from "./benchmark-paths.mjs";
import { buildCodexArgs, portableAgentText, renderAgentPrompt } from "./benchmark-agent-command.mjs";
export { buildCodexArgs, portableAgentText, renderAgentPrompt } from "./benchmark-agent-command.mjs";

const requiredTools = ["index_repository", "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept"];
const v3RequiredTools = [...requiredTools, "validate_okf_relationships"];
const v4RequiredTools = ["index_repository", "get_okf_authoring_schemas", "validate_okf_bundle"];
const v8RequiredTools = ["index_repository", "get_okf_authoring_schemas", "validate_okf_changes"];
const v13RequiredTools = [
  "get_hub_status", "configure_hub", "preflight_hub_ingest", "index_repository", "get_architecture",
  "get_okf_authoring_schemas", "prepare_hub_okf", "validate_okf_changes",
  "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
];
const v13ExactlyOnceTools = v13RequiredTools.filter((tool) => !["get_okf_authoring_schemas", "validate_okf_changes"].includes(tool));
const v13ForbiddenTools = new Set([
  "accept_hub_okf_proposal", "preview_hub_bootstrap", "bootstrap_hub",
  "submit_hub_okf_proposals", "synchronize_hub_okf", "recover_hub_okf",
]);
const v13EnabledTools = [
  ...v13RequiredTools, "search_graph", "trace_path", "get_code_snippet", "search_code",
  "search_hub_okf", "read_hub_okf_concept",
];
const initialIngestPromptVersions = new Set(["okf-author-v13", "okf-author-v14", "okf-author-v15", "okf-author-v16", "okf-author-v17", "okf-author-v18", "okf-author-v19", "okf-author-v20", "okf-author-v21", "okf-author-v22"]);
const configuredInitialIngestPromptVersions = new Set(["okf-author-v16", "okf-author-v17", "okf-author-v18", "okf-author-v19", "okf-author-v20", "okf-author-v21", "okf-author-v22"]);
const skillInitialIngestPromptVersions = new Set(["okf-author-v17", "okf-author-v18", "okf-author-v19", "okf-author-v20", "okf-author-v21", "okf-author-v22"]);
const receiptQualificationPromptVersions = new Set(["okf-author-v18", "okf-author-v19", "okf-author-v20", "okf-author-v21", "okf-author-v22"]);
const configuredInitialIngestRequiredTools = v13RequiredTools.filter((tool) => tool !== "configure_hub");
const configuredInitialIngestEnabledTools = v13EnabledTools.filter((tool) => tool !== "configure_hub");
const receiptInitialIngestRequiredTools = [
  "preflight_hub_ingest", "index_repository", "get_okf_authoring_schemas", "prepare_hub_okf",
  "validate_okf_changes", "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
];
const skillInitialIngestRequiredTools = receiptInitialIngestRequiredTools;
const skillInitialIngestEnabledTools = [
  ...skillInitialIngestRequiredTools, "search_graph", "trace_path", "get_code_snippet", "search_code",
  "index_status", "check_index_coverage", "detect_changes", "search_hub_okf", "read_hub_okf_concept",
];
const refreshPromptVersions = new Set(["okf-refresh-v1", "okf-refresh-v2", "okf-refresh-v3"]);
const refreshRequiredTools = [
  "get_hub_status", "preflight_hub_ingest", "index_repository", "get_architecture",
  "prepare_hub_okf", "validate_okf_changes", "finalize_hub_okf_proposal", "inspect_hub_okf_proposal",
];
const refreshEnabledTools = [
  ...refreshRequiredTools, "list_okf_schemas", "get_okf_schema", "search_graph", "trace_path",
  "get_code_snippet", "search_code", "search_hub_okf", "read_hub_okf_concept",
];
const batchPromptVersions = new Set(["okf-batch-ingest-v1", "okf-batch-ingest-v2", "okf-batch-ingest-v3", "okf-batch-ingest-v4"]);
const batchRequiredTools = [
  "get_hub_status", "configure_hub", "prepare_batch_hub_ingest", "confirm_batch_hub_ingest",
  "preflight_hub_ingest", "index_repository", "get_okf_authoring_schemas", "prepare_hub_okf",
  "validate_okf_changes", "record_batch_hub_ingest_member",
  "finalize_batch_hub_ingest_proposal", "inspect_hub_okf_proposal",
];
const batchEnabledTools = [
  ...batchRequiredTools, "search_graph", "trace_path", "get_code_snippet", "search_code",
  "search_hub_okf", "read_hub_okf_concept",
];

export function validateV13Lifecycle(mcpTools, guidanceAttempts = [], requireConfigure = true) {
  const guidanceCount = mcpTools.get_okf_authoring_schemas ?? 0;
  const cleanGuidance = guidanceCount === 1
    && (guidanceAttempts.length === 0 || guidanceAttempts[0]?.status === "completed");
  const correctedGuidance = guidanceCount === 2
    && guidanceAttempts[0]?.status === "failed"
    && guidanceAttempts[0]?.code === "INVALID_ARGUMENT"
    && guidanceAttempts[0]?.retryable === true
    && guidanceAttempts[1]?.status === "completed";
  return [
    ...v13ExactlyOnceTools.filter((tool) => requireConfigure || tool !== "configure_hub")
      .filter((tool) => mcpTools[tool] !== 1)
      .map((tool) => `${tool} must run exactly once; observed ${mcpTools[tool] ?? 0}`),
    ...(mcpTools.validate_okf_changes >= 1 && mcpTools.validate_okf_changes <= 2
      ? []
      : [`validate_okf_changes must run once, or twice after one repair; observed ${mcpTools.validate_okf_changes ?? 0}`]),
    ...(cleanGuidance || correctedGuidance
      ? []
      : [`get_okf_authoring_schemas must succeed once, or succeed on one correction after retryable INVALID_ARGUMENT; observed ${guidanceCount}`]),
    ...Object.keys(mcpTools).filter((tool) => v13ForbiddenTools.has(tool))
      .map((tool) => `forbidden V13 lifecycle tool observed: ${tool}`),
    ...(!requireConfigure && mcpTools.configure_hub ? ["configured Initial Ingest must not call configure_hub"] : []),
  ];
}

export function validateSkillInitialIngestLifecycle(mcpTools, guidanceAttempts = []) {
  const exactlyOnce = ["preflight_hub_ingest", "index_repository", "prepare_hub_okf", "inspect_hub_okf_proposal"];
  const guidanceCount = mcpTools.get_okf_authoring_schemas ?? 0;
  const cleanGuidance = guidanceCount === 1 && (guidanceAttempts.length === 0 || guidanceAttempts[0]?.status === "completed");
  const correctedGuidance = guidanceCount === 2 && guidanceAttempts[0]?.status === "failed"
    && guidanceAttempts[0]?.code === "INVALID_ARGUMENT" && guidanceAttempts[0]?.retryable === true
    && guidanceAttempts[1]?.status === "completed";
  return [
    ...exactlyOnce.filter((tool) => mcpTools[tool] !== 1)
      .map((tool) => `${tool} must run exactly once; observed ${mcpTools[tool] ?? 0}`),
    ...((mcpTools.finalize_hub_okf_proposal ?? 0) >= 1 && (mcpTools.finalize_hub_okf_proposal ?? 0) <= 2
      ? [] : [`finalize_hub_okf_proposal must run once, or twice after one repair; observed ${mcpTools.finalize_hub_okf_proposal ?? 0}`]),
    ...((mcpTools.validate_okf_changes ?? 0) >= 1 && (mcpTools.validate_okf_changes ?? 0) <= 2
      ? [] : [`validate_okf_changes must run once, or twice after one repair; observed ${mcpTools.validate_okf_changes ?? 0}`]),
    ...(cleanGuidance || correctedGuidance ? []
      : [`get_okf_authoring_schemas must freeze one Receipt after at most one input correction; observed ${guidanceCount}`]),
    ...["get_hub_status", "configure_hub", ...v13ForbiddenTools].filter((tool) => mcpTools[tool])
      .map((tool) => `forbidden skill-backed Initial Ingest tool observed: ${tool}`),
  ];
}

function toolResultObjects(item) {
  const values = [];
  if (item?.result?.structured_content && typeof item.result.structured_content === "object") {
    values.push(item.result.structured_content);
  }
  for (const block of item?.result?.content ?? []) {
    if (block?.type !== "text" || typeof block.text !== "string") continue;
    try {
      const parsed = JSON.parse(block.text);
      if (parsed && typeof parsed === "object") values.push(parsed);
    } catch { /* Provider prose is not qualification evidence. */ }
  }
  return values;
}

function compactDiscoverySeed(seed) {
  if (!seed || typeof seed !== "object") return null;
  return {
    id: seed.id ?? null,
    state: seed.state ?? null,
    sourceCommit: seed.source?.commit ?? null,
    groups: Array.isArray(seed.groups) ? seed.groups.map((group) => ({
      id: group?.id ?? null,
      lane: group?.lane ?? null,
      priority: group?.priority ?? null,
      kind: group?.kind ?? null,
      sourcePaths: Array.isArray(group?.sources)
        ? [...new Set(group.sources.map((source) => source?.path).filter((value) => typeof value === "string"))].sort()
        : [],
    })) : [],
  };
}

export function validateReceiptDiscoveryLifecycle(discovery, expectedChecks = [], expectedCommit = null) {
  const failures = [];
  const seed = discovery?.seed;
  const inventory = discovery?.inventory;
  if (!seed || seed.state !== "ready" || !/^discovery-seed-[a-f0-9]{24}$/.test(seed.id ?? "")) {
    failures.push("index_repository did not return one ready Discovery Seed");
  }
  if (expectedCommit && seed?.sourceCommit !== expectedCommit) {
    failures.push(`Discovery Seed source revision differs from the pinned fixture: ${seed?.sourceCommit ?? "unavailable"}`);
  }
  if (!inventory || inventory.seedId !== seed?.id) {
    failures.push("successful guidance Inventory does not bind the observed Discovery Seed");
  }
  const inventoryItems = inventory?.items ?? [];
  const allowedOutcomes = new Set(["materialized", "question", "ignored"]);
  const outcomes = new Map(inventoryItems.map((item) => [item.originGroupId, item.outcome]));
  for (const item of inventoryItems) {
    if (!allowedOutcomes.has(item.outcome)) {
      failures.push(`Inventory item has an unsupported outcome: ${item.originGroupId ?? "unknown"}`);
    }
  }
  for (const group of seed?.groups ?? []) {
    if (group.priority === "p0" && !outcomes.has(group.id)) {
      failures.push(`P0 discovery group lacks an Inventory outcome: ${group.id}`);
    }
  }
  for (const check of expectedChecks) {
    const group = (seed?.groups ?? []).find((candidate) => candidate.lane === check.lane
      && (!check.priority || candidate.priority === check.priority)
      && candidate.sourcePaths.includes(check.sourcePath));
    if (!group) {
      failures.push(`representative ${check.lane} source did not enter the Seed: ${check.sourcePath}`);
    } else if (!outcomes.has(group.id)) {
      failures.push(`representative Seed group lacks a proposal outcome: ${group.id}`);
    }
  }
  if (!/^discovery-receipt-[a-f0-9]{24}$/.test(discovery?.receiptId ?? "")) {
    failures.push("successful guidance did not return one Discovery Receipt");
  }
  if (discovery?.prepareReceiptId !== discovery?.receiptId) {
    failures.push("Prepare did not consume the exact frozen Discovery Receipt");
  }
  return [...new Set(failures)];
}

export function validateRefreshLifecycle(mcpTools) {
  const exactlyOnce = refreshRequiredTools.filter((tool) => tool !== "validate_okf_changes");
  const forbidden = ["configure_hub", "accept_hub_okf_proposal", "submit_hub_okf_proposals",
    "synchronize_hub_okf", "bootstrap_hub", "preview_hub_bootstrap"];
  return [
    ...exactlyOnce.filter((tool) => mcpTools[tool] !== 1)
      .map((tool) => `${tool} must run exactly once; observed ${mcpTools[tool] ?? 0}`),
    ...(mcpTools.validate_okf_changes >= 1 && mcpTools.validate_okf_changes <= 2
      ? [] : [`validate_okf_changes must run once, or twice after one repair; observed ${mcpTools.validate_okf_changes ?? 0}`]),
    ...forbidden.filter((tool) => mcpTools[tool])
      .map((tool) => `forbidden Refresh lifecycle tool observed: ${tool}`),
  ];
}

export function validateBatchLifecycle(mcpTools, memberCount) {
  const once = ["get_hub_status", "configure_hub", "prepare_batch_hub_ingest",
    "confirm_batch_hub_ingest", "finalize_batch_hub_ingest_proposal", "inspect_hub_okf_proposal"];
  const perMember = ["preflight_hub_ingest", "index_repository", "prepare_hub_okf", "record_batch_hub_ingest_member"];
  const forbidden = ["finalize_hub_okf_proposal", "accept_hub_okf_proposal",
    "submit_hub_okf_proposals", "synchronize_hub_okf", "bootstrap_hub", "preview_hub_bootstrap",
    "prepare_domain_enrichment", "run_domain_enrichment"];
  return [
    ...once.filter((tool) => mcpTools[tool] !== 1)
      .map((tool) => `${tool} must run exactly once; observed ${mcpTools[tool] ?? 0}`),
    ...perMember.filter((tool) => mcpTools[tool] !== memberCount)
      .map((tool) => `${tool} must run once per member; observed ${mcpTools[tool] ?? 0}/${memberCount}`),
    ...(mcpTools.get_okf_authoring_schemas >= memberCount && mcpTools.get_okf_authoring_schemas <= memberCount * 2
      ? [] : [`get_okf_authoring_schemas must succeed directly or after one correction per member; observed ${mcpTools.get_okf_authoring_schemas ?? 0}`]),
    ...(mcpTools.validate_okf_changes >= memberCount && mcpTools.validate_okf_changes <= memberCount * 2
      ? [] : [`validate_okf_changes must run one or two times per member; observed ${mcpTools.validate_okf_changes ?? 0}`]),
    ...forbidden.filter((tool) => mcpTools[tool])
      .map((tool) => `forbidden Batch Init lifecycle tool observed: ${tool}`),
  ];
}
const authoringTools = new Set([
  "list_okf_schemas", "select_okf_schemas", "get_okf_schema", "validate_okf_concept", "validate_okf_relationships",
  "get_okf_authoring_schemas", "validate_okf_bundle", "validate_okf_changes",
]);

export function benchmarkProvenanceRepositoryId(source, promptVersion) {
  if (!initialIngestPromptVersions.has(promptVersion)) return source.repositoryId;
  const resolution = resolveRepositoryIdentity({
    displayName: source.displayName,
    remotes: source.identityHints.remotes,
    rootCommits: source.identityHints.rootCommits,
  }, []);
  if (resolution.kind !== "new") throw new Error("isolated Initial Ingest repository identity must be new");
  return resolution.repository.id;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function directoryDigest(root) {
  const hash = createHash("sha256");
  const visit = (directory, relative = "") => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(directory, entry.name);
      const next = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) {
        hash.update(`d\0${next}\0`);
        visit(absolute, next);
      } else if (entry.isFile()) {
        hash.update(`f\0${next}\0`);
        hash.update(fs.readFileSync(absolute));
        hash.update("\0");
      } else throw new Error(`benchmark skill entry is unsafe: ${absolute}`);
    }
  };
  visit(root);
  return `sha256:${hash.digest("hex")}`;
}

function installBenchmarkProductSkills(workspace) {
  const targetRoot = path.join(workspace, ".agents", "skills");
  fs.mkdirSync(targetRoot, { recursive: true });
  return Object.fromEntries(PRODUCT_SKILL_NAMES.map((name) => {
    const source = path.join(projectRoot, ".agents", "skills", name);
    const target = path.join(targetRoot, name);
    if (!fs.existsSync(path.join(source, "SKILL.md"))) throw new Error(`released product skill is unavailable: ${name}`);
    fs.cpSync(source, target, { recursive: true, errorOnExist: true, force: false });
    return [name, directoryDigest(target)];
  }));
}

function validateBenchmarkProductSkills(workspace, expected) {
  for (const [name, digest] of Object.entries(expected)) {
    const target = path.join(workspace, ".agents", "skills", name);
    if (!fs.existsSync(target) || directoryDigest(target) !== digest) {
      throw new Error(`released product skill changed during benchmark: ${name}`);
    }
  }
}

function gitSync(root, args, commitTimestamp) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", env: {
    ...process.env,
    ...(commitTimestamp ? { GIT_AUTHOR_DATE: commitTimestamp, GIT_COMMITTER_DATE: commitTimestamp } : {}),
  } });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function seedInitialIngestHub(runtimeRoot, token) {
  const hub = createHubIdentity("agentbase-benchmark/isolated-hub", "main");
  const localHubId = hubProfileId(hub);
  const root = path.join(runtimeRoot, "data", "agentbase-mcp", "hubs", localHubId);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  gitSync(root, ["init", "--initial-branch=main"]);
  fs.writeFileSync(path.join(root, "README.md"), renderHubReadme());
  fs.writeFileSync(path.join(root, "index.md"), "---\nokf_version: \"0.2\"\n---\n\n# AgentBase-Hub\n");
  const ci = renderHubCiBundle();
  for (const [relative, bytes] of Object.entries(ci.files)) {
    const target = path.join(root, ...relative.split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { mode: relative.endsWith(".mjs") ? 0o755 : 0o644 });
  }
  gitSync(root, ["add", "README.md", "index.md", ...Object.keys(ci.files)]);
  gitSync(root, ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit",
    "--no-gpg-sign", "--no-verify", "-m", `Initialize isolated benchmark Hub\n\nAgentBase-Hub-Kind: base\nAgentBase-Hub-ID: ${localHubId}\nAgentBase-Hub-Format: 1`],
  "2026-08-24T00:00:00Z");
  const baseCommit = gitSync(root, ["rev-parse", "HEAD"]);
  gitSync(root, ["remote", "add", "origin", hub.canonicalHttpsUrl]);
  gitSync(root, ["update-ref", "refs/agentbase/published", baseCommit]);
  const environment = { ...process.env, HOME: path.join(runtimeRoot, "home"), AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"),
    XDG_CONFIG_HOME: path.join(runtimeRoot, "config"), XDG_DATA_HOME: path.join(runtimeRoot, "data") };
  activatePersistedHubConfiguration({ formatVersion: 1, kind: "remote", localHubId, localRoot: root,
    baseCommit, catalogVersion: "7.0.0", host: hub.host, repository: hub.repository,
    targetBranch: hub.targetBranch }, environment, null);
  writeHubProfileToken(localHubId, token, environment);
}

function qualificationHubToken(host) {
  const configuration = resolveHubConfiguration(process.env);
  if (configuration.kind !== "remote" || configuration.host !== host || !configuration.token) {
    throw new Error(`released-skill qualification requires the configured AgentBase Hub token for ${host}`);
  }
  return configuration.token;
}

function createRefreshSource(repository, entry) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-source-"));
  fs.cpSync(repository, root, { recursive: true });
  const mutations = entry.mutations ?? [entry.mutation];
  if (!mutations.length || mutations.length > 8 || mutations.some((mutation) => !mutation)) {
    throw new Error("refresh requires between one and eight source mutations");
  }
  for (const mutation of mutations) {
    const target = path.join(root, ...mutation.path.split("/"));
    const before = fs.readFileSync(target, "utf8");
    const count = before.split(mutation.from).length - 1;
    if (count !== mutation.count) {
      throw new Error(`${mutation.path}: refresh mutation expected ${mutation.count} matches, found ${count}`);
    }
    fs.writeFileSync(target, before.split(mutation.from).join(mutation.to));
  }
  gitSync(root, ["add", "--", ...mutations.map((mutation) => mutation.path)]);
  gitSync(root, ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost",
    "commit", "--no-gpg-sign", "--no-verify", "-m", "Benchmark refresh source change"], new Date().toISOString());
  return root;
}

function seedRefreshHub(runtimeRoot, entry) {
  const localHubId = createHash("sha256").update(`refresh\0${entry.repositoryId}`).digest("hex").slice(0, 24);
  const root = path.join(runtimeRoot, "data", "agentbase-mcp", "hubs", localHubId);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  gitSync(root, ["init", "--initial-branch=main"]);
  fs.writeFileSync(path.join(root, "README.md"), "# AgentBase-Hub\n");
  fs.writeFileSync(path.join(root, "index.md"), "---\nokf_version: \"0.2\"\n---\n\n# AgentBase-Hub\n");
  gitSync(root, ["add", "README.md", "index.md"]);
  gitSync(root, ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit",
    "--no-gpg-sign", "--no-verify", "-m", `Initialize AgentBase-Hub base\n\nAgentBase-Hub-Kind: base\nAgentBase-Hub-ID: ${localHubId}\nAgentBase-Hub-Format: 1`],
  "2026-08-22T00:00:00Z");
  const baseCommit = gitSync(root, ["rev-parse", "HEAD"]);
  for (const item of fs.readdirSync(root)) if (item !== ".git") fs.rmSync(path.join(root, item), { recursive: true, force: true });
  fs.cpSync(path.resolve(projectRoot, entry.baseline), root, { recursive: true });
  const bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  const repository = [...bundle.concepts.values()].find((concept) => readRepositoryIdentityRecord(concept)?.id === entry.repositoryId);
  if (!repository) throw new Error("refresh baseline lacks its canonical Repository concept");
  const frontmatter = structuredClone(repository.frontmatter);
  frontmatter.agentbase.repository.observed_source = {
    commit: entry.commit, dirty: false, dirty_digest: null, observed_at: "2026-08-22T00:00:01Z",
  };
  fs.writeFileSync(path.join(root, repository.path), renderConceptDocument({ ...repository, frontmatter }));
  loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  gitSync(root, ["add", "--all"]);
  const proposalId = createHash("sha256").update(`refresh-baseline\0${entry.repositoryId}`).digest("hex").slice(0, 24);
  gitSync(root, ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit",
    "--no-gpg-sign", "--no-verify", "-m", `Seed Refresh benchmark baseline\n\nAgentBase-Proposal-ID: ${proposalId}\nAgentBase-Subject: ${entry.subjectDirectory}\nAgentBase-Source-ID: ${entry.repositoryId}\nAgentBase-Evidence-Digest: sha256:${"1".repeat(64)}\nAgentBase-Diff-Digest: sha256:${"2".repeat(64)}\nAgentBase-Schema-Catalog: 7.0.0`],
  "2026-08-22T00:00:01Z");
  const configuration = {
    formatVersion: 1, kind: "local-only", localHubId, localRoot: root, baseCommit, catalogVersion: "7.0.0",
  };
  const configDirectory = path.join(runtimeRoot, "agentbase", "config", "hub");
  fs.mkdirSync(configDirectory, { recursive: true, mode: 0o700 });
  fs.writeFileSync(path.join(configDirectory, "hub.json"), `${JSON.stringify(configuration, null, 2)}\n`, { mode: 0o600 });
}

function materializeRefreshOutput(runtimeRoot, workspace) {
  const proposals = path.join(runtimeRoot, "agentbase", "state", "hub-runtime", "proposals");
  const entries = fs.existsSync(proposals) ? fs.readdirSync(proposals).filter((entry) => /^[a-f0-9]{24}$/.test(entry)) : [];
  if (entries.length !== 1) throw new Error(`Refresh must finalize exactly one proposal; observed ${entries.length}`);
  fs.cpSync(path.join(proposals, entries[0], "bundle"), path.join(workspace, "okf"), { recursive: true });
}

export function validateRefreshKnowledge(workspace, entry) {
  if (!entry.expectedOkf) return;
  const file = path.join(workspace, "okf", ...entry.expectedOkf.path.split("/"));
  if (!fs.existsSync(file)) throw new Error(`Refresh expected OKF path is missing: ${entry.expectedOkf.path}`);
  const content = fs.readFileSync(file, "utf8");
  const missing = entry.expectedOkf.includes.filter((value) => !content.includes(value));
  const retained = entry.expectedOkf.excludes.filter((value) => content.includes(value));
  if (missing.length || retained.length) {
    throw new Error(`Refresh knowledge mismatch: missing [${missing.join(", ")}]; retained [${retained.join(", ")}]`);
  }
}

function token(value) {
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function serializedBytes(value) {
  const serialized = JSON.stringify(value);
  return serialized === undefined ? 0 : Buffer.byteLength(serialized);
}

function toolError(item) {
  try {
    const text = item?.result?.content?.find((entry) => entry?.type === "text")?.text;
    const parsed = typeof text === "string" ? JSON.parse(text) : {};
    return { code: parsed.code ?? null, retryable: parsed.retryable === true, error: parsed.error ?? null };
  } catch {
    return { code: null, retryable: false, error: null };
  }
}

export function summarizeAgentEvents(events) {
  const completed = new Set();
  let mcpToolCalls = 0;
  let commandExecutions = 0;
  let authoringToolCalls = 0;
  let authoringArgumentBytes = 0;
  let authoringResultBytes = 0;
  const authoringActivity = {};
  const mcpTools = {};
  const guidanceAttempts = [];
  const discovery = { seed: null, inventory: null, receiptId: null, prepareReceiptId: null };
  let usage = null;
  let finalValidationIdentities = null;
  for (const line of events.split("\n")) {
    try {
      const event = JSON.parse(line);
      const item = event?.item;
      if (event?.type === "item.completed") {
        if (item?.type === "mcp_tool_call" && typeof item?.tool === "string") {
          if (item.status === "completed") completed.add(item.tool);
          mcpToolCalls += 1;
          mcpTools[item.tool] = (mcpTools[item.tool] ?? 0) + 1;
          if (item.tool === "get_okf_authoring_schemas") {
            guidanceAttempts.push({ status: item.status, ...toolError(item) });
            if (item.status === "completed") {
              const inventory = item.arguments?.discovery_inventory;
              if (inventory && typeof inventory === "object") {
                discovery.inventory = {
                  seedId: inventory.seed_id ?? null,
                  items: Array.isArray(inventory.items) ? inventory.items.map((inventoryItem) => ({
                    originGroupId: inventoryItem?.origin_group_id ?? null,
                    outcome: inventoryItem?.outcome ?? null,
                  })) : [],
                };
              }
              for (const value of toolResultObjects(item)) {
                if (typeof value.discovery_receipt_id === "string") discovery.receiptId = value.discovery_receipt_id;
              }
            }
          }
          if (item.tool === "index_repository" && item.status === "completed") {
            for (const value of toolResultObjects(item)) {
              const seed = compactDiscoverySeed(value.agentbase_discovery_seed);
              if (seed) discovery.seed = seed;
            }
          }
          if (item.tool === "prepare_hub_okf" && item.status === "completed"
            && typeof item.arguments?.discovery_receipt_id === "string") {
            discovery.prepareReceiptId = item.arguments.discovery_receipt_id;
          }
          if (authoringTools.has(item.tool)) {
            const argumentBytes = serializedBytes(item.arguments);
            const resultBytes = serializedBytes(item.result);
            const prior = authoringActivity[item.tool] ?? { calls: 0, argumentBytes: 0, resultBytes: 0 };
            authoringActivity[item.tool] = {
              calls: prior.calls + 1,
              argumentBytes: prior.argumentBytes + argumentBytes,
              resultBytes: prior.resultBytes + resultBytes,
            };
            authoringToolCalls += 1;
            authoringArgumentBytes += argumentBytes;
            authoringResultBytes += resultBytes;
          }
          if (item.tool === "validate_okf_changes" && item.status === "completed" && Array.isArray(item.arguments?.changes)) {
            finalValidationIdentities = item.arguments.changes.map((change) => change?.identity)
              .filter((identity) => typeof identity === "string").sort();
          }
        }
        if (item?.type === "command_execution") commandExecutions += 1;
      }
      if (event?.type === "turn.completed" && event.usage && typeof event.usage === "object") {
        const inputTokens = token(event.usage.input_tokens);
        const cachedInputTokens = token(event.usage.cached_input_tokens);
        usage = {
          inputTokens,
          cachedInputTokens,
          cacheWriteInputTokens: token(event.usage.cache_write_input_tokens),
          uncachedInputTokens: inputTokens !== null && cachedInputTokens !== null && inputTokens >= cachedInputTokens
            ? inputTokens - cachedInputTokens : null,
          outputTokens: token(event.usage.output_tokens),
          reasoningOutputTokens: token(event.usage.reasoning_output_tokens),
        };
      }
    } catch { /* Preserve malformed trace for diagnostics; it cannot prove tool success. */ }
  }
  return {
    usage,
    activity: {
      mcpToolCalls,
      commandExecutions,
      authoringToolCalls,
      authoringArgumentBytes,
      authoringResultBytes,
      authoringTools: Object.fromEntries(Object.entries(authoringActivity).sort(([left], [right]) => left.localeCompare(right))),
      mcpTools: Object.fromEntries(Object.entries(mcpTools).sort(([left], [right]) => left.localeCompare(right))),
      guidance: {
        attempts: guidanceAttempts,
        inputCorrectionsUsed: Math.max(0, guidanceAttempts.length - 1),
        firstAttemptSucceeded: guidanceAttempts[0]?.status === "completed",
      },
      observedSourceReadBytes: null,
      limitation: "event trace does not prove complete source-read volume",
      finalValidationIdentities,
      discovery,
    },
    completedTools: [...completed].sort(),
  };
}

function conceptIdentities(root) {
  const identities = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && entry.name.endsWith(".md") && !["index.md", "log.md", "README.md"].includes(entry.name)) {
        identities.push(path.relative(root, absolute).split(path.sep).join("/").slice(0, -3));
      }
    }
  };
  visit(root);
  return identities.sort();
}

export function validateFinalChangeCoverage(validatedIdentities, finalizedIdentities) {
  if (!Array.isArray(validatedIdentities)) return ["final successful validate_okf_changes identities are unavailable"];
  const validated = new Set(validatedIdentities);
  const authoredIdentities = finalizedIdentities.filter((identity) => !identity.startsWith("questions/"));
  const missing = authoredIdentities.filter((identity) => !validated.has(identity));
  const extra = validatedIdentities.filter((identity) => !authoredIdentities.includes(identity));
  return [
    ...(missing.length ? [`final validate_okf_changes omitted finalized concepts: ${missing.join(", ")}`] : []),
    ...(extra.length ? [`final validate_okf_changes included non-finalized concepts: ${extra.join(", ")}`] : []),
  ];
}

function toolUsage(completedTools, arm, promptVersion) {
  if (arm === "direct") return {};
  const completed = new Set(completedTools);
  const required = batchPromptVersions.has(promptVersion) ? batchRequiredTools
    : refreshPromptVersions.has(promptVersion) ? refreshRequiredTools
    : ["okf-author-v8", "okf-author-v9", "okf-author-v10", "okf-author-v11", "okf-author-v12"].includes(promptVersion)
    ? v8RequiredTools
    : skillInitialIngestPromptVersions.has(promptVersion) ? skillInitialIngestRequiredTools
    : configuredInitialIngestPromptVersions.has(promptVersion) ? configuredInitialIngestRequiredTools
    : initialIngestPromptVersions.has(promptVersion) ? v13RequiredTools
    : ["okf-author-v4", "okf-author-v5", "okf-author-v6", "okf-author-v7"].includes(promptVersion)
      ? v4RequiredTools
      : promptVersion === "okf-author-v3" ? v3RequiredTools : requiredTools;
  return Object.fromEntries(required.map((tool) => [tool, completed.has(tool)]));
}

export function requiredToolFailures(usage, observedTools) {
  return Object.entries(usage).filter(([, used]) => !used).map(([tool]) => observedTools[tool]
    ? `required MCP tool did not complete successfully: ${tool}`
    : `required MCP tool not observed: ${tool}`);
}

function validateAgentWorkspace(workspace, allowInstalledSkills = false) {
  const entries = fs.readdirSync(workspace).sort();
  const expected = allowInstalledSkills ? [".agents", "okf"] : ["okf"];
  if (JSON.stringify(entries) !== JSON.stringify(expected)) {
    const requirement = allowInstalledSkills ? "exactly .agents/ and okf/" : "only okf/";
    throw new Error(`agent workspace must contain ${requirement}, found: ${entries.join(", ") || "nothing"}`);
  }
  if (!fs.statSync(path.join(workspace, "okf")).isDirectory()) throw new Error("agent output okf is not a directory");
}

export function runAgentRepository({
  manifest, entry, repository, root, executable = manifest.agent.executable, arm = "mcp",
}) {
  if (!["mcp", "direct"].includes(arm)) throw new Error(`unknown benchmark arm: ${arm}`);
  const version = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  const actualVersion = version.status === 0 ? version.stdout.trim() : "";
  if (actualVersion !== manifest.agent.version) {
    throw new Error(`${entry.id}: expected ${manifest.agent.version}, found ${actualVersion || "unavailable"}`);
  }
  fs.mkdirSync(root, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-benchmark-"));
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-runtime-"));
  const runtimeTmp = path.join(runtimeRoot, "tmp");
  fs.mkdirSync(path.join(runtimeRoot, "home"));
  fs.mkdirSync(runtimeTmp, { mode: 0o700 });
  const skillDigests = arm === "mcp" && skillInitialIngestPromptVersions.has(manifest.promptVersion)
    ? installBenchmarkProductSkills(workspace) : null;
  const isRefresh = refreshPromptVersions.has(manifest.promptVersion);
  if (arm === "mcp" && configuredInitialIngestPromptVersions.has(manifest.promptVersion)) {
    seedInitialIngestHub(runtimeRoot, qualificationHubToken("github.com"));
  }
  const sourceRepository = isRefresh ? createRefreshSource(repository, entry) : repository;
  if (isRefresh) seedRefreshHub(runtimeRoot, entry);
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const source = discoverRepositorySourceState(sourceRepository, startedAt);
  const promptVersion = arm === "direct"
    ? (manifest.directPromptVersion ?? "okf-author-direct-v1")
    : manifest.promptVersion;
  const template = fs.readFileSync(path.join(benchmarkRoot(), "prompts", `${promptVersion}.md`), "utf8");
  const prompt = renderAgentPrompt(template, {
    SOURCE_ROOT: sourceRepository,
    OUTPUT_ROOT: workspace,
    REPOSITORY_ID: entry.repositoryId ?? source.repositoryId,
    CATALOG_VERSION: manifest.catalogVersion,
    CONFIRMED_DOMAIN: entry.confirmedDomain
      ? `${entry.confirmedDomain.title} (${entry.confirmedDomain.identity}); evidence ${entry.confirmedDomain.evidenceResource}`
      : "None; do not infer a Domain from repository or product names",
    SUBJECT_DIRECTORY: entry.subjectDirectory ?? "",
  });
  const portablePrompt = renderAgentPrompt(template, {
    SOURCE_ROOT: "<SOURCE_ROOT>",
    OUTPUT_ROOT: "<OUTPUT_ROOT>",
    REPOSITORY_ID: entry.repositoryId ?? source.repositoryId,
    CATALOG_VERSION: manifest.catalogVersion,
    CONFIRMED_DOMAIN: entry.confirmedDomain
      ? `${entry.confirmedDomain.title} (${entry.confirmedDomain.identity}); evidence ${entry.confirmedDomain.evidenceResource}`
      : "None; do not infer a Domain from repository or product names",
    SUBJECT_DIRECTORY: entry.subjectDirectory ?? "",
  });
  const promptFile = path.join(root, "prompt.md");
  const eventsFile = path.join(root, "agent-events.jsonl");
  const finalMessage = path.join(root, "agent-final.md");
  fs.writeFileSync(promptFile, portablePrompt);
  const run = {
    suite: manifest.suite,
    repository: entry.id,
    arm,
    kind: entry.kind,
    fixturePath: entry.path,
    fixtureCommit: entry.commit,
    sourceRepositoryId: source.repositoryId,
    provenanceRepositoryId: entry.repositoryId ?? benchmarkProvenanceRepositoryId(source, promptVersion),
    ...(isRefresh ? { baselineCommit: entry.commit, sourceCommit: source.commit } : {}),
    catalogVersion: manifest.catalogVersion,
    promptVersion,
    promptDigest: `sha256:${createHash("sha256").update(portablePrompt).digest("hex")}`,
    ...(skillDigests ? { productSkills: skillDigests } : {}),
    agent: { ...manifest.agent, executable, actualVersion },
    startedAt,
    completedAt: null,
    outcome: "running",
  };
  writeJson(path.join(root, "run.json"), run);
  const args = buildCodexArgs({
    workspace, finalMessage, model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort, arm, runtimeRoot,
    ...(skillInitialIngestPromptVersions.has(promptVersion) ? { enabledTools: skillInitialIngestEnabledTools }
      : configuredInitialIngestPromptVersions.has(promptVersion) ? { enabledTools: configuredInitialIngestEnabledTools }
      : initialIngestPromptVersions.has(promptVersion) ? { enabledTools: v13EnabledTools }
      : isRefresh ? { enabledTools: refreshEnabledTools } : {}),
  });
  const result = spawnSync(executable, args, {
    cwd: projectRoot,
    input: prompt,
    encoding: "utf8",
    timeout: manifest.agent.timeoutMs,
    maxBuffer: 50 * 1024 * 1024,
    env: {
      ...process.env,
      TMPDIR: runtimeTmp,
      AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"),
      XDG_CONFIG_HOME: path.join(runtimeRoot, "config"),
      XDG_DATA_HOME: path.join(runtimeRoot, "data"),
    },
  });
  const portable = (value) => portableAgentText(value, { repository: sourceRepository, workspace, runtimeRoot });
  fs.writeFileSync(eventsFile, portable(result.stdout || ""));
  if (fs.existsSync(finalMessage)) fs.writeFileSync(finalMessage, portable(fs.readFileSync(finalMessage, "utf8")));
  if (result.stderr) fs.writeFileSync(path.join(root, "agent-stderr.txt"), portable(result.stderr.slice(0, 1024 * 1024)));
  const summary = summarizeAgentEvents(result.stdout || "");
  let failure;
  try {
    const after = discoverRepositorySourceState(sourceRepository);
    if (after.commit !== source.commit || after.dirty !== source.dirty || after.dirtyDigest !== source.dirtyDigest) {
      throw new Error("source repository changed during agent run");
    }
    if (result.status !== 0) throw new Error(`agent exited ${result.status ?? `by ${result.signal ?? "timeout"}`}`);
    if (isRefresh) {
      materializeRefreshOutput(runtimeRoot, workspace);
      validateRefreshKnowledge(workspace, entry);
    }
    if (skillDigests) validateBenchmarkProductSkills(workspace, skillDigests);
    validateAgentWorkspace(workspace, Boolean(skillDigests));
    const coverageFailures = initialIngestPromptVersions.has(promptVersion)
      ? validateFinalChangeCoverage(summary.activity.finalValidationIdentities, conceptIdentities(path.join(workspace, "okf"))) : [];
    if (coverageFailures.length) throw new Error(coverageFailures.join("; "));
    fs.cpSync(path.join(workspace, "okf"), path.join(root, "okf"), { recursive: true });
  } catch (error) {
    failure = error instanceof Error ? error.message : "unknown agent failure";
  }
  const usage = toolUsage(summary.completedTools, arm, promptVersion);
  const v13LifecycleFailures = skillInitialIngestPromptVersions.has(promptVersion)
    ? validateSkillInitialIngestLifecycle(summary.activity.mcpTools, summary.activity.guidance.attempts)
    : initialIngestPromptVersions.has(promptVersion)
      ? validateV13Lifecycle(summary.activity.mcpTools, summary.activity.guidance.attempts,
        !configuredInitialIngestPromptVersions.has(promptVersion)) : [];
  const refreshLifecycleFailures = refreshPromptVersions.has(promptVersion)
    ? validateRefreshLifecycle(summary.activity.mcpTools) : [];
  const discoveryChecks = receiptQualificationPromptVersions.has(promptVersion)
    ? JSON.parse(fs.readFileSync(path.join(manifest.root, entry.expectation), "utf8")).discoveryChecks ?? [] : [];
  const discoveryLifecycleFailures = receiptQualificationPromptVersions.has(promptVersion)
    ? validateReceiptDiscoveryLifecycle(summary.activity.discovery, discoveryChecks, entry.commit) : [];
  const directMcpFailure = arm === "direct" && summary.activity.mcpToolCalls
    ? ["direct arm unexpectedly observed MCP tool calls"] : [];
  const completed = {
    ...run,
    completedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedMs,
    outcome: failure ? "failed" : "succeeded",
    process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? null },
    usage: summary.usage,
    activity: summary.activity,
    discoveryQualification: receiptQualificationPromptVersions.has(promptVersion) ? {
      status: discoveryLifecycleFailures.length ? "failed" : "passed",
      representativeChecks: discoveryChecks,
      failures: discoveryLifecycleFailures,
    } : null,
    requiredToolUsage: usage,
    failures: [
      ...(failure ? [failure] : []),
      ...directMcpFailure,
      ...requiredToolFailures(usage, summary.activity.mcpTools),
      ...v13LifecycleFailures,
      ...refreshLifecycleFailures,
      ...discoveryLifecycleFailures,
    ],
  };
  if (completed.failures.length) completed.outcome = "failed";
  writeJson(path.join(root, "run.json"), completed);
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.rmSync(runtimeRoot, { recursive: true, force: true });
  if (isRefresh) fs.rmSync(sourceRepository, { recursive: true, force: true });
  return completed;
}

function batchProposalRoot(runtimeRoot) {
  const proposals = path.join(runtimeRoot, "agentbase", "state", "hub-runtime", "proposals");
  const entries = fs.existsSync(proposals)
    ? fs.readdirSync(proposals).filter((entry) => /^[a-f0-9]{24}$/.test(entry)) : [];
  if (entries.length !== 1) throw new Error(`Batch Init must finalize exactly one proposal; observed ${entries.length}`);
  return path.join(proposals, entries[0]);
}

export function runAgentBatch({ manifest, repositories, root, executable = manifest.agent.executable }) {
  if (manifest.workflow !== "batch-initial-ingest" || repositories.length !== manifest.repositories.length
    || repositories.length < 2) throw new Error("batch benchmark manifest or fixtures are invalid");
  const version = spawnSync(executable, ["--version"], { encoding: "utf8", timeout: 10_000 });
  const actualVersion = version.status === 0 ? version.stdout.trim() : "";
  if (actualVersion !== manifest.agent.version) {
    throw new Error(`expected ${manifest.agent.version}, found ${actualVersion || "unavailable"}`);
  }
  fs.mkdirSync(root, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-batch-benchmark-"));
  const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-okf-batch-runtime-"));
  const runtimeTmp = path.join(runtimeRoot, "tmp");
  fs.mkdirSync(path.join(runtimeRoot, "home"));
  fs.mkdirSync(runtimeTmp, { mode: 0o700 });
  const startedAt = new Date().toISOString(), startedMs = Date.now();
  const sources = repositories.map((repository, index) => {
    const source = discoverRepositorySourceState(repository, startedAt);
    return { entry: manifest.repositories[index], repository, source,
      repositoryId: benchmarkProvenanceRepositoryId(source, "okf-author-v15") };
  });
  const template = fs.readFileSync(path.join(benchmarkRoot(), "prompts", `${manifest.promptVersion}.md`), "utf8");
  const domain = `${manifest.confirmedDomain.title} (${manifest.confirmedDomain.identity}); evidence ${manifest.confirmedDomain.evidenceResource}`;
  const values = { OUTPUT_ROOT: workspace, CATALOG_VERSION: manifest.catalogVersion, CONFIRMED_DOMAIN: domain };
  const portableValues = { ...values, OUTPUT_ROOT: "<OUTPUT_ROOT>" };
  sources.forEach((item, index) => {
    values[`SOURCE_${index + 1}_ROOT`] = item.repository;
    values[`REPOSITORY_${index + 1}_ID`] = item.repositoryId;
    portableValues[`SOURCE_${index + 1}_ROOT`] = `<SOURCE_${index + 1}_ROOT>`;
    portableValues[`REPOSITORY_${index + 1}_ID`] = item.repositoryId;
  });
  const prompt = renderAgentPrompt(template, values), portablePrompt = renderAgentPrompt(template, portableValues);
  const eventsFile = path.join(root, "agent-events.jsonl"), finalMessage = path.join(root, "agent-final.md");
  fs.writeFileSync(path.join(root, "prompt.md"), portablePrompt);
  const run = {
    suite: manifest.suite, workflow: manifest.workflow, promptVersion: manifest.promptVersion,
    promptDigest: `sha256:${createHash("sha256").update(portablePrompt).digest("hex")}`,
    catalogVersion: manifest.catalogVersion, confirmedDomain: manifest.confirmedDomain,
    fixtures: sources.map((item) => ({ id: item.entry.id, path: item.entry.path, commit: item.source.commit,
      sourceRepositoryId: item.source.repositoryId, provenanceRepositoryId: item.repositoryId })),
    agent: { ...manifest.agent, executable, actualVersion }, startedAt, completedAt: null, outcome: "running",
  };
  writeJson(path.join(root, "run.json"), run);
  const result = spawnSync(executable, buildCodexArgs({ workspace, finalMessage,
    model: manifest.agent.model, reasoningEffort: manifest.agent.reasoningEffort,
    runtimeRoot, enabledTools: batchEnabledTools }), {
    cwd: projectRoot, input: prompt, encoding: "utf8", timeout: manifest.agent.timeoutMs,
    maxBuffer: 50 * 1024 * 1024,
    env: { ...process.env, TMPDIR: runtimeTmp, AGENTBASE_HOME: path.join(runtimeRoot, "agentbase"), XDG_CONFIG_HOME: path.join(runtimeRoot, "config"),
      XDG_DATA_HOME: path.join(runtimeRoot, "data") },
  });
  const portable = (value) => sources.reduce((text, item, index) => text.split(item.repository)
    .join(`<SOURCE_${index + 1}_ROOT>`), portableAgentText(value, { repository: "\0", workspace, runtimeRoot }));
  fs.writeFileSync(eventsFile, portable(result.stdout || ""));
  if (fs.existsSync(finalMessage)) fs.writeFileSync(finalMessage, portable(fs.readFileSync(finalMessage, "utf8")));
  if (result.stderr) fs.writeFileSync(path.join(root, "agent-stderr.txt"), portable(result.stderr.slice(0, 1024 * 1024)));
  const summary = summarizeAgentEvents(result.stdout || "");
  let failure, proposal = null, inspection = null;
  try {
    for (const item of sources) {
      const after = discoverRepositorySourceState(item.repository);
      if (after.commit !== item.source.commit || after.dirty !== item.source.dirty
        || after.dirtyDigest !== item.source.dirtyDigest) throw new Error(`${item.entry.id}: source changed during agent run`);
    }
    if (result.status !== 0) throw new Error(`agent exited ${result.status ?? `by ${result.signal ?? "timeout"}`}`);
    const proposalRoot = batchProposalRoot(runtimeRoot);
    proposal = JSON.parse(fs.readFileSync(path.join(proposalRoot, "hub-proposal.json"), "utf8"));
    inspection = JSON.parse(fs.readFileSync(path.join(proposalRoot, "inspection.json"), "utf8"));
    const expectedIds = sources.map((item) => item.repositoryId);
    if (proposal.mode !== "batch-new" || proposal.domainId !== manifest.confirmedDomain.identity
      || JSON.stringify(proposal.sourceRepositoryIds) !== JSON.stringify(expectedIds)) {
      throw new Error("final proposal scope does not match exact batch inputs");
    }
    if (!inspection.applicable || inspection.batch?.members?.length !== sources.length) {
      throw new Error("final proposal inspection lacks applicable member attribution");
    }
    fs.cpSync(path.join(proposalRoot, "bundle"), path.join(root, "okf"), { recursive: true });
    loadOkfBundle(path.join(root, "okf"), { requireAgentBaseRootIndex: true });
    writeJson(path.join(root, "proposal.json"), proposal);
    writeJson(path.join(root, "inspection.json"), inspection);
  } catch (error) {
    failure = error instanceof Error ? error.message : "unknown batch agent failure";
  }
  const lifecycleFailures = validateBatchLifecycle(summary.activity.mcpTools, sources.length);
  const completed = { ...run, completedAt: new Date().toISOString(), elapsedMs: Date.now() - startedMs,
    outcome: failure || lifecycleFailures.length ? "failed" : "succeeded",
    process: { exitCode: result.status, signal: result.signal, error: result.error?.message ?? null },
    usage: summary.usage, activity: summary.activity,
    proposal: proposal ? { id: proposal.id, mode: proposal.mode, domainId: proposal.domainId,
      sourceRepositoryIds: proposal.sourceRepositoryIds } : null,
    attribution: inspection?.batch ?? null,
    coverage: inspection?.coverage ?? null,
    failures: [...(failure ? [failure] : []), ...lifecycleFailures],
  };
  writeJson(path.join(root, "run.json"), completed);
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.rmSync(runtimeRoot, { recursive: true, force: true });
  return completed;
}
