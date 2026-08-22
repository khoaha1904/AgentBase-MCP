import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runGit, type GitRequest } from "../../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "../query/runtime-actions.ts";
import { attachExistingHub } from "./setup.ts";

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
        + `    aliases: { remotes: [], root_commits: [] }\n  observed_values:\n`
        + `    - subject: repositories/repo-${sequence}\n      property: repository.purpose\n      role: documentation\n`
        + `      value: 'Repository ${sequence}'\n      source_id: documentation\n`
        + `    - subject: repositories/repo-${sequence}\n`
        + `      property: repository.purpose\n      role: implementation\n      source_id: implementation\n`
        + `      value: 'Repository ${sequence} implementation'\n`
        + `---\n\n# Purpose\n\nRepo ${sequence}.\n`);
      const finalized = await actions.finalize(prepared.sessionId, sequence === 1 ? [{
        subject: "repositories/repo-1", property: "repository.purpose",
        observationRefs: [
          { role: "documentation", sourceId: "documentation" },
          { role: "implementation", sourceId: "implementation" },
        ], missingEvidence: [],
      }] : []) as { proposal: { id: string; diffDigest: string } };
      if (sequence === 1) {
        const inspected = await actions.inspect(finalized.proposal.id) as {
          inspection: { entries: readonly { path: string; change: string }[] };
        };
        assert.equal(inspected.inspection.entries.some((entry) =>
          entry.change === "created" && /^questions\/question-[a-f0-9]{24}\.md$/.test(entry.path)), true);
        assert.equal(inspected.inspection.entries.some((entry) =>
          entry.change === "created" && entry.path === "questions/index.md"), true);
        assert.equal(fs.existsSync(path.join(root, "state", "proposals", finalized.proposal.id, "questions.json")), false);
      }
      await actions.accept(finalized.proposal.id, finalized.proposal.diffDigest);
      if (sequence === 1) {
        assert.equal(fs.existsSync(path.join(root, "state", "questions")), false);
        const secondMachineActions = createHubRuntimeActions(environment, path.join(root, "state-second"));
        const [question] = await secondMachineActions.listQuestions({ status: "open" }) as readonly {
          id: string; revision: number; observations: readonly { role: string; source: { resource: string } }[];
        }[];
        assert.ok(question);
        assert.deepEqual(question.observations.map((value) => value.role).sort(), ["documentation", "implementation"]);
        assert.equal(question.observations.every((value) => value.source.resource.startsWith("repository://")), true);
        const answered = await actions.answerQuestion({ questionId: question.id, revision: question.revision,
          answer: "Repository purpose is owner-confirmed.", maintainer: "human:khoa" }) as {
          question: { status: string };
          proposal: { id: string; diffDigest: string };
          inspection: { entries: readonly { path: string; change: string }[] };
        };
        assert.equal(answered.question.status, "resolved");
        assert.equal((await actions.listQuestions({ status: "open" }) as readonly unknown[]).length, 1);
        assert.equal((await actions.listQuestions({ status: "resolved" }) as readonly unknown[]).length, 0);
        const changed = answered.inspection.entries.filter((entry) => entry.change !== "preserved");
        assert.deepEqual(changed.map((entry) => entry.change).sort(), ["created", "modified"]);
        const guidancePath = changed.find((entry) => entry.change === "created")?.path;
        assert.ok(guidancePath);
        await actions.accept(answered.proposal.id, answered.proposal.diffDigest);
        await assert.rejects(actions.answerQuestion({ questionId: question.id, revision: question.revision,
          answer: "A stale answer.", maintainer: "human:khoa" }), /revision changed/);
        assert.match(JSON.stringify(await actions.read(guidancePath)), /owner-confirmed/);
        const observed = await actions.readObservedValues("repositories/repo-1.md") as {
          values: readonly { role: string }[];
        };
        assert.deepEqual(observed.values.map((value) => value.role).sort(), ["documentation", "implementation"]);
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

    await runGit({ args: ["rm", "questions/index.md", ...fs.readdirSync(path.join(configured.localRoot, "questions"))
      .filter((name) => name.startsWith("question-")).map((name) => `questions/${name}`)],
    cwd: configured.localRoot, operation: "create orphan Guidance fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "orphan Guidance fixture"],
      cwd: configured.localRoot, operation: "commit orphan Guidance fixture", commitTimestamp: "2026-08-13T00:00:00Z" });
    await assert.rejects(restartedActions.listQuestions({}), /no shared Question document.*regenerate.*migrate/);

    await runGit({ args: ["rm", "README.md"], cwd: configured.localRoot, operation: "remove legacy Hub README fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "legacy Hub without README"],
      cwd: configured.localRoot, operation: "commit legacy Hub fixture", commitTimestamp: "2026-08-13T00:00:01Z" });
    const attachEnvironment = { HOME: path.join(root, "attach-home"), XDG_CONFIG_HOME: path.join(root, "attach-config"),
      XDG_DATA_HOME: path.join(root, "attach-data"), AGENTBASE_HUB_GITHUB_TOKEN: "token-canary" };
    const attached = await attachExistingHub("https://github.com/acme/AgentBase-Hub", attachEnvironment, async (request: GitRequest) => {
      if (request.args[0] !== "clone") return runGit(request);
      const destination = String(request.args.at(-1));
      fs.cpSync(configured.localRoot, destination, { recursive: true });
      await runGit({ args: ["remote", "add", "origin", "https://github.com/acme/AgentBase-Hub.git"],
        cwd: destination, operation: "add legacy Hub fixture origin" });
      return { stdout: "", stderr: "" };
    });
    assert.equal(attached.repository, "acme/AgentBase-Hub");
    assert.equal(fs.existsSync(path.join(attached.localRoot, "README.md")), false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
