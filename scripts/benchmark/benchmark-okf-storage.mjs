import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { benchmarkPath } from "./benchmark-paths.mjs";

const runIdPattern = /^\d{4}-\d{2}-\d{2}T\d{6}Z$/;

function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }

export function manifestFor(suite) {
  const suitesRoot = benchmarkPath("suites");
  const candidates = fs.existsSync(suitesRoot)
    ? fs.readdirSync(suitesRoot, { withFileTypes: true }).flatMap((domain) => {
      if (!domain.isDirectory()) return [];
      const candidate = path.join(suitesRoot, domain.name, suite, "manifest.json");
      return fs.existsSync(candidate) ? [path.dirname(candidate)] : [];
    }) : [];
  const legacyRoot = benchmarkPath("suites", "legacy", suite);
  if (fs.existsSync(path.join(legacyRoot, "manifest.json"))) candidates.push(legacyRoot);
  const selectedRoot = candidates[0];
  const file = selectedRoot ? path.join(selectedRoot, "manifest.json") : "";
  if (!fs.existsSync(file)) throw new Error(`unknown benchmark suite: ${suite}`);
  const manifest = readJson(file);
  if (manifest.suite !== suite || !Array.isArray(manifest.repositories) || !manifest.repositories.length) {
    throw new Error(`invalid benchmark manifest: ${file}`);
  }
  return { ...manifest, root: selectedRoot };
}

function git(repository, args) {
  const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

export function fixtureFor(entry) {
  const legacyMatch = typeof entry.path === "string" ? entry.path.match(/^\.\.\/fixtures\/source-repos\/(.+)$/) : null;
  const relative = legacyMatch
    ? (legacyMatch[1] === "serverless-data-pipelines-demo"
      ? "repositories/crawler/serverless-data-pipelines-demo" : `repositories/legacy/${legacyMatch[1]}`)
    : entry.path;
  const registry = readJson(benchmarkPath("repositories.lock.json"));
  const admitted = registry.repositories?.find((item) => item.id === entry.id && item.path === relative);
  if (!admitted) throw new Error(`${entry.id}: repository is not admitted by repositories.lock.json`);
  if (admitted.commit !== entry.commit) throw new Error(`${entry.id}: manifest commit does not match repository registry`);
  const repository = benchmarkPath(relative);
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
  return benchmarkPath("results", suite, repository, runId);
}
