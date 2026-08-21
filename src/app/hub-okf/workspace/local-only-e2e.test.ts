import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runGit } from "../../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "../query/runtime-actions.ts";

const repositoryGuidance = {
  candidates: [{ id: "repository", identityHint: "source", identityBasis: "checkout root",
    queryValue: "repository", evidenceIds: ["readme"], disposition: "concept" as const }],
  semanticObservations: [{ id: "readme", candidateId: "repository", role: "documentation" as const,
    signal: "repository", source: { path: "README.md", startLine: 1, endLine: 1 } }],
  resourceObservations: [],
};

async function sourceRepository(root: string): Promise<string> {
  const repository = path.join(root, "source");
  fs.mkdirSync(repository);
  await runGit({ args: ["init", "-b", "main"], cwd: repository, operation: "initialize source fixture" });
  fs.writeFileSync(path.join(repository, "README.md"), "# Source\n");
  await runGit({ args: ["add", "README.md"], cwd: repository, operation: "stage source fixture" });
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "source"],
    cwd: repository, operation: "commit source fixture", commitTimestamp: "2026-08-13T00:00:00Z" });
  return repository;
}

test("[AB-HUB-SETUP-006..008][SC-003] local-only Hub accepts, queries and inventories two knowledge commits without a remote", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "local-only-hub-e2e-"));
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
  const actions = createHubRuntimeActions(environment, path.join(root, "state"));
  try {
    const repository = await sourceRepository(root);
    const configured = await actions.configure({ mode: "new" }) as { localRoot: string };
    for (const sequence of [1, 2]) {
      const prepared = await actions.prepare({ mode: "new", sourceRepository: repository,
        subjectDirectory: `repositories/repo-${sequence}`,
        guidanceRequest: repositoryGuidance }) as { sessionId: string; bundleRoot: string; sourceRepositoryId: string;
          source: { repositoryId: string; commit: string | null; dirty: boolean; dirtyDigest: string | null; limitations: readonly string[] } };
      fs.writeFileSync(path.join(prepared.bundleRoot, `repositories/repo-${sequence}.md`),
        `---\ntype: Repository\ntitle: Repo ${sequence}\ndescription: Repository ${sequence}\nstatus: draft\n`
        + `generated: { by: 'agentbase/0.0.0', at: '2026-08-13T00:00:00Z' }\n`
        + `sources:\n  - id: documentation\n    resource: repository://${prepared.sourceRepositoryId}/README.md#L1-L1\n`
        + `  - id: implementation\n    resource: repository://${prepared.sourceRepositoryId}/README.md#L1-L1\n`
        + `agentbase:\n  repository:\n    id: ${prepared.sourceRepositoryId}\n    display_name: source\n`
        + `    aliases: { remotes: [], root_commits: [] }\n  live_claims:\n    - id: AB-CLAIM-repo-${sequence}-doc\n`
        + `      subject: repositories/repo-${sequence}\n      property: repository.purpose\n      role: documentation\n`
        + `      source_id: documentation\n      target: { kind: text, name: Purpose }\n`
        + `      observed: { commit: ${prepared.source?.commit ?? "a".repeat(40)}, dirty: false, dirty_digest: null }\n`
        + `    - id: AB-CLAIM-repo-${sequence}-code\n      subject: repositories/repo-${sequence}\n`
        + `      property: repository.purpose\n      role: implementation\n      source_id: implementation\n`
        + `      target: { kind: text, name: Purpose implementation }\n`
        + `      observed: { commit: ${prepared.source?.commit ?? "a".repeat(40)}, dirty: false, dirty_digest: null }\n`
        + `---\n\n# Purpose\n\nRepo ${sequence}.\n`);
      const finalized = await actions.finalize(prepared.sessionId, sequence === 1 ? [{
        subject: "repositories/repo-1", property: "repository.purpose",
        claimIds: ["AB-CLAIM-repo-1-doc", "AB-CLAIM-repo-1-code"], missingEvidence: [],
      }] : []) as { proposal: { id: string; diffDigest: string } };
      await actions.accept(finalized.proposal.id, finalized.proposal.diffDigest);
      if (sequence === 1) {
        const [question] = await actions.listQuestions({ status: "pending" }) as readonly {
          id: string; revision: number; claims: readonly { role: string; source: { resource: string } }[];
        }[];
        assert.ok(question);
        assert.deepEqual(question.claims.map((claim) => claim.role).sort(), ["documentation", "implementation"]);
        assert.equal(question.claims.every((claim) => claim.source.resource.startsWith("repository://")), true);
        const answered = await actions.answerQuestion({ questionId: question.id, revision: question.revision,
          answer: "Repository purpose is owner-confirmed.", maintainer: "human:khoa" }) as {
          question: { status: string };
          proposal: { id: string; diffDigest: string };
          inspection: { entries: readonly { path: string; change: string }[] };
        };
        assert.equal(answered.question.status, "resolved");
        const guidancePath = answered.inspection.entries.find((entry) => entry.change === "created")?.path;
        assert.ok(guidancePath);
        await actions.accept(answered.proposal.id, answered.proposal.diffDigest);
        assert.match(JSON.stringify(await actions.read(guidancePath)), /owner-confirmed/);
        const live = await actions.readLiveEvidence("repositories/repo-1.md", prepared.source) as {
          claims: readonly { role: string }[];
        };
        assert.deepEqual([...live.claims.map((claim) => claim.role), "maintainer-guidance"].sort(),
          ["documentation", "implementation", "maintainer-guidance"]);
      }
    }
    const pending = await actions.listPending() as readonly unknown[];
    assert.equal(pending.length, 3);
    const restartedActions = createHubRuntimeActions(environment, path.join(root, "state"));
    assert.equal((await restartedActions.listQuestions({ status: "resolved" }) as readonly unknown[]).length, 1);
    const searched = await actions.search("Repo 2") as { status: string; matches: readonly { path: string }[] };
    assert.equal(searched.status, "ok");
    assert.equal(searched.matches.some((match) => match.path === "repositories/repo-2.md"), true);
    assert.equal((await runGit({ args: ["remote"], cwd: configured.localRoot, operation: "verify no local Hub remote" })).stdout, "");
    await assert.rejects(actions.submitMany(["x"]), /first bootstrap/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
