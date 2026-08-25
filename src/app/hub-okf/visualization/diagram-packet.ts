import type {
  PublishedVisualizationProjection,
  VisualizationEdge,
  VisualizationFlow,
  VisualizationNode,
  VisualizationOmission,
  VisualizationQuestion,
} from "../../../core/knowledge/index.ts";

const MAXIMUM_NODES = 64;
const MAXIMUM_EDGES = 256;
const MAXIMUM_FLOW_STEPS = 64;

export type DiagramType = "architecture" | "dependency" | "sequence";

export type DiagramPacket = Readonly<{
  schemaVersion: 1;
  hub: string;
  commit: string;
  domain: PublishedVisualizationProjection["domain"];
  diagramType: DiagramType;
  nodes: readonly VisualizationNode[];
  edges: readonly VisualizationEdge[];
  flows: readonly VisualizationFlow[];
  questions: readonly VisualizationQuestion[];
  omissions: readonly VisualizationOmission[];
}>;

export type DiagramPacketResult = Readonly<{
  status: "ready";
  mode: "diagram";
  commit: string;
  domain: string;
  packet: DiagramPacket;
  reasons: readonly string[];
}> | Readonly<{
  status: "insufficient-data";
  mode: "diagram";
  commit: string;
  domain: string;
  reasons: readonly string[];
}>;

export type DiagramPacketOptions = Readonly<{
  diagramType: DiagramType;
  conceptIds: readonly string[];
}>;

function insufficient(
  projection: PublishedVisualizationProjection,
  reasons: readonly string[],
): DiagramPacketResult {
  return {
    status: "insufficient-data",
    mode: "diagram",
    commit: projection.commit,
    domain: projection.domain.id,
    reasons,
  };
}

function relevantOmissions(
  omissions: readonly VisualizationOmission[],
  selected: ReadonlySet<string>,
  domain: string,
): readonly VisualizationOmission[] {
  return omissions.filter((item) => item.subject === domain || selected.has(item.subject));
}

function assertBoundaryConnections(
  nodes: readonly VisualizationNode[],
  edges: readonly VisualizationEdge[],
): void {
  const disconnected = nodes.filter((node) => node.membership === "boundary"
    && !edges.some((edge) => edge.displaySource === node.id || edge.displayTarget === node.id));
  if (disconnected.length) {
    throw new Error(`boundary concepts require their accepted connecting edge: ${disconnected.map((node) => node.id).join(", ")}`);
  }
}

function packet(
  projection: PublishedVisualizationProjection,
  diagramType: DiagramType,
  nodes: readonly VisualizationNode[],
  edges: readonly VisualizationEdge[],
  flows: readonly VisualizationFlow[],
): DiagramPacketResult {
  if (nodes.length > MAXIMUM_NODES || edges.length > MAXIMUM_EDGES
    || flows.reduce((count, flow) => count + flow.steps.length, 0) > MAXIMUM_FLOW_STEPS) {
    return insufficient(projection, ["The selected topology exceeds the bounded diagram packet limits."]);
  }
  const selected = new Set(nodes.map((node) => node.id));
  return {
    status: "ready",
    mode: "diagram",
    commit: projection.commit,
    domain: projection.domain.id,
    reasons: [],
    packet: {
      schemaVersion: 1,
      hub: projection.hub,
      commit: projection.commit,
      domain: projection.domain,
      diagramType,
      nodes,
      edges,
      flows,
      questions: projection.questions.filter((item) => selected.has(item.subject)),
      omissions: relevantOmissions(projection.omissions, selected, projection.domain.id),
    },
  };
}

export function prepareDiagramPacket(
  projection: PublishedVisualizationProjection,
  options: DiagramPacketOptions,
): DiagramPacketResult {
  const conceptIds = [...new Set(options.conceptIds)];
  if (!conceptIds.length) throw new Error("diagram selection requires at least one concept ID");
  if (conceptIds.length !== options.conceptIds.length) throw new Error("diagram concept IDs must be unique");
  if (conceptIds.length > MAXIMUM_NODES) throw new Error(`diagram selection accepts at most ${MAXIMUM_NODES} concept IDs`);

  const available = new Map(projection.nodes.map((node) => [node.id, node]));
  const unknown = conceptIds.filter((id) => !available.has(id));
  if (unknown.length) throw new Error(`diagram selection is outside the Published Domain projection: ${unknown.join(", ")}`);

  const selected = new Set(conceptIds);
  if (options.diagramType === "sequence") {
    const selectedFlows = projection.flows.filter((flow) => selected.has(flow.id));
    if (selectedFlows.length !== 1) {
      return insufficient(projection, ["Sequence diagrams require exactly one selected Published Flow."]);
    }
    const flow = selectedFlows[0]!;
    if (!flow.steps.length || flow.steps.some((step, index) => step.order !== index + 1)) {
      return insufficient(projection, ["The selected Flow has no complete contiguous Published flow_steps."]);
    }
    const sequenceIds = new Set([flow.id, ...flow.steps.flatMap((step) => [step.source, step.target])]);
    const missing = [...sequenceIds].filter((id) => !available.has(id));
    if (missing.length) {
      return insufficient(projection, ["The selected Flow references endpoints outside the bounded Published projection."]);
    }
    const nodes = projection.nodes.filter((node) => sequenceIds.has(node.id));
    const edges = projection.edges.filter((edge) => sequenceIds.has(edge.displaySource) && sequenceIds.has(edge.displayTarget));
    return packet(projection, options.diagramType, nodes, edges, [flow]);
  }

  const nodes = projection.nodes.filter((node) => selected.has(node.id));
  const selectedEdges = projection.edges.filter((edge) => selected.has(edge.displaySource) && selected.has(edge.displayTarget));
  if (options.diagramType === "dependency") {
    const runtimeEdges = selectedEdges.filter((edge) => edge.displayClass === "runtime");
    if (!runtimeEdges.length) {
      return insufficient(projection, ["The selected concepts have no accepted Published dependency/runtime edge."]);
    }
    assertBoundaryConnections(nodes, runtimeEdges);
    return packet(projection, options.diagramType, nodes, runtimeEdges, []);
  }
  assertBoundaryConnections(nodes, selectedEdges);
  return packet(projection, options.diagramType, nodes, selectedEdges, []);
}
