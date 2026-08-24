import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, createLocalOnlyHubState, hubProfileId, HUB_PROPOSAL_TRAILERS } from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, createQuestionId, loadOkfBundle, parseConceptDocument,
  parseQuestionDocument, readExternalIdentities, readObservedValues, renderConceptDocument,
  renderQuestionDocument, renderQuestionIndex, type SharedQuestion,
} from "../../../core/knowledge/index.ts";
import { AwsCliAdapter, AwsCliError, type AwsProcessRunner } from "../../../providers/aws-cli/index.ts";
import { runGit, type GitRequest } from "../../../providers/github-hub/index.ts";
import {
  finalizeDomainEnrichment, prepareDomainEnrichment, runDomainEnrichment,
} from "../enrichment/index.ts";
import {
  HUB_CI_MANIFEST_PATH, HUB_CI_VALIDATOR_PATH, HUB_CI_WORKFLOW_PATH, createHubRuntimeActions,
  executeHubBootstrap, previewHubBootstrap, readPersistedHubConfiguration, renderHubCiBundle,
  replacePersistedHubConfiguration, validateHubCi, writePersistedHubConfiguration,
} from "../index.ts";
import { attachExistingHub, createLocalHub } from "./setup.ts";
import {
  hubProfileCredentialPath, loadExactHubProfileToken, writeGlobalHubToken, writeHubProfileToken,
} from "../configuration/credential-file.ts";

const repositoryGuidance = {
  candidates: [{ id: "repository", identityHint: "source", identityBasis: "checkout root",
    queryValue: "repository", evidenceIds: ["readme"], disposition: "concept" as const }],
  semanticObservations: [{ id: "readme", candidateId: "repository", role: "documentation" as const,
    signal: "repository", source: { path: "README.md", startLine: 1, endLine: 1 } }],
  resourceObservations: [],
};

async function configureTestRemoteHub(environment: NodeJS.ProcessEnv, repository: string): Promise<ReturnType<typeof createLocalHub> extends Promise<infer T> ? T : never> {
  const local = await createLocalHub(environment);
  const current = readPersistedHubConfiguration(environment);
  assert.ok(current?.kind === "local-only");
  const identity = createHubIdentity(repository, "main"), localHubId = hubProfileId(identity);
  await runGit({ args: ["remote", "add", "origin", identity.canonicalHttpsUrl], cwd: local.localRoot,
    operation: "attach test Hub remote" });
  replacePersistedHubConfiguration(current, { ...current, kind: "remote", localHubId,
    host: identity.host, repository: identity.repository, targetBranch: identity.targetBranch }, environment,
  { retireExpected: true });
  return { ...local, kind: "remote", localHubId, host: identity.host, repository: identity.repository, targetBranch: identity.targetBranch };
}

function batchGuidance(index: number) {
  return {
    candidates: [
      { id: "repository", identityHint: `batch-${index}`, identityBasis: "checkout root",
        queryValue: `batch ${index} repository`, evidenceIds: ["readme"], disposition: "concept" as const },
      { id: "system", identityHint: `batch-${index}`, identityBasis: "README capability",
        queryValue: `batch ${index} operational system`, evidenceIds: ["system-readme"],
        disposition: "concept" as const, suggestedType: "System" },
    ],
    semanticObservations: [
      { id: "readme", candidateId: "repository", role: "documentation" as const,
        signal: "repository", source: { path: "README.md", startLine: 1, endLine: 1 } },
      { id: "system-readme", candidateId: "system", role: "documentation" as const,
        signal: "operational system with cooperating parts", source: { path: "README.md", startLine: 1, endLine: 1 } },
    ],
    resourceObservations: [],
  };
}

async function namedSourceRepository(root: string, name: string): Promise<string> {
  const repository = path.join(root, name);
  fs.mkdirSync(repository);
  await runGit({ args: ["init", "-b", "main"], cwd: repository, operation: "initialize source fixture" });
  fs.writeFileSync(path.join(repository, "README.md"), "# Source\n");
  await runGit({ args: ["add", "README.md"], cwd: repository, operation: "stage source fixture" });
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "source"],
    cwd: repository, operation: "commit source fixture", commitTimestamp: "2026-08-13T00:00:00Z" });
  return repository;
}

async function sourceRepository(root: string): Promise<string> {
  return namedSourceRepository(root, "source");
}

function enrichmentQuestion(kind: SharedQuestion["kind"], subject: string, property: string,
  scopeKey: string, candidateKey: string, repositoryId: string): SharedQuestion {
  const id = createQuestionId({ kind, originSubject: subject, originProperty: property, scopeKey });
  return { id, revision: 1, state: "open", kind, originSubject: subject, originProperty: property,
    subject, property, scopeKey, references: [{ referenceKind: "candidate-evidence", candidateKey,
      sourceResource: `repository://${repositoryId}/README.md#L1-L1` }], missingEvidence: ["exact provider evidence"],
    limitations: [], guidance: [], title: `${kind} ${property}`, createdAt: "2026-08-13T00:00:00Z" };
}

async function addPublishedEnrichmentFixture(root: string): Promise<Readonly<{
  repositoryIds: readonly string[]; questions: readonly SharedQuestion[]; commit: string;
}>> {
  fs.copyFileSync(path.join(root, "repositories/repo-2.md"), path.join(root, "repositories/repo-3.md"));
  fs.appendFileSync(path.join(root, "repositories/index.md"), "\n* [Repo 3](repo-3.md) - Repository\n");
  const repositoryPaths = ["repositories/repo-1.md", "repositories/repo-2.md", "repositories/repo-3.md"];
  const repositoryIds = ["repository-source-one-111111111111", "repository-source-two-222222222222", "repository-source-three-333333333333"];
  for (const [index, relative] of repositoryPaths.entries()) {
    const concept = parseConceptDocument(relative, fs.readFileSync(path.join(root, relative), "utf8"));
    const agentbase = concept.frontmatter.agentbase as Record<string, unknown>;
    const repository = agentbase.repository as Record<string, unknown>;
    repository.id = repositoryIds[index]!;
    repository.display_name = `source-${index + 1}`;
    const sources = (Array.isArray(concept.frontmatter.sources) ? [...concept.frontmatter.sources] : []).map((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return value;
      const source = { ...value } as Record<string, unknown>;
      if (typeof source.resource === "string" && source.resource.startsWith("repository://")) {
        source.resource = source.resource.replace(/^repository:\/\/[^/]+/, `repository://${repositoryIds[index]}`);
      }
      return source;
    });
    sources.push({ id: "owner-domain", resource: "agentbase://owner-guidance/domains/crawler" });
    const relationships = Array.isArray(concept.frontmatter.relationships) ? [...concept.frontmatter.relationships] : [];
    relationships.push({ kind: "part-of", target: "domains/crawler", evidence: ["owner-domain"] });
    if (index === 2) delete agentbase.observed_values;
    const body = index === 2 ? concept.body.replace(/<!-- agentbase:observed-values:start -->[\s\S]*?<!-- agentbase:observed-values:end -->/g, "") : concept.body;
    fs.writeFileSync(path.join(root, relative), renderConceptDocument({ ...concept,
      frontmatter: { ...concept.frontmatter, sources, relationships },
      body: `${body.trimEnd()}\n\nPrimary Domain: [Crawler](../domains/crawler.md).\n` }));
  }
  fs.mkdirSync(path.join(root, "domains"), { recursive: true });
  fs.writeFileSync(path.join(root, "domains/crawler.md"), `---\ntype: Domain\ntitle: Crawler\n`
    + `description: Published crawler Domain\nstatus: draft\ngenerated: { by: 'agentbase/0.0.0', at: '2026-08-13T00:00:00Z' }\n`
    + `sources:\n  - id: owner-domain\n    resource: agentbase://owner-guidance/domains/crawler\n---\n\n# Purpose\n\nPublished crawler Domain.\n`);
  fs.writeFileSync(path.join(root, "domains/index.md"), "# Domains\n\n* [Crawler](crawler.md) - Domain\n");
  const rootIndex = fs.readFileSync(path.join(root, "index.md"), "utf8");
  if (!rootIndex.includes("domains/index.md")) fs.writeFileSync(path.join(root, "index.md"), `${rootIndex.trimEnd()}\n\n* [Domains](domains/index.md) - business domains\n`);
  const questions = [
    enrichmentQuestion("relation-candidate", "repositories/repo-1", "queue.relation", "crawler-relation", "candidate-111111111111111111111111", repositoryIds[0]!),
    enrichmentQuestion("conflict", "repositories/repo-1", "queue.identity", "crawler-identity", "candidate-222222222222222222222222", repositoryIds[0]!),
    enrichmentQuestion("maintainer-decision", "repositories/repo-3", "queue.intent", "crawler-intent", "candidate-333333333333333333333333", repositoryIds[2]!),
  ];
  fs.mkdirSync(path.join(root, "questions"), { recursive: true });
  const existing = fs.readdirSync(path.join(root, "questions")).filter((name) => /^question-.*\.md$/.test(name))
    .map((name) => parseQuestionDocument(parseConceptDocument(`questions/${name}`, fs.readFileSync(path.join(root, "questions", name), "utf8"))));
  for (const question of questions) fs.writeFileSync(path.join(root, "questions", `${question.id}.md`), renderQuestionDocument(question));
  fs.writeFileSync(path.join(root, "questions/index.md"), renderQuestionIndex([...existing, ...questions]));
  await runGit({ args: ["add", "index.md", "domains", "repositories", "questions"], cwd: root, operation: "stage enrichment fixture" });
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "published enrichment fixture"],
    cwd: root, operation: "commit enrichment fixture", commitTimestamp: "2026-08-13T00:00:02Z" });
  const commit = (await runGit({ args: ["rev-parse", "HEAD"], cwd: root, operation: "resolve enrichment fixture" })).stdout.trim();
  return { repositoryIds, questions, commit };
}

test("[AB-HUB-SETUP-001..017][AB-BATCH-006][AB-HUB-CI-001..007][AB-QUERY-012] remote Hub keeps Draft separate from Published query", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "local-only-hub-e2e-"));
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
  const actions = createHubRuntimeActions(environment, path.join(root, "state"));
  try {
    const repository = await sourceRepository(root);
    const tokenLauncher = spawnSync(process.execPath,
      [path.resolve("scripts/installation/configure-hub-token.mjs"), "--repository-url", "https://github.com/acme/hub.git", "--target-branch", "main"],
      { cwd: root, encoding: "utf8", env: { ...process.env, HOME: root, XDG_CONFIG_HOME: path.join(root, "launcher-config") } });
    assert.equal(tokenLauncher.status, 1);
    assert.match(tokenLauncher.stderr, /requires an interactive terminal/);
    assert.equal((await actions.status() as { kind: string }).kind, "unconfigured");
    await configureTestRemoteHub(environment, "acme/test-hub");
    await actions.preflight(repository);
    const configured = readPersistedHubConfiguration(environment);
    assert.ok(configured && configured.kind === "remote");
    const workflow = renderHubCiBundle().files[HUB_CI_WORKFLOW_PATH]!.toString();
    assert.equal(fs.readFileSync(path.join(configured.localRoot, ...HUB_CI_WORKFLOW_PATH.split("/")), "utf8"), workflow);
    assert.equal(fs.existsSync(path.join(configured.localRoot, ...HUB_CI_VALIDATOR_PATH.split("/"))), true);
    assert.equal(fs.existsSync(path.join(configured.localRoot, ...HUB_CI_MANIFEST_PATH.split("/"))), true);
    const emptyCi = await validateHubCi(configured.localRoot, () => new Date("2026-08-22T00:00:00Z"));
    assert.equal(emptyCi.passed, true);
    const standalone = JSON.parse(execFileSync(process.execPath,
      [path.join(configured.localRoot, ...HUB_CI_VALIDATOR_PATH.split("/")), "--root", configured.localRoot, "--format", "json"],
      { encoding: "utf8" })) as { passed: boolean };
    assert.equal(standalone.passed, true);
    const installedValidator = path.join(configured.localRoot, ...HUB_CI_VALIDATOR_PATH.split("/"));
    const validatorBytes = fs.readFileSync(installedValidator);
    fs.appendFileSync(installedValidator, "\n// tampered\n");
    assert.match((await validateHubCi(configured.localRoot)).errors.join("\n"), /checksum mismatch/);
    fs.writeFileSync(installedValidator, validatorBytes);
    assert.deepEqual(emptyCi.freshness.summary, { total: 0, observed: 0, unknown: 0 });
    assert.match(workflow, /permissions:\n  contents: read/);
    assert.doesNotMatch(workflow, /pull_request_target|secrets\.|write/);
    assert.doesNotMatch(workflow, /npm (?:ci|install)|Checkout AgentBase-MCP|repository:/);

    const ciFixture = path.join(root, "ci-fixture");
    fs.mkdirSync(path.join(ciFixture, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(ciFixture, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Notes](notes.md) - custom notes\n");
    fs.writeFileSync(path.join(ciFixture, "notes.md"), "---\ntype: Team Note\ntitle: Notes\ndescription: Custom knowledge.\n---\n\n# Notes\n");
    for (const [relative, bytes] of Object.entries(renderHubCiBundle().files)) {
      const target = path.join(ciFixture, ...relative.split("/"));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
    }
    const customCi = await validateHubCi(ciFixture, () => new Date("2026-08-22T00:00:00Z"));
    assert.equal(customCi.passed, true);
    assert.match(customCi.warnings.join("\n"), /custom OKF type Team Note/);
    fs.writeFileSync(path.join(ciFixture, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Missing](missing.md) - broken\n");
    assert.equal((await validateHubCi(ciFixture)).passed, false);
    fs.writeFileSync(path.join(ciFixture, ".env"), "github_pat_abcdefghijklmnopqrstuvwxyz012345\n");
    const unsafeCi = await validateHubCi(ciFixture);
    assert.equal(unsafeCi.passed, false);
    assert.match(unsafeCi.errors.join("\n"), /sensitive|forbidden/);
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
        assert.match(fs.readFileSync(path.join(configured.localRoot, ...guidancePath.split("/")), "utf8"), /owner-confirmed/);
      }
    }

    const pending = await actions.listPending() as readonly unknown[];
    assert.equal(pending.length, 3);
    const restartedActions = createHubRuntimeActions(environment, path.join(root, "state"));
    assert.equal((await restartedActions.listQuestions({ status: "resolved" }) as readonly unknown[]).length, 1);
    assert.deepEqual((await actions.search("Repo 2") as { matches: readonly unknown[] }).matches, []);
    await assert.rejects(actions.read("repositories/repo-2.md"), /Git exited with status 128/);
    assert.equal((await runGit({ args: ["remote"], cwd: configured.localRoot, operation: "verify test Hub remote" })).stdout.trim(), "origin");
    await assert.rejects(actions.submitMany(["x"]), /dedicated GitHub token/);

    const bootstrapEnvironment = { HOME: path.join(root, "bootstrap-home"), XDG_CONFIG_HOME: path.join(root, "bootstrap-config"),
      XDG_DATA_HOME: path.join(root, "bootstrap-data"), XDG_STATE_HOME: path.join(root, "bootstrap-state") };
    const bootstrapRemote = path.join(root, "bootstrap-remote.git");
    await runGit({ args: ["init", "--bare", "--initial-branch=main", bootstrapRemote], cwd: root, operation: "create bootstrap remote" });
    const bootstrapUrl = "https://github.com/acme/bootstrap-hub.git";
    const bootstrapBranch = "knowledge/main";
    const remoteProfileId = hubProfileId(createHubIdentity("acme/bootstrap-hub", bootstrapBranch));
    writeHubProfileToken(remoteProfileId, "bootstrap-token-canary", bootstrapEnvironment);
    let failPublishedAdmission = true;
    const bootstrapGit = async (request: GitRequest) => {
      if (request.operation === "inspect bootstrapped Published boundary" && failPublishedAdmission) {
        failPublishedAdmission = false; throw new Error("simulated post-activation crash");
      }
      const args = [...request.args];
      const remoteIndex = args.findIndex((value) => value === bootstrapUrl || value === "origin");
      if (["ls-remote", "push", "fetch"].includes(args[0] ?? "") && remoteIndex >= 0) {
        args[remoteIndex] = bootstrapRemote;
        return { stdout: execFileSync("/usr/bin/git", args, { cwd: request.cwd, encoding: "utf8" }), stderr: "" };
      }
      return runGit(request);
    };
    const preview = await previewHubBootstrap(bootstrapUrl, bootstrapBranch, bootstrapEnvironment, bootstrapGit);
    assert.equal(preview.remoteState, "empty");
    assert.deepEqual(preview.baselinePaths, [HUB_CI_MANIFEST_PATH, HUB_CI_VALIDATOR_PATH, HUB_CI_WORKFLOW_PATH, "README.md", "index.md"].sort());
    await assert.rejects(executeHubBootstrap(bootstrapUrl, bootstrapBranch, bootstrapEnvironment,
      { git: bootstrapGit }), /simulated post-activation crash/);
    const interrupted = readPersistedHubConfiguration(bootstrapEnvironment);
    assert.equal(interrupted?.localHubId, remoteProfileId);
    const bootstrapped = await executeHubBootstrap(bootstrapUrl, bootstrapBranch, bootstrapEnvironment, { git: bootstrapGit });
    assert.equal(bootstrapped.phase, "completed");
    assert.ok(interrupted?.kind === "remote");
    assert.equal((await runGit({ args: ["rev-parse", "refs/agentbase/published"], cwd: interrupted.localRoot,
      operation: "verify bootstrap Published boundary" })).stdout.trim(), bootstrapped.intent.baseCommit);
    assert.equal((await runGit({ args: ["rev-parse", `refs/heads/${bootstrapBranch}`], cwd: bootstrapRemote,
      operation: "verify remote bootstrap target" })).stdout.trim(), bootstrapped.intent.baseCommit);
    assert.match((await runGit({ args: ["show", `refs/heads/${bootstrapBranch}:${HUB_CI_MANIFEST_PATH}`], cwd: bootstrapRemote,
      operation: "verify remote bootstrap CI target" })).stdout, new RegExp(`"target_branch": "${bootstrapBranch}"`));

    const legacyEnvironment = { HOME: path.join(root, "legacy-home"), XDG_CONFIG_HOME: path.join(root, "legacy-config"),
      XDG_DATA_HOME: path.join(root, "legacy-data") };
    const legacyRoot = path.join(root, "legacy-hub");
    fs.cpSync(configured.localRoot, legacyRoot, { recursive: true });
    await runGit({ args: ["remote", "set-url", "origin", "https://github.com/acme/legacy-hub.git"], cwd: legacyRoot,
      operation: "attach legacy migration remote" });
    const legacyId = "a".repeat(24), canonicalLegacyId = hubProfileId(createHubIdentity("acme/legacy-hub", "main"));
    writePersistedHubConfiguration({ formatVersion: 1, kind: "remote", localHubId: legacyId, localRoot: legacyRoot,
      baseCommit: configured.baseCommit, catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
      host: "github.com", repository: "acme/legacy-hub", targetBranch: "main" }, legacyEnvironment);
    writeGlobalHubToken("legacy-token-canary", legacyEnvironment);
    const legacyState = path.join(root, "legacy-state"), legacyTransaction = path.join(legacyState, "transactions", "sync-legacy");
    fs.mkdirSync(legacyTransaction, { recursive: true });
    fs.writeFileSync(path.join(legacyTransaction, "transaction.json"), `${JSON.stringify({ phase: "prepared",
      originalHead: (await runGit({ args: ["rev-parse", "HEAD"], cwd: legacyRoot, operation: "resolve legacy head" })).stdout.trim(),
      candidateRoot: path.join(legacyTransaction, "candidate") })}\n`);
    await createHubRuntimeActions(legacyEnvironment, legacyState).preflight(repository);
    assert.equal(readPersistedHubConfiguration(legacyEnvironment)?.localHubId, canonicalLegacyId);
    assert.equal(loadExactHubProfileToken(canonicalLegacyId, legacyEnvironment), "legacy-token-canary");
    assert.equal(fs.existsSync(hubProfileCredentialPath(legacyId, legacyEnvironment)), false);
    const migratedTransaction = JSON.parse(fs.readFileSync(path.join(legacyTransaction, "transaction.json"), "utf8")) as { localHubId?: string };
    assert.equal(migratedTransaction.localHubId, canonicalLegacyId);

    const batchEnvironment = { HOME: path.join(root, "batch-home"), XDG_CONFIG_HOME: path.join(root, "batch-config"),
      XDG_DATA_HOME: path.join(root, "batch-data") };
    const batchState = path.join(root, "batch-state"), batchActions = createHubRuntimeActions(batchEnvironment, batchState);
    await configureTestRemoteHub(batchEnvironment, "acme/batch-hub");
    const batchRepositories = await Promise.all(["batch-source-a", "batch-source-b", "batch-source-c"]
      .map((name) => namedSourceRepository(root, name)));
    const domain = { identity: "domains/crawler", title: "Crawler",
      evidenceResource: "agentbase://owner-guidance/domains/crawler" };
    const preparedBatch = await batchActions.prepareBatch({ sourceRepositories: batchRepositories, proposedDomain: domain }) as {
      manifest: { id: string; revision: number; members: readonly { id: string; repositoryId: string }[] };
      matrix: readonly { documentPaths: readonly string[] }[];
    };
    assert.equal(preparedBatch.manifest.members.length, 3);
    assert.equal(preparedBatch.matrix.every((row) => row.documentPaths.includes("README.md")), true);
    await assert.rejects(batchActions.confirmBatch({ manifestId: preparedBatch.manifest.id,
      manifestRevision: preparedBatch.manifest.revision, assessments: preparedBatch.manifest.members.map((member) => ({
        memberId: member.id, decision: "match", evidencePath: "missing.md",
      })) }), /not confirmable/);
    const confirmedBatch = await batchActions.confirmBatch({ manifestId: preparedBatch.manifest.id,
      manifestRevision: preparedBatch.manifest.revision, assessments: preparedBatch.manifest.members.map((member) => ({
        memberId: member.id, decision: "match", evidencePath: "README.md",
      })) }) as { id: string; revision: number; members: readonly { id: string; repositoryId: string }[] };
    for (const [index, member] of confirmedBatch.members.entries()) {
      let preparedMember = await batchActions.prepare({ mode: "new", sourceRepository: batchRepositories[index]!,
        subjectDirectory: `repositories/batch-${index + 1}`, confirmedDomain: domain,
        guidanceRequest: batchGuidance(index + 1) }) as { sessionId: string; bundleRoot: string };
      const describeSystem = () => {
        const domainPath = path.join(preparedMember.bundleRoot, "domains", "crawler.md");
        fs.writeFileSync(domainPath, fs.readFileSync(domainPath, "utf8")
          .replace(/(\* \[[^\]]+\]\([^)]+\)) - System/, "$1 - Operational batch member"));
      };
      describeSystem();
      if (index === 1) {
        fs.rmSync(path.join(preparedMember.bundleRoot, "repositories", "batch-2.md"));
        const failed = await batchActions.recordBatchMember({ manifestId: confirmedBatch.id,
          manifestRevision: confirmedBatch.revision, memberId: member.id,
          sessionId: preparedMember.sessionId }) as { status: string };
        assert.equal(failed.status, "failed");
        await batchActions.retryBatchMember({ manifestId: confirmedBatch.id,
          manifestRevision: confirmedBatch.revision, memberId: member.id });
        preparedMember = await batchActions.prepare({ mode: "new", sourceRepository: batchRepositories[index]!,
          subjectDirectory: "repositories/batch-2", confirmedDomain: domain,
          guidanceRequest: batchGuidance(index + 1) }) as { sessionId: string; bundleRoot: string };
        describeSystem();
      }
      const recorded = await batchActions.recordBatchMember({ manifestId: confirmedBatch.id,
        manifestRevision: confirmedBatch.revision, memberId: member.id,
        sessionId: preparedMember.sessionId }) as { status: string };
      assert.equal(recorded.status, "complete");
    }
    fs.writeFileSync(path.join(batchRepositories[0]!, "README.md"), "# Changed during batch\n");
    await assert.rejects(batchActions.finalizeBatch({ manifestId: confirmedBatch.id,
      manifestRevision: confirmedBatch.revision }), /completion or rerun/);
    fs.writeFileSync(path.join(batchRepositories[0]!, "README.md"), "# Source\n");
    const revisedBatch = await batchActions.reviseBatch({ manifestId: confirmedBatch.id,
      manifestRevision: confirmedBatch.revision, memberIds: confirmedBatch.members.slice(0, 2).map((member) => member.id) }) as {
      manifest: { revision: number; members: readonly unknown[] }; reusedMemberIds: readonly string[];
    };
    assert.equal(revisedBatch.manifest.members.length, 2); assert.equal(revisedBatch.reusedMemberIds.length, 2);
    const reducedProposal = await batchActions.finalizeBatch({ manifestId: confirmedBatch.id,
      manifestRevision: revisedBatch.manifest.revision }) as { inspection: { entries: readonly { path: string; change: string }[] } };
    assert.equal(reducedProposal.inspection.entries.some((entry) => entry.path === "repositories/batch-3.md"), false);
    const finalizedBatch = await batchActions.finalizeBatch({ manifestId: confirmedBatch.id,
      manifestRevision: confirmedBatch.revision }) as { proposal: { id: string; mode: string; diffDigest: string;
        sourceRepositoryIds: readonly string[] }; inspection: { entries: readonly { path: string; change: string }[];
          batch: { members: readonly { repositoryId: string; paths: readonly string[] }[]; sharedPaths: readonly string[] } } };
    assert.equal(finalizedBatch.proposal.mode, "batch-new");
    assert.deepEqual(finalizedBatch.proposal.sourceRepositoryIds, confirmedBatch.members.map((member) => member.repositoryId));
    assert.equal(finalizedBatch.inspection.entries.filter((entry) => entry.change === "created"
      && /^repositories\/batch-[123]\.md$/.test(entry.path)).length, 3);
    assert.equal(finalizedBatch.inspection.batch.members.length, 3);
    assert.equal(finalizedBatch.inspection.batch.sharedPaths.includes("domains/crawler.md"), true);
    const domainBytes = fs.readFileSync(path.join(batchState, "proposals", finalizedBatch.proposal.id, "bundle", "domains", "crawler.md"), "utf8");
    assert.match(domainBytes, /batch-1\.md/); assert.match(domainBytes, /batch-2\.md/); assert.match(domainBytes, /batch-3\.md/);
    assert.match(domainBytes, /systems\/batch-1\.md\) - System/);
    assert.match(domainBytes, /systems\/batch-2\.md\) - System/);
    assert.match(domainBytes, /systems\/batch-3\.md\) - System/);
    await batchActions.accept(finalizedBatch.proposal.id, finalizedBatch.proposal.diffDigest);
    const [batchPending] = await batchActions.listPending() as readonly { mode: string; sourceRepositoryIds: readonly string[] }[];
    assert.equal(batchPending?.mode, "batch-new"); assert.equal(batchPending?.sourceRepositoryIds.length, 3);

    const enrichmentRoot = path.join(root, "enrichment-published");
    fs.cpSync(configured.localRoot, enrichmentRoot, { recursive: true });
    const fixture = await addPublishedEnrichmentFixture(enrichmentRoot);
    const stateRoot = path.join(root, "enrichment-state"), accountId = "123456789012", region = "ap-southeast-1", otherRegion = "us-east-1";
    const candidates = [
      { id: "candidate-111111111111111111111111", kind: "relation" as const,
        sourceConceptId: "repositories/repo-1", targetConceptId: "repositories/repo-2", predicate: "depends-on" as const,
        queue: { name: "crawler-events", accountId, region }, identityEvidenceIds: ["documentation"],
        interactionEvidenceIds: ["documentation"], question: { id: fixture.questions[0]!.id, revision: 1 } },
      { id: "candidate-222222222222222222222222", kind: "identity" as const,
        sourceConceptId: "repositories/repo-1", queue: { name: "crawler-results", accountId, region },
        expectedArn: `arn:aws:sqs:${region}:${accountId}:different-queue`,
        identityEvidenceIds: ["documentation"], interactionEvidenceIds: [],
        question: { id: fixture.questions[1]!.id, revision: 1 } },
      { id: "candidate-333333333333333333333333", kind: "question" as const,
        sourceConceptId: "repositories/repo-3", queue: { name: "crawler-review", accountId, region },
        identityEvidenceIds: ["documentation"], interactionEvidenceIds: [],
        question: { id: fixture.questions[2]!.id, revision: 1 } },
      { id: "candidate-444444444444444444444444", kind: "identity" as const,
        sourceConceptId: "repositories/repo-3", queue: { name: "crawler-results", accountId, region: otherRegion },
        identityEvidenceIds: ["documentation"], interactionEvidenceIds: [] },
      { id: "candidate-555555555555555555555555", kind: "identity" as const,
        sourceConceptId: "repositories/repo-2", queue: { name: "crawler-results", accountId, region: otherRegion },
        identityEvidenceIds: ["documentation"], interactionEvidenceIds: [] },
      { id: "candidate-666666666666666666666666", kind: "identity" as const,
        sourceConceptId: "repositories/repo-3", queue: { name: "crawler-identity", accountId, region },
        identityEvidenceIds: ["documentation"], interactionEvidenceIds: [] },
    ];
    const manifest = prepareDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, baseCommit: fixture.commit,
      domainId: "domains/crawler", repositoryIds: fixture.repositoryIds, candidates, accountId, regions: [region, otherRegion],
      createdAt: "2026-08-13T00:00:03Z" });
    const calls: readonly string[][] = [];
    let reviewFailures = 0;
    const runner: AwsProcessRunner = async (args) => {
      (calls as string[][]).push([...args]);
      if (args[0] === "--version") return { stdout: "", stderr: "aws-cli/2.30.0 Python/3.13" };
      if (args[0] === "sts") return { stdout: JSON.stringify({ Account: accountId }), stderr: "" };
      const nameIndex = args.indexOf("--queue-name"), urlIndex = args.indexOf("--queue-url"), regionIndex = args.indexOf("--region");
      const callRegion = regionIndex >= 0 ? args[regionIndex + 1]! : region;
      if (nameIndex >= 0) {
        const name = args[nameIndex + 1]!;
        if (name === "crawler-review") throw new AwsCliError("unauthorized", "AWS denied the exact read-only operation");
        if (name === "crawler-results" && callRegion === otherRegion && reviewFailures++ === 0) throw new AwsCliError("throttled", "bounded provider throttling", true);
        return { stdout: JSON.stringify({ QueueUrl: `https://sqs.${callRegion}.amazonaws.com/${accountId}/${name}` }), stderr: "" };
      }
      const queueUrl = args[urlIndex + 1]!, name = queueUrl.split("/").at(-1)!;
      return { stdout: JSON.stringify({ Attributes: { QueueArn: `arn:aws:sqs:${callRegion}:${accountId}:${name}`,
        VisibilityTimeout: "30", MessageRetentionPeriod: "345600", ReceiveMessageWaitTimeSeconds: "0" } }), stderr: "" };
    };
    const adapter = new AwsCliAdapter(runner);
    let mismatchedResourceCall = false;
    const mismatchedAdapter = new AwsCliAdapter(async (args) => {
      if (args[0] === "--version") return { stdout: "", stderr: "aws-cli/2.30.0 Python/3.13" };
      if (args[0] === "sts") return { stdout: JSON.stringify({ Account: "999999999999" }), stderr: "" };
      mismatchedResourceCall = true; return { stdout: "{}", stderr: "" };
    });
    await assert.rejects(runDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot,
      manifestId: manifest.id, manifestRevision: manifest.revision, providerSessionConfirmed: true,
      adapter: mismatchedAdapter }), /active AWS account does not match/);
    assert.equal(mismatchedResourceCall, false);
    const incomplete = await runDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot,
      manifestId: manifest.id, manifestRevision: manifest.revision, providerSessionConfirmed: true, adapter });
    assert.equal(incomplete.status, "incomplete");
    assert.deepEqual(incomplete.outcomes.map((item) => item.status), ["confirmed", "rejected", "unresolved", "failed", "confirmed", "confirmed"]);
    assert.equal(fs.existsSync(path.join(stateRoot, "proposals")), false);
    const ready = await runDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot,
      manifestId: manifest.id, manifestRevision: manifest.revision, providerSessionConfirmed: true,
      retryCandidateIds: [candidates[3]!.id], adapter });
    assert.equal(ready.status, "ready");
    assert.deepEqual(ready.decisions.map((item) => item.tier), ["automatic", "recommended", "manual"]);
    assert.notEqual(ready.outcomes[1]!.identity?.value, ready.outcomes[3]!.identity?.value);
    assert.equal(calls.some((args) => args.includes("list-queues") || args.includes("list-queue-tags")), false);
    const beforeRevisionCalls = calls.length;
    const revised = prepareDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, baseCommit: fixture.commit,
      domainId: "domains/crawler", repositoryIds: fixture.repositoryIds, candidates, accountId, regions: [region, otherRegion],
      createdAt: manifest.createdAt, prior: manifest });
    const reused = await runDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot,
      manifestId: revised.id, manifestRevision: revised.revision, providerSessionConfirmed: true, adapter });
    assert.equal(reused.status, "ready");
    assert.equal(calls.length, beforeRevisionCalls);
    const localHub = createLocalOnlyHubState({ kind: "local-only", root: enrichmentRoot,
      localHubId: configured.localHubId, baseCommit: fixture.commit, remoteBase: fixture.commit,
      activeHead: fixture.commit, catalogVersion: AGENTBASE_OKF_SCHEMA_CATALOG_VERSION });
    const sourceBefore = fs.readFileSync(path.join(enrichmentRoot, "repositories/repo-1.md"), "utf8");
    const checkpointPath = path.join(stateRoot, "enrichments", revised.id, `outcomes-${revised.revision}.json`);
    const checkpointBytes = fs.readFileSync(checkpointPath, "utf8"), tampered = JSON.parse(checkpointBytes) as {
      outcomes: { evidenceDigest: string }[];
    };
    tampered.outcomes[0]!.evidenceDigest = `sha256:${"0".repeat(64)}`;
    fs.writeFileSync(checkpointPath, `${JSON.stringify(tampered, null, 2)}\n`);
    await assert.rejects(Promise.resolve().then(() => finalizeDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, localHub,
      manifestId: revised.id, manifestRevision: revised.revision, answers: [] })), /outcome integrity is invalid/);
    fs.writeFileSync(checkpointPath, checkpointBytes);
    const stalePath = path.join(enrichmentRoot, "questions", `${fixture.questions[1]!.id}.md`), staleBytes = fs.readFileSync(stalePath, "utf8");
    fs.writeFileSync(stalePath, renderQuestionDocument({ ...fixture.questions[1]!, revision: 2 }));
    await assert.rejects(Promise.resolve().then(() => finalizeDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, localHub,
      manifestId: revised.id, manifestRevision: revised.revision, answers: [] })), /Question (?:revision changed|decision input is stale)/);
    fs.writeFileSync(stalePath, staleBytes);
    const finalizedEnrichment = finalizeDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, localHub,
      manifestId: revised.id, manifestRevision: revised.revision, answers: [
        { candidateId: candidates[1]!.id, questionId: fixture.questions[1]!.id, questionRevision: 1,
          action: "answer", answer: "Use the verified queue identity.", maintainer: "human:khoa" },
        { candidateId: candidates[2]!.id, questionId: fixture.questions[2]!.id, questionRevision: 1, action: "defer" },
      ] });
    assert.equal(finalizedEnrichment.proposal.mode, "enrichment");
    assert.match(JSON.stringify(finalizedEnrichment.inspection), /AWS denied the exact read-only operation/);
    assert.match(JSON.stringify(finalizedEnrichment.inspection), /Strong provider identity matches multiple concepts/);
    assert.equal(fs.readFileSync(path.join(enrichmentRoot, "repositories/repo-1.md"), "utf8"), sourceBefore);
    assert.equal((await runGit({ args: ["status", "--porcelain"], cwd: enrichmentRoot, operation: "verify no pre-Accept mutation" })).stdout, "");
    const proposalBundle = path.join(stateRoot, "proposals", finalizedEnrichment.proposal.id, "bundle");
    const proposed = loadOkfBundle(proposalBundle);
    assert.equal(readExternalIdentities(proposed.concepts.get("repositories/repo-1")!).length, 1);
    assert.equal(readObservedValues(proposed.concepts.get("repositories/repo-2")!).some((value) => value.role === "provider"), true);
    assert.equal(parseQuestionDocument(proposed.concepts.get(`questions/${fixture.questions[0]!.id}`)!).state, "resolved");
    assert.equal(parseQuestionDocument(proposed.concepts.get(`questions/${fixture.questions[2]!.id}`)!).state, "open");
    assert.equal([...proposed.concepts.values()].some((concept) => concept.type === "Maintainer Guidance"
      && concept.body.includes("verified queue identity")), true);
    const firstIdentity = readExternalIdentities(proposed.concepts.get("repositories/repo-1")!)[0]!;
    const regionalIdentity = readExternalIdentities(proposed.concepts.get("repositories/repo-3")!)[0]!;
    assert.notEqual(firstIdentity.value, regionalIdentity.value);
    assert.equal(JSON.stringify(proposed.concepts.get("repositories/repo-1")!.frontmatter.relationships).includes("repositories/repo-3"), false);
    assert.throws(() => prepareDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, baseCommit: fixture.commit,
      domainId: "domains/crawler", repositoryIds: fixture.repositoryIds.slice(0, 2), candidates, accountId,
      regions: [region, otherRegion], createdAt: revised.createdAt, prior: revised }), /outside selected Repository membership/);
    const reduced = prepareDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot, baseCommit: fixture.commit,
      domainId: "domains/crawler", repositoryIds: fixture.repositoryIds.slice(0, 2), candidates: candidates.slice(0, 2), accountId,
      regions: [region, otherRegion], createdAt: revised.createdAt, prior: revised });
    const beforeReducedCalls = calls.length;
    const reducedState = await runDomainEnrichment({ stateRoot, publishedRoot: enrichmentRoot,
      manifestId: reduced.id, manifestRevision: reduced.revision, providerSessionConfirmed: true, adapter });
    assert.equal(reducedState.status, "ready"); assert.equal(calls.length, beforeReducedCalls);
    const unsafeAdapter = new AwsCliAdapter(async (args) => args[0] === "--version"
      ? { stdout: "", stderr: "aws-cli/2.30.0 Python/3.13" }
      : args[0] === "sts" ? { stdout: JSON.stringify({ Account: accountId }), stderr: "" }
        : args.includes("--queue-name") ? { stdout: JSON.stringify({ QueueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/unsafe` }), stderr: "" }
          : { stdout: JSON.stringify({ Attributes: { QueueArn: `arn:aws:sqs:${region}:${accountId}:unsafe`, VisibilityTimeout: "ghp_unsafe_token_value_1234567890" } }), stderr: "" });
    await unsafeAdapter.preflight(accountId);
    await assert.rejects(unsafeAdapter.verifySqsQueue({ name: "unsafe", accountId, region, observedAt: manifest.createdAt }), /VisibilityTimeout is invalid/);

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
      XDG_DATA_HOME: path.join(root, "attach-data") };
    const githubProfileId = hubProfileId(createHubIdentity("acme/AgentBase-Hub", "main"));
    const enterpriseProfileId = hubProfileId(createHubIdentity("platform/Knowledge-Hub", "knowledge/release", "github.corp.example"));
    writeHubProfileToken(githubProfileId, "github-token-canary", attachEnvironment);
    writeHubProfileToken(enterpriseProfileId, "enterprise-token-canary", attachEnvironment);
    const attached = await attachExistingHub("https://github.com/acme/AgentBase-Hub", "main", attachEnvironment, async (request: GitRequest) => {
      if (request.args[0] !== "clone") return runGit(request);
      assert.equal(request.token, "github-token-canary");
      const destination = String(request.args.at(-1));
      fs.cpSync(configured.localRoot, destination, { recursive: true });
      await runGit({ args: ["remote", "set-url", "origin", "https://github.com/acme/AgentBase-Hub.git"],
        cwd: destination, operation: "add legacy Hub fixture origin" });
      return { stdout: "", stderr: "" };
    });
    assert.equal(attached.repository, "acme/AgentBase-Hub");
    assert.equal(fs.existsSync(path.join(attached.localRoot, "README.md")), false);
    fs.writeFileSync(path.join(attached.localRoot, "README.md"), "# Profile A only\n");
    await runGit({ args: ["add", "README.md"], cwd: attached.localRoot, operation: "stage profile A draft" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "profile A local draft"],
      cwd: attached.localRoot, operation: "commit profile A draft", commitTimestamp: "2026-08-14T00:00:00Z" });
    const attachedHead = (await runGit({ args: ["rev-parse", "HEAD"], cwd: attached.localRoot, operation: "resolve profile A draft" })).stdout.trim();
    const enterprise = await attachExistingHub("https://github.corp.example/platform/Knowledge-Hub.git", "knowledge/release",
      attachEnvironment, async (request: GitRequest) => {
        if (request.args[0] !== "clone") return runGit(request);
        assert.equal(request.token, "enterprise-token-canary");
        const destination = String(request.args.at(-1));
        fs.cpSync(configured.localRoot, destination, { recursive: true });
        await runGit({ args: ["branch", "-m", "knowledge/release"], cwd: destination,
          operation: "name Enterprise fixture branch" });
        await runGit({ args: ["remote", "set-url", "origin", "https://github.corp.example/platform/Knowledge-Hub.git"],
          cwd: destination, operation: "add Enterprise Hub fixture origin" });
        return { stdout: "", stderr: "" };
      });
    assert.equal(enterprise.host, "github.corp.example");
    assert.equal(enterprise.targetBranch, "knowledge/release");
    assert.notEqual(enterprise.localRoot, attached.localRoot);
    assert.notEqual(enterprise.activeHead, attachedHead);
    await assert.rejects(attachExistingHub("https://github.corp.example/platform/Other-Hub", "../invalid",
      attachEnvironment), /target branch is invalid/);
    assert.equal(readPersistedHubConfiguration(attachEnvironment)?.localHubId, enterprise.localHubId,
      "failed activation preserves the previous active profile");
    const switchedBack = await attachExistingHub("https://github.com/acme/AgentBase-Hub", "main", attachEnvironment, async (request) => {
      if (request.args[0] === "ls-remote") {
        assert.equal(request.token, "github-token-canary");
        const head = (await runGit({ args: ["rev-parse", "HEAD"], cwd: attached.localRoot, operation: "resolve saved fixture" })).stdout.trim();
        return { stdout: `${head}\trefs/heads/main\n`, stderr: "" };
      }
      return runGit(request);
    });
    assert.equal(switchedBack.localRoot, attached.localRoot);
    assert.equal(fs.existsSync(enterprise.localRoot), true, "inactive Enterprise profile remains isolated and reusable");
    fs.rmSync(hubProfileCredentialPath(attached.localHubId, attachEnvironment));
    fs.writeFileSync(path.join(attached.localRoot, "dirty-status.tmp"), "local failure fixture\n");
    const partialStatus = await createHubRuntimeActions({ HOME: attachEnvironment.HOME,
      XDG_CONFIG_HOME: attachEnvironment.XDG_CONFIG_HOME, XDG_DATA_HOME: attachEnvironment.XDG_DATA_HOME },
    path.join(root, "partial-status-state")).status() as {
      kind: string; hub: { repository: string }; local: { state: string }; credential: string;
    };
    assert.deepEqual({ kind: partialStatus.kind, repository: partialStatus.hub.repository,
      local: partialStatus.local.state, credential: partialStatus.credential }, {
      kind: "remote", repository: "acme/AgentBase-Hub", local: "unavailable", credential: "missing",
    });
    fs.rmSync(path.join(attached.localRoot, "dirty-status.tmp"));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
