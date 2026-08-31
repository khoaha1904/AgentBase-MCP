import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createInventoryItemId, createInventoryReceipt, createQuestionPlanId,
  createRepositorySourceResource, getOkfAuthoringGuidance, loadOkfBundle,
  parseKnowledgeActivityLog, parseQuestionDocument, validateInventoryReceipt, type DiscoverySeed,
} from "../../../core/knowledge/index.ts";
import {
  beginHubAuthoringSession, finalizeHubAuthoringSession, materializeInitialIngestSessionSkeletons,
} from "./authoring-session.ts";

const commit = "a".repeat(40), baseCommit = "b".repeat(40);
const repositoryId = "repository-worker-aaaaaaaaaaaa";

test("[AB-MCP-024..030] Receipt Prepare is idempotent and Finalize owns Questions, provenance and activity", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-receipt-authoring-"));
  const hub = path.join(root, "hub"), source = path.join(root, "source"), stateRoot = path.join(root, "state");
  try {
    fs.mkdirSync(hub); fs.mkdirSync(source);
    fs.writeFileSync(path.join(hub, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    fs.writeFileSync(path.join(source, "README.md"), "# Worker\n\nProcesses jobs.\n");
    fs.writeFileSync(path.join(source, "main.tf"), [
      "resource \"aws_lambda_function\" \"worker\" {", "  function_name = \"worker\"", "}",
      "resource \"aws_sqs_queue\" \"jobs\" {}", "resource \"aws_sns_topic\" \"events\" {}", "",
    ].join("\n"));
    fs.writeFileSync(path.join(source, "handler.py"), "def handle(event, context):\n    return {'status': 'ok'}\n");
    const groups = [
      ["1", "identity-product", "repository-identity", "Repository identity", "README.md", 1, "p0"],
      ["2", "runtime-entrypoint", "runtime-entrypoint", "Worker runtime", "main.tf", 1, "p0"],
      ["3", "integration-data-channel", "outbound-integration", "Job queue", "main.tf", 4, "p0"],
      ["4", "integration-data-channel", "relation-candidate", "Queue ownership question", "main.tf", 4, "p1"],
      ["5", "runtime-entrypoint", "runtime-implementation", "Worker implementation", "handler.py", 1, "p0"],
    ].map(([number, lane, kind, title, sourcePath, line, priority]) => ({
      id: `discovery-group-${String(number).padStart(24, "0")}`,
      lane: lane as DiscoverySeed["groups"][number]["lane"], kind: String(kind),
      priority: priority as DiscoverySeed["groups"][number]["priority"], title: String(title), count: 1,
      sources: [{ path: String(sourcePath), startLine: Number(line), endLine: Number(line) }],
      hints: [String(sourcePath)], limitations: [],
    }));
    const seed: DiscoverySeed = {
      id: `discovery-seed-${"1".repeat(24)}`, digest: `sha256:${"2".repeat(64)}`,
      source: { repositoryId, remote: "https://github.example.test/acme/worker.git", defaultBranch: "main", commit },
      engine: { id: "codebase-memory-mcp", version: "0.10.8", profile: "agentbase-mvp-12-v1" },
      lanes: [
        { lane: "identity-product", status: "covered" },
        { lane: "runtime-entrypoint", status: "covered" },
        { lane: "interface-event-trigger", status: "absent-after-check" },
        { lane: "integration-data-channel", status: "covered" },
        { lane: "deploy-operations", status: "absent-after-check" },
      ],
      groups,
      capture: { nodeCount: 12, edgeCount: 8, coverageTerminal: true, truncated: false,
        p1P2Overflow: 0, limitations: [] },
      state: "ready",
    };
    const request = {
      candidates: [
        { id: "repository", identityHint: "worker", identityBasis: "README", queryValue: "job worker repository",
          evidenceIds: ["readme"], disposition: "concept" as const, suggestedType: "Repository" },
        { id: "worker", identityHint: "worker", identityBasis: "Terraform address", queryValue: "job processing runtime",
          evidenceIds: ["function", "handler"], disposition: "concept" as const },
        { id: "queue", identityHint: "jobs", identityBasis: "Terraform address", queryValue: "worker input transport",
          evidenceIds: ["queue-resource"], disposition: "embedded" as const, parentCandidateId: "worker" },
        { id: "topic", identityHint: "events", identityBasis: "Terraform address", queryValue: "worker event transport",
          evidenceIds: ["topic-resource"], disposition: "embedded" as const, parentCandidateId: "worker" },
        { id: "external", identityHint: "upstream API", identityBasis: "README dependency", queryValue: "external job source",
          evidenceIds: ["external-doc"], disposition: "embedded" as const, parentCandidateId: "worker" },
      ],
      semanticObservations: [
        { id: "readme", candidateId: "repository", role: "documentation" as const,
          signal: "repository purpose", source: { path: "README.md", startLine: 1, endLine: 3 } },
        { id: "external-doc", candidateId: "external", role: "documentation" as const,
          signal: "calls upstream API", source: { path: "README.md", startLine: 3, endLine: 3 } },
        { id: "handler", candidateId: "worker", role: "implementation" as const,
          signal: "worker handler entrypoint", source: { path: "handler.py", startLine: 1, endLine: 2 } },
      ],
      resourceObservations: [
        { id: "function", candidateId: "worker", sourceTool: "terraform" as const,
          resourceType: "aws_lambda_function", address: "aws_lambda_function.worker",
          source: { path: "main.tf", startLine: 1, endLine: 3 } },
        { id: "queue-resource", candidateId: "queue", sourceTool: "terraform" as const,
          resourceType: "aws_sqs_queue", address: "aws_sqs_queue.jobs",
          source: { path: "main.tf", startLine: 4, endLine: 4 } },
        { id: "topic-resource", candidateId: "topic", sourceTool: "terraform" as const,
          resourceType: "aws_sns_topic", address: "aws_sns_topic.events",
          source: { path: "main.tf", startLine: 5, endLine: 5 } },
      ],
    };
    const inventory = {
      seedId: seed.id,
      items: [
        { id: createInventoryItemId(seed.id, groups[0]!.id), originGroupId: groups[0]!.id,
          outcome: "materialized" as const, outputs: [{ candidateId: "repository" }] },
        { id: createInventoryItemId(seed.id, groups[1]!.id), originGroupId: groups[1]!.id,
          outcome: "materialized" as const,
          outputs: [{ candidateId: "worker" }, { candidateId: "queue", parentCandidateId: "worker" },
            { candidateId: "topic", parentCandidateId: "worker" },
            { candidateId: "external", parentCandidateId: "worker" }] },
        { id: createInventoryItemId(seed.id, groups[2]!.id), originGroupId: groups[2]!.id,
          outcome: "materialized" as const, outputs: [{ candidateId: "queue", parentCandidateId: "worker" }] },
        { id: createInventoryItemId(seed.id, groups[3]!.id), originGroupId: groups[3]!.id,
          outcome: "question" as const, outputs: [], questionPlanId: createQuestionPlanId(seed.id, groups[3]!.id) },
        { id: createInventoryItemId(seed.id, groups[4]!.id), originGroupId: groups[4]!.id,
          outcome: "materialized" as const, outputs: [{ candidateId: "worker" }] },
      ],
      questionPlans: [{
        id: createQuestionPlanId(seed.id, groups[3]!.id), kind: "relation-candidate" as const,
        originGroupId: groups[3]!.id, targetCandidateId: "worker", property: "queue-ownership",
        scopeKey: "worker-jobs-queue",
        candidateEvidence: [{ candidateKey: "queue",
          sourceResource: createRepositorySourceResource(repositoryId, "main.tf", 4, 4), observedRevision: commit }],
        missingEvidence: ["consumer ownership is not explicit"], limitations: [],
      }],
      limitations: [],
    };
    const guidance = getOkfAuthoringGuidance(request);
    const receipt = createInventoryReceipt({ seed, inventory, guidanceRequest: request, guidance,
      hubProfileId: "c".repeat(24), publishedBase: baseCommit, createdAt: "2026-08-25T00:00:00.000Z" });
    const superseded = structuredClone(receipt);
    Reflect.deleteProperty(superseded.inventory.items[0]!, "outcome");
    Reflect.set(superseded.inventory.items[0]!, "disposition", "concept");
    assert.throws(() => validateInventoryReceipt(superseded), /superseded private Inventory contract/);
    const options = {
      stateRoot, mode: "new" as const, localHubId: "c".repeat(24), baseCommit, checkoutRoot: hub,
      sourceRepositoryRoot: source, sourceRepositoryId: repositoryId,
      sourceState: { commit, dirty: false, dirtyDigest: null }, evidenceDigest: receipt.digest,
      subjectDirectory: "repositories/worker", signals: [], selectedSchemas: ["Repository", "Function"],
      guidance, coverage: { partial: false, limitations: [] }, discoveryReceipt: receipt,
      requireObservedRevision: true, createdAt: "2026-08-25T00:00:00.000Z",
    };
    const first = beginHubAuthoringSession(options);
    const skeletons = materializeInitialIngestSessionSkeletons(stateRoot, first.id, hub,
      { id: repositoryId, displayName: "worker", remotes: [seed.source.remote], rootCommits: [commit] });
    assert.equal(skeletons.filter((item) => item.candidateId === "worker").length, 1,
      "overlapping Terraform and implementation groups must emit one runtime concept");
    const retry = beginHubAuthoringSession({ ...options, createdAt: "2026-08-26T00:00:00.000Z" });
    assert.equal(retry.id, first.id);
    assert.deepEqual(materializeInitialIngestSessionSkeletons(stateRoot, retry.id, hub,
      { id: repositoryId, displayName: "worker", remotes: [seed.source.remote], rootCommits: [commit] }), skeletons);

    const workerPath = path.join(first.bundleRoot, skeletons.find((item) => item.candidateId === "worker")!.path);
    const validWorker = fs.readFileSync(workerPath, "utf8");
    assert.match(validWorker, /\| jobs \|/);
    assert.match(validWorker, /\| events \|/);
    assert.match(validWorker, /\| upstream API \|/);
    assert.match(validWorker, /  - id: queue-resource\n/);
    assert.match(validWorker, /  - id: topic-resource\n/);
    assert.match(validWorker, /  - id: external-doc\n/);
    const authoredWorker = validWorker
      .replace(/  - id: queue-resource\n    resource: [^\n]+\n    observed_revision: [^\n]+\n/, "")
      .replace("| jobs |", "| Job transport |")
      .split("\n").filter((line) => !line.startsWith("| events |")).join("\n");
    fs.writeFileSync(workerPath, authoredWorker.replace("main.tf#L1-L3", "main.tf#L1-L99"));
    assert.throws(() => finalizeHubAuthoringSession(stateRoot, first.id, hub, [], [],
      { commit, dirty: false, dirtyDigest: null }, baseCommit), /one repair attempt remains/);
    fs.writeFileSync(workerPath, authoredWorker);
    const finalized = finalizeHubAuthoringSession(stateRoot, first.id, hub, [], [],
      { commit, dirty: false, dirtyDigest: null }, baseCommit);
    assert.ok("proposal" in finalized);
    if (!("proposal" in finalized)) return;
    const bundleRoot = path.join(stateRoot, "proposals", finalized.proposal.id, "bundle");
    const bundle = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
    const question = [...bundle.concepts.values()].find((concept) => concept.type === "Question");
    assert.ok(question);
    const authoredWorkerConcept = bundle.concepts.get(skeletons.find((item) => item.candidateId === "worker")!.identity)!;
    assert.match(authoredWorkerConcept.body, /\| Job transport \|/);
    assert.match(authoredWorkerConcept.body, /\| events \|/);
    const retainedSourceIds = Array.isArray(authoredWorkerConcept.frontmatter.sources)
      ? authoredWorkerConcept.frontmatter.sources.flatMap((source) => source && typeof source === "object"
        && !Array.isArray(source) && typeof source.id === "string" ? [source.id] : []) : [];
    assert.equal(retainedSourceIds.filter((id) => id === "queue-resource").length, 1,
      "Finalize restores missing embedded evidence exactly once");
    assert.equal(retainedSourceIds.filter((id) => id === "topic-resource").length, 1);
    assert.equal(retainedSourceIds.filter((id) => id === "external-doc").length, 1);
    assert.equal(parseQuestionDocument(question).references[0]?.referenceKind, "candidate-evidence");
    for (const concept of [...bundle.concepts.values()].filter((entry) => entry.type !== "Question")) {
      const repositorySources = Array.isArray(concept.frontmatter.sources)
        ? concept.frontmatter.sources.filter((entry) => JSON.stringify(entry).includes(`repository://${repositoryId}/`)) : [];
      assert.equal(repositorySources.every((entry) => (entry as Record<string, unknown>).observed_revision === commit), true);
    }
    const activityPath = path.join(bundleRoot, "repositories", "worker", "log.md");
    const activity = parseKnowledgeActivityLog(fs.readFileSync(activityPath, "utf8"));
    assert.equal(activity.length, 1);
    assert.match(activity[0]!.summary, /2 concept output\(s\), 3 embedded output\(s\)/);
    assert.equal(finalized.inspection.discovery?.sourceRevision, commit);
    assert.equal(finalized.inspection.discovery?.questions.length, 1);
    assert.deepEqual(finalized.inspection.activity, { repositoryLog: "repositories/worker/log.md", domainLog: null });
    assert.throws(() => beginHubAuthoringSession(options), /already finalized/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
