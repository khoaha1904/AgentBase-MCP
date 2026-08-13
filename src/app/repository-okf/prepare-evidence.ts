import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { TaskContextProvider, TaskContextQuery, TaskEvidenceFact } from "../../core/code-intelligence/index.ts";
import {
  createRepositoryEvidenceBundle,
  type EngineIdentity,
  type EvidenceFact,
  type JsonValue,
  type QueryEvidence,
  type RepositoryEvidenceBundle,
  type RepositorySourceState,
} from "../../core/observations/index.ts";
import { discoverRepositorySourceState } from "./source-state.ts";

export type EvidencePreparation = Readonly<{
  provider: TaskContextProvider;
  engine: EngineIdentity;
  indexRepository(): Promise<unknown>;
  now?: () => string;
}>;

function treeFingerprint(target: string): string {
  if (!fs.existsSync(target)) return "absent";
  const hash = createHash("sha256");
  const walk = (current: string) => {
    const stat = fs.lstatSync(current);
    hash.update(`${path.relative(target, current).split(path.sep).join("/")}\0${stat.mode}\0`);
    if (stat.isSymbolicLink()) hash.update(fs.readlinkSync(current));
    else if (stat.isDirectory()) fs.readdirSync(current).sort().forEach((entry) => walk(path.join(current, entry)));
    else if (stat.isFile()) hash.update(fs.readFileSync(current));
  };
  walk(target);
  return `sha256:${hash.digest("hex")}`;
}

function mutationFingerprint(repositoryRoot: string): string {
  const hash = createHash("sha256");
  for (const relative of [".codebase-memory", ".gitattributes", ".gitignore"]) {
    hash.update(`${relative}\0${treeFingerprint(path.join(repositoryRoot, relative))}\0`);
  }
  return hash.digest("hex");
}

function sourceIdentityMatches(left: RepositorySourceState, right: RepositorySourceState): boolean {
  return left.repositoryId === right.repositoryId
    && left.commit === right.commit
    && left.dirty === right.dirty
    && left.dirtyDigest === right.dirtyDigest;
}

export type RepositoryIntegrityCheckpoint = Readonly<{
  source: RepositorySourceState;
  controlFingerprint: string;
}>;

export function captureRepositoryIntegrity(
  repositoryRoot: string,
  capturedAt = new Date().toISOString(),
): RepositoryIntegrityCheckpoint {
  return {
    source: discoverRepositorySourceState(repositoryRoot, capturedAt),
    controlFingerprint: mutationFingerprint(repositoryRoot),
  };
}

export function repositoryIntegrityMatches(
  left: RepositoryIntegrityCheckpoint,
  right: RepositoryIntegrityCheckpoint,
): boolean {
  return left.controlFingerprint === right.controlFingerprint
    && sourceIdentityMatches(left.source, right.source);
}

function assertSourceUnchanged(
  repositoryRoot: string,
  checkpoint: RepositoryIntegrityCheckpoint,
  stage: string,
): void {
  const current = captureRepositoryIntegrity(repositoryRoot, checkpoint.source.capturedAt);
  if (!repositoryIntegrityMatches(checkpoint, current)) {
    throw new Error(`Codebase Memory changed repository source or forbidden provider state during ${stage}`);
  }
}

function evidenceFact(fact: TaskEvidenceFact): EvidenceFact {
  return { id: fact.id, statement: fact.statement, sources: fact.sources };
}

function queryRecord(
  queryId: string,
  kind: QueryEvidence["kind"],
  input: Readonly<Record<string, JsonValue>>,
  facts: readonly EvidenceFact[],
  completeness: QueryEvidence["completeness"],
  limitations: readonly string[],
): QueryEvidence {
  const sourceReferences = facts.flatMap((fact) => fact.sources).filter((source, index, values) => values.findIndex((candidate) => (
    candidate.path === source.path && candidate.startLine === source.startLine && candidate.endLine === source.endLine
  )) === index);
  return { queryId, kind, input, facts, sourceReferences, completeness, limitations };
}

function focusInput(query: TaskContextQuery): JsonValue {
  return query.focus.map((focus) => ({
    search: focus.search,
    ...(focus.trace ? { trace: { ...focus.trace } } : {}),
  }));
}

export async function prepareRepositoryEvidence(
  repositoryRoot: string,
  query: Omit<TaskContextQuery, "repositoryId">,
  dependencies: EvidencePreparation,
): Promise<RepositoryEvidenceBundle> {
  const now = dependencies.now ?? (() => new Date().toISOString());
  const checkpoint = captureRepositoryIntegrity(repositoryRoot, now());
  const source = checkpoint.source;
  await dependencies.indexRepository();
  assertSourceUnchanged(repositoryRoot, checkpoint, "indexing");
  const boundedQuery: TaskContextQuery = { ...query, repositoryId: source.repositoryId };
  const overviewResult = await dependencies.provider.repositoryOverview(source.repositoryId);
  if (overviewResult.status !== "found") throw new Error(`repository overview failed: ${overviewResult.status}`);
  const contextResult = await dependencies.provider.relevantContext(boundedQuery);
  if (contextResult.status !== "found") throw new Error(`task context failed: ${contextResult.status}`);
  assertSourceUnchanged(repositoryRoot, checkpoint, "graph queries");

  const architectureFacts: EvidenceFact[] = overviewResult.overview.boundaries.map((boundary) => ({
    id: `architecture:boundary:${boundary.from}:${boundary.to}`,
    statement: `The architecture reports an ${boundary.from}-to-${boundary.to} call boundary`,
    sources: [],
  }));
  const taskFacts = contextResult.facts.map(evidenceFact);
  const searchFacts = taskFacts.filter((fact) => fact.id.startsWith("search:"));
  const traceFacts = taskFacts.filter((fact) => fact.id.startsWith("trace:"));
  const snippetFacts: EvidenceFact[] = taskFacts.filter((fact) => fact.sources.length).map((fact) => ({
    id: `snippet:${fact.id}`,
    statement: `Bounded source was captured for ${fact.id}`,
    sources: fact.sources,
  }));
  const limitations = [...overviewResult.overview.limitations, ...contextResult.limitations].sort();
  const records = [
    queryRecord(
      "query:architecture",
      "architecture",
      { repositoryId: source.repositoryId },
      architectureFacts,
      overviewResult.overview.completeness,
      overviewResult.overview.limitations,
    ),
    queryRecord(
      "query:search",
      "search",
      { focus: focusInput(boundedQuery), maximumFacts: boundedQuery.maximumFacts },
      searchFacts,
      contextResult.completeness,
      limitations,
    ),
    queryRecord(
      "query:trace",
      "trace",
      { focus: focusInput(boundedQuery), maximumFiles: boundedQuery.maximumFiles },
      traceFacts,
      contextResult.completeness,
      limitations,
    ),
    queryRecord(
      "query:snippet",
      "snippet",
      { maximumFiles: boundedQuery.maximumFiles },
      snippetFacts,
      contextResult.completeness,
      contextResult.limitations,
    ),
  ];
  return createRepositoryEvidenceBundle({
    formatVersion: 1,
    engine: dependencies.engine,
    source,
    queries: records,
    generatedAt: now(),
  });
}
