import type {
  CodeEdge,
  CodeNode,
  ConformanceExpectation,
  NeighborhoodFound,
  RepositoryMap,
  RepositoryOverview,
  TaskContextConformanceExpectation,
  TaskContextFound,
} from "../../core/code-intelligence/index.ts";

const repository = {
  repositoryId: "fixture:typescript-modular-monolith",
  displayName: "TypeScript Modular Monolith Fixture",
  revision: "fixture-v1",
} as const;

const snapshot = {
  snapshotId: "fixture:typescript-modular-monolith@fixture-v1",
  repositoryId: repository.repositoryId,
  revision: repository.revision,
  completeness: "complete",
  limitations: ["explicit fake data; no source parsing performed"],
} as const;

export const authoredFiles = [
  "src/app/cli.ts",
  "src/app/index.ts",
  "src/app/inspect.ts",
  "src/app/report.ts",
  "src/catalog/format.ts",
  "src/catalog/index.ts",
  "src/catalog/models.ts",
  "src/catalog/repository.ts",
  "src/workspace/index.ts",
  "src/workspace/paths.ts",
  "src/workspace/policy.ts",
  "src/workspace/state.ts",
] as const;

const fileNodes: readonly CodeNode[] = authoredFiles.map((file) => ({
  id: `file:${file}`,
  kind: "file",
  name: file.split("/").at(-1) ?? file,
  file,
  language: "typescript",
}));

const evidenceNodes: readonly CodeNode[] = [
  { id: "module:catalog", kind: "module", name: "catalog", file: "src/catalog/index.ts", language: "typescript" },
  { id: "module:workspace", kind: "module", name: "workspace", file: "src/workspace/index.ts", language: "typescript" },
  { id: "symbol:app/inspect.ts#inspectWorkspace", kind: "symbol", name: "inspectWorkspace", file: "src/app/inspect.ts", language: "typescript" },
  { id: "symbol:catalog/index.ts#listModules", kind: "symbol", name: "listModules", file: "src/catalog/index.ts", language: "typescript" },
  { id: "symbol:workspace/index.ts#resolveWorkspace", kind: "symbol", name: "resolveWorkspace", file: "src/workspace/index.ts", language: "typescript" },
  { id: "symbol:catalog/models.ts#CatalogEntry", kind: "declaration", name: "CatalogEntry", file: "src/catalog/models.ts", language: "typescript" },
];

const evidenceEdges: readonly CodeEdge[] = [
  {
    id: "calls:inspectWorkspace->listModules",
    kind: "calls",
    source: "symbol:app/inspect.ts#inspectWorkspace",
    target: "symbol:catalog/index.ts#listModules",
    evidenceFile: "src/app/inspect.ts",
  },
  {
    id: "calls:inspectWorkspace->resolveWorkspace",
    kind: "calls",
    source: "symbol:app/inspect.ts#inspectWorkspace",
    target: "symbol:workspace/index.ts#resolveWorkspace",
    evidenceFile: "src/app/inspect.ts",
  },
  {
    id: "contains:app/inspect.ts#inspectWorkspace",
    kind: "contains",
    source: "file:src/app/inspect.ts",
    target: "symbol:app/inspect.ts#inspectWorkspace",
    evidenceFile: "src/app/inspect.ts",
  },
  { id: "imports:app/inspect.ts->catalog", kind: "imports", source: "file:src/app/inspect.ts", target: "module:catalog", evidenceFile: "src/app/inspect.ts" },
  {
    id: "imports:app/inspect.ts->workspace",
    kind: "imports",
    source: "file:src/app/inspect.ts",
    target: "module:workspace",
    evidenceFile: "src/app/inspect.ts",
  },
];

export const fixtureRepositoryMap: RepositoryMap = {
  repository,
  snapshot,
  nodes: [...fileNodes, ...evidenceNodes],
  edges: evidenceEdges,
  diagnostics: [],
};

const acceptedNodeIds = [
  "file:src/app/inspect.ts",
  "module:catalog",
  "module:workspace",
  "symbol:app/inspect.ts#inspectWorkspace",
  "symbol:catalog/index.ts#listModules",
  "symbol:workspace/index.ts#resolveWorkspace",
] as const;

export const acceptedNeighborhood: NeighborhoodFound = {
  status: "found",
  snapshot,
  subjectId: "symbol:app/inspect.ts#inspectWorkspace",
  completeness: "complete",
  nodes: [...fileNodes, ...evidenceNodes].filter((node) => acceptedNodeIds.includes(node.id as typeof acceptedNodeIds[number])),
  edges: evidenceEdges,
  diagnostics: [],
};

export const isolatedNeighborhood: NeighborhoodFound = {
  status: "found",
  snapshot,
  subjectId: "symbol:catalog/models.ts#CatalogEntry",
  completeness: "complete",
  nodes: evidenceNodes.filter((node) => node.id === "symbol:catalog/models.ts#CatalogEntry"),
  edges: [],
  diagnostics: [],
};

export const fixtureExpectation: ConformanceExpectation = {
  repositoryId: repository.repositoryId,
  query: { snapshotId: snapshot.snapshotId, subjectId: acceptedNeighborhood.subjectId, maxDepth: 1 },
  expectedNodeIds: acceptedNodeIds,
  expectedEdgeIds: evidenceEdges.map((edge) => edge.id),
  maximumFiles: 3,
  runs: 5,
};

export const fixtureRepositoryOverview: RepositoryOverview = {
  repositoryId: repository.repositoryId,
  summary: "TypeScript repository with app, catalog and workspace packages.",
  languages: [{ name: "TypeScript", fileCount: 12 }],
  packages: ["workspace", "catalog", "app"],
  entryPoints: [
    { qualifiedName: "agentbase-typescript-fixture.src.app.inspect.inspectWorkspace", path: "src/app/inspect.ts", startLine: 4, endLine: 6 },
    { qualifiedName: "agentbase-typescript-fixture.src.catalog.repository.listModules", path: "src/catalog/repository.ts", startLine: 3, endLine: 5 },
    { qualifiedName: "agentbase-typescript-fixture.src.workspace.paths.resolveWorkspace", path: "src/workspace/paths.ts", startLine: 3, endLine: 6 },
  ],
  boundaries: [
    { from: "app", to: "workspace", calls: 1 },
    { from: "app", to: "catalog", calls: 1 },
  ],
  completeness: "complete",
  limitations: ["explicit fake data derived from the sanitized v0.10.1 spike"],
};

export const fixtureTaskContext: TaskContextFound = {
  status: "found",
  repositoryId: repository.repositoryId,
  task: "Trace the inspectWorkspace flow across its public catalog and workspace boundaries",
  facts: [
    {
      id: "search:agentbase-typescript-fixture.src.app.inspect.inspectWorkspace",
      kind: "search",
      statement: "inspectWorkspace is a Function in src/app/inspect.ts at lines 4-6",
      sources: [{ path: "src/app/inspect.ts", startLine: 4, endLine: 6 }],
      providerReferences: ["search:inspectWorkspace", "snippet:inspectWorkspace"],
    },
    {
      id: "trace:inspectWorkspace:agentbase-typescript-fixture.src.catalog.repository.listModules",
      kind: "trace",
      statement: "inspectWorkspace calls catalog listModules at hop 1",
      sources: [{ path: "src/catalog/repository.ts", startLine: 3, endLine: 5 }],
      providerReferences: ["trace:inspectWorkspace:listModules", "snippet:listModules"],
    },
    {
      id: "trace:inspectWorkspace:agentbase-typescript-fixture.src.workspace.paths.resolveWorkspace",
      kind: "trace",
      statement: "inspectWorkspace calls workspace resolveWorkspace at hop 1",
      sources: [{ path: "src/workspace/paths.ts", startLine: 3, endLine: 6 }],
      providerReferences: ["trace:inspectWorkspace:resolveWorkspace", "snippet:resolveWorkspace"],
    },
    {
      id: "architecture:boundary:app:catalog",
      kind: "architecture",
      statement: "The architecture reports an app-to-catalog call boundary",
      sources: [],
      providerReferences: ["architecture:boundary:app:catalog"],
    },
    {
      id: "architecture:boundary:app:workspace",
      kind: "architecture",
      statement: "The architecture reports an app-to-workspace call boundary",
      sources: [],
      providerReferences: ["architecture:boundary:app:workspace"],
    },
  ],
  completeness: "complete",
  limitations: [],
};

export const fixtureTaskContextExpectation: TaskContextConformanceExpectation = {
  query: {
    repositoryId: repository.repositoryId,
    task: fixtureTaskContext.task,
    focus: [{ search: "inspectWorkspace", trace: { functionName: "inspectWorkspace", direction: "outbound", depth: 1 } }],
    maximumFiles: 3,
    maximumFacts: 5,
  },
  expectedFactIds: fixtureTaskContext.facts.map((fact) => fact.id),
  runs: 5,
};
