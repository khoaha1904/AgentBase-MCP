import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, hubProfileId } from "../../../core/hub/index.ts";
import {
  AGENTBASE_OKF_PROFILE_PATH, getOkfAuthoringGuidance, loadOkfBundle, parseConceptDocument,
  readRepositoryObservedSource, readRepositoryRefreshCoverage, renderAgentBaseOkfProfileDocument, validateOkfRelationships,
  type InventoryReceipt,
} from "../../../core/knowledge/index.ts";
import { runGit, type SourceSnapshot } from "../../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "../runtime-actions.ts";
import { agentBaseStorage } from "../../local-storage/index.ts";
import { publishConfiguredHubProposal } from "../publication/configured-publish.ts";
import { writeGlobalHubToken } from "../configuration/credential-file.ts";
import { readPersistedHubConfiguration, replacePersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { createLocalHub } from "../workspace/setup.ts";
import { createTestInventoryReceipt } from "../test-support.ts";
import { writeInitialIngestSkeletons } from "./initial-ingest-skeleton.ts";

async function enableProfileHub(root: string): Promise<void> {
  fs.mkdirSync(path.join(root, "shared"), { recursive: true });
  fs.writeFileSync(path.join(root, "index.md"), `---\nokf_version: "0.2"\n---\n\n# Hub\n\n* [Profile](${AGENTBASE_OKF_PROFILE_PATH}) - Profile\n* [Shared](shared/index.md) - Shared knowledge\n`);
  fs.writeFileSync(path.join(root, "shared/index.md"), "# Shared\n\n* [Profile](agentbase-profile.md) - Profile\n");
  fs.writeFileSync(path.join(root, AGENTBASE_OKF_PROFILE_PATH), renderAgentBaseOkfProfileDocument());
  await runGit({ args: ["add", "index.md", "shared"], cwd: root, operation: "stage Profile test baseline" });
  await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "Profile test baseline"],
    cwd: root, operation: "commit Profile test baseline", commitTimestamp: "2026-08-20T00:00:00Z" });
  const head = (await runGit({ args: ["rev-parse", "HEAD"], cwd: root, operation: "resolve Profile test baseline" })).stdout.trim();
  await runGit({ args: ["update-ref", "refs/agentbase/published", head], cwd: root, operation: "publish Profile test baseline" });
}

async function localSourceSnapshot(input: Readonly<{
  requestedRoot: string; repositoryId: string; hub: ReturnType<typeof createHubIdentity>; stateRoot: string;
}>): Promise<SourceSnapshot> {
  const requestedRoot = fs.realpathSync(input.requestedRoot);
  const commit = (await runGit({ args: ["rev-parse", "HEAD"], cwd: requestedRoot,
    operation: "resolve local source fixture" })).stdout.trim();
  const repository = `fixtures/${path.basename(requestedRoot)}`;
  return { repositoryId: input.repositoryId,
    remote: { host: input.hub.host, repository, canonicalHttpsUrl: `https://${input.hub.host}/${repository}.git` },
    defaultBranch: "main", commit, requestedRoot, analysisRoot: requestedRoot,
    kind: "current-checkout", createdAt: "2026-08-25T00:00:00.000Z", privateRoot: input.stateRoot };
}

test("[AB-SCHEMA-057][AB-SCHEMA-060] one runtime keeps internal resources embedded with root-only navigation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-compact-skeleton-"));
  try {
    fs.writeFileSync(path.join(root, "index.md"), "---\nokf_version: '0.2'\n---\n\n# Hub\n");
    const candidates = [
      { id: "repository", identityHint: "worker", identityBasis: "README", queryValue: "job worker repository",
        evidenceIds: ["readme"], disposition: "concept" as const, suggestedType: "Repository" },
      { id: "worker", identityHint: "worker", identityBasis: "Terraform address", queryValue: "job processing runtime",
        evidenceIds: ["function"], disposition: "concept" as const },
      ...[
        ["jobs", "jobs queue", "worker input transport", "jobs-source"],
        ["dlq", "retry DLQ", "failed job recovery", "dlq-source"],
        ["state", "state table", "job state persistence", "state-source"],
        ["results", "results bucket", "processed result storage", "results-source"],
      ].map(([id, identityHint, queryValue, evidenceId]) => ({
        id: id!, identityHint: identityHint!, identityBasis: "Terraform address", queryValue: queryValue!,
        evidenceIds: [evidenceId!], disposition: "embedded" as const, parentCandidateId: "worker",
      })),
    ];
    const request = {
      candidates,
      semanticObservations: [{ id: "readme", candidateId: "repository", role: "documentation" as const,
        signal: "repository purpose", source: { path: "README.md", startLine: 1, endLine: 2 } }],
      resourceObservations: [
        { id: "function", candidateId: "worker", sourceTool: "terraform" as const,
          resourceType: "aws_lambda_function", address: "aws_lambda_function.worker",
          source: { path: "main.tf", startLine: 1, endLine: 3 } },
        { id: "jobs-source", candidateId: "jobs", sourceTool: "terraform" as const,
          resourceType: "aws_sqs_queue", address: "aws_sqs_queue.jobs",
          source: { path: "main.tf", startLine: 4, endLine: 4 } },
        { id: "dlq-source", candidateId: "dlq", sourceTool: "terraform" as const,
          resourceType: "aws_sqs_queue", address: "aws_sqs_queue.dlq",
          source: { path: "main.tf", startLine: 5, endLine: 5 } },
        { id: "state-source", candidateId: "state", sourceTool: "terraform" as const,
          resourceType: "aws_dynamodb_table", address: "aws_dynamodb_table.state",
          source: { path: "main.tf", startLine: 6, endLine: 6 } },
        { id: "results-source", candidateId: "results", sourceTool: "terraform" as const,
          resourceType: "aws_s3_bucket", address: "aws_s3_bucket.results",
          source: { path: "main.tf", startLine: 7, endLine: 7 } },
      ],
    };
    const repositoryId = "repository-worker-aaaaaaaaaaaa";
    const skeletons = writeInitialIngestSkeletons({
      bundleRoot: root, subjectDirectory: "repositories/worker", sourceRepositoryId: repositoryId,
      repository: { id: repositoryId, displayName: "worker", remotes: [], rootCommits: [] },
      request, guidance: getOkfAuthoringGuidance(request), createdAt: "2026-08-31T00:00:00Z",
      sourceState: { commit: "a".repeat(40), dirty: false, dirtyDigest: null },
    });

    assert.deepEqual(skeletons.map((item) => item.type).sort(), ["Function", "Repository"]);
    const bundle = loadOkfBundle(root, { requireAgentBaseRootIndex: true });
    assert.deepEqual(bundle.files.filter((file) => path.posix.basename(file) === "index.md"), ["index.md"]);
    assert.match(fs.readFileSync(path.join(root, "index.md"), "utf8"),
      /\[worker\]\(repositories\/worker\.md\) - Repository/);
    const worker = bundle.concepts.get("components/worker")!;
    assert.ok(worker);
    const [table, evidence] = worker.body.split("## Exact Evidence");
    assert.doesNotMatch(table!, /repository:\/\//);
    for (const name of ["jobs queue", "retry DLQ", "state table", "results bucket"]) {
      assert.match(table!, new RegExp(`\\| ${name} \\|`, "i"));
    }
    for (const source of ["jobs-source", "dlq-source", "state-source", "results-source"]) {
      assert.match(evidence!, new RegExp(`\\* \\x60${source}\\x60 - \\x60repository://${repositoryId}/main\\.tf#L\\d+-L\\d+\\x60`));
    }
    assert.equal([...bundle.concepts.values()].some((concept) => concept.type === "Resource"), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("[AB-INGEST-004..006][AB-INGEST-008][AB-INGEST-011][AB-INGEST-013..015][AB-REFRESH-019..023][AB-USE-006] preparation renders one generic inspectable skeleton bundle and recoverable Refresh", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-initial-ingest-"));
  const source = path.join(root, "vehicle-events");
  const environment = { HOME: root, XDG_CONFIG_HOME: path.join(root, "config"), XDG_DATA_HOME: path.join(root, "data") };
  try {
    fs.mkdirSync(source);
    fs.writeFileSync(path.join(source, "README.md"), "# Vehicle events\n\nPublishes vehicle events asynchronously.\n");
    fs.writeFileSync(path.join(source, "main.tf"), [
      "resource \"aws_lambda_function\" \"publisher\" {", "  function_name = \"vehicle-publisher\"", "}",
      "resource \"aws_sqs_queue\" \"events\" {", "  name = \"vehicle-events\"", "}", "",
    ].join("\n"));
    await runGit({ args: ["init", "-b", "main"], cwd: source, operation: "initialize ingest fixture" });
    await runGit({ args: ["add", "."], cwd: source, operation: "stage ingest fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "fixture"],
      cwd: source, operation: "commit ingest fixture", commitTimestamp: "2026-08-21T00:00:00Z" });

    const stateRoot = agentBaseStorage(environment).hubRuntime, receipts = new Map<string, InventoryReceipt>();
    const actions = createHubRuntimeActions(environment, stateRoot, {
      sourceSnapshotResolver: localSourceSnapshot,
      discoveryReceiptResolver: (id) => receipts.get(id),
    });
    const local = await createLocalHub(environment), current = readPersistedHubConfiguration(environment);
    assert.ok(current?.kind === "local-only");
    const hub = createHubIdentity("acme/vehicle-events-hub", "main"), localHubId = hubProfileId(hub);
    await runGit({ args: ["remote", "add", "origin", hub.canonicalHttpsUrl], cwd: local.localRoot,
      operation: "attach ingest test Hub remote" });
    replacePersistedHubConfiguration(current, { ...current, kind: "remote", localHubId,
      host: hub.host, repository: hub.repository, targetBranch: hub.targetBranch }, environment, { retireExpected: true });
    await enableProfileHub(local.localRoot);
    const remote = path.join(root, "publication-remote.git");
    await runGit({ args: ["-c", "protocol.file.allow=always", "clone", "--bare", local.localRoot, remote], cwd: root, operation: "create isolated publication remote" });
    writeGlobalHubToken("fixture-only", environment);
    const publish = async (proposalId: string, diffDigest: string) => {
      const result = await publishConfiguredHubProposal({ proposalId, diffDigest, mode: "direct" }, environment, {
        git: (request) => {
          const { token: _token, ...localRequest } = request;
          return runGit({ ...localRequest,
            args: ["-c", "protocol.file.allow=always", ...request.args.map((arg) => arg === hub.canonicalHttpsUrl ? remote : arg)] });
        },
      });
      assert.equal(result.remote, "published");
      assert.equal(result.local, "recognized");
      assert.equal(fs.existsSync(path.join(stateRoot, "proposals", proposalId, "accepted.json")), false);
      return result;
    };
    const preflight = await actions.preflight(source) as {
      repository: { kind: string; repository: { id: string; displayName: string; remotes: string[]; rootCommits: string[] } };
      source_authority: { remote: string; default_branch: string; commit: string };
    };
    assert.equal(preflight.repository.kind, "new");
    const guidanceRequest = {
      candidates: [
        { id: "repository", identityHint: "vehicle-events", identityBasis: "checkout root", queryValue: "source identity",
          evidenceIds: ["readme"], disposition: "concept" as const },
        { id: "publisher", identityHint: "publisher", identityBasis: "Terraform address", queryValue: "independent runtime",
          evidenceIds: ["function"], disposition: "concept" as const },
        { id: "events", identityHint: "vehicle-events", identityBasis: "Terraform address",
          queryValue: "Internal trigger transport for the publisher", evidenceIds: ["queue"],
          disposition: "embedded" as const, parentCandidateId: "publisher" },
        { id: "system", identityHint: "vehicle-events", identityBasis: "README capability",
          queryValue: "Coordinates event publication and delivery", evidenceIds: ["system-docs"],
          disposition: "concept" as const, suggestedType: "System" },
        { id: "flow", identityHint: "publish-vehicle-event", identityBasis: "documented end-to-end behavior",
          queryValue: "Publishes a vehicle event for asynchronous delivery", evidenceIds: ["flow-docs"],
          disposition: "concept" as const, suggestedType: "Flow" },
      ],
      semanticObservations: [
        { id: "readme", candidateId: "repository", role: "documentation" as const,
          signal: "repository", source: { path: "README.md", startLine: 1, endLine: 3 } },
        { id: "system-docs", candidateId: "system", role: "documentation" as const,
          signal: "Coordinates several cooperating parts to deliver one recognizable capability",
          source: { path: "README.md", startLine: 1, endLine: 3 } },
        { id: "flow-docs", candidateId: "flow", role: "documentation" as const,
          signal: "end-to-end flow with a trigger, observable outcome and supporting concept evidence",
          source: { path: "README.md", startLine: 1, endLine: 3 } },
      ],
      resourceObservations: [
        { id: "function", candidateId: "publisher", sourceTool: "terraform" as const,
          resourceType: "aws_lambda_function", address: "aws_lambda_function.publisher", source: { path: "main.tf", startLine: 1, endLine: 3 } },
        { id: "queue", candidateId: "events", sourceTool: "terraform" as const,
          resourceType: "aws_sqs_queue", address: "aws_sqs_queue.events", source: { path: "main.tf", startLine: 4, endLine: 6 } },
      ],
    };
    const dedupeBundle = path.join(root, "dedupe-bundle");
    fs.mkdirSync(dedupeBundle);
    fs.writeFileSync(path.join(dedupeBundle, "index.md"),
      "---\nokf_version: '0.2'\n---\n\n# Hub\n\n* [Repository catalog](repositories/index.md) - Existing wording.\n");
    writeInitialIngestSkeletons({
      bundleRoot: dedupeBundle, subjectDirectory: "repositories/vehicle-events",
      sourceRepositoryId: preflight.repository.repository.id, repository: preflight.repository.repository,
      request: guidanceRequest, guidance: getOkfAuthoringGuidance(guidanceRequest),
      createdAt: "2026-08-21T00:00:00Z", sourceState: { commit: null, dirty: false, dirtyDigest: null },
    });
    assert.equal(fs.readFileSync(path.join(dedupeBundle, "index.md"), "utf8").split("\n")
      .filter((line) => line.includes("](repositories/index.md)")).length, 1);
    assert.match(fs.readFileSync(path.join(dedupeBundle, "index.md"), "utf8"),
      /\[vehicle-events\]\(repositories\/vehicle-events\.md\) - Repository/i);
    const configured = readPersistedHubConfiguration(environment);
    assert.ok(configured?.kind === "remote");
    const publishedBase = (await runGit({ args: ["rev-parse", "HEAD"], cwd: configured.localRoot,
      operation: "resolve test Published base" })).stdout.trim();
    const receipt = createTestInventoryReceipt({
      label: "vehicle-events",
      source: { repositoryId: preflight.repository.repository.id,
        remote: preflight.source_authority.remote, defaultBranch: preflight.source_authority.default_branch,
        commit: preflight.source_authority.commit },
      hubProfileId: localHubId,
      publishedBase,
      request: guidanceRequest,
      limitations: ["runtime consumers were not present in this repository"],
    });
    receipts.set(receipt.id, receipt);
    const prepared = await actions.prepare({
      mode: "new", sourceRepository: source,
      subjectDirectory: "repositories/vehicle-events", discoveryReceiptId: receipt.id,
      confirmedDomain: {
        identity: "domains/vehicle-data", title: "Vehicle Data",
        evidenceResource: "agentbase://owner-guidance/domains/vehicle-data",
      },
    }) as { sessionId: string; bundleRoot: string; sourceRepositoryId: string; selectedSchemas: string[];
      skeletons: readonly { identity: string; path: string; type: string }[]; authoringConstraints: readonly string[] };
    assert.match(prepared.authoringConstraints.join("\n"), /Preserve generated sources, relationships, repository identity metadata and navigation/);
    assert.match(prepared.authoringConstraints.join("\n"), /Repository as the default dossier/);
    assert.deepEqual(prepared.selectedSchemas.sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    assert.deepEqual(prepared.skeletons.map((item) => item.type).sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    const skeletonBundle = loadOkfBundle(prepared.bundleRoot, { requireAgentBaseRootIndex: true });
    assert.deepEqual([...skeletonBundle.concepts.values()].map((concept) => concept.type).sort(),
      ["AgentBase OKF Profile", "Domain", "Flow", "Function", "Repository", "System"]);
    const initialObserved = readRepositoryObservedSource(skeletonBundle.concepts.get("domains/vehicle-data/repositories/vehicle-events")!);
    assert.match(initialObserved?.commit ?? "", /^[a-f0-9]{40}$/);
    assert.deepEqual(skeletonBundle.concepts.get("domains/vehicle-data/knowledge/publisher")?.frontmatter.agentbase, {
      technology: { kind: "runtime-function", provider: "aws", product: "lambda",
        sourceTool: "terraform", resourceType: "aws_lambda_function" },
    });
    assert.equal(skeletonBundle.concepts.get("domains/vehicle-data/repositories/vehicle-events")?.body.includes("../knowledge/publisher.md"), true);
    const publisherBody = skeletonBundle.concepts.get("domains/vehicle-data/knowledge/publisher")?.body ?? "";
    assert.match(publisherBody, /# Embedded Knowledge/);
    assert.match(publisherBody, /Vehicle-events \| Internal trigger transport for the publisher \| message-queue \| aws \/ sqs; terraform:aws_sqs_queue/i);
    assert.match(publisherBody, /\| `queue` \|/);
    assert.match(publisherBody, /## Exact Evidence[\s\S]*`queue` - `repository:\/\/repository-[a-z0-9-]+\/main\.tf#L4-L6`/);
    assert.doesNotMatch(publisherBody.split("## Exact Evidence")[0]!, /repository:\/\//);
    assert.equal([...skeletonBundle.concepts.values()].some((concept) => concept.type === "Resource"), false);
    assert.equal(prepared.skeletons.some((item) => item.identity.includes("events") && item.type === "Resource"), false);
    assert.match(skeletonBundle.concepts.get("domains/vehicle-data/knowledge/vehicle-events")?.body ?? "", /suggested.*proposal review/i);
    assert.deepEqual(skeletonBundle.concepts.get("domains/vehicle-data/knowledge/vehicle-events")?.frontmatter.relationships, [
      { kind: "part-of", target: "domains/vehicle-data", evidence: ["owner-domain-vehicle-data"] },
    ]);
    assert.match(skeletonBundle.concepts.get("domains/vehicle-data")?.body ?? "",
      /Owner-confirmed business boundary related to \[vehicle-events\]\(repositories\/vehicle-events\.md\)/);
    assert.deepEqual(skeletonBundle.files.filter((file) => file.endsWith("/index.md")),
      ["domains/vehicle-data/index.md", "shared/index.md"]);
    const rootNavigation = fs.readFileSync(path.join(prepared.bundleRoot, "index.md"), "utf8");
    assert.match(rootNavigation, /\[Vehicle Data\]\(domains\/vehicle-data\/\) - Domain Capsule/);
    assert.doesNotMatch(rootNavigation, /repositories\/vehicle-events\.md/);
    const flow = skeletonBundle.concepts.get("domains/vehicle-data/knowledge/publish-vehicle-event");
    assert.deepEqual(flow?.frontmatter.flow_steps, []);
    const unfilled = validateOkfRelationships(
      [...skeletonBundle.concepts].map(([identity, concept]) => ({ identity, concept })),
      { sourceIdentities: new Set(["domains/vehicle-data/knowledge/publish-vehicle-event"]),
        strictSourceIdentities: new Set(["domains/vehicle-data/knowledge/publish-vehicle-event"]) },
    );
    assert.match(unfilled.failures.join("\n"), /flow_steps must be a non-empty list/);
    const malformedFlow = parseConceptDocument("flows/malformed.md", fs.readFileSync(
      path.join(prepared.bundleRoot, "domains/vehicle-data/knowledge/publish-vehicle-event.md"), "utf8",
    ).replace("flow_steps: []", "flow_steps:\n  - { order: 1, from: domains/vehicle-data/knowledge/vehicle-events, action: invokes, to: domains/vehicle-data/knowledge/publisher, mode: asynchronous, evidence: [flow-docs] }"));
    assert.match(validateOkfRelationships([{ identity: "flows/malformed", concept: malformedFlow }]).failures.join("\n"),
      /requires order \(positive integer\), source, action, target and mode/);
    const flowPath = path.join(prepared.bundleRoot, "domains/vehicle-data/knowledge/publish-vehicle-event.md");
    fs.writeFileSync(flowPath, fs.readFileSync(flowPath, "utf8")
      .replace("flow_steps: []", [
        "flow_steps:",
        "  - order: 1",
        "    source: domains/vehicle-data/knowledge/vehicle-events",
        "    action: invokes",
        "    target: domains/vehicle-data/knowledge/publisher",
        "    mode: asynchronous",
        "    evidence: [flow-docs]",
      ].join("\n"))
      .replace("# Limitations", [
        "[Vehicle events](vehicle-events.md) invokes the [publisher](publisher.md).",
        "", "# Limitations",
      ].join("\n")));

    const publisherPath = path.join(prepared.bundleRoot, "domains", "vehicle-data", "knowledge", "publisher.md");
    const validPublisher = fs.readFileSync(publisherPath, "utf8");
    fs.writeFileSync(publisherPath, validPublisher.replace("main.tf#L1-L3", "main.tf#L1-L99"));
    await assert.rejects(actions.finalize(prepared.sessionId),
      /domains\/vehicle-data\/knowledge\/publisher\.md: source span exceeds main\.tf \(6 lines\)/);
    fs.writeFileSync(publisherPath, validPublisher);

    const finalized = await actions.finalize(prepared.sessionId) as {
      proposal: { id: string; phase: string; selectedSchemas: string[]; diffDigest: string };
      inspection: { applicable: boolean; coverage: { partial: boolean; limitations: string[] } };
    };
    assert.equal(finalized.proposal.phase, "prepared");
    assert.equal(finalized.inspection.applicable, true);
    assert.equal(finalized.inspection.coverage.partial, true);
    assert.deepEqual(finalized.inspection.coverage.limitations, ["runtime consumers were not present in this repository"]);
    const initialPublication = await publish(finalized.proposal.id, finalized.proposal.diffDigest);
    const correctionSubject = "domains/vehicle-data/repositories/vehicle-events.md";
    const beforeCorrection = await actions.read(correctionSubject) as { commit: string; excerpt: string };
    assert.doesNotMatch(JSON.stringify(beforeCorrection), /Refresh evidence confirms delivery ownership/);
    fs.appendFileSync(path.join(source, "README.md"), "\nThe publisher now exposes delivery ownership.\n");
    await runGit({ args: ["add", "README.md"], cwd: source, operation: "stage refresh fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "refresh fixture"],
      cwd: source, operation: "commit refresh fixture", commitTimestamp: "2026-08-22T00:00:00Z" });
    const refresh = await actions.prepare({
      mode: "refresh", sourceRepository: source, subjectDirectory: "repositories/vehicle-events",
      signals: ["repository"],
    }) as { sessionId: string; bundleRoot: string; selectedSchemas: string[];
      source: { commit: string }; sourceChanges: { paths: string[] };
      continuity: { knownGaps: readonly { detail: string }[] } };
    assert.deepEqual(refresh.sourceChanges.paths, ["README.md"]);
    assert.match(refresh.continuity.knownGaps.map((gap) => gap.detail).join("\n"), /runtime consumers were not present/);
    assert.deepEqual(refresh.selectedSchemas.sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    const repositoryPath = path.join(refresh.bundleRoot, "domains", "vehicle-data", "repositories", "vehicle-events.md");
    const initialDebt = readRepositoryRefreshCoverage(parseConceptDocument(correctionSubject, fs.readFileSync(repositoryPath, "utf8")));
    assert.equal(initialDebt?.coveragePasses, 0);
    assert.equal(initialDebt?.omittedChangedPaths, 0);
    assert.deepEqual(initialDebt?.limitations, receipt.coverage.limitations);
    fs.appendFileSync(repositoryPath, "\nRefresh evidence confirms delivery ownership.\n");
    await assert.rejects(actions.finalize(refresh.sessionId), /missing outcome for README\.md/);
    assert.equal(fs.existsSync(refresh.bundleRoot), true, "failed accounting keeps the session repairable");
    const refreshed = await actions.finalize(refresh.sessionId, [], [], [{
      path: "README.md", outcome: "updated", reason: "Updates the Repository delivery-ownership overview.",
    }]) as {
      proposal: { id: string; diffDigest: string; selectedSchemas: string[] };
      inspection: {
        changeAccounting: { partial: boolean; omitted: number; limitations: string[];
          outcomes: readonly { path: string; outcome: string; reason: string }[] };
        groups: { updated: readonly { path: string; after?: { content: string } }[] };
      };
    };
    assert.deepEqual(refreshed.proposal.selectedSchemas, ["Domain", "Flow", "Function", "Repository", "System"]);
    assert.deepEqual(refreshed.inspection.changeAccounting, {
      outcomes: [{ path: "README.md", outcome: "updated", reason: "Updates the Repository delivery-ownership overview." }],
      partial: false, omitted: 0, limitations: [],
    });
    const updatedRepository = refreshed.inspection.groups.updated.find((entry) => entry.path === "domains/vehicle-data/repositories/vehicle-events.md");
    assert.ok(updatedRepository?.after);
    assert.deepEqual(readRepositoryRefreshCoverage(parseConceptDocument(updatedRepository.path, updatedRepository.after.content)), initialDebt,
      "a complete Delta must preserve the Published Initial-Ingest discovery debt");
    assert.equal(readRepositoryObservedSource(parseConceptDocument(updatedRepository.path, updatedRepository.after.content))?.commit,
      refresh.source.commit);
    // Preparation/inspection and a paused or cancelled conversation do not
    // publish. Query remains on the old snapshot until a separate Publish call.
    const privateCorrectionRead = await actions.read(correctionSubject) as { commit: string; excerpt: string };
    assert.equal(privateCorrectionRead.commit, beforeCorrection.commit);
    assert.equal(privateCorrectionRead.excerpt, beforeCorrection.excerpt);
    assert.equal((await runGit({ args: ["rev-parse", "refs/heads/main"], cwd: remote,
      operation: "verify private correction did not publish" })).stdout.trim(), initialPublication.commit);
    assert.match(updatedRepository.after.content, /Refresh evidence confirms delivery ownership/);
    await publish(refreshed.proposal.id, refreshed.proposal.diffDigest);
    assert.match(JSON.stringify(await actions.read(correctionSubject)), /Refresh evidence confirms delivery ownership/);

    fs.mkdirSync(path.join(source, "bulk"));
    for (let index = 0; index < 129; index += 1) {
      fs.writeFileSync(path.join(source, "bulk", `file-${String(index).padStart(3, "0")}.ts`), `export const value${index} = ${index};\n`);
    }
    await runGit({ args: ["add", "bulk"], cwd: source, operation: "stage bounded Refresh fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "bounded refresh fixture"],
      cwd: source, operation: "commit bounded Refresh fixture", commitTimestamp: "2026-08-23T00:00:00Z" });
    const partial = await actions.prepare({
      mode: "refresh", sourceRepository: source, subjectDirectory: "repositories/vehicle-events", signals: ["repository"],
    }) as { sessionId: string; sourceChanges: { paths: string[]; omitted: number; limitations: string[] }; refreshScope: string };
    assert.equal(partial.refreshScope, "delta");
    assert.equal(partial.sourceChanges.paths.length, 128);
    assert.equal(partial.sourceChanges.omitted, 1);
    const partialFinalized = await actions.finalize(partial.sessionId, [], [], partial.sourceChanges.paths.map((changedPath) => ({
      path: changedPath, outcome: "ignored" as const, reason: "Synthetic fixture file has no shared-knowledge effect.",
    }))) as { proposal: { id: string; diffDigest: string }; inspection: { groups: { updated: readonly { path: string; after?: { content: string } }[] } } };
    const partialRepository = partialFinalized.inspection.groups.updated.find((entry) =>
      entry.path === "domains/vehicle-data/repositories/vehicle-events.md");
    assert.ok(partialRepository?.after);
    const partialCoverage = readRepositoryRefreshCoverage(parseConceptDocument(partialRepository.path, partialRepository.after.content));
    assert.equal(partialCoverage?.status, "partial");
    assert.equal(partialCoverage?.omittedChangedPaths, 1);
    assert.equal(partialCoverage?.coveragePasses, 0);
    assert.deepEqual(partialCoverage?.limitations, receipt.coverage.limitations);
    assert.equal(Number.isFinite(Date.parse(partialCoverage?.observedAt ?? "")), true);
    await publish(partialFinalized.proposal.id, partialFinalized.proposal.diffDigest);

    fs.appendFileSync(path.join(source, "bulk", "file-000.ts"), "export const current = true;\n");
    await runGit({ args: ["add", "bulk/file-000.ts"], cwd: source, operation: "stage complete Delta fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "complete delta fixture"],
      cwd: source, operation: "commit complete Delta fixture", commitTimestamp: "2026-08-24T00:00:00Z" });
    const completeDelta = await actions.prepare({
      mode: "refresh", sourceRepository: source, subjectDirectory: "repositories/vehicle-events", signals: ["repository"],
    }) as { sessionId: string; sourceChanges: { paths: string[] } };
    assert.deepEqual(completeDelta.sourceChanges.paths, ["bulk/file-000.ts"]);
    const completeDeltaFinalized = await actions.finalize(completeDelta.sessionId, [], [], [{
      path: "bulk/file-000.ts", outcome: "ignored", reason: "Synthetic fixture file has no shared-knowledge effect.",
    }]) as { proposal: { id: string; diffDigest: string }; inspection: { groups: { updated: readonly { path: string; after?: { content: string } }[] } } };
    const completeDeltaRepository = completeDeltaFinalized.inspection.groups.updated.find((entry) =>
      entry.path === "domains/vehicle-data/repositories/vehicle-events.md");
    assert.ok(completeDeltaRepository?.after);
    assert.equal(readRepositoryRefreshCoverage(parseConceptDocument(
      completeDeltaRepository.path, completeDeltaRepository.after.content))?.omittedChangedPaths, 1);
    await publish(completeDeltaFinalized.proposal.id, completeDeltaFinalized.proposal.diffDigest);

    const partialCoverageRefresh = await actions.prepare({
      mode: "refresh", refreshScope: "coverage",
      coverage: { partial: true, limitations: ["runtime entrypoint coverage remained partial"] },
      sourceRepository: source, subjectDirectory: "repositories/vehicle-events", signals: ["repository"],
    }) as { sessionId: string; sourceChanges: { paths: string[] } };
    assert.deepEqual(partialCoverageRefresh.sourceChanges.paths, []);
    const partialCoverageFinalized = await actions.finalize(partialCoverageRefresh.sessionId) as {
      proposal: { id: string; diffDigest: string };
      inspection: { groups: { updated: readonly { path: string; after?: { content: string } }[] } };
    };
    const partialCoverageRepository = partialCoverageFinalized.inspection.groups.updated.find((entry) =>
      entry.path === "domains/vehicle-data/repositories/vehicle-events.md");
    assert.ok(partialCoverageRepository?.after);
    const retainedCoverage = readRepositoryRefreshCoverage(parseConceptDocument(
      partialCoverageRepository.path, partialCoverageRepository.after.content));
    assert.equal(retainedCoverage?.omittedChangedPaths, 1);
    assert.equal(retainedCoverage?.coveragePasses, 1);
    assert.deepEqual(retainedCoverage?.limitations,
      ["runtime entrypoint coverage remained partial", ...receipt.coverage.limitations]);
    await publish(partialCoverageFinalized.proposal.id, partialCoverageFinalized.proposal.diffDigest);

    const coverageRefresh = await actions.prepare({
      mode: "refresh", refreshScope: "coverage", coverage: { partial: false, limitations: [] },
      sourceRepository: source, subjectDirectory: "repositories/vehicle-events", signals: ["repository"],
    }) as { sessionId: string; bundleRoot: string; sourceChanges: { paths: string[] }; refreshScope: string;
      continuity: { knownGaps: readonly { detail: string }[] } };
    assert.equal(coverageRefresh.refreshScope, "coverage");
    assert.deepEqual(coverageRefresh.sourceChanges.paths, []);
    assert.equal(coverageRefresh.continuity.knownGaps.some((gap) => /Refresh coverage is partial/.test(gap.detail)), true);
    const coverageRepositoryPath = path.join(coverageRefresh.bundleRoot, "domains", "vehicle-data", "repositories", "vehicle-events.md");
    fs.appendFileSync(coverageRepositoryPath, "\nCoverage Refresh adds previously omitted recovery guidance.\n");
    const coverageFinalized = await actions.finalize(coverageRefresh.sessionId) as {
      proposal: { id: string; diffDigest: string };
      inspection: { groups: { updated: readonly { path: string; after?: { content: string } }[] } };
    };
    const coverageRepository = coverageFinalized.inspection.groups.updated.find((entry) =>
      entry.path === "domains/vehicle-data/repositories/vehicle-events.md");
    assert.ok(coverageRepository?.after);
    assert.match(coverageRepository.after.content, /previously omitted recovery guidance/);
    const convergingCoverage = readRepositoryRefreshCoverage(parseConceptDocument(
      coverageRepository.path, coverageRepository.after.content));
    assert.equal(convergingCoverage?.omittedChangedPaths, 0);
    assert.equal(convergingCoverage?.coveragePasses, 2);
    assert.deepEqual(convergingCoverage?.limitations,
      ["Coverage Refresh found new knowledge; another bounded convergence pass is required."]);
    await publish(coverageFinalized.proposal.id, coverageFinalized.proposal.diffDigest);

    const confirmingCoverage = await actions.prepare({
      mode: "refresh", refreshScope: "coverage", coverage: { partial: false, limitations: [] },
      sourceRepository: source, subjectDirectory: "repositories/vehicle-events", signals: ["repository"],
    }) as { sessionId: string; sourceChanges: { paths: string[] } };
    assert.deepEqual(confirmingCoverage.sourceChanges.paths, []);
    const confirmedCoverage = await actions.finalize(confirmingCoverage.sessionId) as {
      inspection: { groups: { updated: readonly { path: string; after?: { content: string } }[] } };
    };
    const confirmedRepository = confirmedCoverage.inspection.groups.updated.find((entry) =>
      entry.path === "domains/vehicle-data/repositories/vehicle-events.md");
    assert.ok(confirmedRepository?.after);
    assert.equal(readRepositoryRefreshCoverage(parseConceptDocument(
      confirmedRepository.path, confirmedRepository.after.content)), undefined);
    const status = await actions.status() as { local: { draft_count: number } };
    assert.equal(status.local.draft_count, 0, "six changes are Published; confirming Coverage Refresh is only a preview");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
