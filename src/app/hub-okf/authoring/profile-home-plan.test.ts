import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { AGENTBASE_PRODUCER } from "../../../product-version.ts";
import {
  AGENTBASE_OKF_PROFILE_PATH,
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  classifyAgentBaseHubProfile,
  getOkfConceptSchema,
  loadOkfBundle,
  normalizeAgentBaseInitialIngestHomePlan,
  normalizeConfirmedDomain,
  parseQuestionDocument,
  renderAgentBaseOkfProfileDocument,
  type OkfAuthoringGuidance,
  type OkfAuthoringGuidanceRequest,
} from "../../../core/knowledge/index.ts";
import { createHubIdentity, hubProfileId } from "../../../core/hub/index.ts";
import { createTestInventoryReceipt } from "../test-support.ts";
import {
  beginHubAuthoringSession,
  finalizeHubAuthoringSession,
  materializeInitialIngestSessionSkeletons,
} from "./authoring-session.ts";
import { materializeQuestionGuidance } from "./guidance-proposal.ts";
import { resolveProfileInitialIngestPlan, resolveProfileRefreshSubject } from "./profile-home-plan.ts";
import { writeInitialIngestSkeletons } from "./initial-ingest-skeleton.ts";

const request: OkfAuthoringGuidanceRequest = {
  candidates: [
    { id: "repository", identityHint: "checkout", identityBasis: "checkout", queryValue: "Orders source",
      evidenceIds: ["repo-doc"], disposition: "concept", suggestedType: "Repository" },
    { id: "service", identityHint: "order-service", identityBasis: "documentation", queryValue: "Processes orders",
      evidenceIds: ["service-doc"], disposition: "concept", suggestedType: "System" },
    { id: "contract", identityHint: "order-contract", identityBasis: "documentation", queryValue: "Shared order API",
      evidenceIds: ["contract-doc"], disposition: "concept", suggestedType: "Component" },
    { id: "embedded", identityHint: "worker detail", identityBasis: "implementation", queryValue: "Internal detail",
      evidenceIds: ["embedded-doc"], disposition: "embedded", parentCandidateId: "service" },
  ],
  semanticObservations: [
    { id: "repo-doc", candidateId: "repository", role: "documentation", signal: "repository",
      source: { path: "README.md", startLine: 1, endLine: 1 } },
    { id: "service-doc", candidateId: "service", role: "documentation", signal: "system",
      source: { path: "README.md", startLine: 2, endLine: 2 } },
    { id: "contract-doc", candidateId: "contract", role: "documentation", signal: "interface",
      source: { path: "README.md", startLine: 3, endLine: 3 } },
    { id: "embedded-doc", candidateId: "embedded", role: "implementation", signal: "detail",
      source: { path: "src/index.ts", startLine: 1, endLine: 1 } },
  ],
  resourceObservations: [],
};

function recommendation(candidateId: string, type: string): OkfAuthoringGuidance["recommendations"][number] {
  return { candidateId, disposition: "concept", status: "exact", schema: getOkfConceptSchema(type)!,
    matchedEvidence: [], missingEvidence: [], technology: {}, limitations: [] };
}

const guidance: OkfAuthoringGuidance = {
  catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  recommendations: [
    recommendation("repository", "Repository"),
    recommendation("service", "System"),
    recommendation("contract", "Component"),
    { candidateId: "embedded", disposition: "embedded", parentCandidateId: "service", status: "embedded",
      matchedEvidence: [], missingEvidence: [], technology: {}, limitations: [] },
  ],
};

function profileRoot(t: test.TestContext): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-ingest-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "shared"), { recursive: true });
  fs.writeFileSync(path.join(root, "index.md"), `---\nokf_version: "0.2"\n---\n\n# Hub\n\n* [Profile](${AGENTBASE_OKF_PROFILE_PATH}) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n`);
  fs.writeFileSync(path.join(root, "shared", "index.md"), "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n");
  fs.writeFileSync(path.join(root, ...AGENTBASE_OKF_PROFILE_PATH.split("/")), renderAgentBaseOkfProfileDocument());
  return root;
}

test("[AB-HOME-004..008] Profile Initial Ingest keeps home separate from Domain participation", (t) => {
  const root = profileRoot(t);
  const plan = normalizeAgentBaseInitialIngestHomePlan({
    default_home: { kind: "domain", identity: "domains/orders", title: "Orders" },
    exceptions: [{ candidate_id: "contract", home: { kind: "shared" } }],
    participations: [
      { candidate_id: "repository", domain: { identity: "domains/orders", title: "Orders" } },
      { candidate_id: "service", domain: { identity: "domains/fulfilment", title: "Fulfilment" } },
      { candidate_id: "contract", domain: { identity: "domains/orders", title: "Orders" } },
    ],
  });
  const resolved = resolveProfileInitialIngestPlan({ subjectDirectory: "repositories/checkout", homePlan: plan,
    request, guidance });
  assert.equal(resolved.subjectDirectory, "domains/orders/repositories/checkout");
  const skeletons = writeInitialIngestSkeletons({
    bundleRoot: root, subjectDirectory: resolved.subjectDirectory, homePlan: resolved.plan,
    sourceRepositoryId: "repository-checkout-aaaaaaaaaaaa",
    repository: { id: "repository-checkout-aaaaaaaaaaaa", displayName: "checkout", remotes: [], rootCommits: [] },
    request, guidance, createdAt: "2026-09-04T00:00:00Z",
    sourceState: { commit: "a".repeat(40), dirty: false, dirtyDigest: null },
  });
  assert.deepEqual(skeletons.map((item) => item.path).sort(), [
    "domains/fulfilment/index.md",
    "domains/orders/index.md",
    "domains/orders/knowledge/order-service.md",
    "domains/orders/repositories/checkout.md",
    "shared/knowledge/order-contract.md",
  ]);
  const bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true });
  assert.equal(classifyAgentBaseHubProfile(bundle).kind, "profile-1.0");
  assert.deepEqual(bundle.concepts.get("domains/orders/knowledge/order-service")?.frontmatter.relationships, [
    { kind: "part-of", target: "domains/fulfilment", evidence: ["owner-domain-fulfilment"] },
  ]);
  assert.deepEqual(bundle.concepts.get("shared/knowledge/order-contract")?.frontmatter.relationships, [
    { kind: "part-of", target: "domains/orders", evidence: ["owner-domain-orders"] },
  ]);
  assert.match(fs.readFileSync(path.join(root, "domains/orders/index.md"), "utf8"), /repositories\/checkout\.md/);
  assert.match(fs.readFileSync(path.join(root, "shared/index.md"), "utf8"), /knowledge\/order-contract\.md/);
  assert.match(fs.readFileSync(path.join(root, "index.md"), "utf8"), /domains\/fulfilment\//);
});

test("[AB-HOME-004..005][AB-HOME-009] compatibility is explicit and invalid Receipt assignments fail before use", () => {
  const confirmedDomain = normalizeConfirmedDomain({ identity: "domains/orders", title: "Orders" });
  const compatibility = resolveProfileInitialIngestPlan({ subjectDirectory: "repositories/checkout", confirmedDomain,
    request, guidance });
  assert.equal(compatibility.subjectDirectory, "domains/orders/repositories/checkout");
  assert.deepEqual(compatibility.plan.participations.map((entry) => entry.candidateId), ["repository", "service"]);
  const invalid = normalizeAgentBaseInitialIngestHomePlan({
    default_home: { kind: "shared" },
    exceptions: [{ candidate_id: "embedded", home: { kind: "shared" } }],
    participations: [],
  });
  assert.throws(() => resolveProfileInitialIngestPlan({ subjectDirectory: "repositories/checkout", homePlan: invalid,
    request, guidance }), /does not resolve to a materialized concept candidate/);
  assert.throws(() => resolveProfileInitialIngestPlan({ subjectDirectory: "repositories/checkout", request, guidance }),
    /exactly one/);
});

test("[AB-PROFILE-LIFECYCLE-002] Profile Refresh accepts only the resolved Repository identity or matching legacy slug", () => {
  const summary = { identity: "domains/orders/repositories/checkout",
    path: "domains/orders/repositories/checkout.md", type: "Repository", title: "Checkout",
    description: "Orders source", domains: ["domains/orders"] };
  assert.equal(resolveProfileRefreshSubject(summary.identity, summary), summary.identity);
  assert.equal(resolveProfileRefreshSubject("repositories/checkout", summary), summary.identity);
  assert.throws(() => resolveProfileRefreshSubject("repositories/other", summary), /must match/);
  assert.throws(() => resolveProfileRefreshSubject("domains/other/repositories/checkout", summary), /must match/);
  assert.throws(() => resolveProfileRefreshSubject("repositories/checkout", undefined), /could not resolve/);
});

test("[AB-HOME-009..010][AB-PROFILE-LIFECYCLE-003..007][AB-COMPACT-011..012] Profile lifecycle retains subject, Questions and Guidance without activity logs", (t) => {
  const hubRoot = profileRoot(t);
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-source-"));
  const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-profile-state-"));
  t.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(stateRoot, { recursive: true, force: true }));
  fs.writeFileSync(path.join(sourceRoot, "README.md"), "# Checkout\n\nOrders.\nShared contract.\n");
  fs.mkdirSync(path.join(sourceRoot, "src"));
  fs.writeFileSync(path.join(sourceRoot, "src/index.ts"), "export const worker = true;\n");
  const repositoryId = "repository-checkout-aaaaaaaaaaaa", commit = "a".repeat(40), baseCommit = "b".repeat(40);
  const hub = createHubIdentity("acme/profile-hub", "main"), profileId = hubProfileId(hub);
  const receipt = createTestInventoryReceipt({
    label: "profile-home-session",
    source: { repositoryId, remote: "https://github.com/acme/checkout.git", defaultBranch: "main", commit },
    hubProfileId: profileId, publishedBase: baseCommit, request,
    questions: [{ kind: "missing-evidence", targetCandidateId: "service", property: "owner",
      scopeKey: "service-owner", missingEvidence: ["maintainer ownership"] }],
  });
  const plan = normalizeAgentBaseInitialIngestHomePlan({
    default_home: { kind: "domain", identity: "domains/orders", title: "Orders" },
    exceptions: [{ candidate_id: "contract", home: { kind: "shared" } }],
    participations: [{ candidate_id: "repository", domain: { identity: "domains/orders", title: "Orders" } }],
  });
  const resolved = resolveProfileInitialIngestPlan({ subjectDirectory: "repositories/checkout", homePlan: plan,
    request: receipt.guidanceRequest, guidance: receipt.guidance });
  const options = {
    stateRoot, mode: "new" as const, hub, baseCommit, checkoutRoot: hubRoot, sourceRepositoryRoot: sourceRoot,
    sourceRepositoryId: repositoryId, sourceState: { commit, dirty: false, dirtyDigest: null },
    evidenceDigest: receipt.digest, subjectDirectory: resolved.subjectDirectory, homePlan: resolved.plan,
    signals: [], selectedSchemas: ["Repository", "System", "Component", "Domain"],
    guidance: receipt.guidance, coverage: { partial: false, limitations: [] }, discoveryReceipt: receipt,
    requireObservedRevision: true, createdAt: "2026-09-04T00:00:00.000Z",
  };
  const session = beginHubAuthoringSession(options);
  assert.equal(beginHubAuthoringSession({ ...options, createdAt: "2026-09-05T00:00:00.000Z" }).id, session.id);
  const sharedPlan = normalizeAgentBaseInitialIngestHomePlan({
    default_home: { kind: "shared" }, exceptions: [], participations: [],
  });
  assert.notEqual(beginHubAuthoringSession({ ...options, subjectDirectory: "shared/repositories/checkout",
    homePlan: sharedPlan }).id, session.id);
  materializeInitialIngestSessionSkeletons(stateRoot, session.id, hubRoot,
    { id: repositoryId, displayName: "checkout", remotes: [], rootCommits: [] });
  const finalized = finalizeHubAuthoringSession(stateRoot, session.id, hubRoot, [], [],
    options.sourceState, baseCommit);
  assert.ok("proposal" in finalized);
  if (!("proposal" in finalized)) return;
  let bundle = loadOkfBundle(path.join(stateRoot, "proposals", finalized.proposal.id, "bundle"),
    { requireAgentBaseRootIndex: true });
  assert.equal(classifyAgentBaseHubProfile(bundle).kind, "profile-1.0");
  assert.equal([...bundle.concepts.values()].some((concept) =>
    concept.type === "Question" && concept.path.startsWith("domains/orders/questions/")), true);
  assert.equal(bundle.files.some((relative) => path.posix.basename(relative) === "log.md"), false);
  const refreshBase = "c".repeat(40);
  const refreshSession = beginHubAuthoringSession({
    stateRoot, mode: "refresh", hub, baseCommit: refreshBase, checkoutRoot: bundle.root,
    sourceRepositoryRoot: sourceRoot, sourceRepositoryId: repositoryId, sourceState: options.sourceState,
    evidenceDigest: `sha256:${"d".repeat(64)}`, subjectDirectory: resolved.subjectDirectory,
    signals: [], selectedSchemas: ["Repository", "System", "Component", "Domain"],
    requireObservedRevision: true, createdAt: "2026-09-04T00:30:00.000Z",
  });
  const repositoryPath = path.join(refreshSession.bundleRoot, "domains", "orders", "repositories", "checkout.md");
  fs.appendFileSync(repositoryPath, "\nRefresh confirms the current Orders source.\n");
  const refreshed = finalizeHubAuthoringSession(stateRoot, refreshSession.id, bundle.root, [], [],
    options.sourceState, refreshBase);
  assert.ok("proposal" in refreshed);
  if (!("proposal" in refreshed)) return;
  assert.equal(refreshed.proposal.subject, resolved.subjectDirectory);
  bundle = loadOkfBundle(path.join(stateRoot, "proposals", refreshed.proposal.id, "bundle"),
    { requireAgentBaseRootIndex: true });
  assert.equal(classifyAgentBaseHubProfile(bundle).kind, "profile-1.0");
  const invalidRefresh = beginHubAuthoringSession({
    stateRoot, mode: "refresh", hub, baseCommit: "e".repeat(40), checkoutRoot: bundle.root,
    sourceRepositoryRoot: sourceRoot, sourceRepositoryId: repositoryId, sourceState: options.sourceState,
    evidenceDigest: `sha256:${"f".repeat(64)}`, subjectDirectory: resolved.subjectDirectory,
    signals: [], selectedSchemas: ["Repository"], requireObservedRevision: true,
    createdAt: "2026-09-04T00:45:00.000Z",
  });
  fs.writeFileSync(path.join(invalidRefresh.bundleRoot, "orphan.md"),
    `---\ntype: Team Note\ntitle: Orphan\ndescription: Invalid Profile root concept.\nstatus: draft\ngenerated:\n  by: ${AGENTBASE_PRODUCER}\n  at: 2026-09-04T00:45:00.000Z\n---\n\n# Orphan\n`);
  assert.throws(() => finalizeHubAuthoringSession(stateRoot, invalidRefresh.id, bundle.root, [], [],
    options.sourceState, "e".repeat(40)), /refreshed Profile layout failed validation/);
  const questionConcept = [...bundle.concepts.values()].find((concept) => concept.type === "Question")!;
  const question = parseQuestionDocument(questionConcept);
  const guidanceResult = materializeQuestionGuidance({
    targetRoot: bundle.root,
    question: { ...question, status: question.state, sourceRepositoryId: repositoryId,
      observationIds: [], observations: [] },
    answer: "The Orders team owns this service.", by: "human:owner", at: "2026-09-04T01:00:00.000Z",
  });
  assert.equal(guidanceResult.concept.path,
    `domains/orders/knowledge/${question.id}-r${question.revision}.md`);
  assert.equal(guidanceResult.resolved.guidance[0], guidanceResult.concept.conceptId);
  assert.equal(parseQuestionDocument(loadOkfBundle(bundle.root).concepts.get(questionConcept.conceptId)!).state, "resolved");
  assert.match(fs.readFileSync(path.join(bundle.root, "domains/orders/index.md"), "utf8"),
    new RegExp(`knowledge/${question.id}-r${question.revision}\\.md`));
  assert.equal(classifyAgentBaseHubProfile(loadOkfBundle(bundle.root,
    { requireAgentBaseRootIndex: true })).kind, "profile-1.0");
});
