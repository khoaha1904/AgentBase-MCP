import {
  normalizeRepositoryOverview,
  normalizeTaskContext,
  validateTaskContextQuery,
  type RepositoryOverview,
  type RepositoryOverviewResult,
  type TaskContextFound,
  type TaskContextProvider,
  type TaskContextQuery,
  type TaskContextResult,
  type TaskEvidenceFact,
} from "../../core/code-intelligence/index.ts";
import {
  parseArchitecture,
  parseSearch,
  parseSnippet,
  parseTrace,
} from "./response-parser.ts";

export type CodebaseMemoryTool = "index_repository" | "get_architecture" | "search_graph" | "trace_path" | "get_code_snippet";
export type ProviderInvoker = (tool: CodebaseMemoryTool, argumentsValue: Readonly<Record<string, unknown>>) => Promise<unknown>;

export type CodebaseMemoryAdapterOptions = Readonly<{
  repositoryId: string;
  repositoryRoot: string;
  project: string;
  invoke: ProviderInvoker;
}>;

function packageName(qualifiedName: string): string {
  const suffix = qualifiedName.split(".src.")[1];
  return suffix?.split(".")[0] ?? "unknown";
}

function boundedFacts(candidates: readonly TaskEvidenceFact[], query: TaskContextQuery): Readonly<{ facts: readonly TaskEvidenceFact[]; truncated: boolean }> {
  const facts: TaskEvidenceFact[] = [];
  const files = new Set<string>();
  for (const fact of candidates) {
    if (facts.length >= query.maximumFacts) break;
    const candidateFiles = new Set([...files, ...fact.sources.map((source) => source.path)]);
    if (candidateFiles.size > query.maximumFiles) continue;
    facts.push(fact);
    fact.sources.forEach((source) => files.add(source.path));
  }
  return { facts, truncated: facts.length !== candidates.length };
}

export class CodebaseMemoryAdapter implements TaskContextProvider {
  readonly #options: CodebaseMemoryAdapterOptions;
  #overview?: RepositoryOverview;

  constructor(options: CodebaseMemoryAdapterOptions) {
    this.#options = options;
  }

  async repositoryOverview(repositoryId: string): Promise<RepositoryOverviewResult> {
    if (repositoryId !== this.#options.repositoryId) return { status: "repository-not-found", repositoryId };
    if (this.#overview) return { status: "found", overview: this.#overview };
    const response = await this.#options.invoke("get_architecture", {
      project: this.#options.project,
      aspects: ["all"],
    });
    this.#overview = normalizeRepositoryOverview(parseArchitecture(repositoryId, response));
    return { status: "found", overview: this.#overview };
  }

  async relevantContext(query: TaskContextQuery): Promise<TaskContextResult> {
    const validation = validateTaskContextQuery(query);
    if (!validation.valid) return { status: "invalid-query", code: validation.code, message: validation.message };
    if (query.repositoryId !== this.#options.repositoryId) return { status: "repository-not-found", repositoryId: query.repositoryId };
    const overviewResult = await this.repositoryOverview(query.repositoryId);
    if (overviewResult.status !== "found") return overviewResult;
    const candidates: TaskEvidenceFact[] = overviewResult.overview.boundaries.map((boundary) => ({
      id: `architecture:boundary:${boundary.from}:${boundary.to}`,
      kind: "architecture",
      statement: `The architecture reports an ${boundary.from}-to-${boundary.to} call boundary`,
      sources: [],
      providerReferences: [`architecture:boundary:${boundary.from}:${boundary.to}`],
    }));

    for (const focus of query.focus) {
      const searchResponse = await this.#options.invoke("search_graph", {
        project: this.#options.project,
        query: focus.search,
        label: "Function",
        limit: 10,
        format: "json",
      });
      const hits = parseSearch(searchResponse);
      for (const hit of hits) {
        const snippetResponse = await this.#options.invoke("get_code_snippet", {
          project: this.#options.project,
          qualified_name: hit.qualifiedName,
          include_neighbors: false,
        });
        const snippet = parseSnippet(this.#options.repositoryRoot, snippetResponse);
        candidates.push({
          id: `search:${hit.qualifiedName}`,
          kind: "search",
          statement: `${snippet.name} is a ${snippet.label} in ${snippet.source.path} at lines ${snippet.source.startLine}-${snippet.source.endLine}`,
          sources: [snippet.source],
          providerReferences: [`search:${hit.qualifiedName}`, `snippet:${hit.qualifiedName}`],
        });
      }
      if (!focus.trace) continue;
      const traceResponse = await this.#options.invoke("trace_path", {
        project: this.#options.project,
        function_name: focus.trace.functionName,
        direction: focus.trace.direction,
        depth: focus.trace.depth,
        limit: 20,
        mode: "calls",
        format: "json",
      });
      const trace = parseTrace(traceResponse);
      for (const call of trace.calls) {
        const snippetResponse = await this.#options.invoke("get_code_snippet", {
          project: this.#options.project,
          qualified_name: call.qualifiedName,
          include_neighbors: false,
        });
        const snippet = parseSnippet(this.#options.repositoryRoot, snippetResponse);
        candidates.push({
          id: `trace:${trace.functionName}:${call.qualifiedName}`,
          kind: "trace",
          statement: `${trace.functionName} calls ${packageName(call.qualifiedName)} ${call.name} at hop ${call.hop}`,
          sources: [snippet.source],
          providerReferences: [`trace:${trace.functionName}:${call.qualifiedName}`, `snippet:${call.qualifiedName}`],
        });
      }
    }
    const selected = boundedFacts(candidates, query);
    const result: TaskContextFound = {
      status: "found",
      repositoryId: query.repositoryId,
      task: query.task,
      facts: selected.facts,
      completeness: selected.truncated ? "partial" : "complete",
      limitations: selected.truncated ? ["task context was truncated by the requested file or fact boundary"] : [],
    };
    return normalizeTaskContext(result, query);
  }
}

export async function indexRepository(project: string, repositoryRoot: string, invoke: ProviderInvoker): Promise<unknown> {
  return invoke("index_repository", { repo_path: repositoryRoot, mode: "fast", name: project, persistence: false });
}
