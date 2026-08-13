import {
  ContractValidationError,
  type CodeEdge,
  type CodeNode,
  type NeighborhoodFound,
  type NeighborhoodQuery,
  type QueryValidation,
  type RepositoryBoundary,
  type RepositoryEntryPoint,
  type RepositoryLanguage,
  type RepositoryMap,
  type RepositoryOverview,
  type SourceReference,
  type SnapshotIdentity,
  type TaskContextFound,
  type TaskContextQuery,
} from "./contract.ts";

function requireText(value: string, label: string): void {
  if (!value.trim()) throw new ContractValidationError("EMPTY_IDENTITY", `${label} must be non-empty`);
}

function requireRelativePath(value: string, label: string): void {
  requireText(value, label);
  if (value.startsWith("/") || value.includes("\\") || value.split("/").some((part) => part === ".." || part === "." || part === "")) {
    throw new ContractValidationError("INVALID_PATH", `${label} must be a normalized repository-relative path`);
  }
}

function requireCount(value: number, label: string, minimum = 0): void {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new ContractValidationError("INVALID_COUNT", `${label} must be a safe integer greater than or equal to ${minimum}`);
  }
}

function normalizeSourceReference(source: SourceReference, label: string): SourceReference {
  requireRelativePath(source.path, `${label} path`);
  if ((source.startLine === undefined) !== (source.endLine === undefined)) {
    throw new ContractValidationError("INVALID_SOURCE_SPAN", `${label} must provide both startLine and endLine`);
  }
  if (source.startLine !== undefined && source.endLine !== undefined) {
    requireCount(source.startLine, `${label} startLine`, 1);
    requireCount(source.endLine, `${label} endLine`, source.startLine);
  }
  return { ...source };
}

function compareSources(left: SourceReference, right: SourceReference): number {
  return left.path.localeCompare(right.path)
    || (left.startLine ?? 0) - (right.startLine ?? 0)
    || (left.endLine ?? 0) - (right.endLine ?? 0);
}

function uniqueText(values: readonly string[], label: string): readonly string[] {
  const normalized = values.map((value) => {
    requireText(value, label);
    return value;
  }).sort();
  if (new Set(normalized).size !== normalized.length) {
    throw new ContractValidationError("DUPLICATE_VALUE", `${label} values must be unique`);
  }
  return normalized;
}

function uniqueById<T extends { readonly id: string }>(values: readonly T[], label: string): readonly T[] {
  const seen = new Set<string>();
  for (const value of values) {
    requireText(value.id, `${label} id`);
    if (seen.has(value.id)) throw new ContractValidationError("DUPLICATE_ID", `duplicate ${label} id: ${value.id}`);
    seen.add(value.id);
  }
  return [...values].sort((left, right) => left.id.localeCompare(right.id));
}

function normalizeSnapshot(snapshot: SnapshotIdentity): SnapshotIdentity {
  requireText(snapshot.snapshotId, "snapshotId");
  requireText(snapshot.repositoryId, "repositoryId");
  requireText(snapshot.revision, "revision");
  return { ...snapshot, limitations: [...snapshot.limitations].sort() };
}

function normalizeNodes(nodes: readonly CodeNode[]): readonly CodeNode[] {
  for (const node of nodes) {
    requireText(node.name, "node name");
    requireRelativePath(node.file, "node file");
  }
  return uniqueById(nodes, "node");
}

function normalizeEdges(edges: readonly CodeEdge[], nodeIds: ReadonlySet<string>): readonly CodeEdge[] {
  for (const edge of edges) {
    requireRelativePath(edge.evidenceFile, "edge evidenceFile");
    if (!nodeIds.has(edge.source)) throw new ContractValidationError("DANGLING_EDGE", `edge ${edge.id} has unknown source ${edge.source}`);
    if (!nodeIds.has(edge.target)) throw new ContractValidationError("DANGLING_EDGE", `edge ${edge.id} has unknown target ${edge.target}`);
  }
  return uniqueById(edges, "edge");
}

export function normalizeRepositoryMap(map: RepositoryMap): RepositoryMap {
  requireText(map.repository.repositoryId, "repositoryId");
  requireText(map.repository.displayName, "displayName");
  requireText(map.repository.revision, "repository revision");
  const snapshot = normalizeSnapshot(map.snapshot);
  if (snapshot.repositoryId !== map.repository.repositoryId || snapshot.revision !== map.repository.revision) {
    throw new ContractValidationError("IDENTITY_MISMATCH", "repository and snapshot identities must describe the same revision");
  }
  const nodes = normalizeNodes(map.nodes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  return {
    repository: { ...map.repository },
    snapshot,
    nodes,
    edges: normalizeEdges(map.edges, nodeIds),
    diagnostics: [...map.diagnostics].sort(),
  };
}

export function normalizeNeighborhood(result: NeighborhoodFound): NeighborhoodFound {
  const snapshot = normalizeSnapshot(result.snapshot);
  requireText(result.subjectId, "subjectId");
  const nodes = normalizeNodes(result.nodes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  if (!nodeIds.has(result.subjectId)) {
    throw new ContractValidationError("SUBJECT_MISSING", `neighborhood does not contain subject ${result.subjectId}`);
  }
  return {
    ...result,
    snapshot,
    nodes,
    edges: normalizeEdges(result.edges, nodeIds),
    diagnostics: [...result.diagnostics].sort(),
  };
}

export function validateNeighborhoodQuery(query: NeighborhoodQuery): QueryValidation {
  if (!query.snapshotId.trim()) return { valid: false, code: "INVALID_SNAPSHOT_ID", message: "snapshotId must be non-empty" };
  if (!query.subjectId.trim()) return { valid: false, code: "INVALID_SUBJECT_ID", message: "subjectId must be non-empty" };
  if (!Number.isInteger(query.maxDepth) || query.maxDepth < 0 || query.maxDepth > 8) {
    return { valid: false, code: "INVALID_MAX_DEPTH", message: "maxDepth must be an integer from 0 through 8" };
  }
  return { valid: true };
}

export function normalizeRepositoryOverview(overview: RepositoryOverview): RepositoryOverview {
  requireText(overview.repositoryId, "repositoryId");
  requireText(overview.summary, "overview summary");
  const languages = overview.languages.map((language: RepositoryLanguage) => {
    requireText(language.name, "language name");
    requireCount(language.fileCount, "language fileCount");
    return { ...language };
  }).sort((left, right) => left.name.localeCompare(right.name));
  if (new Set(languages.map((language) => language.name)).size !== languages.length) {
    throw new ContractValidationError("DUPLICATE_VALUE", "language names must be unique");
  }
  const entryPoints = overview.entryPoints.map((entry: RepositoryEntryPoint) => {
    requireText(entry.qualifiedName, "entry point qualifiedName");
    return { ...entry, ...normalizeSourceReference(entry, "entry point") };
  }).sort((left, right) => left.qualifiedName.localeCompare(right.qualifiedName));
  const boundaries = overview.boundaries.map((boundary: RepositoryBoundary) => {
    requireText(boundary.from, "boundary from");
    requireText(boundary.to, "boundary to");
    requireCount(boundary.calls, "boundary calls");
    return { ...boundary };
  }).sort((left, right) => left.from.localeCompare(right.from) || left.to.localeCompare(right.to));
  return {
    ...overview,
    languages,
    packages: uniqueText(overview.packages, "package"),
    entryPoints,
    boundaries,
    limitations: [...overview.limitations].sort(),
  };
}

export function validateTaskContextQuery(query: TaskContextQuery): QueryValidation {
  if (!query.repositoryId.trim()) return { valid: false, code: "INVALID_REPOSITORY_ID", message: "repositoryId must be non-empty" };
  if (!query.task.trim()) return { valid: false, code: "INVALID_TASK", message: "task must be non-empty" };
  if (!query.focus.length || query.focus.length > 20) {
    return { valid: false, code: "INVALID_FOCUS", message: "focus must contain from 1 through 20 structural queries" };
  }
  for (const focus of query.focus) {
    if (!focus.search.trim()) return { valid: false, code: "INVALID_FOCUS", message: "focus search must be non-empty" };
    if (focus.trace && (!focus.trace.functionName.trim() || !Number.isSafeInteger(focus.trace.depth)
      || focus.trace.depth < 1 || focus.trace.depth > 8)) {
      return { valid: false, code: "INVALID_TRACE", message: "trace requires a functionName and depth from 1 through 8" };
    }
  }
  if (!Number.isSafeInteger(query.maximumFiles) || query.maximumFiles < 1 || query.maximumFiles > 100) {
    return { valid: false, code: "INVALID_MAXIMUM_FILES", message: "maximumFiles must be an integer from 1 through 100" };
  }
  if (!Number.isSafeInteger(query.maximumFacts) || query.maximumFacts < 1 || query.maximumFacts > 1000) {
    return { valid: false, code: "INVALID_MAXIMUM_FACTS", message: "maximumFacts must be an integer from 1 through 1000" };
  }
  return { valid: true };
}

export function normalizeTaskContext(
  context: TaskContextFound,
  bounds: Pick<TaskContextQuery, "maximumFiles" | "maximumFacts">,
): TaskContextFound {
  requireText(context.repositoryId, "repositoryId");
  requireText(context.task, "task");
  requireCount(bounds.maximumFiles, "maximumFiles", 1);
  requireCount(bounds.maximumFacts, "maximumFacts", 1);
  if (context.facts.length > bounds.maximumFacts) {
    throw new ContractValidationError("FACT_LIMIT_EXCEEDED", `facts ${context.facts.length} exceed ${bounds.maximumFacts}`);
  }
  const facts = uniqueById(context.facts.map((fact) => {
    requireText(fact.statement, "fact statement");
    const sources = fact.sources.map((source) => normalizeSourceReference(source, `fact ${fact.id} source`)).sort(compareSources);
    return { ...fact, sources, providerReferences: uniqueText(fact.providerReferences, `fact ${fact.id} provider reference`) };
  }), "fact");
  const distinctFiles = new Set(facts.flatMap((fact) => fact.sources.map((source) => source.path))).size;
  if (distinctFiles > bounds.maximumFiles) {
    throw new ContractValidationError("FILE_LIMIT_EXCEEDED", `distinct files ${distinctFiles} exceed ${bounds.maximumFiles}`);
  }
  return { ...context, facts, limitations: [...context.limitations].sort() };
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(value);
}
