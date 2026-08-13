import {
  normalizeNeighborhood,
  normalizeRepositoryMap,
  validateNeighborhoodQuery,
  type CodeIntelligenceProvider,
  type NeighborhoodQuery,
  type NeighborhoodResult,
  type RepositoryMap,
  type RepositoryMapResult,
  type RepositoryOverview,
  type RepositoryOverviewResult,
  type TaskContextFound,
  type TaskContextProvider,
  type TaskContextQuery,
  type TaskContextResult,
  type TaskEvidenceFact,
  normalizeRepositoryOverview,
  normalizeTaskContext,
  validateTaskContextQuery,
} from "../../core/code-intelligence/index.ts";

export class FakeCodeIntelligenceProvider implements CodeIntelligenceProvider, TaskContextProvider {
  readonly #map: RepositoryMap;
  readonly #neighborhoods: ReadonlyMap<string, NeighborhoodResult>;
  readonly #overview?: RepositoryOverview;
  readonly #taskContext?: TaskContextFound;

  constructor(
    map: RepositoryMap,
    neighborhoods: ReadonlyMap<string, NeighborhoodResult>,
    taskValues?: Readonly<{ overview: RepositoryOverview; context: TaskContextFound }>,
  ) {
    this.#map = normalizeRepositoryMap(map);
    this.#neighborhoods = new Map([...neighborhoods].map(([subject, result]) => [
      subject,
      result.status === "found" ? normalizeNeighborhood(result) : result,
    ]));
    if (taskValues) {
      this.#overview = normalizeRepositoryOverview(taskValues.overview);
      this.#taskContext = normalizeTaskContext(taskValues.context, { maximumFiles: 100, maximumFacts: 1000 });
    }
  }

  async repositoryMap(repositoryId: string): Promise<RepositoryMapResult> {
    if (repositoryId !== this.#map.repository.repositoryId) return { status: "repository-not-found", repositoryId };
    return { status: "found", map: this.#map };
  }

  async relevantNeighborhood(query: NeighborhoodQuery): Promise<NeighborhoodResult> {
    const validation = validateNeighborhoodQuery(query);
    if (!validation.valid) return { status: "invalid-query", code: validation.code, message: validation.message };
    if (query.snapshotId !== this.#map.snapshot.snapshotId) return { status: "snapshot-not-found", snapshotId: query.snapshotId };
    const result = this.#neighborhoods.get(query.subjectId);
    if (!result) return { status: "subject-not-found", snapshotId: query.snapshotId, subjectId: query.subjectId };
    if (result.status !== "found") return result;
    if (query.maxDepth === 0) {
      return normalizeNeighborhood({
        ...result,
        nodes: result.nodes.filter((node) => node.id === result.subjectId),
        edges: [],
      });
    }
    if (query.relationshipKinds) {
      const allowed = new Set(query.relationshipKinds);
      const edges = result.edges.filter((edge) => allowed.has(edge.kind));
      const nodeIds = new Set([result.subjectId, ...edges.flatMap((edge) => [edge.source, edge.target])]);
      return normalizeNeighborhood({ ...result, nodes: result.nodes.filter((node) => nodeIds.has(node.id)), edges });
    }
    return result;
  }

  async repositoryOverview(repositoryId: string): Promise<RepositoryOverviewResult> {
    if (repositoryId !== this.#map.repository.repositoryId) return { status: "repository-not-found", repositoryId };
    if (!this.#overview) return { status: "not-indexed", repositoryId };
    return { status: "found", overview: this.#overview };
  }

  async relevantContext(query: TaskContextQuery): Promise<TaskContextResult> {
    const validation = validateTaskContextQuery(query);
    if (!validation.valid) return { status: "invalid-query", code: validation.code, message: validation.message };
    if (query.repositoryId !== this.#map.repository.repositoryId) return { status: "repository-not-found", repositoryId: query.repositoryId };
    if (!this.#taskContext) return { status: "not-indexed", repositoryId: query.repositoryId };
    const selected: TaskEvidenceFact[] = [];
    const files = new Set<string>();
    for (const fact of this.#taskContext.facts) {
      if (selected.length >= query.maximumFacts) break;
      const candidateFiles = new Set([...files, ...fact.sources.map((source) => source.path)]);
      if (candidateFiles.size > query.maximumFiles) continue;
      selected.push(fact);
      fact.sources.forEach((source) => files.add(source.path));
    }
    const omitted = selected.length !== this.#taskContext.facts.length;
    return normalizeTaskContext({
      ...this.#taskContext,
      task: query.task,
      facts: selected,
      completeness: omitted ? "partial" : this.#taskContext.completeness,
      limitations: omitted ? [...this.#taskContext.limitations, "fake context truncated by query bounds"] : this.#taskContext.limitations,
    }, query);
  }
}
