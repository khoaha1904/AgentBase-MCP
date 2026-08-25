import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createHubIdentity, hubProfileId } from "../../../core/hub/index.ts";
import {
  getOkfAuthoringGuidance, loadOkfBundle, parseConceptDocument, readRepositoryObservedSource, validateOkfRelationships,
  type InventoryReceipt,
} from "../../../core/knowledge/index.ts";
import { runGit, type SourceSnapshot } from "../../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "../query/runtime-actions.ts";
import { readPersistedHubConfiguration, replacePersistedHubConfiguration } from "../configuration/configuration-file.ts";
import { createLocalHub } from "../workspace/setup.ts";
import { createTestInventoryReceipt } from "../test-support.ts";
import { writeInitialIngestSkeletons } from "./initial-ingest-skeleton.ts";

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

test("[AB-INGEST-004..006][AB-INGEST-008][AB-INGEST-011][AB-INGEST-013..015] preparation renders one generic inspectable skeleton bundle and stops", async () => {
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

    const stateRoot = path.join(root, "state"), receipts = new Map<string, InventoryReceipt>();
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
    assert.deepEqual(prepared.selectedSchemas.sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    assert.deepEqual(prepared.skeletons.map((item) => item.type).sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    const skeletonBundle = loadOkfBundle(prepared.bundleRoot, { requireAgentBaseRootIndex: true });
    assert.deepEqual([...skeletonBundle.concepts.values()].map((concept) => concept.type).sort(),
      ["Domain", "Flow", "Function", "Repository", "System"]);
    const initialObserved = readRepositoryObservedSource(skeletonBundle.concepts.get("repositories/vehicle-events")!);
    assert.match(initialObserved?.commit ?? "", /^[a-f0-9]{40}$/);
    assert.deepEqual(skeletonBundle.concepts.get("components/publisher")?.frontmatter.agentbase, {
      technology: { kind: "runtime-function", provider: "aws", product: "lambda",
        sourceTool: "terraform", resourceType: "aws_lambda_function" },
    });
    assert.equal(skeletonBundle.concepts.get("repositories/vehicle-events")?.body.includes("components/publisher.md"), true);
    const publisherBody = skeletonBundle.concepts.get("components/publisher")?.body ?? "";
    assert.match(publisherBody, /# Embedded Knowledge/);
    assert.match(publisherBody, /Vehicle-events \| Internal trigger transport for the publisher \| message-queue \| aws \/ sqs; terraform:aws_sqs_queue/i);
    assert.match(publisherBody, /repository:\/\/repository-[a-z0-9-]+\/main\.tf#L4-L6/);
    assert.equal(skeletonBundle.concepts.has("resources/vehicle-events"), false);
    assert.equal(prepared.skeletons.some((item) => item.identity.includes("events") && item.type === "Resource"), false);
    assert.match(skeletonBundle.concepts.get("systems/vehicle-events")?.body ?? "", /suggested.*proposal review/i);
    assert.deepEqual(skeletonBundle.concepts.get("systems/vehicle-events")?.frontmatter.relationships, [
      { kind: "part-of", target: "domains/vehicle-data", evidence: ["owner-domain"] },
    ]);
    assert.match(skeletonBundle.concepts.get("domains/vehicle-data")?.body ?? "",
      /# Systems[\s\S]*\[Vehicle-events\]\(\.\.\/systems\/vehicle-events\.md\)/);
    const componentsIndex = path.join(prepared.bundleRoot, "components", "index.md");
    const preparedNavigation = fs.readFileSync(componentsIndex, "utf8");
    fs.appendFileSync(componentsIndex, "\n* [Publisher](./publisher.md) - Function\n");
    assert.throws(() => loadOkfBundle(prepared.bundleRoot, { requireAgentBaseRootIndex: true }),
      /components\/index\.md: duplicate index target: publisher\.md/);
    fs.writeFileSync(componentsIndex, preparedNavigation);
    const flow = skeletonBundle.concepts.get("flows/publish-vehicle-event");
    assert.deepEqual(flow?.frontmatter.flow_steps, []);
    const unfilled = validateOkfRelationships(
      [...skeletonBundle.concepts].map(([identity, concept]) => ({ identity, concept })),
      { sourceIdentities: new Set(["flows/publish-vehicle-event"]),
        strictSourceIdentities: new Set(["flows/publish-vehicle-event"]) },
    );
    assert.match(unfilled.failures.join("\n"), /flow_steps must be a non-empty list/);
    const malformedFlow = parseConceptDocument("flows/malformed.md", fs.readFileSync(
      path.join(prepared.bundleRoot, "flows/publish-vehicle-event.md"), "utf8",
    ).replace("flow_steps: []", "flow_steps:\n  - { order: 1, from: systems/vehicle-events, action: invokes, to: components/publisher, mode: asynchronous, evidence: [flow-docs] }"));
    assert.match(validateOkfRelationships([{ identity: "flows/malformed", concept: malformedFlow }]).failures.join("\n"),
      /requires order \(positive integer\), source, action, target and mode/);
    const flowPath = path.join(prepared.bundleRoot, "flows/publish-vehicle-event.md");
    fs.writeFileSync(flowPath, fs.readFileSync(flowPath, "utf8")
      .replace("flow_steps: []", [
        "flow_steps:",
        "  - order: 1",
        "    source: systems/vehicle-events",
        "    action: invokes",
        "    target: components/publisher",
        "    mode: asynchronous",
        "    evidence: [flow-docs]",
      ].join("\n"))
      .replace("# Limitations", [
        "[Vehicle events](../systems/vehicle-events.md) invokes the [publisher](../components/publisher.md).",
        "", "# Limitations",
      ].join("\n")));

    const publisherPath = path.join(prepared.bundleRoot, "components", "publisher.md");
    const validPublisher = fs.readFileSync(publisherPath, "utf8");
    fs.writeFileSync(publisherPath, validPublisher.replace("main.tf#L1-L3", "main.tf#L1-L99"));
    await assert.rejects(actions.finalize(prepared.sessionId),
      /components\/publisher\.md: source span exceeds main\.tf \(6 lines\)/);
    fs.writeFileSync(publisherPath, validPublisher);

    const finalized = await actions.finalize(prepared.sessionId) as {
      proposal: { id: string; phase: string; selectedSchemas: string[]; diffDigest: string };
      inspection: { applicable: boolean; coverage: { partial: boolean; limitations: string[] } };
    };
    assert.equal(finalized.proposal.phase, "prepared");
    assert.equal(finalized.inspection.applicable, true);
    assert.equal(finalized.inspection.coverage.partial, true);
    assert.deepEqual(finalized.inspection.coverage.limitations, ["runtime consumers were not present in this repository"]);
    await actions.accept(finalized.proposal.id, finalized.proposal.diffDigest);
    fs.appendFileSync(path.join(source, "README.md"), "\nThe publisher now exposes delivery ownership.\n");
    await runGit({ args: ["add", "README.md"], cwd: source, operation: "stage refresh fixture" });
    await runGit({ args: ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "refresh fixture"],
      cwd: source, operation: "commit refresh fixture", commitTimestamp: "2026-08-22T00:00:00Z" });
    const refresh = await actions.prepare({
      mode: "refresh", sourceRepository: source, subjectDirectory: "repositories/vehicle-events",
      signals: ["repository"],
    }) as { sessionId: string; bundleRoot: string; selectedSchemas: string[];
      source: { commit: string }; sourceChanges: { paths: string[] } };
    assert.deepEqual(refresh.sourceChanges.paths, ["README.md"]);
    assert.deepEqual(refresh.selectedSchemas.sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    const repositoryPath = path.join(refresh.bundleRoot, "repositories", "vehicle-events.md");
    fs.appendFileSync(repositoryPath, "\nRefresh evidence confirms delivery ownership.\n");
    const refreshed = await actions.finalize(refresh.sessionId) as {
      proposal: { selectedSchemas: string[] };
      inspection: { groups: { updated: readonly { path: string; after?: { content: string } }[] } };
    };
    assert.deepEqual(refreshed.proposal.selectedSchemas, ["Domain", "Flow", "Function", "Repository", "System"]);
    const updatedRepository = refreshed.inspection.groups.updated.find((entry) => entry.path === "repositories/vehicle-events.md");
    assert.ok(updatedRepository?.after);
    assert.equal(readRepositoryObservedSource(parseConceptDocument(updatedRepository.path, updatedRepository.after.content))?.commit,
      refresh.source.commit);
    const status = await actions.status() as { local: { draft_count: number } };
    assert.equal(status.local.draft_count, 1, "Initial Ingest was accepted locally; Refresh remained an unaccepted preview");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
