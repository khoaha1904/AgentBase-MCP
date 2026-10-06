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
  inspectHubProposal,
  readVerifiedHubProposalInspection,
} from "./inspect.ts";
import { callHubOkfTool } from "../mcp/mcp-tool-call.ts";
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
