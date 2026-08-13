import type { Completeness, EvidenceKind, SourceReference } from "../code-intelligence/index.ts";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | Readonly<{ [key: string]: JsonValue }>;

export type EngineIdentity = Readonly<{
  provider: "codebase-memory-mcp";
  packageName: "codebase-memory-mcp";
  providerVersion: "0.10.1";
  packageIntegrity: string;
  executableSha256: string;
  adapterVersion: number;
  invocationMode: "one-shot-cli" | "scoped-session";
}>;

export type RepositorySourceState = Readonly<{
  repositoryId: string;
  displayName: string;
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
  capturedAt: string;
  limitations: readonly string[];
}>;

export type EvidenceFact = Readonly<{
  id: string;
  statement: string;
  sources: readonly SourceReference[];
}>;

export type QueryEvidence = Readonly<{
  queryId: string;
  kind: EvidenceKind;
  input: Readonly<{ [key: string]: JsonValue }>;
  facts: readonly EvidenceFact[];
  sourceReferences: readonly SourceReference[];
  completeness: Completeness;
  limitations: readonly string[];
}>;

export type RepositoryEvidenceBundleInput = Readonly<{
  formatVersion: 1;
  engine: EngineIdentity;
  source: RepositorySourceState;
  queries: readonly QueryEvidence[];
  generatedAt: string;
}>;

export type RepositoryEvidenceBundle = RepositoryEvidenceBundleInput & Readonly<{
  bundleDigest: string;
}>;

export class EvidenceValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "EvidenceValidationError";
    this.code = code;
  }
}
