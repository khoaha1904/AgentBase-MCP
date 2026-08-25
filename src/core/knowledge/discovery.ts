import { createHash } from "node:crypto";

import type { QuestionKind } from "./governance/questions.ts";
import type {
  OkfAuthoringGuidance,
  OkfAuthoringGuidanceRequest,
  ObservationSource,
} from "./schemas/guidance.ts";
import { getOkfAuthoringGuidance } from "./schemas/guidance.ts";
import { createRepositorySourceResource } from "./documents/okf-document.ts";

export const DISCOVERY_LANES = [
  "identity-product",
  "runtime-entrypoint",
  "interface-event-trigger",
  "integration-data-channel",
  "deploy-operations",
] as const;

export type DiscoveryLane = typeof DISCOVERY_LANES[number];
export type DiscoveryPriority = "p0" | "p1" | "p2";
export type DiscoveryOutcome = "materialized" | "question" | "ignored";
export type DiscoveryLaneResult = Readonly<{
  lane: DiscoveryLane;
  status: "covered" | "absent-after-check" | "limited";
  limitation?: string;
}>;

export type DiscoverySourceIdentity = Readonly<{
  repositoryId: string;
  remote: string;
  defaultBranch: string;
  commit: string;
}>;

export type DiscoveryGroup = Readonly<{
  id: string;
  lane: DiscoveryLane;
  kind: string;
  priority: DiscoveryPriority;
  title: string;
  count: number;
  sources: readonly ObservationSource[];
  hints: readonly string[];
  limitations: readonly string[];
}>;

export type DiscoverySeed = Readonly<{
  id: string;
  digest: string;
  source: DiscoverySourceIdentity;
  engine: Readonly<{ id: string; version: string; profile: string }>;
  lanes: readonly DiscoveryLaneResult[];
  groups: readonly DiscoveryGroup[];
  capture: Readonly<{
    nodeCount: number;
    edgeCount: number;
    coverageTerminal: boolean;
    truncated: boolean;
    p1P2Overflow: number;
    limitations: readonly string[];
  }>;
  state: "collecting" | "ready" | "invalid";
}>;

export type InventoryOutput = Readonly<{
  candidateId: string;
  parentCandidateId?: string;
}>;

export type InventoryItem = Readonly<{
  id: string;
  originGroupId: string;
  outcome: DiscoveryOutcome;
  outputs: readonly InventoryOutput[];
  questionPlanId?: string;
  reason?: string;
  coveredByItemId?: string;
}>;

export type QuestionPlan = Readonly<{
  id: string;
  kind: QuestionKind;
  originGroupId: string;
  targetCandidateId: string;
  property: string;
  scopeKey: string;
  candidateEvidence: readonly Readonly<{
    candidateKey: string;
    sourceResource: string;
    observedRevision: string;
  }>[];
  missingEvidence: readonly string[];
  limitations: readonly string[];
}>;

export type DiscoveryInventory = Readonly<{
  seedId: string;
  items: readonly InventoryItem[];
  questionPlans: readonly QuestionPlan[];
  limitations: readonly string[];
}>;

export type CoverageResult = Readonly<{
  lanes: readonly DiscoveryLaneResult[];
  p0Acknowledged: readonly string[];
  p0Missing: readonly string[];
  materializedItemIds: readonly string[];
  missingOutcomeIds: readonly string[];
  ignoredCounts: Readonly<Record<string, number>>;
  limitations: readonly string[];
  outcome: "ready-for-review" | "incomplete";
}>;

export type InventoryReceipt = Readonly<{
  id: string;
  digest: string;
  seedId: string;
  seedDigest: string;
  source: DiscoverySourceIdentity;
  engine: DiscoverySeed["engine"];
  hubProfileId: string;
  publishedBase: string;
  inventory: DiscoveryInventory;
  coverage: CoverageResult;
  guidanceRequest: OkfAuthoringGuidanceRequest;
  guidance: OkfAuthoringGuidance;
  createdAt: string;
}>;

export class DiscoveryValidationError extends Error {
  readonly code: "INVALID_SEED" | "INVALID_INVENTORY" | "DISCOVERY_OVERFLOW";

  constructor(code: DiscoveryValidationError["code"], message: string) {
    super(message);
    this.name = "DiscoveryValidationError";
    this.code = code;
  }
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const REPOSITORY_ID = /^repository-[a-z0-9-]+-[a-f0-9]{12}$/;
const QUESTION_KINDS = new Set<QuestionKind>([
  "conflict", "missing-evidence", "relation-candidate", "identity-candidate", "maintainer-decision",
]);

function privateInventoryId(prefix: "inventory-item" | "question-plan", seedId: string, originGroupId: string): string {
  const hex = createHash("sha256").update(JSON.stringify([1, prefix, seedId, originGroupId])).digest("hex");
  return `${prefix}-${hex.slice(0, 24)}`;
}

export function createInventoryItemId(seedId: string, originGroupId: string): string {
  return privateInventoryId("inventory-item", seedId, originGroupId);
}

export function createQuestionPlanId(seedId: string, originGroupId: string): string {
  return privateInventoryId("question-plan", seedId, originGroupId);
}

function bounded(value: unknown, maximum = 512): value is string {
  return typeof value === "string" && Boolean(value.trim()) && !value.includes("\n") && !value.includes("\r")
    && Buffer.byteLength(value) <= maximum;
}

function unique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicates`);
}

function validateSource(source: ObservationSource, label: string): void {
  if (!source.path || source.path.startsWith("/") || source.path.split("/").some((part) => !part || part === "." || part === "..")
    || !Number.isSafeInteger(source.startLine) || !Number.isSafeInteger(source.endLine)
    || source.startLine < 1 || source.endLine < source.startLine) {
    throw new Error(`${label} is not a normalized repository source span`);
  }
}

function validateSourceIdentity(source: DiscoverySourceIdentity): void {
  if (!REPOSITORY_ID.test(source.repositoryId) || !COMMIT.test(source.commit)
    || !bounded(source.defaultBranch, 255)
    || !/^https:\/\/[A-Za-z0-9.-]+\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(source.remote)) {
    throw new Error("discovery source identity is invalid");
  }
}

export function validateDiscoverySeed(seed: DiscoverySeed): void {
  try {
    if (!/^discovery-seed-[a-f0-9]{24}$/.test(seed.id) || !DIGEST.test(seed.digest)) {
      throw new Error("discovery Seed identity is invalid");
    }
    validateSourceIdentity(seed.source);
    if (!bounded(seed.engine.id, 128) || !bounded(seed.engine.version, 64) || !bounded(seed.engine.profile, 128)) {
      throw new Error("discovery engine identity is invalid");
    }
    if (seed.lanes.length !== DISCOVERY_LANES.length) throw new Error("discovery Seed must contain all five lanes");
    unique(seed.lanes.map((lane) => lane.lane), "discovery lanes");
    for (const expected of DISCOVERY_LANES) {
      const lane = seed.lanes.find((entry) => entry.lane === expected);
      if (!lane || !["covered", "absent-after-check", "limited"].includes(lane.status)
        || lane.status === "limited" && !bounded(lane.limitation)
        || lane.status !== "limited" && lane.limitation !== undefined) {
        throw new Error(`discovery lane ${expected} is invalid`);
      }
    }
    if (seed.groups.length > 64) throw new DiscoveryValidationError("DISCOVERY_OVERFLOW", "discovery Seed exceeds 64 groups");
    unique(seed.groups.map((group) => group.id), "discovery group IDs");
    for (const group of seed.groups) {
      if (!/^discovery-group-[a-f0-9]{24}$/.test(group.id) || !DISCOVERY_LANES.includes(group.lane)
        || !["p0", "p1", "p2"].includes(group.priority) || !bounded(group.kind, 128)
        || !bounded(group.title) || !Number.isSafeInteger(group.count) || group.count < 1
        || group.sources.length > 8 || group.hints.length > 16 || group.limitations.length > 16) {
        throw new Error(`discovery group ${group.id} is invalid`);
      }
      group.sources.forEach((source, index) => validateSource(source, `${group.id} source ${index + 1}`));
      [...group.hints, ...group.limitations].forEach((value) => {
        if (!bounded(value, 1024)) throw new Error(`discovery group ${group.id} contains invalid text`);
      });
    }
    const p0Count = seed.groups.filter((group) => group.priority === "p0").length;
    if (p0Count > 64) throw new DiscoveryValidationError("DISCOVERY_OVERFLOW", "discovery Seed exceeds 64 P0 groups");
    if (!["collecting", "ready", "invalid"].includes(seed.state)
      || !Number.isSafeInteger(seed.capture.nodeCount) || seed.capture.nodeCount < 0
      || !Number.isSafeInteger(seed.capture.edgeCount) || seed.capture.edgeCount < 0
      || !Number.isSafeInteger(seed.capture.p1P2Overflow) || seed.capture.p1P2Overflow < 0
      || seed.capture.limitations.length > 32
      || seed.capture.limitations.some((value) => !bounded(value, 1024))) {
      throw new Error("discovery capture state is invalid");
    }
    if (seed.state === "ready" && (!seed.capture.coverageTerminal
      || seed.lanes.some((lane) => lane.status === "limited" && seed.groups.some((group) => group.priority === "p0" && group.lane === lane.lane)))) {
      throw new Error("discovery Seed cannot be ready while P0 coverage is non-terminal or limited");
    }
  } catch (error) {
    if (error instanceof DiscoveryValidationError) throw error;
    throw new DiscoveryValidationError("INVALID_SEED", error instanceof Error ? error.message : "discovery Seed is invalid");
  }
}

function questionPlanFailures(
  plan: QuestionPlan,
  seed: DiscoverySeed,
  groupIds: ReadonlySet<string>,
  request: OkfAuthoringGuidanceRequest,
): readonly string[] {
  const failures: string[] = [];
  const candidateIds = new Set(request.candidates.map((candidate) => candidate.id));
  const observations = [...request.semanticObservations, ...request.resourceObservations];
  if (plan.id !== createQuestionPlanId(seed.id, plan.originGroupId) || !groupIds.has(plan.originGroupId)
    || !candidateIds.has(plan.targetCandidateId) || !QUESTION_KINDS.has(plan.kind)
    || !bounded(plan.property, 128) || !ID.test(plan.property) || !bounded(plan.scopeKey)
    || !plan.candidateEvidence.length || plan.candidateEvidence.length > 64
    || plan.missingEvidence.length > 64 || plan.limitations.length > 64) {
    failures.push(`QuestionPlan ${plan.id} identity, target or bounded shape is invalid`);
  }
  for (const reference of plan.candidateEvidence) {
    const candidate = request.candidates.find((entry) => entry.id === reference.candidateKey);
    const exactResources = candidate?.evidenceIds.flatMap((evidenceId) => {
      const observation = observations.find((entry) => entry.id === evidenceId);
      return observation ? [createRepositorySourceResource(seed.source.repositoryId, observation.source.path,
        observation.source.startLine, observation.source.endLine)] : [];
    }) ?? [];
    if (!candidate || !bounded(reference.sourceResource, 1024)
      || !exactResources.includes(reference.sourceResource) || reference.observedRevision !== seed.source.commit) {
      failures.push(`QuestionPlan ${plan.id} candidate evidence is invalid`);
    }
  }
  if (plan.kind === "conflict" && plan.candidateEvidence.length < 2) {
    failures.push(`QuestionPlan ${plan.id} conflict requires at least two candidate evidence references`);
  }
  [...plan.missingEvidence, ...plan.limitations].forEach((value) => {
    if (!bounded(value, 512)) failures.push(`QuestionPlan ${plan.id} contains invalid text`);
  });
  return failures;
}

export function validateDiscoveryInventory(
  seed: DiscoverySeed,
  inventory: DiscoveryInventory,
  guidanceRequest: OkfAuthoringGuidanceRequest,
): CoverageResult {
  try {
    validateDiscoverySeed(seed);
    const failures: string[] = [];
    if (seed.state !== "ready" || inventory.seedId !== seed.id || inventory.items.length > 64
      || inventory.questionPlans.length > 64 || inventory.limitations.length > 64) {
      failures.push("discovery Inventory does not bind one ready active Seed");
    }
    const duplicateFailure = (values: readonly string[], label: string) => {
      if (new Set(values).size !== values.length) failures.push(`${label} must be unique`);
    };
    duplicateFailure(inventory.items.map((item) => item.id), "Inventory item IDs");
    duplicateFailure(inventory.items.map((item) => item.originGroupId), "Inventory origin groups");
    duplicateFailure(inventory.questionPlans.map((plan) => plan.id), "QuestionPlan IDs");
    duplicateFailure(inventory.questionPlans.map((plan) => plan.originGroupId), "QuestionPlan origin groups");
    const candidates = new Map(guidanceRequest.candidates.map((candidate) => [candidate.id, candidate]));
    const groups = new Map(seed.groups.map((group) => [group.id, group]));
    const items = new Map(inventory.items.map((item) => [item.id, item]));
    const questionPlans = new Map(inventory.questionPlans.map((plan) => [plan.id, plan]));
    for (const plan of inventory.questionPlans) {
      failures.push(...questionPlanFailures(plan, seed, new Set(groups.keys()), guidanceRequest));
    }
    for (const item of inventory.items) {
      const group = groups.get(item.originGroupId);
      if (item.id !== createInventoryItemId(seed.id, item.originGroupId) || !group
        || !["materialized", "question", "ignored"].includes(item.outcome)) {
        failures.push(`Inventory item ${item.id} identity, origin or outcome is invalid`);
      }
      if (item.outcome === "materialized") {
        if (!item.outputs.length || item.outputs.length > 16 || item.questionPlanId !== undefined
          || item.reason !== undefined || item.coveredByItemId !== undefined) {
          failures.push(`${item.id} materialized outcome is invalid`);
        }
        duplicateFailure(item.outputs.map((output) => output.candidateId), `${item.id} output candidates`);
        for (const output of item.outputs) {
          const candidate = candidates.get(output.candidateId);
          const expectedParent = candidate?.disposition === "embedded" ? candidate.parentCandidateId : undefined;
          if (!candidate || output.parentCandidateId !== expectedParent
            || expectedParent !== undefined && !candidates.has(expectedParent)) {
            failures.push(`${item.id} output ${output.candidateId} mapping is invalid`);
          }
        }
      } else if (item.outputs.length) {
        failures.push(`${item.id} non-materialized outcome cannot declare outputs`);
      }
      if (item.outcome === "question") {
        const plan = item.questionPlanId ? questionPlans.get(item.questionPlanId) : undefined;
        if (!plan || plan.originGroupId !== item.originGroupId || item.reason !== undefined || item.coveredByItemId !== undefined) {
          failures.push(`${item.id} Question outcome is invalid`);
        }
      } else if (item.questionPlanId !== undefined) {
        failures.push(`${item.id} cannot declare a QuestionPlan`);
      }
      if (item.outcome === "ignored") {
        if (group?.priority === "p0") {
          const target = item.coveredByItemId ? items.get(item.coveredByItemId) : undefined;
          if (item.reason !== "duplicate-covered" || !target || target.outcome !== "materialized" || !target.outputs.length) {
            failures.push(`${item.id} cannot ignore P0 without a materialized duplicate`);
          }
        } else if (!bounded(item.reason) || item.coveredByItemId !== undefined) {
          failures.push(`${item.id} ignored reason is invalid`);
        }
      } else if (item.reason !== undefined || item.coveredByItemId !== undefined) {
        failures.push(`${item.id} non-ignored outcome cannot declare ignore fields`);
      }
    }
    const materializedCandidates = new Set(inventory.items.flatMap((item) =>
      item.outcome === "materialized" ? item.outputs.map((output) => output.candidateId) : []));
    for (const plan of inventory.questionPlans) {
      const target = candidates.get(plan.targetCandidateId);
      const owner = target?.disposition === "embedded" ? target.parentCandidateId : target?.id;
      if (!owner || !materializedCandidates.has(owner)) {
        failures.push(`QuestionPlan ${plan.id} target has no materialized owner candidate`);
      }
    }
    if (failures.length) throw new Error([...new Set(failures)].join("; "));
    const missingOutcomeIds = seed.groups.filter((group) => !inventory.items.some((item) => item.originGroupId === group.id))
      .map((group) => group.id);
    const p0Missing = seed.groups.filter((group) => group.priority === "p0" && missingOutcomeIds.includes(group.id))
      .map((group) => group.id);
    const p0Acknowledged = seed.groups.filter((group) => group.priority === "p0" && !p0Missing.includes(group.id))
      .map((group) => group.id);
    const ignoredCounts = inventory.items.filter((item) => item.outcome === "ignored").reduce<Record<string, number>>((counts, item) => {
      const reason = item.reason ?? "unspecified";
      counts[reason] = (counts[reason] ?? 0) + 1;
      return counts;
    }, {});
    const lowerPriorityMissing = seed.groups.filter((group) => group.priority !== "p0"
      && missingOutcomeIds.includes(group.id)).length;
    const limitations = [...new Set([...seed.capture.limitations, ...inventory.limitations,
      ...(lowerPriorityMissing ? [`${lowerPriorityMissing} lower-priority discovery group(s) lack an explicit outcome`] : []),
    ])].sort();
    return {
      lanes: seed.lanes,
      p0Acknowledged,
      p0Missing,
      materializedItemIds: inventory.items.filter((item) => item.outcome === "materialized")
        .map((item) => item.id),
      missingOutcomeIds,
      ignoredCounts: Object.fromEntries(Object.entries(ignoredCounts).sort(([left], [right]) => left.localeCompare(right))),
      limitations,
      outcome: p0Missing.length ? "incomplete" : "ready-for-review",
    };
  } catch (error) {
    if (error instanceof DiscoveryValidationError) throw error;
    throw new DiscoveryValidationError("INVALID_INVENTORY", error instanceof Error ? error.message : "discovery Inventory is invalid");
  }
}

export function createInventoryReceipt(input: Readonly<{
  seed: DiscoverySeed;
  inventory: DiscoveryInventory;
  guidanceRequest: OkfAuthoringGuidanceRequest;
  guidance: OkfAuthoringGuidance;
  hubProfileId: string;
  publishedBase: string;
  createdAt: string;
}>): InventoryReceipt {
  if (JSON.stringify(input.guidance) !== JSON.stringify(getOkfAuthoringGuidance(input.guidanceRequest))) {
    throw new DiscoveryValidationError("INVALID_INVENTORY", "discovery guidance is not the deterministic request result");
  }
  const coverage = validateDiscoveryInventory(input.seed, input.inventory, input.guidanceRequest);
  if (coverage.outcome !== "ready-for-review" || !/^[a-f0-9]{24}$/.test(input.hubProfileId)
    || !COMMIT.test(input.publishedBase) || !Number.isFinite(Date.parse(input.createdAt))) {
    throw new DiscoveryValidationError("INVALID_INVENTORY", "discovery Receipt authority or P0 coverage is invalid");
  }
  const body = {
    seedId: input.seed.id,
    seedDigest: input.seed.digest,
    source: input.seed.source,
    engine: input.seed.engine,
    hubProfileId: input.hubProfileId,
    publishedBase: input.publishedBase,
    inventory: input.inventory,
    coverage,
    guidanceRequest: input.guidanceRequest,
    guidance: input.guidance,
  };
  const hex = createHash("sha256").update(JSON.stringify(body)).digest("hex");
  return { id: `discovery-receipt-${hex.slice(0, 24)}`, digest: `sha256:${hex}`, ...body, createdAt: input.createdAt };
}

export function validateInventoryReceipt(receipt: InventoryReceipt): void {
  validateSourceIdentity(receipt.source);
  if (!/^discovery-receipt-[a-f0-9]{24}$/.test(receipt.id) || !DIGEST.test(receipt.digest)
    || !/^discovery-seed-[a-f0-9]{24}$/.test(receipt.seedId) || !DIGEST.test(receipt.seedDigest)
    || !/^[a-f0-9]{24}$/.test(receipt.hubProfileId) || !COMMIT.test(receipt.publishedBase)
    || !Number.isFinite(Date.parse(receipt.createdAt))) {
    throw new DiscoveryValidationError("INVALID_INVENTORY", "discovery Receipt identity or authority is invalid");
  }
  if (receipt.inventory.items.some((item) => !["materialized", "question", "ignored"].includes(item.outcome)
    || item.id !== createInventoryItemId(receipt.seedId, item.originGroupId)
    || Object.hasOwn(item, "evidenceIds") || Object.hasOwn(item, "disposition"))
    || receipt.inventory.questionPlans.some((plan) => plan.id !== createQuestionPlanId(receipt.seedId, plan.originGroupId))) {
    throw new DiscoveryValidationError("INVALID_INVENTORY", "discovery Receipt uses a superseded private Inventory contract; re-ingest is required");
  }
  const { id: _id, digest: _digest, createdAt: _createdAt, ...body } = receipt;
  const hex = createHash("sha256").update(JSON.stringify(body)).digest("hex");
  if (receipt.id !== `discovery-receipt-${hex.slice(0, 24)}` || receipt.digest !== `sha256:${hex}`
    || receipt.coverage.outcome !== "ready-for-review" || receipt.coverage.p0Missing.length) {
    throw new DiscoveryValidationError("INVALID_INVENTORY", "discovery Receipt digest or coverage is invalid");
  }
}

export function rebaseInventoryReceipt(
  receipt: InventoryReceipt,
  publishedBase: string,
  createdAt = new Date().toISOString(),
): InventoryReceipt {
  validateInventoryReceipt(receipt);
  if (!COMMIT.test(publishedBase) || !Number.isFinite(Date.parse(createdAt))) {
    throw new DiscoveryValidationError("INVALID_INVENTORY", "replacement Receipt base or time is invalid");
  }
  if (publishedBase === receipt.publishedBase) return receipt;
  const body = {
    seedId: receipt.seedId,
    seedDigest: receipt.seedDigest,
    source: receipt.source,
    engine: receipt.engine,
    hubProfileId: receipt.hubProfileId,
    publishedBase,
    inventory: receipt.inventory,
    coverage: receipt.coverage,
    guidanceRequest: receipt.guidanceRequest,
    guidance: receipt.guidance,
  };
  const hex = createHash("sha256").update(JSON.stringify(body)).digest("hex");
  return { id: `discovery-receipt-${hex.slice(0, 24)}`, digest: `sha256:${hex}`, ...body, createdAt };
}
