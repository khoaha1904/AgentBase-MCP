import { createHash } from "node:crypto";
import path from "node:path";

import type { SourceReference } from "../code-intelligence/index.ts";
import {
  EvidenceValidationError,
  type EvidenceFact,
  type JsonValue,
  type QueryEvidence,
  type RepositoryEvidenceBundle,
  type RepositoryEvidenceBundleInput,
} from "./repository-evidence.ts";

function requireText(value: string, label: string): void {
  if (!value.trim()) throw new EvidenceValidationError("EMPTY_VALUE", `${label} must be non-empty`);
}

function requireTimestamp(value: string, label: string): void {
  requireText(value, label);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new EvidenceValidationError("INVALID_TIMESTAMP", `${label} must be a canonical ISO timestamp`);
  }
}

function normalizeSource(source: SourceReference, label: string): SourceReference {
  requireText(source.path, `${label} path`);
  const normalized = path.posix.normalize(source.path);
  if (source.path.startsWith("/") || source.path.includes("\\") || normalized !== source.path
    || source.path.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new EvidenceValidationError("INVALID_PATH", `${label} path must be normalized and repository-relative`);
  }
  if ((source.startLine === undefined) !== (source.endLine === undefined)) {
    throw new EvidenceValidationError("INVALID_SOURCE_SPAN", `${label} must provide both line bounds`);
  }
  if (source.startLine !== undefined && source.endLine !== undefined
    && (!Number.isSafeInteger(source.startLine) || !Number.isSafeInteger(source.endLine)
      || source.startLine < 1 || source.endLine < source.startLine)) {
    throw new EvidenceValidationError("INVALID_SOURCE_SPAN", `${label} has an invalid line span`);
  }
  return { ...source };
}

function sourceOrder(left: SourceReference, right: SourceReference): number {
  return left.path.localeCompare(right.path)
    || (left.startLine ?? 0) - (right.startLine ?? 0)
    || (left.endLine ?? 0) - (right.endLine ?? 0);
}

function uniqueById<T extends { readonly id: string }>(values: readonly T[], label: string): readonly T[] {
  const ids = new Set<string>();
  for (const value of values) {
    requireText(value.id, `${label} id`);
    if (ids.has(value.id)) throw new EvidenceValidationError("DUPLICATE_ID", `duplicate ${label} id: ${value.id}`);
    ids.add(value.id);
  }
  return [...values].sort((left, right) => left.id.localeCompare(right.id));
}

function normalizeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((item) => normalizeJson(item));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => {
      requireText(key, "query input key");
      return [key, normalizeJson(item)];
    }));
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new EvidenceValidationError("INVALID_JSON", "query input numbers must be finite");
  }
  return value;
}

function normalizeFact(fact: EvidenceFact): EvidenceFact {
  requireText(fact.statement, `fact ${fact.id} statement`);
  return {
    ...fact,
    sources: fact.sources.map((source) => normalizeSource(source, `fact ${fact.id} source`)).sort(sourceOrder),
  };
}

function normalizeQuery(query: QueryEvidence): QueryEvidence {
  requireText(query.queryId, "queryId");
  return {
    ...query,
    input: normalizeJson(query.input) as Readonly<{ [key: string]: JsonValue }>,
    facts: uniqueById(query.facts.map(normalizeFact), "fact"),
    sourceReferences: query.sourceReferences.map((source) => normalizeSource(source, `query ${query.queryId} source`)).sort(sourceOrder),
    limitations: [...query.limitations].sort(),
  };
}

export function normalizeRepositoryEvidence(input: RepositoryEvidenceBundleInput): RepositoryEvidenceBundleInput {
  if (input.formatVersion !== 1) throw new EvidenceValidationError("FORMAT_UNSUPPORTED", "formatVersion must be 1");
  requireText(input.engine.packageIntegrity, "packageIntegrity");
  if (!/^[a-f0-9]{64}$/.test(input.engine.executableSha256)) {
    throw new EvidenceValidationError("INVALID_EXECUTABLE_DIGEST", "executableSha256 must be 64 lowercase hex characters");
  }
  if (!Number.isSafeInteger(input.engine.adapterVersion) || input.engine.adapterVersion < 1) {
    throw new EvidenceValidationError("INVALID_ADAPTER_VERSION", "adapterVersion must be a positive integer");
  }
  requireText(input.source.repositoryId, "repositoryId");
  requireText(input.source.displayName, "displayName");
  requireTimestamp(input.source.capturedAt, "capturedAt");
  requireTimestamp(input.generatedAt, "generatedAt");
  if (input.source.dirty && !input.source.dirtyDigest) {
    throw new EvidenceValidationError("DIRTY_DIGEST_MISSING", "dirty source state requires dirtyDigest");
  }
  if (!input.source.dirty && input.source.dirtyDigest !== null) {
    throw new EvidenceValidationError("CLEAN_DIGEST_PRESENT", "clean source state cannot carry dirtyDigest");
  }
  const queries = input.queries.map(normalizeQuery);
  const queryIds = new Set<string>();
  for (const query of queries) {
    if (queryIds.has(query.queryId)) throw new EvidenceValidationError("DUPLICATE_ID", `duplicate query id: ${query.queryId}`);
    queryIds.add(query.queryId);
  }
  return {
    ...input,
    source: { ...input.source, limitations: [...input.source.limitations].sort() },
    queries: queries.sort((left, right) => left.queryId.localeCompare(right.queryId)),
  };
}

export function createRepositoryEvidenceBundle(input: RepositoryEvidenceBundleInput): RepositoryEvidenceBundle {
  const normalized = normalizeRepositoryEvidence(input);
  const digest = createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  return { ...normalized, bundleDigest: `sha256:${digest}` };
}
