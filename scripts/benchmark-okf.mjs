#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  loadOkfBundle,
  validateAgentBaseDraft,
  validateConceptAgainstSchema,
} from "../src/core/knowledge/index.ts";
import { discoverRepositorySourceState } from "../src/app/repository-okf/index.ts";

const projectRoot = path.resolve(import.meta.dirname, "..");
const runIdPattern = /^\d{4}-\d{2}-\d{2}T\d{6}Z$/;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function manifestFor(suite) {
  const file = path.join(projectRoot, "benchmark", "repos", suite, "manifest.json");
  if (!fs.existsSync(file)) throw new Error(`unknown benchmark suite: ${suite}`);
  const manifest = readJson(file);
  if (manifest.suite !== suite || !Array.isArray(manifest.repositories) || !manifest.repositories.length) {
    throw new Error(`invalid benchmark manifest: ${file}`);
  }
  return manifest;
}

function git(repository, args) {
  const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function fixtureFor(entry) {
  const repository = path.resolve(projectRoot, entry.path);
  if (!fs.existsSync(repository)) throw new Error(`${entry.id}: fixture is missing at ${entry.path}`);
  const commit = git(repository, ["rev-parse", "HEAD"]);
  if (commit !== entry.commit) throw new Error(`${entry.id}: expected ${entry.commit}, found ${commit}`);
  if (git(repository, ["status", "--porcelain"])) throw new Error(`${entry.id}: fixture must be clean`);
  return repository;
}

function utcRunId() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
    .replace(/^(\d{4})(\d{2})(\d{2})T/, "$1-$2-$3T");
}

function resultRoot(suite, repository, runId) {
  if (!runIdPattern.test(runId)) throw new Error(`invalid UTC run ID: ${runId}`);
  return path.join(projectRoot, "benchmark", "results", suite, repository, runId);
}

export function observationFactCount(observation) {
  if (!observation || !Array.isArray(observation.queries)) return 0;
  return observation.queries.reduce((total, query) => total + (Array.isArray(query.facts) ? query.facts.length : 0), 0);
}

export function scoreClaims(entry, claims, bundle, observationSucceeded) {
  const expected = new Map(entry.expectedClaims.map((claim) => [claim.id, claim]));
  const failures = [];
  const seen = new Set();
  let supported = 0;
  let observationBacked = 0;
  let missing = 0;
  let incorrect = 0;
  for (const claim of claims.claims ?? []) {
    if (!expected.has(claim.id)) failures.push(`unexpected claim: ${claim.id}`);
    if (seen.has(claim.id)) failures.push(`duplicate claim: ${claim.id}`);
    seen.add(claim.id);
    if (claim.status === "supported") {
      supported += 1;
      if (!bundle.concepts.has(claim.concept)) failures.push(`${claim.id}: concept does not exist: ${claim.concept}`);
      if (!["observation", "direct-source"].includes(claim.evidence)) failures.push(`${claim.id}: invalid evidence mode`);
      if (claim.evidence === "observation") {
        observationBacked += 1;
        if (!observationSucceeded) failures.push(`${claim.id}: observation evidence claimed after observation failure`);
      }
    } else if (claim.status === "missing") missing += 1;
    else if (claim.status === "incorrect") incorrect += 1;
    else failures.push(`${claim.id}: invalid status`);
  }
  for (const id of expected.keys()) if (!seen.has(id)) failures.push(`claim result is missing: ${id}`);
  const total = expected.size;
  return {
    expectedClaims: total,
    supportedClaims: supported,
    missingClaims: missing,
    incorrectClaims: incorrect,
    semanticCoveragePercent: total ? Math.round((supported / total) * 100) : 100,
    observationBackedCoveragePercent: total ? Math.round((observationBacked / total) * 100) : 100,
    failures,
  };
}

function start(suite, requestedRunId) {
  const manifest = manifestFor(suite);
  const runId = requestedRunId || utcRunId();
  const summaries = [];
  for (const entry of manifest.repositories) {
    const repository = fixtureFor(entry);
    const root = resultRoot(suite, entry.id, runId);
    if (fs.existsSync(root)) throw new Error(`${entry.id}: result already exists for ${runId}`);
    fs.mkdirSync(root, { recursive: true });
    const startedAt = new Date().toISOString();
    const source = discoverRepositorySourceState(repository, startedAt);
    const observed = spawnSync(process.execPath, [
      path.join(projectRoot, "src", "cli.ts"), "observe", repository, entry.observationTarget, "--refresh",
    ], { cwd: projectRoot, encoding: "utf8", maxBuffer: 20 * 1024 * 1024, timeout: 180_000 });
    let observation;
    if (observed.status === 0) {
      observation = JSON.parse(observed.stdout);
      writeJson(path.join(root, "observation.json"), observation);
    } else {
      fs.writeFileSync(path.join(root, "observation-error.txt"), observed.stderr || `observe exited ${observed.status}\n`);
    }
    const run = {
      suite,
      repository: entry.id,
      kind: entry.kind,
      fixturePath: entry.path,
      fixtureCommit: entry.commit,
      sourceRepositoryId: source.repositoryId,
      observationTarget: entry.observationTarget,
      startedAt,
      completedAt: new Date().toISOString(),
      observation: {
        outcome: observed.status === 0 ? "succeeded" : "failed",
        exitCode: observed.status,
        factCount: observationFactCount(observation),
      },
    };
    writeJson(path.join(root, "run.json"), run);
    summaries.push({ repository: entry.id, result: path.relative(projectRoot, root), observation: run.observation });
  }
  process.stdout.write(`${JSON.stringify({ suite, runId, repositories: summaries }, null, 2)}\n`);
}

function reportFor(entry, run, metrics) {
  const outcome = run.observation.outcome === "succeeded"
    ? `succeeded with ${run.observation.factCount} normalized fact(s)`
    : "failed";
  return `# ${entry.id} — ${run.completedAt.slice(0, 10)}\n\n`
    + `- Fixture: \`${entry.commit}\` (${entry.kind})\n`
    + `- Observation target: \`${entry.observationTarget}\`\n`
    + `- Observation: ${outcome}\n`
    + `- OKF validation: ${metrics.validation.passed ? "passed" : "failed"}\n`
    + `- Expected claims supported: ${metrics.supportedClaims}/${metrics.expectedClaims} (${metrics.semanticCoveragePercent}%)\n`
    + `- Claims backed by normalized observation: ${metrics.observationBackedClaims}/${metrics.expectedClaims} (${metrics.observationBackedCoveragePercent}%)\n`
    + `- OKF concepts: ${metrics.conceptCount}\n\n`
    + "## Interpretation\n\n"
    + (metrics.observationBackedCoveragePercent === metrics.semanticCoveragePercent
      ? "The normalized observation supplied all evidence used by the supported claims.\n"
      : "Direct source inspection was required for claims not supplied by the normalized observation.\n")
    + (metrics.validation.failures.length ? `\n## Validation failures\n\n${metrics.validation.failures.map((failure) => `- ${failure}`).join("\n")}\n` : "");
}

function finalize(suite, runId) {
  const manifest = manifestFor(suite);
  const summaries = [];
  for (const entry of manifest.repositories) {
    fixtureFor(entry);
    const root = resultRoot(suite, entry.id, runId);
    const run = readJson(path.join(root, "run.json"));
    const claims = readJson(path.join(root, "claims.json"));
    const bundle = loadOkfBundle(path.join(root, "okf"), { requireAgentBaseRootIndex: true });
    const validationFailures = [...bundle.warnings];
    for (const concept of bundle.concepts.values()) {
      validationFailures.push(...validateAgentBaseDraft(concept), ...validateConceptAgainstSchema(concept));
      const sources = Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : [];
      for (const source of sources) {
        if (source && typeof source === "object" && !Array.isArray(source) && typeof source.resource === "string"
          && source.resource.startsWith("repository://")
          && !source.resource.startsWith(`repository://${run.sourceRepositoryId}/`)) {
          validationFailures.push(`${concept.path}: source repository does not match ${run.sourceRepositoryId}`);
        }
      }
    }
    const score = scoreClaims(entry, claims, bundle, run.observation.outcome === "succeeded");
    validationFailures.push(...score.failures);
    const metrics = {
      suite,
      repository: entry.id,
      runId,
      observation: run.observation,
      expectedClaims: score.expectedClaims,
      supportedClaims: score.supportedClaims,
      missingClaims: score.missingClaims,
      incorrectClaims: score.incorrectClaims,
      semanticCoveragePercent: score.semanticCoveragePercent,
      observationBackedClaims: (claims.claims ?? []).filter((claim) => claim.status === "supported" && claim.evidence === "observation").length,
      observationBackedCoveragePercent: score.observationBackedCoveragePercent,
      conceptCount: bundle.concepts.size,
      okfTreeDigest: bundle.treeDigest,
      validation: { passed: validationFailures.length === 0, failures: validationFailures },
    };
    writeJson(path.join(root, "metrics.json"), metrics);
    fs.writeFileSync(path.join(root, "report.md"), reportFor(entry, run, metrics));
    summaries.push(metrics);
  }
  process.stdout.write(`${JSON.stringify({ suite, runId, repositories: summaries }, null, 2)}\n`);
  if (summaries.some((metrics) => !metrics.validation.passed)) process.exitCode = 1;
}

function usage() {
  process.stderr.write("Usage: npm run benchmark:okf -- start <suite> [UTC-run-id]\n"
    + "       npm run benchmark:okf -- finalize <suite> <UTC-run-id>\n");
  process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, suite, runId, ...extra] = process.argv.slice(2);
  try {
    if (extra.length || !suite) usage();
    else if (command === "start") start(suite, runId);
    else if (command === "finalize" && runId) finalize(suite, runId);
    else usage();
  } catch (error) {
    process.stderr.write(`OKF benchmark failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
