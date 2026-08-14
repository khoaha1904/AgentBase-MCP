#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  computeOkfTreeDigest,
  loadOkfBundle,
  parseConceptDocument,
  validateAgentBaseDraft,
  validateConceptAgainstSchema,
} from "../src/core/knowledge/index.ts";

const projectRoot = path.resolve(import.meta.dirname, "..");
const runIdPattern = /^\d{4}-\d{2}-\d{2}T\d{6}Z$/;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function manifestFor(suite) {
  const root = path.join(projectRoot, "benchmark", "repos", suite);
  const file = path.join(root, "manifest.json");
  if (!fs.existsSync(file)) throw new Error(`unknown benchmark suite: ${suite}`);
  const manifest = readJson(file);
  if (manifest.suite !== suite || !Array.isArray(manifest.repositories) || !manifest.repositories.length) {
    throw new Error(`invalid benchmark manifest: ${file}`);
  }
  return { ...manifest, root };
}

function git(repository, args) {
  const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

export function fixtureFor(entry) {
  const repository = path.resolve(projectRoot, entry.path);
  if (!fs.existsSync(repository)) throw new Error(`${entry.id}: fixture is missing at ${entry.path}`);
  const commit = git(repository, ["rev-parse", "HEAD"]);
  if (commit !== entry.commit) throw new Error(`${entry.id}: expected ${entry.commit}, found ${commit}`);
  if (git(repository, ["status", "--porcelain"])) throw new Error(`${entry.id}: fixture must be clean`);
  return repository;
}

export function utcRunId() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
    .replace(/^(\d{4})(\d{2})(\d{2})T/, "$1-$2-$3T");
}

export function resultRoot(suite, repository, runId) {
  if (!runIdPattern.test(runId)) throw new Error(`invalid UTC run ID: ${runId}`);
  return path.join(projectRoot, "benchmark", "results", suite, repository, runId);
}

function selectedRepositories(manifest, repository) {
  if (!repository) return manifest.repositories;
  const selected = manifest.repositories.filter((entry) => entry.id === repository);
  if (!selected.length) throw new Error(`unknown repository in ${manifest.suite}: ${repository}`);
  return selected;
}

function nonempty(value) {
  return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
}

function sourcePaths(concept, repositoryId) {
  const prefix = `repository://${repositoryId}/`;
  const sources = Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : [];
  return sources.flatMap((source) => {
    if (!source || typeof source !== "object" || Array.isArray(source) || typeof source.resource !== "string"
      || !source.resource.startsWith(prefix)) return [];
    const encoded = source.resource.slice(prefix.length).split("#L")[0];
    if (!encoded) return [];
    try { return [encoded.split("/").map(decodeURIComponent).join("/")]; } catch { return []; }
  });
}

function invalidRepositorySources(concept, repositoryId) {
  const prefix = `repository://${repositoryId}/`;
  const sources = Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : [];
  return sources.filter((source) => source && typeof source === "object" && !Array.isArray(source)
    && typeof source.resource === "string" && source.resource.startsWith("repository://")
    && !source.resource.startsWith(prefix)).length;
}

function resolvedLinks(concept, bundle) {
  const targets = new Set();
  for (const match of concept.body.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const raw = match[1]?.split("#")[0]?.split("?")[0];
    if (!raw || !raw.endsWith(".md")) continue;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(concept.path), raw));
    const target = [...bundle.concepts.values()].find((item) => item.path === resolved);
    const key = target?.frontmatter.benchmark_key;
    if (typeof key === "string") targets.add(key);
  }
  return targets;
}

function relationships(concept, bundle) {
  const links = resolvedLinks(concept, bundle);
  const declared = Array.isArray(concept.frontmatter.relationships) ? concept.frontmatter.relationships : [];
  return declared.flatMap((relationship) => {
    if (!relationship || typeof relationship !== "object" || Array.isArray(relationship)
      || typeof relationship.kind !== "string" || typeof relationship.target !== "string"
      || !links.has(relationship.target)) return [];
    return [`${concept.frontmatter.benchmark_key}|${relationship.kind}|${relationship.target}`];
  });
}

export function scoreSemanticBenchmark(expectation, bundle, repositoryId) {
  const failures = [...bundle.warnings];
  const actual = new Map();
  for (const concept of bundle.concepts.values()) {
    failures.push(...validateAgentBaseDraft(concept), ...validateConceptAgainstSchema(concept));
    if (invalidRepositorySources(concept, repositoryId)) failures.push(`${concept.path}: provenance uses another repository identity`);
    const key = concept.frontmatter.benchmark_key;
    if (typeof key !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) failures.push(`${concept.path}: benchmark_key is missing or invalid`);
    else if (actual.has(key)) failures.push(`${concept.path}: duplicate benchmark_key ${key}`);
    else actual.set(key, concept);
  }
  const expected = new Map(expectation.concepts.map((item) => [item.key, item]));
  const assignments = new Map();
  const usedActual = new Set();
  for (const item of expectation.concepts) {
    if (actual.has(item.key)) {
      assignments.set(item.key, actual.get(item.key));
      usedActual.add(item.key);
      continue;
    }
    if (!Array.isArray(item.identityTerms) || !item.identityTerms.length) continue;
    const ranked = [...actual.entries()].filter(([key]) => !usedActual.has(key)).flatMap(([key, concept]) => {
      const primaryIdentity = [key, concept.frontmatter.title, concept.frontmatter.description]
        .filter((value) => typeof value === "string").join(" ").toLowerCase();
      const identity = `${primaryIdentity} ${concept.body}`.toLowerCase();
      const terms = item.identityTerms.map((term) => term.toLowerCase());
      if (!terms.every((term) => identity.includes(term))) return [];
      const evidence = sourcePaths(concept, repositoryId);
      const evidenceMatches = item.requiredSourcePaths.filter((required) => evidence.includes(required)).length;
      const primaryMatches = terms.filter((term) => primaryIdentity.includes(term)).length;
      return [{ key, concept, score: (primaryMatches * 100) + evidenceMatches }];
    }).sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
    if (ranked[0]) {
      assignments.set(item.key, ranked[0].concept);
      usedActual.add(ranked[0].key);
    }
  }
  const matchedKeys = [...assignments.keys()];
  const correctSchemas = matchedKeys.filter((key) => assignments.get(key).type === expected.get(key).type).length;
  let metadataPresent = 0;
  let metadataRequired = 0;
  let evidencePresent = 0;
  let evidenceRequired = 0;
  for (const item of expectation.concepts) {
    const concept = assignments.get(item.key);
    metadataRequired += item.requiredMetadata.length;
    evidenceRequired += item.requiredSourcePaths.length;
    if (!concept) continue;
    metadataPresent += item.requiredMetadata.filter((field) => nonempty(concept.frontmatter[field])).length;
    const paths = sourcePaths(concept, repositoryId);
    evidencePresent += item.requiredSourcePaths.filter((required) => paths.includes(required)).length;
  }
  const actualRelationships = new Set([...actual.values()].flatMap((concept) => relationships(concept, bundle)));
  const expectedRelationships = new Set(expectation.relationships.flatMap((item) => {
    const from = assignments.get(item.from)?.frontmatter.benchmark_key;
    const to = assignments.get(item.to)?.frontmatter.benchmark_key;
    return typeof from === "string" && typeof to === "string" ? [`${from}|${item.kind}|${to}`] : [];
  }));
  const relationshipMatches = [...expectedRelationships].filter((item) => actualRelationships.has(item)).length;
  const unexpectedConcepts = [...actual.keys()].filter((key) => !usedActual.has(key));
  const unexpectedRelationships = [...actualRelationships].filter((item) => !expectedRelationships.has(item));
  const percent = (part, total) => total ? Math.round((part / total) * 100) : 100;
  return {
    expectedConcepts: expected.size,
    actualConcepts: actual.size,
    matchedConcepts: matchedKeys.length,
    conceptPrecisionPercent: percent(matchedKeys.length, actual.size),
    conceptRecallPercent: percent(matchedKeys.length, expected.size),
    schemaPrecisionPercent: percent(correctSchemas, actual.size),
    schemaRecallPercent: percent(correctSchemas, expected.size),
    metadataCompletenessPercent: percent(metadataPresent, metadataRequired),
    provenanceCoveragePercent: percent(evidencePresent, evidenceRequired),
    relationshipCoveragePercent: percent(relationshipMatches, expectedRelationships.size),
    unexpectedConcepts,
    unexpectedRelationships,
    validation: { passed: failures.length === 0, failures },
  };
}

function reportFor(entry, run, metrics) {
  if (run.outcome !== "succeeded") {
    return `# ${entry.id} — agent OKF benchmark\n\n`
      + `- Agent: \`${run.agent.model}\` via \`${run.agent.actualVersion}\`\n`
      + `- Catalog/prompt: \`${run.catalogVersion}\` / \`${run.promptVersion}\`\n`
      + `- Agent outcome: failed\n- OKF validation: failed\n`
      + `- Semantic metrics: not scored because the required MCP lifecycle failed\n`
      + `\n## Validation failures\n\n${metrics.validation.failures.map((item) => `- ${item}`).join("\n")}\n`;
  }
  return `# ${entry.id} — agent OKF benchmark\n\n`
    + `- Agent: \`${run.agent.model}\` via \`${run.agent.actualVersion}\`\n`
    + `- Catalog/prompt: \`${run.catalogVersion}\` / \`${run.promptVersion}\`\n`
    + `- Agent outcome: ${run.outcome}\n`
    + `- OKF validation: ${metrics.validation.passed ? "passed" : "failed"}\n`
    + `- Concept precision / recall: ${metrics.conceptPrecisionPercent}% / ${metrics.conceptRecallPercent}%\n`
    + `- Schema precision / recall: ${metrics.schemaPrecisionPercent}% / ${metrics.schemaRecallPercent}%\n`
    + `- Metadata completeness: ${metrics.metadataCompletenessPercent}%\n`
    + `- Provenance coverage: ${metrics.provenanceCoveragePercent}%\n`
    + `- Relationship coverage: ${metrics.relationshipCoveragePercent}%\n`
    + `- Unexpected concepts / relationships: ${metrics.unexpectedConcepts.length} / ${metrics.unexpectedRelationships.length}\n`
    + (metrics.validation.failures.length ? `\n## Validation failures\n\n${metrics.validation.failures.map((item) => `- ${item}`).join("\n")}\n` : "");
}

function invalidMetrics(suite, repository, runId, error) {
  return {
    suite,
    repository,
    runId,
    expectedConcepts: 0,
    actualConcepts: 0,
    matchedConcepts: 0,
    conceptPrecisionPercent: 0,
    conceptRecallPercent: 0,
    schemaPrecisionPercent: 0,
    schemaRecallPercent: 0,
    metadataCompletenessPercent: 0,
    provenanceCoveragePercent: 0,
    relationshipCoveragePercent: 0,
    unexpectedConcepts: [],
    unexpectedRelationships: [],
    validation: { passed: false, failures: [`OKF bundle could not be loaded: ${error}`] },
    okfTreeDigest: null,
  };
}

export function loadScorableBundle(root) {
  try {
    return loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  } catch (error) {
    const failures = [`OKF conformance failed: ${error instanceof Error ? error.message : "unknown error"}`];
    const concepts = new Map();
    const files = [];
    const walk = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
        const absolute = path.join(directory, entry.name);
        const relative = path.relative(root, absolute).split(path.sep).join("/");
        if (entry.isDirectory()) walk(absolute);
        else if (entry.isFile()) files.push(relative);
      }
    };
    walk(root);
    for (const relative of files.filter((file) => file.endsWith(".md")
      && !["index.md", "log.md", "README.md"].includes(path.posix.basename(file)))) {
      try {
        const concept = parseConceptDocument(relative, fs.readFileSync(path.join(root, ...relative.split("/")), "utf8"));
        concepts.set(concept.conceptId, concept);
      } catch (conceptError) {
        failures.push(`${relative}: ${conceptError instanceof Error ? conceptError.message : "concept could not be parsed"}`);
      }
    }
    return { root, concepts, files, warnings: failures, treeDigest: computeOkfTreeDigest(root) };
  }
}

async function run(suite, repository, requestedRunId) {
  const manifest = manifestFor(suite);
  const runId = requestedRunId || utcRunId();
  const { runAgentRepository } = await import("./benchmark-agent.mjs");
  const summaries = [];
  for (const entry of selectedRepositories(manifest, repository)) {
    const source = fixtureFor(entry);
    const root = resultRoot(suite, entry.id, runId);
    if (fs.existsSync(root)) throw new Error(`${entry.id}: result already exists for ${runId}`);
    const result = runAgentRepository({ manifest, entry, repository: source, root });
    if (result.outcome !== "succeeded") {
      const metrics = invalidMetrics(suite, entry.id, runId, `agent run failed: ${result.failures.join("; ")}`);
      writeJson(path.join(root, "metrics.json"), metrics);
      fs.writeFileSync(path.join(root, "report.md"), reportFor(entry, result, metrics));
    }
    summaries.push({ repository: entry.id, outcome: result.outcome, failures: result.failures });
  }
  process.stdout.write(`${JSON.stringify({ suite, runId, repositories: summaries }, null, 2)}\n`);
  if (summaries.some((item) => item.outcome !== "succeeded")) process.exitCode = 1;
}

function finalize(suite, runId, repository) {
  const manifest = manifestFor(suite);
  const summaries = [];
  for (const entry of selectedRepositories(manifest, repository)) {
    fixtureFor(entry);
    const root = resultRoot(suite, entry.id, runId);
    const runData = readJson(path.join(root, "run.json"));
    if (runData.outcome !== "succeeded") throw new Error(`${entry.id}: agent run did not succeed`);
    if (runData.catalogVersion !== manifest.catalogVersion) throw new Error(`${entry.id}: catalog version changed`);
    for (const required of ["prompt.md", "agent-events.jsonl", "agent-final.md", "okf"]) {
      if (!fs.existsSync(path.join(root, required))) throw new Error(`${entry.id}: missing agent artifact ${required}`);
    }
    const expectation = readJson(path.join(manifest.root, entry.expectation));
    let metrics;
    try {
      const bundle = loadScorableBundle(path.join(root, "okf"));
      metrics = { suite, repository: entry.id, runId, ...scoreSemanticBenchmark(expectation, bundle, runData.sourceRepositoryId), okfTreeDigest: bundle.treeDigest };
    } catch (error) {
      metrics = invalidMetrics(suite, entry.id, runId, error instanceof Error ? error.message : "unknown error");
    }
    writeJson(path.join(root, "metrics.json"), metrics);
    fs.writeFileSync(path.join(root, "report.md"), reportFor(entry, runData, metrics));
    summaries.push(metrics);
  }
  process.stdout.write(`${JSON.stringify({ suite, runId, repositories: summaries }, null, 2)}\n`);
  if (summaries.some((item) => !item.validation.passed)) process.exitCode = 1;
}

function usage() {
  process.stderr.write("Usage: npm run benchmark:okf -- run <suite> [repository] [UTC-run-id]\n"
    + "       npm run benchmark:okf -- finalize <suite> <UTC-run-id> [repository]\n");
  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, suite, first, second, ...extra] = process.argv.slice(2);
  try {
    if (extra.length || !suite) usage();
    else if (command === "run") await run(suite, first, second);
    else if (command === "finalize" && first) finalize(suite, first, second);
    else usage();
  } catch (error) {
    process.stderr.write(`OKF benchmark failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
