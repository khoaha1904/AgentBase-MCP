import type {
  CodeIntelligenceProvider,
  ConformanceExpectation,
  ConformanceReport,
  TaskContextConformanceExpectation,
  TaskContextConformanceReport,
  TaskContextProvider,
} from "./contract.ts";
import {
  normalizeNeighborhood,
  normalizeRepositoryMap,
  normalizeRepositoryOverview,
  normalizeTaskContext,
  stableSerialize,
  validateTaskContextQuery,
} from "./normalize.ts";

export async function evaluateConformance(
  provider: CodeIntelligenceProvider,
  expectation: ConformanceExpectation,
): Promise<ConformanceReport> {
  const failures: string[] = [];
  const mapResult = await provider.repositoryMap(expectation.repositoryId);
  if (mapResult.status !== "found") {
    failures.push(`repository map not found: ${expectation.repositoryId}`);
  } else {
    const normalizedMap = normalizeRepositoryMap(mapResult.map);
    if (normalizedMap.snapshot.completeness !== "complete") failures.push("repository map is partial");
  }

  const serializations: string[] = [];
  let missingNodeIds = [...expectation.expectedNodeIds];
  let missingEdgeIds = [...expectation.expectedEdgeIds];
  let distinctFiles = 0;
  for (let run = 0; run < expectation.runs; run += 1) {
    const result = await provider.relevantNeighborhood(expectation.query);
    if (result.status !== "found") {
      failures.push(`neighborhood run ${run + 1} returned ${result.status}`);
      continue;
    }
    const normalized = normalizeNeighborhood(result);
    if (normalized.completeness !== "complete" || normalized.snapshot.completeness !== "complete") {
      failures.push(`neighborhood run ${run + 1} is partial`);
    }
    const nodeIds = new Set(normalized.nodes.map((node) => node.id));
    const edgeIds = new Set(normalized.edges.map((edge) => edge.id));
    missingNodeIds = expectation.expectedNodeIds.filter((id) => !nodeIds.has(id));
    missingEdgeIds = expectation.expectedEdgeIds.filter((id) => !edgeIds.has(id));
    const files = new Set([
      ...normalized.nodes.map((node) => node.file),
      ...normalized.edges.map((edge) => edge.evidenceFile),
    ]);
    distinctFiles = files.size;
    serializations.push(stableSerialize(normalized));
  }

  if (missingNodeIds.length) failures.push(`missing nodes: ${missingNodeIds.join(", ")}`);
  if (missingEdgeIds.length) failures.push(`missing edges: ${missingEdgeIds.join(", ")}`);
  if (distinctFiles > expectation.maximumFiles) failures.push(`distinct files ${distinctFiles} exceeds ${expectation.maximumFiles}`);
  if (serializations.length !== expectation.runs || new Set(serializations).size !== 1) failures.push("normalized results are not deterministic");

  return {
    passed: failures.length === 0,
    failures,
    missingNodeIds,
    missingEdgeIds,
    distinctFiles,
    serializations,
  };
}

export async function evaluateTaskContextConformance(
  provider: TaskContextProvider,
  expectation: TaskContextConformanceExpectation,
): Promise<TaskContextConformanceReport> {
  const failures: string[] = [];
  const validation = validateTaskContextQuery(expectation.query);
  if (!validation.valid) {
    return { passed: false, failures: [validation.message], missingFactIds: [...expectation.expectedFactIds], distinctFiles: 0, serializations: [] };
  }
  const overviewResult = await provider.repositoryOverview(expectation.query.repositoryId);
  if (overviewResult.status !== "found") failures.push(`repository overview returned ${overviewResult.status}`);
  else if (normalizeRepositoryOverview(overviewResult.overview).completeness !== "complete") failures.push("repository overview is partial");

  const serializations: string[] = [];
  let missingFactIds = [...expectation.expectedFactIds];
  let distinctFiles = 0;
  for (let run = 0; run < expectation.runs; run += 1) {
    const result = await provider.relevantContext(expectation.query);
    if (result.status !== "found") {
      failures.push(`task context run ${run + 1} returned ${result.status}`);
      continue;
    }
    const normalized = normalizeTaskContext(result, expectation.query);
    if (normalized.completeness !== "complete") failures.push(`task context run ${run + 1} is partial`);
    const factIds = new Set(normalized.facts.map((fact) => fact.id));
    missingFactIds = expectation.expectedFactIds.filter((id) => !factIds.has(id));
    distinctFiles = new Set(normalized.facts.flatMap((fact) => fact.sources.map((source) => source.path))).size;
    serializations.push(stableSerialize(normalized));
  }
  if (missingFactIds.length) failures.push(`missing facts: ${missingFactIds.join(", ")}`);
  if (serializations.length !== expectation.runs || new Set(serializations).size !== 1) failures.push("normalized task context is not deterministic");
  return { passed: failures.length === 0, failures, missingFactIds, distinctFiles, serializations };
}
