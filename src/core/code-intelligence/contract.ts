export type Completeness = "complete" | "partial";

export type RepositoryIdentity = Readonly<{
  repositoryId: string;
  displayName: string;
  revision: string;
}>;

export type SnapshotIdentity = Readonly<{
  snapshotId: string;
  repositoryId: string;
  revision: string;
  completeness: Completeness;
  limitations: readonly string[];
}>;

export type SourceLocation = Readonly<{
  line: number;
  column: number;
}>;

export type CodeNode = Readonly<{
  id: string;
  kind: "file" | "module" | "symbol" | "declaration";
  name: string;
  file: string;
  location?: SourceLocation;
  language?: string;
}>;

export type CodeEdge = Readonly<{
  id: string;
  kind: "contains" | "imports" | "calls";
  source: string;
  target: string;
  evidenceFile: string;
}>;

export type RepositoryMap = Readonly<{
  repository: RepositoryIdentity;
  snapshot: SnapshotIdentity;
  nodes: readonly CodeNode[];
  edges: readonly CodeEdge[];
  diagnostics: readonly string[];
}>;

export type RepositoryMapResult =
  | Readonly<{ status: "found"; map: RepositoryMap }>
  | Readonly<{ status: "repository-not-found"; repositoryId: string }>;

export type NeighborhoodQuery = Readonly<{
  snapshotId: string;
  subjectId: string;
  maxDepth: number;
  relationshipKinds?: readonly CodeEdge["kind"][];
}>;

export type NeighborhoodFound = Readonly<{
  status: "found";
  snapshot: SnapshotIdentity;
  subjectId: string;
  completeness: Completeness;
  nodes: readonly CodeNode[];
  edges: readonly CodeEdge[];
  diagnostics: readonly string[];
}>;

export type NeighborhoodResult =
  | NeighborhoodFound
  | Readonly<{ status: "snapshot-not-found"; snapshotId: string }>
  | Readonly<{ status: "subject-not-found"; snapshotId: string; subjectId: string }>
  | Readonly<{ status: "invalid-query"; code: string; message: string }>;

export interface CodeIntelligenceProvider {
  repositoryMap(repositoryId: string): Promise<RepositoryMapResult>;
  relevantNeighborhood(query: NeighborhoodQuery): Promise<NeighborhoodResult>;
}

export type EvidenceKind = "architecture" | "search" | "trace" | "snippet";

export type SourceReference = Readonly<{
  path: string;
  startLine?: number;
  endLine?: number;
}>;

export type RepositoryLanguage = Readonly<{
  name: string;
  fileCount: number;
}>;

export type RepositoryEntryPoint = Readonly<{
  qualifiedName: string;
  path: string;
  startLine?: number;
  endLine?: number;
}>;

export type RepositoryBoundary = Readonly<{
  from: string;
  to: string;
  calls: number;
}>;

export type RepositoryOverview = Readonly<{
  repositoryId: string;
  summary: string;
  languages: readonly RepositoryLanguage[];
  packages: readonly string[];
  entryPoints: readonly RepositoryEntryPoint[];
  boundaries: readonly RepositoryBoundary[];
  completeness: Completeness;
  limitations: readonly string[];
}>;

export type RepositoryOverviewResult =
  | Readonly<{ status: "found"; overview: RepositoryOverview }>
  | Readonly<{ status: "repository-not-found"; repositoryId: string }>
  | Readonly<{ status: "not-indexed"; repositoryId: string }>;

export type TaskEvidenceFact = Readonly<{
  id: string;
  kind: EvidenceKind;
  statement: string;
  sources: readonly SourceReference[];
  providerReferences: readonly string[];
}>;

export type TaskContextQuery = Readonly<{
  repositoryId: string;
  task: string;
  focus: readonly TaskContextFocus[];
  maximumFiles: number;
  maximumFacts: number;
}>;

export type TaskContextFocus = Readonly<{
  search: string;
  trace?: Readonly<{
    functionName: string;
    direction: "inbound" | "outbound" | "both";
    depth: number;
  }>;
}>;

export type TaskContextFound = Readonly<{
  status: "found";
  repositoryId: string;
  task: string;
  facts: readonly TaskEvidenceFact[];
  completeness: Completeness;
  limitations: readonly string[];
}>;

export type TaskContextResult =
  | TaskContextFound
  | Readonly<{ status: "repository-not-found"; repositoryId: string }>
  | Readonly<{ status: "not-indexed"; repositoryId: string }>
  | Readonly<{ status: "invalid-query"; code: string; message: string }>;

export interface TaskContextProvider {
  repositoryOverview(repositoryId: string): Promise<RepositoryOverviewResult>;
  relevantContext(query: TaskContextQuery): Promise<TaskContextResult>;
}

export type TaskContextConformanceExpectation = Readonly<{
  query: TaskContextQuery;
  expectedFactIds: readonly string[];
  runs: number;
}>;

export type TaskContextConformanceReport = Readonly<{
  passed: boolean;
  failures: readonly string[];
  missingFactIds: readonly string[];
  distinctFiles: number;
  serializations: readonly string[];
}>;

export type QueryValidation =
  | Readonly<{ valid: true }>
  | Readonly<{ valid: false; code: string; message: string }>;

export type ConformanceExpectation = Readonly<{
  repositoryId: string;
  query: NeighborhoodQuery;
  expectedNodeIds: readonly string[];
  expectedEdgeIds: readonly string[];
  maximumFiles: number;
  runs: number;
}>;

export type ConformanceReport = Readonly<{
  passed: boolean;
  failures: readonly string[];
  missingNodeIds: readonly string[];
  missingEdgeIds: readonly string[];
  distinctFiles: number;
  serializations: readonly string[];
}>;

export class ContractValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ContractValidationError";
    this.code = code;
  }
}
