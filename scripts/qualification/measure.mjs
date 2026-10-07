#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

import {
  loadHubGraph, loadOkfBundle, parseRepositorySourceResource, readRepositoryIdentityRecord,
  resolveRepositoryIdentity, searchHubConceptsWithFreshness,
} from "../../src/core/knowledge/index.ts";
import { createHubIdentity } from "../../src/core/hub/index.ts";
import { discoverRepositorySourceState, matchRepositoryNames } from "../../src/app/repository-source/index.ts";
import { admitPersistentLocalHub, comparePublishedNameLinks, readPersistedHubConfiguration } from "../../src/app/hub-okf/index.ts";
import { runGit } from "../../src/providers/github-hub/index.ts";
import { DiscoverySession } from "../../src/app/agentbase-mcp/discovery-session.ts";
import { measureFixtureCosts } from "./measure-costs.mjs";

export function byteCost(value) {
  const bytes = Buffer.byteLength(JSON.stringify(value), "utf8");
  return { bytes, estimated_tokens: bytes / 4 };
}

function requireInput(condition) {
  if (!condition) throw new Error("Invalid qualification input");
}

function id(value) {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,255}$/.test(value)
    && !value.split("/").some((part) => part === "..") && !value.includes("://");
}

export function readSpec(file) {
  const specFile = path.resolve(file), directory = path.dirname(specFile);
  requireInput(fs.statSync(specFile).size <= 1024 * 1024);
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  requireInput(spec && Array.isArray(spec.repos) && spec.repos.length >= 2 && spec.repos.length <= 32);
  const repos = spec.repos.map((repo) => {
    requireInput(repo && typeof repo.id === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(repo.id)
      && typeof repo.path === "string");
    const root = fs.realpathSync(path.resolve(directory, repo.path));
    requireInput(fs.statSync(root).isDirectory());
    return { id: repo.id, root };
  });
  const repoIds = new Set(repos.map((repo) => repo.id));
  requireInput(repoIds.size === repos.length && new Set(repos.map((repo) => repo.root)).size === repos.length);
  requireInput(Array.isArray(spec.links) && spec.links.length <= 4096);
  for (const link of spec.links) requireInput(link && id(link.name) && id(link.kind)
    && repoIds.has(link.defining_repo) && repoIds.has(link.using_repo) && link.defining_repo !== link.using_repo);
  requireInput(Array.isArray(spec.questions) && spec.questions.length <= 128);
  const questions = spec.questions.map((question, index) => {
    requireInput(question && typeof question.text === "string" && question.text.length >= 1
      && question.text.length <= 4096 && Array.isArray(question.expected)
      && question.expected.length >= 1 && question.expected.length <= 32);
    for (const expected of question.expected) {
      requireInput(expected && ((id(expected.concept_id) && expected.source === undefined)
        || (typeof expected.source === "string" && expected.concept_id === undefined)));
      if (expected.source !== undefined) {
        const separator = expected.source.indexOf(":"), repoId = expected.source.slice(0, separator);
        const relative = expected.source.slice(separator + 1);
        requireInput(repoIds.has(repoId) && relative && !path.posix.isAbsolute(relative)
          && !relative.includes("\\") && !relative.split("/").some((part) => !part || part === "." || part === ".."));
      }
    }
    const questionId = question.id ?? `q${index + 1}`;
    requireInput(id(questionId));
    return { id: questionId, text: question.text, expected: question.expected.map((target) =>
      target.concept_id === undefined ? { source: target.source } : { concept_id: target.concept_id }) };
  });
  requireInput(new Set(questions.map((question) => question.id)).size === questions.length);
  requireInput(spec.hub && [spec.hub.concept_directory, spec.hub.agentbase_home].filter((value) => value !== undefined).length === 1);
  const hubPath = spec.hub.concept_directory ?? spec.hub.agentbase_home;
  requireInput(typeof hubPath === "string" && (!spec.hub.domain || id(spec.hub.domain)));
  return { repos, links: spec.links.map(({ name, defining_repo, using_repo, kind }) => ({ name, defining_repo, using_repo, kind })),
    questions, hub: { concept_directory: spec.hub.concept_directory, agentbase_home: spec.hub.agentbase_home,
      domain: spec.hub.domain, root: fs.realpathSync(path.resolve(directory, hubPath)) } };
}

async function hubReader(hub) {
  if (hub.concept_directory !== undefined) {
    const bundle = loadOkfBundle(hub.root);
    return { commit: "a".repeat(40), listMarkdownPaths: async () => bundle.files.filter((file) => file.endsWith(".md")),
      readMarkdown: async (relative) => {
        requireInput(bundle.files.includes(relative));
        return fs.readFileSync(path.join(hub.root, relative), "utf8");
      } };
  }
  // Read configuration directly, never load a credential or invoke runtime migration/sync.
  const configuration = readPersistedHubConfiguration({ AGENTBASE_HOME: hub.root });
  requireInput(configuration?.kind === "remote");
  const local = await admitPersistentLocalHub({ ...configuration,
    hub: createHubIdentity(configuration.repository, configuration.targetBranch, configuration.host),
  }, undefined, { readOnly: true });
  return { commit: local.remoteBase,
    listMarkdownPaths: async () => (await runGit({ args: ["ls-tree", "-r", "--name-only", "-z", local.remoteBase],
      cwd: local.root, operation: "measure Published paths", maximumOutputBytes: 4 * 1024 * 1024 })).stdout.split("\0").filter((item) => item.endsWith(".md")),
    readMarkdown: async (relative) => (await runGit({ args: ["show", `${local.remoteBase}:${relative}`], cwd: local.root,
      operation: "measure Published concept", maximumOutputBytes: 256 * 1024 })).stdout };
}

function linkIdentity(link) {
  return JSON.stringify([link.name, link.defining_repo, link.using_repo, link.kind]);
}

export function linkMetrics(expected, candidates) {
  const wanted = new Map(expected.map((link) => [linkIdentity(link), link]));
  const found = new Map(candidates.map((link) => [linkIdentity(link), {
    name: link.name, defining_repo: link.defining_repo, using_repo: link.using_repo, kind: link.kind,
  }]));
  const matched = [...wanted.keys()].filter((key) => found.has(key)).length;
  return { expected: wanted.size, candidates: found.size, matched,
    recall: wanted.size ? matched / wanted.size : null, precision: found.size ? matched / found.size : null,
    missing: [...wanted].filter(([key]) => !found.has(key)).map(([, link]) => link),
    extra: [...found].filter(([key]) => !wanted.has(key)).map(([, link]) => link) };
}

export async function measureQualification(specFile, { matchLinks, baseline = false } = {}) {
  const spec = readSpec(specFile), temporary = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-measure-")));
  try {
    const reader = await hubReader(spec.hub), graph = await loadHubGraph(reader, 256 * 1024);
    const records = [...graph.concepts.values()].flatMap((item) => {
      const record = readRepositoryIdentityRecord(item.document);
      return record ? [record] : [];
    });
    const repos = spec.repos.map((repo) => {
      const source = discoverRepositorySourceState(repo.root);
      const resolution = resolveRepositoryIdentity({ displayName: source.displayName, ...source.identityHints }, records);
      requireInput(resolution.kind !== "ambiguous");
      return { ...repo, source, repositoryId: resolution.repository.id, remotes: source.identityHints.remotes };
    });
    const nameMatches = baseline || matchLinks ? undefined : comparePublishedNameLinks(repos, matchRepositoryNames(repos), graph);
    const candidates = matchLinks ? await matchLinks(repos, graph) : nameMatches?.links ?? [];
    const retrieval = [];
    for (const question of spec.questions) {
      const response = await searchHubConceptsWithFreshness(reader, question.text,
        { limit: 64, ...(spec.hub.domain ? { domain: spec.hub.domain } : { global: true }) });
      const matches = response.status === "ok" ? response.matches : [];
      const expected = question.expected.map((target) => {
        const index = matches.findIndex((match) => {
          if (target.concept_id !== undefined) return match.identity === target.concept_id;
          const split = target.source.indexOf(":"), repo = repos.find((item) => item.id === target.source.slice(0, split));
          const document = graph.concepts.get(match.identity)?.document;
          return (Array.isArray(document?.frontmatter.sources) ? document.frontmatter.sources : []).some((source) => {
            const parsed = source && typeof source === "object" && !Array.isArray(source)
              && typeof source.resource === "string" ? parseRepositorySourceResource(source.resource) : undefined;
            return parsed?.repositoryId === repo.repositoryId && parsed.relativePath === target.source.slice(split + 1);
          });
        });
        return { ...target, rank: index < 0 ? null : index + 1, hit_at_1: index === 0, hit_at_5: index >= 0 && index < 5 };
      });
      retrieval.push({ id: question.id, status: response.status, expected,
        top_5: matches.slice(0, 5).map((match) => match.identity),
        hit_at_1: expected.every((item) => item.hit_at_1), hit_at_5: expected.every((item) => item.hit_at_5) });
    }
    const seeds = repos.map((repo, index) => {
      const discovery = new DiscoverySession(path.join(temporary, `seed-${index}`));
      const sourceCommit = repo.source.commit ?? createHash("sha1").update(repo.id).digest("hex");
      discovery.arm({ repositoryId: repo.repositoryId, requestedRoot: repo.root, analysisRoot: repo.root,
        defaultBranch: "main", commit: sourceCommit, kind: "current-checkout", createdAt: "2026-10-07T00:00:00Z",
        privateRoot: temporary, remote: { host: "github.com", repository: `fixtures/${repo.id}`,
          canonicalHttpsUrl: `https://github.com/fixtures/${repo.id}.git` } }, "new");
      discovery.capture(repo.root);
      const seed = discovery.activeSeed;
      return { id: repo.id, ...byteCost(seed), groups: seed.groups.length,
        selected_files: seed.capture.census?.selectedFiles ?? 0, limitations: seed.capture.limitations.length };
    });
    const targets = retrieval.flatMap((item) => item.expected);
    return { version: 1, mode: "offline-deterministic", link_mode: baseline ? "empty-baseline" : "source-matcher",
      links: linkMetrics(spec.links, candidates), retrieval: { questions: retrieval, omitted_documents: graph.omissions.length,
        targets: targets.length, hit_at_1: targets.length ? targets.filter((target) => target.hit_at_1).length / targets.length : null,
        hit_at_5: targets.length ? targets.filter((target) => target.hit_at_5).length / targets.length : null },
      ...(nameMatches ? { matching: { published: nameMatches.links.filter((link) => link.published).length,
        questions: nameMatches.questions.slice(0, 50), referenced_not_defined: nameMatches.referencedNotDefined.slice(0, 50),
        counts: { questions: nameMatches.questions.length, referenced_not_defined: nameMatches.referencedNotDefined.length },
        omitted: { questions: Math.max(0, nameMatches.questions.length - 50), referenced_not_defined: Math.max(0, nameMatches.referencedNotDefined.length - 50) },
        module_version_drift: nameMatches.moduleVersionDrift, limitations: nameMatches.limitations } } : {}),
      costs: { token_estimate: "UTF-8 JSON bytes / 4; not model tokenization", seeds,
        ...await measureFixtureCosts(path.join(temporary, "cost-fixture")) } };
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

export function measurementTable(result) {
  return ["Metric | Value", "--- | ---", `Link recall | ${result.links.matched}/${result.links.expected}`,
    `Link precision | ${result.links.candidates ? `${result.links.matched}/${result.links.candidates}` : "n/a (no candidates)"}`,
    `Retrieval hit@1 / hit@5 | ${result.retrieval.hit_at_1} / ${result.retrieval.hit_at_5}`,
    `listTools bytes / estimated tokens | ${result.costs.list_tools.bytes} / ${result.costs.list_tools.estimated_tokens}`,
    ...Object.entries(result.costs.ingest).map(([name, cost]) => `${name} bytes / estimated tokens | ${cost.bytes} / ${cost.estimated_tokens}`)].join("\n");
}

export async function main(args = process.argv.slice(2)) {
  try {
    const baseline = args.includes("--baseline");
    args = args.filter((value) => value !== "--baseline");
    requireInput(args.length === 1 || args.length === 3 && args[1] === "--output");
    const result = await measureQualification(args[0], { baseline }), serialized = `${JSON.stringify(result, null, 2)}\n`;
    if (args[1] === "--output") {
      const output = path.resolve(args[2]);
      requireInput(!fs.existsSync(output) || !fs.lstatSync(output).isSymbolicLink());
      fs.writeFileSync(output, serialized, { mode: 0o600 });
      fs.chmodSync(output, 0o600);
    }
    else process.stdout.write(serialized);
    process.stderr.write(`${measurementTable(result)}\n`);
    return 0;
  } catch {
    process.stderr.write("Qualification failed: check the local spec, Git repositories and synced Hub. No source details are printed.\n");
    return 1;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) process.exitCode = await main();
