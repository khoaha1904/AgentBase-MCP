#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  computeOkfTreeDigest,
  getOkfConceptSchema,
  loadOkfBundle,
  parseConceptDocument,
  validateAgentBaseDraft,
  validateConceptAgainstSchema,
} from "../src/core/knowledge/index.ts";
import { discoverRepositorySourceState } from "../src/app/repository-okf/index.ts";

const projectRoot = path.resolve(import.meta.dirname, "..");
const runIdPattern = /^\d{4}-\d{2}-\d{2}T\d{6}Z$/;
const authoringGoal = "okf-v0.2-semantic-authoring-v1";
const assessmentLimitations = [
  "Deterministic source-path checks do not prove that authored claims are semantically supported; human review is required.",
  "Reference expectations are curated probes, not an exhaustive inventory of every valid repository concept.",
];

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

function fileDigest(file) {
  return `sha256:${createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

export async function runPairRepository({
  manifest, entry, repository, root, pairId, executable = manifest.agent.executable,
}) {
  if (fs.existsSync(root)) throw new Error(`${entry.id}: result already exists for ${pairId}`);
  const startedAt = new Date().toISOString();
  const fixtureSource = discoverRepositorySourceState(repository, startedAt);
  const expectationFile = path.join(manifest.root, entry.expectation);
  const pair = {
    suite: manifest.suite,
    repository: entry.id,
    pairId,
    status: "running",
    startedAt,
    completedAt: null,
    commonInputs: {
      fixtureCommit: entry.commit,
      sourceRepositoryId: fixtureSource.repositoryId,
      fixtureDirty: fixtureSource.dirty,
      fixtureDirtyDigest: fixtureSource.dirtyDigest,
      expectationDigest: fileDigest(expectationFile),
      catalogVersion: manifest.catalogVersion,
      authoringGoal,
      promptVersions: {
        mcp: manifest.promptVersion,
        direct: manifest.directPromptVersion ?? "okf-author-direct-v1",
      },
      provider: manifest.agent.provider ?? "codex-cli",
      agentVersion: manifest.agent.version,
      model: manifest.agent.model,
      reasoningEffort: manifest.agent.reasoningEffort,
    },
    agentBaseSource: discoverRepositorySourceState(projectRoot, startedAt),
    arms: {
      mcp: { path: "mcp", outcome: "pending", failures: [] },
      direct: { path: "direct", outcome: "pending", failures: [] },
    },
    failures: [],
  };
  fs.mkdirSync(root, { recursive: true });
  writeJson(path.join(root, "pair.json"), pair);
  const { runAgentRepository } = await import("./benchmark-agent.mjs");
  const failedArm = (arm, failure) => {
    const armRoot = path.join(root, arm);
    const result = {
      suite: manifest.suite,
      repository: entry.id,
      arm,
      outcome: "failed",
      usage: null,
      activity: null,
      failures: [failure],
    };
    fs.mkdirSync(armRoot, { recursive: true });
    writeJson(path.join(armRoot, "run.json"), result);
    return result;
  };
  for (const arm of ["mcp", "direct"]) {
    const armRoot = path.join(root, arm);
    let result;
    const currentSource = discoverRepositorySourceState(repository);
    if (currentSource.commit !== fixtureSource.commit || currentSource.dirty !== fixtureSource.dirty
      || currentSource.dirtyDigest !== fixtureSource.dirtyDigest) {
      result = failedArm(arm, `source repository changed before ${arm} arm`);
    } else try {
      result = runAgentRepository({ manifest, entry, repository, root: armRoot, executable, arm });
    } catch (error) {
      const failure = error instanceof Error ? error.message : "unknown arm failure";
      result = failedArm(arm, failure);
    }
    pair.arms[arm] = { path: arm, outcome: result.outcome, failures: result.failures };
  }
  pair.failures = Object.entries(pair.arms).flatMap(([arm, result]) =>
    result.outcome === "succeeded" ? [] : result.failures.map((failure) => `${arm} arm: ${failure}`));
  if (pair.failures.length) pair.status = "incomplete";
  writeJson(path.join(root, "pair.json"), pair);
  return pair;
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

function inspectRelationships(concept, bundle, conceptsByKey) {
  const links = resolvedLinks(concept, bundle);
  const declared = Array.isArray(concept.frontmatter.relationships) ? concept.frontmatter.relationships : [];
  const values = [];
  const failures = [];
  for (const relationship of declared) {
    if (!relationship || typeof relationship !== "object" || Array.isArray(relationship)
      || typeof relationship.kind !== "string" || typeof relationship.target !== "string") {
      failures.push(`${concept.path}: relationship declaration is malformed`);
      continue;
    }
    const target = conceptsByKey.get(relationship.target);
    if (!target) {
      failures.push(`${concept.path}: relationship ${relationship.kind} targets missing concept ${relationship.target}`);
      continue;
    }
    if (!links.has(relationship.target)) {
      failures.push(`${concept.path}: relationship ${relationship.kind} -> ${relationship.target} has no resolving Markdown link`);
      continue;
    }
    const sourceSchema = getOkfConceptSchema(concept.type);
    const supported = sourceSchema?.relationshipGuidance.some((guidance) =>
      guidance.kind === relationship.kind && guidance.targetTypes.includes(target.type));
    if (sourceSchema && !supported) {
      failures.push(`${concept.path}: relationship ${relationship.kind} -> ${relationship.target} is unsupported by ${concept.type} schema guidance`);
      continue;
    }
    values.push(`${concept.frontmatter.benchmark_key}|${relationship.kind}|${relationship.target}`);
  }
  return { values, failures };
}

export function createAuthoringAssessment({
  actualConcepts, validationFailures, contradictionFailures, relationshipIntegrityFailures,
}) {
  const hardFailures = [
    ...validationFailures,
    ...(actualConcepts > 0 ? [] : ["OKF output contains no concept documents"]),
    ...contradictionFailures,
    ...relationshipIntegrityFailures,
  ];
  return {
    status: hardFailures.length ? "invalid" : "reviewable",
    hardFailures: [...new Set(hardFailures)],
    limitations: assessmentLimitations,
  };
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
      const evidence = sourcePaths(concept, repositoryId);
      const evidenceMatches = item.requiredSourcePaths.filter((required) => evidence.includes(required)).length;
      const primaryMatches = terms.filter((term) => primaryIdentity.includes(term)).length;
      const allTermsMatch = terms.every((term) => identity.includes(term));
      const schemaMatches = concept.type === item.type;
      if (!allTermsMatch && !(schemaMatches && evidenceMatches)) return [];
      return [{
        key,
        concept,
        score: (schemaMatches ? 10_000 : 0) + (allTermsMatch ? 1_000 : 0) + (primaryMatches * 100) + evidenceMatches,
      }];
    }).sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
    if (ranked[0]) {
      assignments.set(item.key, ranked[0].concept);
      usedActual.add(ranked[0].key);
    }
  }
  const matchedKeys = [...assignments.keys()];
  const confirmedConcepts = [];
  const contradictedConcepts = [];
  for (const key of matchedKeys) {
    const concept = assignments.get(key);
    const item = expected.get(key);
    if (concept.type === item.type) confirmedConcepts.push(concept.frontmatter.benchmark_key);
    else contradictedConcepts.push({
      actual: concept.frontmatter.benchmark_key,
      expected: key,
      actualType: concept.type,
      expectedType: item.type,
    });
  }
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
  const relationshipInspections = [...actual.values()].map((concept) => inspectRelationships(concept, bundle, actual));
  const relationshipIntegrityFailures = relationshipInspections.flatMap((item) => item.failures);
  const actualRelationships = new Set(relationshipInspections.flatMap((item) => item.values));
  const mappedExpectedRelationships = new Map(expectation.relationships.map((item) => {
    const from = assignments.get(item.from)?.frontmatter.benchmark_key;
    const to = assignments.get(item.to)?.frontmatter.benchmark_key;
    const reference = `${item.from}|${item.kind}|${item.to}`;
    const authored = typeof from === "string" && typeof to === "string" ? `${from}|${item.kind}|${to}` : null;
    return [reference, authored];
  }));
  const confirmedRelationships = [];
  const missingReferenceRelationships = [];
  const confirmedAuthoredRelationships = new Set();
  for (const [reference, authored] of mappedExpectedRelationships) {
    if (authored && actualRelationships.has(authored)) {
      confirmedRelationships.push(reference);
      confirmedAuthoredRelationships.add(authored);
    } else missingReferenceRelationships.push(reference);
  }
  const unjudgedConcepts = [...actual.keys()].filter((key) => !usedActual.has(key));
  const missingReferenceConcepts = [...expected.keys()].filter((key) => !assignments.has(key));
  const unjudgedRelationships = [...actualRelationships].filter((item) => !confirmedAuthoredRelationships.has(item));
  const percent = (part, total) => total ? Math.round((part / total) * 100) : 100;
  const contradictionFailures = contradictedConcepts.map((item) =>
    `Reference ${item.expected} matched ${item.actual} but expected schema ${item.expectedType}, found ${item.actualType}`);
  const metrics = {
    expectedConcepts: expected.size,
    actualConcepts: actual.size,
    matchedConcepts: matchedKeys.length,
    referenceConceptCoveragePercent: percent(matchedKeys.length, expected.size),
    recognizedSchemaAgreementPercent: percent(confirmedConcepts.length, matchedKeys.length),
    metadataCompletenessPercent: percent(metadataPresent, metadataRequired),
    provenanceCoveragePercent: percent(evidencePresent, evidenceRequired),
    referenceRelationshipCoveragePercent: percent(confirmedRelationships.length, expectation.relationships.length),
    classifications: {
      concepts: {
        confirmed: confirmedConcepts,
        contradicted: contradictedConcepts,
        unjudged: unjudgedConcepts,
        missingReference: missingReferenceConcepts,
      },
      relationships: {
        confirmed: confirmedRelationships,
        contradicted: [],
        unjudged: unjudgedRelationships,
        missingReference: missingReferenceRelationships,
      },
    },
    validation: { passed: failures.length === 0, failures },
  };
  return {
    ...metrics,
    authoringAssessment: createAuthoringAssessment({
      actualConcepts: actual.size,
      validationFailures: failures,
      contradictionFailures,
      relationshipIntegrityFailures,
    }),
  };
}

function reportFor(entry, run, metrics) {
  const agent = run.agent ? `${run.agent.model} via ${run.agent.actualVersion}` : "unavailable";
  const catalogPrompt = run.catalogVersion && run.promptVersion
    ? `${run.catalogVersion} / ${run.promptVersion}` : "unavailable";
  if (run.outcome !== "succeeded") {
    return `# ${entry.id} — agent OKF benchmark\n\n`
      + `- Agent: ${agent}\n`
      + `- Catalog/prompt: ${catalogPrompt}\n`
      + `- Agent outcome: failed\n- OKF validation: failed\n`
      + `- Authoring assessment: invalid\n`
      + `- Semantic metrics: not scored because the ${run.arm ?? "mcp"} arm lifecycle failed\n`
      + `\n## Hard failures\n\n${metrics.authoringAssessment.hardFailures.map((item) => `- ${item}`).join("\n")}\n`
      + `\n## Limitations\n\n${metrics.authoringAssessment.limitations.map((item) => `- ${item}`).join("\n")}\n`;
  }
  return `# ${entry.id} — agent OKF benchmark\n\n`
    + `- Agent: ${agent}\n`
    + `- Catalog/prompt: ${catalogPrompt}\n`
    + `- Agent outcome: ${run.outcome}\n`
    + `- OKF validation: ${metrics.validation.passed ? "passed" : "failed"}\n`
    + `- Authoring assessment: ${metrics.authoringAssessment.status}\n`
    + `- Reference concept coverage: ${metrics.referenceConceptCoveragePercent}%\n`
    + `- Recognized schema agreement: ${metrics.recognizedSchemaAgreementPercent}%\n`
    + `- Metadata completeness: ${metrics.metadataCompletenessPercent}%\n`
    + `- Provenance coverage: ${metrics.provenanceCoveragePercent}%\n`
    + `- Reference relationship coverage: ${metrics.referenceRelationshipCoveragePercent}%\n`
    + `- Unjudged concepts / relationships: ${metrics.classifications.concepts.unjudged.length} / ${metrics.classifications.relationships.unjudged.length}\n`
    + `- Missing reference concepts / relationships: ${metrics.classifications.concepts.missingReference.length} / ${metrics.classifications.relationships.missingReference.length}\n`
    + (metrics.authoringAssessment.hardFailures.length
      ? `\n## Hard failures\n\n${metrics.authoringAssessment.hardFailures.map((item) => `- ${item}`).join("\n")}\n` : "")
    + `\n## Limitations\n\n${metrics.authoringAssessment.limitations.map((item) => `- ${item}`).join("\n")}\n`;
}

function invalidMetrics(suite, repository, runId, error) {
  const metrics = {
    suite,
    repository,
    runId,
    expectedConcepts: 0,
    actualConcepts: 0,
    matchedConcepts: 0,
    referenceConceptCoveragePercent: 0,
    recognizedSchemaAgreementPercent: 0,
    metadataCompletenessPercent: 0,
    provenanceCoveragePercent: 0,
    referenceRelationshipCoveragePercent: 0,
    classifications: {
      concepts: { confirmed: [], contradicted: [], unjudged: [], missingReference: [] },
      relationships: { confirmed: [], contradicted: [], unjudged: [], missingReference: [] },
    },
    validation: { passed: false, failures: [`OKF bundle could not be loaded: ${error}`] },
    okfTreeDigest: null,
  };
  return {
    ...metrics,
    authoringAssessment: createAuthoringAssessment({
      actualConcepts: 0,
      validationFailures: metrics.validation.failures,
      contradictionFailures: [],
      relationshipIntegrityFailures: [],
    }),
  };
}

function efficiencyFor(run) {
  if (!run) return null;
  return {
    elapsedMs: Number.isFinite(run.elapsedMs) ? run.elapsedMs : null,
    inputTokens: run.usage?.inputTokens ?? null,
    cachedInputTokens: run.usage?.cachedInputTokens ?? null,
    cacheWriteInputTokens: run.usage?.cacheWriteInputTokens ?? null,
    uncachedInputTokens: run.usage?.uncachedInputTokens ?? null,
    outputTokens: run.usage?.outputTokens ?? null,
    reasoningOutputTokens: run.usage?.reasoningOutputTokens ?? null,
  };
}

export function createPairComparison({ pair, runs, metrics }) {
  const failures = [];
  for (const arm of ["mcp", "direct"]) {
    const run = runs[arm];
    if (!run) failures.push(`${arm} arm run is missing`);
    else if (run.outcome !== "succeeded") failures.push(`${arm} arm did not succeed: ${run.failures?.join("; ") || "unknown failure"}`);
    if (!metrics[arm]) failures.push(`${arm} arm metrics are unavailable`);
    if (run && !run.usage) failures.push(`${arm} arm token usage is unavailable`);
    if (run && !Number.isFinite(run.elapsedMs)) failures.push(`${arm} arm elapsed time is unavailable`);
  }
  const efficiency = {
    mcp: efficiencyFor(runs.mcp),
    direct: efficiencyFor(runs.direct),
    delta: {},
  };
  for (const field of ["elapsedMs", "inputTokens", "cachedInputTokens", "cacheWriteInputTokens", "uncachedInputTokens", "outputTokens", "reasoningOutputTokens"]) {
    const mcp = efficiency.mcp?.[field];
    const direct = efficiency.direct?.[field];
    if (Number.isFinite(mcp) && Number.isFinite(direct)) efficiency.delta[field] = mcp - direct;
  }
  return {
    suite: pair.suite,
    repository: pair.repository,
    pairId: pair.pairId,
    completeness: { status: failures.length ? "incomplete" : "complete", failures },
    quality: { mcp: metrics.mcp ?? null, direct: metrics.direct ?? null },
    efficiency,
    activity: { mcp: runs.mcp?.activity ?? null, direct: runs.direct?.activity ?? null },
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

function finalizeArmRoot({ manifest, entry, root, runId }) {
  let runData;
  try {
    runData = readJson(path.join(root, "run.json"));
  } catch (error) {
    return { run: null, metrics: null, failure: `run artifact is unavailable: ${error instanceof Error ? error.message : "unknown error"}` };
  }
  const fail = (failure) => {
    const metrics = invalidMetrics(manifest.suite, entry.id, runId, failure);
    writeJson(path.join(root, "metrics.json"), metrics);
    fs.writeFileSync(path.join(root, "report.md"), reportFor(entry, runData, metrics));
    return { run: runData, metrics: null, failure };
  };
  if (runData.outcome !== "succeeded") return fail(`agent run failed: ${runData.failures?.join("; ") || "unknown failure"}`);
  if (runData.catalogVersion !== manifest.catalogVersion) return fail("catalog version changed");
  for (const required of ["prompt.md", "agent-events.jsonl", "agent-final.md", "okf"]) {
    if (!fs.existsSync(path.join(root, required))) return fail(`missing agent artifact ${required}`);
  }
  const expectation = readJson(path.join(manifest.root, entry.expectation));
  let metrics;
  try {
    const bundle = loadScorableBundle(path.join(root, "okf"));
    metrics = {
      suite: manifest.suite,
      repository: entry.id,
      runId,
      arm: runData.arm ?? "mcp",
      ...scoreSemanticBenchmark(expectation, bundle, runData.sourceRepositoryId),
      okfTreeDigest: bundle.treeDigest,
    };
  } catch (error) {
    metrics = invalidMetrics(manifest.suite, entry.id, runId, error instanceof Error ? error.message : "unknown error");
  }
  writeJson(path.join(root, "metrics.json"), metrics);
  fs.writeFileSync(path.join(root, "report.md"), reportFor(entry, runData, metrics));
  return { run: runData, metrics, failure: null };
}

function pairReportFor(comparison) {
  const quality = (arm) => {
    const metrics = comparison.quality[arm];
    return metrics
      ? `- ${arm}: assessment ${metrics.authoringAssessment?.status ?? "invalid"}; validation ${metrics.validation.passed ? "passed" : "failed"}; reference concepts ${metrics.referenceConceptCoveragePercent}%; recognized schemas ${metrics.recognizedSchemaAgreementPercent}%; metadata ${metrics.metadataCompletenessPercent}%; provenance ${metrics.provenanceCoveragePercent}%; reference relationships ${metrics.referenceRelationshipCoveragePercent}%; unjudged concepts/relationships ${metrics.classifications?.concepts.unjudged.length ?? 0}/${metrics.classifications?.relationships.unjudged.length ?? 0}`
      : `- ${arm}: unavailable`;
  };
  const efficiency = (arm) => {
    const item = comparison.efficiency[arm];
    return item
      ? `- ${arm}: ${item.inputTokens ?? "n/a"} input (${item.cachedInputTokens ?? "n/a"} cached, ${item.uncachedInputTokens ?? "n/a"} uncached); ${item.outputTokens ?? "n/a"} output; ${item.reasoningOutputTokens ?? "n/a"} reasoning; ${item.elapsedMs ?? "n/a"} ms`
      : `- ${arm}: unavailable`;
  };
  const failures = comparison.completeness.failures.length
    ? `\n## Incomplete evidence\n\n${comparison.completeness.failures.map((item) => `- ${item}`).join("\n")}\n` : "";
  return `# ${comparison.repository} — AgentBase context A/B\n\n`
    + `- Status: ${comparison.completeness.status}\n`
    + "- Interpretation: quality and efficiency are independent; this report declares no overall winner.\n"
    + "- Limitation: deterministic source-path checks cannot prove semantic support; human review is required. Reference expectations are non-exhaustive.\n"
    + "\n## Quality\n\n"
    + `${quality("mcp")}\n${quality("direct")}\n`
    + "\n## Efficiency\n\n"
    + `${efficiency("mcp")}\n${efficiency("direct")}\n`
    + `- Delta convention: MCP minus direct. ${JSON.stringify(comparison.efficiency.delta)}\n`
    + "\n## Investigation activity\n\n"
    + "- Counts are directly observed events, not proof of complete source-read volume.\n"
    + failures;
}

export function comparePairRepository({ manifest, entry, repository, root, pairId }) {
  const pair = readJson(path.join(root, "pair.json"));
  const identityFailures = [];
  if (pair.suite !== manifest.suite || pair.repository !== entry.id || pair.pairId !== pairId) {
    identityFailures.push("pair identity does not match requested suite, repository and pair ID");
  }
  if (pair.commonInputs.fixtureCommit !== entry.commit) identityFailures.push("fixture commit changed");
  if (pair.commonInputs.expectationDigest !== fileDigest(path.join(manifest.root, entry.expectation))) {
    identityFailures.push("expectation changed");
  }
  if (pair.commonInputs.catalogVersion !== manifest.catalogVersion) identityFailures.push("catalog version changed");
  if (pair.commonInputs.authoringGoal !== authoringGoal) identityFailures.push("authoring goal changed");
  if (pair.commonInputs.agentVersion !== manifest.agent.version) identityFailures.push("agent version changed");
  if (pair.commonInputs.model !== manifest.agent.model || pair.commonInputs.reasoningEffort !== manifest.agent.reasoningEffort) {
    identityFailures.push("agent model or reasoning effort changed");
  }
  const finalized = Object.fromEntries(["mcp", "direct"].map((arm) => [
    arm,
    finalizeArmRoot({ manifest, entry, root: path.join(root, arm), runId: pairId }),
  ]));
  if (pair.commonInputs.promptVersions) {
    for (const arm of ["mcp", "direct"]) {
      if (finalized[arm].run?.promptVersion !== pair.commonInputs.promptVersions[arm]) {
        identityFailures.push(`${arm} prompt identity does not match paired input`);
      }
    }
  }
  const comparison = createPairComparison({
    pair,
    runs: { mcp: finalized.mcp.run, direct: finalized.direct.run },
    metrics: { mcp: finalized.mcp.metrics, direct: finalized.direct.metrics },
  });
  comparison.completeness.failures.push(...identityFailures);
  if (identityFailures.length) comparison.completeness.status = "incomplete";
  writeJson(path.join(root, "comparison.json"), comparison);
  fs.writeFileSync(path.join(root, "report.md"), pairReportFor(comparison));
  pair.status = comparison.completeness.status;
  pair.completedAt = new Date().toISOString();
  pair.failures = comparison.completeness.failures;
  writeJson(path.join(root, "pair.json"), pair);
  return comparison;
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

async function pair(suite, repository, requestedPairId) {
  if (!repository) throw new Error("paired benchmark requires one repository");
  const manifest = manifestFor(suite);
  const pairId = requestedPairId || utcRunId();
  const [entry] = selectedRepositories(manifest, repository);
  const source = fixtureFor(entry);
  const result = await runPairRepository({
    manifest,
    entry,
    repository: source,
    root: resultRoot(suite, entry.id, pairId),
    pairId,
  });
  process.stdout.write(`${JSON.stringify({ suite, repository, pairId, status: result.status, arms: result.arms }, null, 2)}\n`);
  if (result.status === "incomplete") process.exitCode = 1;
}

function finalize(suite, runId, repository) {
  const manifest = manifestFor(suite);
  const summaries = [];
  for (const entry of selectedRepositories(manifest, repository)) {
    fixtureFor(entry);
    const root = resultRoot(suite, entry.id, runId);
    const result = finalizeArmRoot({ manifest, entry, root, runId });
    if (result.failure) throw new Error(`${entry.id}: ${result.failure}`);
    summaries.push(result.metrics);
  }
  process.stdout.write(`${JSON.stringify({ suite, runId, repositories: summaries }, null, 2)}\n`);
  if (summaries.some((item) => item.authoringAssessment.status === "invalid")) process.exitCode = 1;
}

function compare(suite, pairId, repository) {
  if (!repository) throw new Error("paired comparison requires one repository");
  const manifest = manifestFor(suite);
  const [entry] = selectedRepositories(manifest, repository);
  const source = fixtureFor(entry);
  const comparison = comparePairRepository({
    manifest,
    entry,
    repository: source,
    root: resultRoot(suite, entry.id, pairId),
    pairId,
  });
  process.stdout.write(`${JSON.stringify(comparison, null, 2)}\n`);
  if (comparison.completeness.status !== "complete") process.exitCode = 1;
}

function usage() {
  process.stderr.write("Usage: npm run benchmark:okf -- run <suite> [repository] [UTC-run-id]\n"
    + "       npm run benchmark:okf -- finalize <suite> <UTC-run-id> [repository]\n"
    + "       npm run benchmark:okf -- pair <suite> <repository> [UTC-pair-id]\n"
    + "       npm run benchmark:okf -- compare <suite> <UTC-pair-id> <repository>\n");
  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, suite, first, second, ...extra] = process.argv.slice(2);
  try {
    if (extra.length || !suite) usage();
    else if (command === "run") await run(suite, first, second);
    else if (command === "finalize" && first) finalize(suite, first, second);
    else if (command === "pair" && first) await pair(suite, first, second);
    else if (command === "compare" && first && second) compare(suite, first, second);
    else usage();
  } catch (error) {
    process.stderr.write(`OKF benchmark failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
