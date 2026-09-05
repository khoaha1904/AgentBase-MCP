import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import {
  loadOkfBundle,
  type OkfBundle,
} from "../documents/okf-bundle.ts";
import {
  agentBaseDomainConceptIdentity,
  classifyAgentBaseHubProfile,
  type AgentBaseConceptHome,
} from "../documents/agentbase-profile.ts";
import {
  validateOkfRelationships,
  type ValidatedOkfFlowStep,
  type ValidatedOkfRelationship,
} from "../documents/okf-relationships.ts";
import { FLOW_STEP_ACTIONS, FLOW_STEP_MODES, isCanonicalRelationshipKind } from "../documents/relationship-vocabulary.ts";
import { externalIdentityKey, readExternalIdentities } from "../governance/external-identities.ts";
import { parseQuestionDocument, type QuestionKind, type QuestionState } from "../governance/questions.ts";
import { readRepositoryIdentityRecord } from "../governance/repository-identity.ts";

const ITEM_LIMIT = 512;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const PROPOSAL_ID = /^[a-f0-9]{24}$/;
const STRUCTURAL_RELATIONS = new Set(["part-of", "implemented-in", "declared-by"]);

export type ProposalImpactIdentity = Readonly<{
  proposalId: string;
  mode: "new" | "refresh" | "enrichment" | "batch-new" | "migration";
  baseCommit: string;
  baseTreeDigest: string;
  proposedTreeDigest: string;
  diffDigest: string;
  sourceRepositoryIds: readonly string[];
}>;

export type ProposalImpactConcept = Readonly<{
  identity: string;
  path: string;
  type: string;
  status: string;
  digest: string;
  home?: ProposalImpactHome;
}>;

export type ProposalImpactProfileKind = "profile-1.0" | "legacy-unprofiled";
export type ProposalImpactHome =
  | Readonly<{ kind: "domain"; selector: string; domainIdentity: string }>
  | Readonly<{ kind: "shared"; selector: "shared" }>;

export type ProposalImpactRelation = Readonly<{
  source: string;
  kind: string;
  target: string;
  evidence: readonly string[];
}>;

export type ProposalImpactFlowStep = Readonly<{
  flow: string;
  order: number;
  source: string;
  action: string;
  target: string;
  mode: string;
  evidence: readonly string[];
}>;

export type ProposalImpactQuestion = Readonly<{
  id: string;
  conceptIdentity: string;
  revision: number;
  state: QuestionState;
  kind: QuestionKind;
  subject: string;
  property: string;
}>;

export type ProposalImpactNavigationDocument = Readonly<{ path: string; digest: string }>;
export type ProposalImpactNavigationLink = Readonly<{ source: string; target: string }>;
export type ProposalImpactUpdate<T> = Readonly<{ before: T; after: T }>;
export type ProposalImpactDelta<T> = Readonly<{
  added: readonly T[];
  updated: readonly ProposalImpactUpdate<T>[];
  removed: readonly T[];
}>;

export type ProposalImpactAffectedDomain = Readonly<{ identity: string; path: string }>;
export type ProposalImpactAffectedRepository = Readonly<{
  identity: string;
  path: string;
  repositoryId: string;
}>;

export type ProposalImpactReferenceIssue = Readonly<{
  kind: "markdown-link" | "relationship" | "flow-step";
  source: string;
  detail: string;
}>;

export type ProposalImpactDuplicateCandidate = Readonly<{
  kind: "repository-id" | "external-identity";
  strongIdentity: string;
  owners: readonly string[];
}>;

export type ProposalImpactTransition<T> = Readonly<{
  state: "introduced" | "retained" | "resolved";
  before?: T;
  after?: T;
}>;

export type ProposalImpactOmission = Readonly<{
  category: string;
  reason: "limit" | "validation-warning" | "unsupported-relation" | "invalid-identity";
  count: number;
  detail?: string;
}>;

export type ProposalSemanticImpact = Readonly<{
  formatVersion: 1;
  identity: ProposalImpactIdentity;
  concepts: ProposalImpactDelta<ProposalImpactConcept>;
  relations: ProposalImpactDelta<ProposalImpactRelation>;
  flowSteps: ProposalImpactDelta<ProposalImpactFlowStep>;
  questions: ProposalImpactDelta<ProposalImpactQuestion>;
  navigation: Readonly<{
    documents: ProposalImpactDelta<ProposalImpactNavigationDocument>;
    links: ProposalImpactDelta<ProposalImpactNavigationLink>;
  }>;
  profile: Readonly<{ base: ProposalImpactProfileKind; proposed: ProposalImpactProfileKind }>;
  affected: Readonly<{
    homes: readonly ProposalImpactHome[];
    domains: readonly ProposalImpactAffectedDomain[];
    repositories: readonly ProposalImpactAffectedRepository[];
  }>;
  danglingReferences: readonly ProposalImpactTransition<ProposalImpactReferenceIssue>[];
  duplicateCandidates: readonly ProposalImpactTransition<ProposalImpactDuplicateCandidate>[];
  omissions: readonly ProposalImpactOmission[];
  digest: string;
}>;

type Snapshot = Readonly<{
  bundle: OkfBundle;
  concepts: ReadonlyMap<string, ProposalImpactConcept>;
  relations: ReadonlyMap<string, ProposalImpactRelation>;
  flowSteps: ReadonlyMap<string, ProposalImpactFlowStep>;
  questions: ReadonlyMap<string, ProposalImpactQuestion>;
  navigationDocuments: ReadonlyMap<string, ProposalImpactNavigationDocument>;
  navigationLinks: ReadonlyMap<string, ProposalImpactNavigationLink>;
  referenceIssues: ReadonlyMap<string, ProposalImpactReferenceIssue>;
  duplicates: ReadonlyMap<string, ProposalImpactDuplicateCandidate>;
  profile: ProposalImpactProfileKind;
  homes: ReadonlyMap<string, ProposalImpactHome>;
  domains: ReadonlyMap<string, readonly string[]>;
  repositoryScopes: ReadonlyMap<string, readonly string[]>;
  omissions: readonly ProposalImpactOmission[];
}>;

function digestBytes(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function orderedMap<T>(entries: Iterable<readonly [string, T]>): ReadonlyMap<string, T> {
  return new Map([...entries].sort(([left], [right]) => left.localeCompare(right)));
}

function pushOmission(
  omissions: ProposalImpactOmission[],
  category: string,
  reason: ProposalImpactOmission["reason"],
  count: number,
  detail?: string,
): void {
  omissions.push({ category, reason, count, ...(detail ? { detail: detail.slice(0, 512) } : {}) });
}

function bounded<T>(category: string, values: readonly T[], omissions: ProposalImpactOmission[]): readonly T[] {
  if (values.length <= ITEM_LIMIT) return values;
  pushOmission(omissions, category, "limit", values.length - ITEM_LIMIT);
  return values.slice(0, ITEM_LIMIT);
}

function delta<T>(
  category: string,
  before: ReadonlyMap<string, T>,
  after: ReadonlyMap<string, T>,
  omissions: ProposalImpactOmission[],
): ProposalImpactDelta<T> {
  const added: T[] = [], updated: ProposalImpactUpdate<T>[] = [], removed: T[] = [];
  for (const [key, value] of after) {
    const prior = before.get(key);
    if (prior === undefined) added.push(value);
    else if (!isDeepStrictEqual(prior, value)) updated.push({ before: prior, after: value });
  }
  for (const [key, value] of before) if (!after.has(key)) removed.push(value);
  return {
    added: bounded(`${category}.added`, added, omissions),
    updated: bounded(`${category}.updated`, updated, omissions),
    removed: bounded(`${category}.removed`, removed, omissions),
  };
}

function transition<T>(
  category: string,
  before: ReadonlyMap<string, T>,
  after: ReadonlyMap<string, T>,
  omissions: ProposalImpactOmission[],
): readonly ProposalImpactTransition<T>[] {
  const values: ProposalImpactTransition<T>[] = [];
  for (const key of [...new Set([...before.keys(), ...after.keys()])].sort()) {
    const prior = before.get(key), next = after.get(key);
    values.push(prior && next ? { state: "retained", before: prior, after: next }
      : next ? { state: "introduced", after: next }
        : { state: "resolved", before: prior! });
  }
  return bounded(category, values, omissions);
}

function conceptMap(
  bundle: OkfBundle,
  homes: ReadonlyMap<string, ProposalImpactHome>,
): ReadonlyMap<string, ProposalImpactConcept> {
  return orderedMap([...bundle.concepts].map(([identity, concept]) => [identity, {
    identity,
    path: concept.path,
    type: concept.type,
    status: concept.status,
    digest: digestBytes(concept.type === "Domain" && path.posix.basename(concept.path) === "index.md"
      ? fs.readFileSync(path.join(bundle.root, ...concept.path.split("/")), "utf8")
        .replace(/\r?\n+# Batch Navigation(?:\r?\n[\s\S]*)?$/, "").split(/\r?\n/)
        .filter((line) => !/^\* \[[^\]]+\]\([^)]+\)(?: - .+)?$/.test(line.trim())).join("\n").trimEnd()
      : fs.readFileSync(path.join(bundle.root, ...concept.path.split("/")))),
    ...(homes.has(identity) ? { home: homes.get(identity)! } : {}),
  }] as const));
}

function impactHome(home: AgentBaseConceptHome): ProposalImpactHome {
  return home.kind === "shared"
    ? { kind: "shared", selector: "shared" }
    : { kind: "domain", selector: home.selector, domainIdentity: agentBaseDomainConceptIdentity(home.selector) };
}

function relationKey(value: ProposalImpactRelation): string {
  return JSON.stringify([value.source, value.kind, value.target]);
}

function flowStepKey(value: ProposalImpactFlowStep): string {
  return JSON.stringify([value.flow, value.order, value.source, value.action, value.target, value.mode]);
}

function normalizeRelations(
  values: readonly ValidatedOkfRelationship[],
  invalid: ReadonlySet<string>,
  omissions: ProposalImpactOmission[],
): ReadonlyMap<string, ProposalImpactRelation> {
  const result = new Map<string, ProposalImpactRelation>();
  for (const value of values) {
    if (!isCanonicalRelationshipKind(value.kind)) {
      pushOmission(omissions, "relations", "unsupported-relation", 1,
        `${value.source} ${value.kind} ${value.target}`);
      continue;
    }
    const item = { ...value, evidence: [...new Set(value.evidence)].sort() };
    const key = relationKey(item);
    if (invalid.has(key)) continue;
    const existing = result.get(key);
    result.set(key, existing ? { ...item, evidence: [...new Set([...existing.evidence, ...item.evidence])].sort() } : item);
  }
  return orderedMap(result);
}

function normalizeFlowSteps(
  values: readonly ValidatedOkfFlowStep[],
  concepts: ReadonlyMap<string, ProposalImpactConcept>,
  invalidFlows: ReadonlySet<string>,
): ReadonlyMap<string, ProposalImpactFlowStep> {
  const result = new Map<string, ProposalImpactFlowStep>();
  for (const value of values) {
    if (!(FLOW_STEP_ACTIONS as readonly string[]).includes(value.action)
      || !(FLOW_STEP_MODES as readonly string[]).includes(value.mode)
      || invalidFlows.has(value.flow)
      || !concepts.has(value.flow) || !concepts.has(value.source) || !concepts.has(value.target)) continue;
    const item = { ...value, evidence: [...new Set(value.evidence)].sort() };
    const key = flowStepKey(item), existing = result.get(key);
    result.set(key, existing ? { ...item, evidence: [...new Set([...existing.evidence, ...item.evidence])].sort() } : item);
  }
  return orderedMap(result);
}

function validationIssue(message: string): ProposalImpactReferenceIssue | undefined {
  const source = message.split(":", 1)[0] ?? "unknown";
  if (/flow step .*targets missing concept|flow step endpoint .*has no resolving Markdown link/.test(message)) {
    return { kind: "flow-step", source, detail: message };
  }
  if (/relationship .*targets missing concept|relationship .*has no resolving Markdown link/.test(message)) {
    return { kind: "relationship", source, detail: message };
  }
  return undefined;
}

function resolveMarkdownTarget(source: string, rawTarget: string): Readonly<{
  target?: string;
  unsafe?: boolean;
}> {
  if (rawTarget.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)) return {};
  const clean = rawTarget.split("#")[0]?.split("?")[0];
  if (!clean || (!clean.endsWith(".md") && !clean.endsWith("/"))) return {};
  const normalized = clean.startsWith("/")
    ? path.posix.normalize(clean.slice(1))
    : path.posix.normalize(path.posix.join(path.posix.dirname(source), clean));
  if (normalized === ".." || normalized.startsWith("../")) return { unsafe: true };
  return { target: normalized.endsWith("/") ? `${normalized}index.md` : normalized };
}

function markdownProjection(bundle: OkfBundle): Readonly<{
  documents: ReadonlyMap<string, ProposalImpactNavigationDocument>;
  links: ReadonlyMap<string, ProposalImpactNavigationLink>;
  issues: ReadonlyMap<string, ProposalImpactReferenceIssue>;
}> {
  const documents = new Map<string, ProposalImpactNavigationDocument>();
  const links = new Map<string, ProposalImpactNavigationLink>();
  const issues = new Map<string, ProposalImpactReferenceIssue>();
  const knownFiles = new Set(bundle.files);
  for (const relative of bundle.files.filter((file) => file.endsWith(".md"))) {
    const bytes = fs.readFileSync(path.join(bundle.root, ...relative.split("/")));
    if (["index.md", "README.md"].includes(path.posix.basename(relative))) {
      documents.set(relative, { path: relative, digest: digestBytes(bytes) });
    }
    const source = bytes.toString("utf8");
    for (const match of source.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const raw = match[1];
      if (!raw) continue;
      const resolved = resolveMarkdownTarget(relative, raw);
      if (resolved.unsafe) {
        const issue = { kind: "markdown-link" as const, source: relative, detail: `unsafe internal Markdown link ${raw}` };
        issues.set(JSON.stringify([issue.kind, issue.source, issue.detail]), issue);
      } else if (resolved.target) {
        const link = { source: relative, target: resolved.target };
        if (knownFiles.has(resolved.target)) links.set(JSON.stringify([link.source, link.target]), link);
        else {
          const issue = { kind: "markdown-link" as const, source: relative,
            detail: `broken internal Markdown link ${resolved.target}` };
          issues.set(JSON.stringify([issue.kind, issue.source, issue.detail]), issue);
        }
      }
    }
  }
  return { documents: orderedMap(documents), links: orderedMap(links), issues: orderedMap(issues) };
}

function questionMap(bundle: OkfBundle, omissions: ProposalImpactOmission[]): ReadonlyMap<string, ProposalImpactQuestion> {
  const result = new Map<string, ProposalImpactQuestion>();
  for (const [identity, concept] of bundle.concepts) {
    if (concept.type !== "Question") continue;
    try {
      const question = parseQuestionDocument(concept);
      result.set(question.id, { id: question.id, conceptIdentity: identity, revision: question.revision,
        state: question.state, kind: question.kind, subject: question.subject, property: question.property });
    } catch (error) {
      pushOmission(omissions, "questions", "validation-warning", 1,
        error instanceof Error ? error.message : `${concept.path}: Question parsing failed`);
    }
  }
  return orderedMap(result);
}

function duplicateMap(bundle: OkfBundle, omissions: ProposalImpactOmission[]): ReadonlyMap<string, ProposalImpactDuplicateCandidate> {
  const owners = new Map<string, { kind: ProposalImpactDuplicateCandidate["kind"]; strongIdentity: string; owners: string[] }>();
  const add = (kind: ProposalImpactDuplicateCandidate["kind"], strongIdentity: string, owner: string) => {
    const key = JSON.stringify([kind, strongIdentity]);
    const value = owners.get(key) ?? { kind, strongIdentity, owners: [] };
    value.owners.push(owner);
    owners.set(key, value);
  };
  for (const [identity, concept] of bundle.concepts) {
    const repository = readRepositoryIdentityRecord(concept);
    if (repository) add("repository-id", repository.id, identity);
    else if (concept.type === "Repository") {
      pushOmission(omissions, "duplicateCandidates", "invalid-identity", 1,
        `${concept.path}: Repository strong identity is invalid`);
    }
    try {
      for (const external of readExternalIdentities(concept)) add("external-identity", externalIdentityKey(external), identity);
    } catch (error) {
      pushOmission(omissions, "duplicateCandidates", "invalid-identity", 1,
        error instanceof Error ? error.message : `${concept.path}: external identity parsing failed`);
    }
  }
  return orderedMap([...owners].flatMap(([key, value]) => {
    const unique = [...new Set(value.owners)].sort();
    return unique.length > 1 ? [[key, { kind: value.kind, strongIdentity: value.strongIdentity, owners: unique }] as const] : [];
  }));
}

function deriveScopes(
  concepts: ReadonlyMap<string, ProposalImpactConcept>,
  relations: ReadonlyMap<string, ProposalImpactRelation>,
): Readonly<{ domains: ReadonlyMap<string, readonly string[]>; repositories: ReadonlyMap<string, readonly string[]> }> {
  const parents = new Map<string, string[]>();
  const dependants = new Map<string, string[]>();
  for (const relation of relations.values()) {
    if (relation.kind === "part-of" && concepts.has(relation.target)) {
      parents.set(relation.source, [...parents.get(relation.source) ?? [], relation.target]);
    }
    if (STRUCTURAL_RELATIONS.has(relation.kind) && concepts.has(relation.target)) {
      dependants.set(relation.target, [...dependants.get(relation.target) ?? [], relation.source]);
    }
  }
  const domainScopes = new Map<string, Set<string>>([...concepts.keys()].map((identity) => [identity, new Set()]));
  const domainPending = [...concepts].filter(([, concept]) => concept.type === "Domain").map(([identity]) => identity).sort();
  const domainQueued = new Set(domainPending);
  for (const identity of domainPending) domainScopes.get(identity)!.add(identity);
  while (domainPending.length) {
    const parent = domainPending.shift()!;
    domainQueued.delete(parent);
    for (const child of (dependants.get(parent) ?? []).sort()) {
      if (!(parents.get(child) ?? []).includes(parent)) continue;
      const scope = domainScopes.get(child)!;
      const size = scope.size;
      for (const domain of domainScopes.get(parent)!) scope.add(domain);
      if (scope.size > size && !domainQueued.has(child)) {
        domainPending.push(child);
        domainQueued.add(child);
      }
    }
  }

  const scopes = new Map<string, Set<string>>([...concepts.keys()].map((identity) => [identity, new Set()]));
  const pending = [...concepts].filter(([, concept]) => concept.type === "Repository").map(([identity]) => identity).sort();
  const queued = new Set(pending);
  for (const identity of pending) scopes.get(identity)!.add(identity);
  while (pending.length) {
    const parent = pending.shift()!;
    queued.delete(parent);
    for (const child of (dependants.get(parent) ?? []).sort()) {
      const scope = scopes.get(child)!;
      const size = scope.size;
      for (const repository of scopes.get(parent)!) scope.add(repository);
      if (scope.size > size && !queued.has(child)) {
        pending.push(child);
        queued.add(child);
      }
    }
  }
  return {
    domains: orderedMap([...domainScopes].map(([identity, values]) => [identity, [...values].sort()] as const)),
    repositories: orderedMap([...scopes].map(([identity, values]) => [identity, [...values].sort()] as const)),
  };
}

function snapshot(root: string, role: "base" | "proposed"): Snapshot {
  const bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  const omissions: ProposalImpactOmission[] = [];
  const admission = classifyAgentBaseHubProfile(bundle);
  if (admission.kind === "unsupported") {
    const detail = admission.failures[0] ?? "unsupported Profile declaration";
    throw new Error(`${role} proposal Hub Profile is unsupported: ${detail}`);
  }
  const homes = admission.kind === "profile-1.0"
    ? orderedMap(admission.homes.map((item) => [item.identity, impactHome(item.home)] as const))
    : new Map<string, ProposalImpactHome>();
  const concepts = conceptMap(bundle, homes);
  const validation = validateOkfRelationships([...bundle.concepts].map(([identity, concept]) => ({ identity, concept })));
  const pathIdentities = new Map([...bundle.concepts].map(([identity, concept]) => [concept.path, identity]));
  const invalidRelations = new Set<string>();
  const invalidFlows = new Set<string>();
  for (const failure of validation.failures) {
    const relation = failure.match(/^(.+): relationship (\S+) -> (\S+)/);
    const source = relation?.[1] ? pathIdentities.get(relation[1]) : undefined;
    if (source && relation?.[2] && relation[3]) {
      invalidRelations.add(JSON.stringify([source, relation[2], relation[3]]));
    }
    const flowPath = failure.match(/^(.+): flow step/)?.[1];
    const flow = flowPath ? pathIdentities.get(flowPath) : undefined;
    if (flow) invalidFlows.add(flow);
  }
  const relations = normalizeRelations(validation.relationships, invalidRelations, omissions);
  const flowSteps = normalizeFlowSteps(validation.flowSteps, concepts, invalidFlows);
  const markdown = markdownProjection(bundle);
  const referenceIssues = new Map(markdown.issues);
  for (const failure of validation.failures) {
    const issue = validationIssue(failure);
    if (issue) referenceIssues.set(JSON.stringify([issue.kind, issue.source, issue.detail]), issue);
    else pushOmission(omissions, "relationships", "validation-warning", 1, failure);
  }
  for (const warning of validation.warnings) pushOmission(omissions, "relationships", "validation-warning", 1, warning);
  const scopes = deriveScopes(concepts, relations);
  return {
    bundle,
    concepts,
    relations,
    flowSteps,
    questions: questionMap(bundle, omissions),
    navigationDocuments: markdown.documents,
    navigationLinks: markdown.links,
    referenceIssues: orderedMap(referenceIssues),
    duplicates: duplicateMap(bundle, omissions),
    profile: admission.kind,
    homes,
    domains: scopes.domains,
    repositoryScopes: scopes.repositories,
    omissions,
  };
}

function changedIdentities<T extends { source: string; target: string }>(
  value: ProposalImpactDelta<T>,
  output: Set<string>,
): void {
  for (const item of [...value.added, ...value.removed]) {
    output.add(item.source); output.add(item.target);
  }
  for (const item of value.updated) {
    output.add(item.before.source); output.add(item.before.target);
    output.add(item.after.source); output.add(item.after.target);
  }
}

function affectedScope(
  base: Snapshot,
  proposed: Snapshot,
  conceptDelta: ProposalImpactDelta<ProposalImpactConcept>,
  relationDelta: ProposalImpactDelta<ProposalImpactRelation>,
  flowDelta: ProposalImpactDelta<ProposalImpactFlowStep>,
  questionDelta: ProposalImpactDelta<ProposalImpactQuestion>,
  sourceRepositoryIds: readonly string[],
  omissions: ProposalImpactOmission[],
): ProposalSemanticImpact["affected"] {
  const changed = new Set<string>();
  for (const item of [...conceptDelta.added, ...conceptDelta.removed]) changed.add(item.identity);
  for (const item of conceptDelta.updated) changed.add(item.after.identity);
  changedIdentities(relationDelta, changed);
  changedIdentities(flowDelta, changed);
  for (const item of [...questionDelta.added, ...questionDelta.removed]) changed.add(item.subject);
  for (const item of questionDelta.updated) { changed.add(item.before.subject); changed.add(item.after.subject); }

  const homes = new Map<string, ProposalImpactHome>();
  const domainIds = new Set<string>(), repositoryConceptIds = new Set<string>();
  const collect = (state: Snapshot, identity: string) => {
    const concept = state.concepts.get(identity);
    const home = state.homes.get(identity);
    if (home) homes.set(`${home.kind}:${home.selector}`, home);
    if (concept?.type === "Domain") domainIds.add(identity);
    if (concept?.type === "Repository") repositoryConceptIds.add(identity);
    for (const domain of state.domains.get(identity) ?? []) domainIds.add(domain);
    for (const repository of state.repositoryScopes.get(identity) ?? []) repositoryConceptIds.add(repository);
  };
  for (const identity of changed) { collect(base, identity); collect(proposed, identity); }
  for (const repositoryId of sourceRepositoryIds) {
    let found = false;
    for (const state of [base, proposed]) {
      for (const [identity, concept] of state.bundle.concepts) {
        if (readRepositoryIdentityRecord(concept)?.id === repositoryId) {
          repositoryConceptIds.add(identity); collect(state, identity); found = true;
        }
      }
    }
    if (!found) pushOmission(omissions, "affected.repositories", "invalid-identity", 1,
      `proposal source Repository ${repositoryId} has no admitted concept`);
  }
  const conceptFromEither = (identity: string) => proposed.concepts.get(identity) ?? base.concepts.get(identity);
  const domains = [...domainIds].sort().flatMap((identity) => {
    const concept = conceptFromEither(identity);
    return concept?.type === "Domain" ? [{ identity, path: concept.path }] : [];
  });
  const repositories = [...repositoryConceptIds].sort().flatMap((identity) => {
    const concept = proposed.bundle.concepts.get(identity) ?? base.bundle.concepts.get(identity);
    const summary = conceptFromEither(identity), record = concept && readRepositoryIdentityRecord(concept);
    if (!summary || !record) {
      pushOmission(omissions, "affected.repositories", "invalid-identity", 1,
        `${identity}: affected Repository identity is invalid`);
      return [];
    }
    return [{ identity, path: summary.path, repositoryId: record.id }];
  });
  return {
    homes: bounded("affected.homes", [...homes].sort(([left], [right]) => left.localeCompare(right))
      .map(([, home]) => home), omissions),
    domains: bounded("affected.domains", domains, omissions),
    repositories: bounded("affected.repositories", repositories, omissions),
  };
}

function validateIdentity(identity: Omit<ProposalImpactIdentity, "baseTreeDigest" | "proposedTreeDigest">): void {
  if (!PROPOSAL_ID.test(identity.proposalId) || !COMMIT.test(identity.baseCommit)
    || !DIGEST.test(identity.diffDigest) || !["new", "refresh", "enrichment", "batch-new", "migration"].includes(identity.mode)
    || identity.sourceRepositoryIds.length > 32 || new Set(identity.sourceRepositoryIds).size !== identity.sourceRepositoryIds.length
    || identity.sourceRepositoryIds.some((value) => !/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(value))) {
    throw new Error("proposal semantic-impact identity is invalid");
  }
}

function boundedOmissions(values: readonly ProposalImpactOmission[]): readonly ProposalImpactOmission[] {
  const ordered = [...values].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  if (ordered.length <= ITEM_LIMIT) return ordered;
  return [...ordered.slice(0, ITEM_LIMIT - 1), {
    category: "omissions", reason: "limit", count: ordered.length - (ITEM_LIMIT - 1),
  }];
}

export function buildProposalSemanticImpact(options: Readonly<{
  baseRoot: string;
  proposedRoot: string;
  identity: Omit<ProposalImpactIdentity, "baseTreeDigest" | "proposedTreeDigest">;
}>): ProposalSemanticImpact {
  validateIdentity(options.identity);
  const base = snapshot(options.baseRoot, "base"), proposed = snapshot(options.proposedRoot, "proposed");
  const omissions: ProposalImpactOmission[] = [
    ...base.omissions.map((item) => ({ ...item, category: `base.${item.category}` })),
    ...proposed.omissions.map((item) => ({ ...item, category: `proposed.${item.category}` })),
  ];
  const concepts = delta("concepts", base.concepts, proposed.concepts, omissions);
  const relations = delta("relations", base.relations, proposed.relations, omissions);
  const flowSteps = delta("flowSteps", base.flowSteps, proposed.flowSteps, omissions);
  const questions = delta("questions", base.questions, proposed.questions, omissions);
  const navigation = {
    documents: delta("navigation.documents", base.navigationDocuments, proposed.navigationDocuments, omissions),
    links: delta("navigation.links", base.navigationLinks, proposed.navigationLinks, omissions),
  };
  const identity: ProposalImpactIdentity = {
    ...options.identity,
    sourceRepositoryIds: [...options.identity.sourceRepositoryIds].sort(),
    baseTreeDigest: base.bundle.treeDigest,
    proposedTreeDigest: proposed.bundle.treeDigest,
  };
  const projection = {
    formatVersion: 1 as const,
    identity,
    concepts,
    relations,
    flowSteps,
    questions,
    navigation,
    profile: { base: base.profile, proposed: proposed.profile },
    affected: affectedScope(base, proposed, concepts, relations, flowSteps, questions,
      identity.sourceRepositoryIds, omissions),
    danglingReferences: transition("danglingReferences", base.referenceIssues, proposed.referenceIssues, omissions),
    duplicateCandidates: transition("duplicateCandidates", base.duplicates, proposed.duplicates, omissions),
    omissions: boundedOmissions(omissions),
  };
  return { ...projection, digest: digestBytes(JSON.stringify(projection)) };
}
