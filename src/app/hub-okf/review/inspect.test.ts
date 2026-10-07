import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubProposal, createLocalOnlyHubState } from "../../../core/hub/index.ts";
import { computeOkfTreeDigest, renderAgentBaseOkfProfileDocument } from "../../../core/knowledge/index.ts";
import { acceptHubProposal } from "./test-support/accept.ts";
import { renderPublicationReview } from "../publication/review-summary.ts";
import {
  bindHubProposalInspection,
  attachHubInspectionContext,
  inspectHubProposal,
  readVerifiedHubProposalInspection,
} from "./inspect.ts";
import { callHubOkfTool } from "../mcp/mcp-tool-call.ts";
import { executeHubCli } from "../cli.ts";
import { createReviewActions } from "./review-actions.ts";
import { writeHubProposalState } from "./proposal-state.ts";

const COMMIT = "a".repeat(40);
const REPOSITORY_ID = "repository-review-aaaaaaaaaaaa";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function seedProfile(root: string): void {
  write(root, "index.md", "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Profile](shared/agentbase-profile.md)\n* [Shared](shared/index.md)\n* [Platform](domains/platform/index.md)\n");
  write(root, "shared/agentbase-profile.md", renderAgentBaseOkfProfileDocument());
  write(root, "shared/index.md", "# Shared\n\n* [Profile](agentbase-profile.md)\n");
  write(root, "domains/platform/index.md", "---\ntype: Domain\ntitle: Platform\ndescription: Platform.\n---\n# Platform\n");
}

test("[AB-IMPACT-010][AB-IMPACT-012..017] Inspect and Accept reject changed semantic evidence before mutation", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-impact-inspection-test-"));
  const proposalRoot = path.join(root, "proposal"), baseRoot = path.join(proposalRoot, "base");
  const bundleRoot = path.join(proposalRoot, "bundle");
  try {
    seedProfile(baseRoot);
    seedProfile(bundleRoot);
    write(bundleRoot, "domains/platform/knowledge/review.md", "---\ntype: Component\ntitle: Review\ndescription: Review.\n---\n# Review\n");
    fs.appendFileSync(path.join(bundleRoot, "domains", "platform", "index.md"), "\n* [Review](knowledge/review.md) - Component\n");
    const ordinary = inspectHubProposal([
      { path: "domains/platform/index.md", change: "modified", allowed: true },
      { path: "domains/platform/knowledge/review.md", change: "created", allowed: true },
    ],
      { baseRoot, proposedRoot: bundleRoot });
    const diffDigest = `sha256:${createHash("sha256").update(JSON.stringify(ordinary.entries)).digest("hex")}`;
    const proposal = createHubProposal({
      mode: "new", subject: "domains/platform/knowledge/review", baseCommit: COMMIT, sourceRepositoryId: REPOSITORY_ID,
      evidenceDigest: `sha256:${"b".repeat(64)}`, schemaVersion: "7.0.0", selectedSchemas: ["Component"],
      treeDigest: computeOkfTreeDigest(bundleRoot), diffDigest, localHubId: "c".repeat(24),
    });
    writeHubProposalState(proposalRoot, proposal);
    const inspection = bindHubProposalInspection(ordinary, { baseRoot, proposedRoot: bundleRoot, proposal });
    fs.writeFileSync(path.join(proposalRoot, "inspection.json"), `${JSON.stringify(inspection, null, 2)}\n`);
    assert.deepEqual(readVerifiedHubProposalInspection(proposalRoot, proposal), inspection);
    fs.writeFileSync(path.join(proposalRoot, "inspection.json"), JSON.stringify({ ...inspection,
      refreshSuggestions: { items: [], omitted: 1 } }));
    assert.throws(() => readVerifiedHubProposalInspection(proposalRoot, proposal), /Refresh suggestions changed/);
    fs.writeFileSync(path.join(proposalRoot, "inspection.json"), JSON.stringify(inspection));
    const acceptedCommit = "d".repeat(40);
    fs.writeFileSync(path.join(proposalRoot, "accepted.json"), `${JSON.stringify({ id: proposal.id,
      mode: proposal.mode, sourceRepositoryId: REPOSITORY_ID, diffDigest, acceptedCommit })}\n`);
    const publicationState = path.join(root, "publication-state");
    fs.mkdirSync(path.join(publicationState, "proposals"), { recursive: true });
    fs.cpSync(proposalRoot, path.join(publicationState, "proposals", proposal.id), { recursive: true });
    const review = renderPublicationReview({ stateRoot: publicationState, publicationMode: "independent", baseBranch: "main",
      proposals: [{ id: proposal.id, mode: proposal.mode, subject: proposal.subject,
        sourceRepositoryId: REPOSITORY_ID, evidenceDigest: proposal.evidenceDigest, diffDigest,
        schemaVersion: proposal.schemaVersion, parentCommit: COMMIT, commit: acceptedCommit,
        diffSummary: "1 file changed", publicationState: "pending" }] });
    assert.match(review.body, /### Semantic Impact[\s\S]*Concepts \+1 ~0 -0/);
    assert.match(review.body, /Physical home: domains\/platform \(domains\/platform\)/);
    assert.doesNotMatch(review.body, /Affected semantic Domain:/);

    const tampered = { ...inspection, semanticImpact: { ...inspection.semanticImpact!, concepts: {
      ...inspection.semanticImpact!.concepts, added: [],
    } } };
    fs.writeFileSync(path.join(proposalRoot, "inspection.json"), `${JSON.stringify(tampered, null, 2)}\n`);
    assert.throws(() => readVerifiedHubProposalInspection(proposalRoot, proposal), /changed after finalization/);
    let gitCalls = 0;
    const localHub = createLocalOnlyHubState({ kind: "local-only", root: path.join(root, "hub"),
      localHubId: "c".repeat(24), baseCommit: COMMIT, remoteBase: COMMIT, activeHead: COMMIT,
      catalogVersion: "7.0.0" });
    await assert.rejects(acceptHubProposal({ stateRoot: path.join(root, "state"), localHub, proposalRoot,
      expectedDiffDigest: diffDigest, git: async () => { gitCalls += 1; return { stdout: "", stderr: "" }; } }),
    /changed after finalization/);
    assert.equal(gitCalls, 0);

    const legacy = { ...ordinary };
    fs.writeFileSync(path.join(proposalRoot, "inspection.json"), `${JSON.stringify(legacy, null, 2)}\n`);
    assert.throws(() => readVerifiedHubProposalInspection(proposalRoot, proposal), /regenerate the prepared proposal/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-IMPACT-016] modified Refresh files appear once in Inspect and never in Finalize summaries", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-refresh-response-"));
  const baseRoot = path.join(root, "base"), bundleRoot = path.join(root, "bundle");
  try {
    for (const directory of [baseRoot, bundleRoot]) {
      write(directory, "index.md", "---\nokf_version: '0.2'\n---\n# Hub\n");
      for (const name of ["publisher", "consumer"]) write(directory, `components/${name}.md`,
        `---\ntype: Function\ntitle: ${name}\ndescription: Event worker.\n---\n# Worker\n\n${"Evidence-backed operation details.\n".repeat(120)}\n${directory === baseRoot ? "Prior behavior." : "Updated behavior."}\n`);
    }
    const ordinary = inspectHubProposal(["publisher", "consumer"].map((name) => ({
      path: `components/${name}.md`, change: "modified" as const, allowed: true,
    })), { baseRoot, proposedRoot: bundleRoot });
    const proposal = createHubProposal({ mode: "refresh", subject: "components/publisher", baseCommit: COMMIT,
      sourceRepositoryId: REPOSITORY_ID, evidenceDigest: `sha256:${"b".repeat(64)}`,
      schemaVersion: "7.0.0", selectedSchemas: ["Function"], treeDigest: computeOkfTreeDigest(bundleRoot),
      diffDigest: `sha256:${createHash("sha256").update(JSON.stringify(ordinary.entries)).digest("hex")}`,
      localHubId: "c".repeat(24) });
    const inspection = bindHubProposalInspection(ordinary, { baseRoot, proposedRoot: bundleRoot, proposal });
    assert.equal(inspection.counts.modified, 2);
    assert.equal(inspection.groups.updated.length, 2);
    assert.equal(JSON.stringify(inspection.groups).includes("content"), false);
    fs.writeFileSync(path.join(root, "inspection.json"), JSON.stringify(inspection));
    writeHubProposalState(root, proposal);
    const review = createReviewActions(root, () => root, async () => { throw new Error("Inspect needs no real Hub"); });
    const finalized = { proposal, inspection, observedSource: { commit: COMMIT, dirty: false, dirtyDigest: null } };
    const actions = { finalize: async () => finalized, inspect: review.inspect } as never;
    const finalResponse = await callHubOkfTool("finalize_hub_okf_proposal", { session_id: `hub-session-${"a".repeat(24)}` }, actions);
    const inspectResponse = await callHubOkfTool("inspect_hub_okf_proposal", { proposal_id: proposal.id }, actions);
    const body = JSON.parse(finalResponse.content[0]!.type === "text" ? finalResponse.content[0]!.text : "{}");
    assert.equal(body.proposal_id, proposal.id);
    assert.equal(body.proposal_digest, proposal.diffDigest);
    assert.equal(body.counts.modified, 2);
    assert.deepEqual(body.refreshSuggestions, { items: [], omitted: 0 });
    assert.equal(body.inspection, undefined);
    assert.ok(Buffer.byteLength(JSON.stringify(finalResponse)) < 1_000);
    assert.ok(Buffer.byteLength(JSON.stringify(inspectResponse)) < 8_000);
    const compact = JSON.parse(inspectResponse.content[0]!.type === "text" ? inspectResponse.content[0]!.text : "{}");
    assert.equal(compact.proposal_digest, proposal.diffDigest);
    assert.deepEqual(compact.inspection.semanticImpact, inspection.semanticImpact);
    for (const entry of compact.inspection.entries) {
      assert.equal(entry.before.content, undefined);
      assert.equal(entry.before.bytes, fs.statSync(entry.before.file).size);
      assert.match(entry.diff.text, /-Prior behavior\.[\s\S]*\+Updated behavior\./);
      assert.equal(entry.diff.truncated, false);
    }
    const complete = await callHubOkfTool("inspect_hub_okf_proposal", { proposal_id: proposal.id, include_content: true }, actions);
    const completeBody = JSON.parse(complete.content[0]!.type === "text" ? complete.content[0]!.text : "{}");
    assert.deepEqual(completeBody.inspection, inspection);
    assert.ok(Buffer.byteLength(JSON.stringify(inspectResponse)) < Buffer.byteLength(JSON.stringify(complete)) / 2);
    let cli = "";
    assert.equal(await executeHubCli(["finalize", "--session", "fixture"], actions, (value) => { cli = value; }), 0);
    assert.deepEqual(JSON.parse(cli), body);
    // Older retained inspections can have bytes in groups; reading them must still compact the response.
    fs.writeFileSync(path.join(root, "inspection.json"), JSON.stringify({ ...inspection,
      groups: { ...inspection.groups, updated: inspection.entries } }));
    const legacy = await review.inspect(proposal.id) as { inspection: typeof inspection };
    assert.equal(JSON.stringify(legacy.inspection.groups).includes("content"), false);
    const partial = attachHubInspectionContext(inspection, [], { partial: true, limitations: ["Consumers not investigated"] },
      { changeAccounting: { outcomes: [], partial: false, omitted: 0, limitations: [] },
        discovery: { sourceRevision: COMMIT, lanes: [], embeddedGroups: [], relationsAndFlows: [],
          questions: ["question-fixture"], ignoredCounts: {}, ignoredReasons: [], limitations: ["Consumers not investigated"] } });
    const partialResponse = await callHubOkfTool("finalize_hub_okf_proposal", { session_id: "fixture" }, {
      finalize: async () => ({ ...finalized, inspection: partial }),
    } as never);
    const partialSummary = JSON.parse(partialResponse.content[0]!.type === "text" ? partialResponse.content[0]!.text : "{}");
    assert.equal(partialSummary.coverage.partial, true);
    assert.equal(partialSummary.changeAccounting.partial, false);
    assert.deepEqual(partialSummary.questions, ["question-fixture"]);
    assert.deepEqual(partialSummary.limitations, ["Consumers not investigated"]);
    const noChange = await callHubOkfTool("finalize_hub_okf_proposal", { session_id: "fixture" }, {
      finalize: async () => ({ result: "no_change", inspection: partial }),
    } as never);
    assert.doesNotMatch(JSON.stringify(noChange), /Evidence-backed|semanticImpact|proposal_id/);
    const replacement = { result: "replacement_required", session_id: "replacement", skeletons: [{ path: "repositories/worker.md" }] };
    const replaced = await callHubOkfTool("finalize_hub_okf_proposal", { session_id: "fixture" }, { finalize: async () => replacement } as never);
    assert.deepEqual(JSON.parse(replaced.content[0]!.type === "text" ? replaced.content[0]!.text : "{}"), replacement);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("[AB-IMPACT-016] Inspect response carries proposal data once and groups do not repeat file bytes", async () => {
  const fileContent = "x".repeat(17_000);
  const value = {
    proposal: { id: "proposal-aaaaaaaaaa", diffDigest: `sha256:${"b".repeat(64)}` },
    inspection: {
      entries: [{ path: "repositories/example.md", change: "created", allowed: true,
        after: { digest: `sha256:${"c".repeat(64)}`, content: fileContent, truncated: false } }],
      groups: { added: [{ path: "repositories/example.md", change: "created", allowed: true }], updated: [], removed: [],
        questionsAndLimitations: { questions: [], limitations: [] } },
    },
  };
  const response = await callHubOkfTool("inspect_hub_okf_proposal", { proposal_id: value.proposal.id }, {
    inspect: async () => value,
  } as never);
  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  assert.equal(response.structuredContent, undefined);
  assert.ok((text.match(/x/g)?.length ?? 0) >= fileContent.length);
  assert.ok(Buffer.byteLength(text) < 20_000, "response should contain the file bytes once");
  const legacySize = Buffer.byteLength(JSON.stringify({ content: [{ type: "text", text }], structuredContent: value }));
  assert.ok(legacySize > Buffer.byteLength(JSON.stringify(response)) * 1.8, "legacy duplicated response is substantially larger");
});
