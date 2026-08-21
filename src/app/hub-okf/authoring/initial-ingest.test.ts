import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadOkfBundle, parseConceptDocument, validateOkfRelationships } from "../../../core/knowledge/index.ts";
import { runGit } from "../../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "../query/runtime-actions.ts";

test("[AB-INGEST-004..006][AB-INGEST-008][AB-INGEST-011] preparation renders one generic inspectable skeleton bundle and stops", async () => {
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

    const actions = createHubRuntimeActions(environment, path.join(root, "state"));
    await actions.configure({ mode: "new" });
    const preflight = await actions.preflight(source) as {
      repository: { kind: string; repository: { id: string; displayName: string; remotes: string[]; rootCommits: string[] } };
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
    const prepared = await actions.prepare({
      mode: "new", sourceRepository: source,
      subjectDirectory: "repositories/vehicle-events", guidanceRequest,
      confirmedDomain: {
        identity: "domains/vehicle-data", title: "Vehicle Data",
        evidenceResource: "agentbase://owner-guidance/domains/vehicle-data",
      },
      coverage: { partial: true, limitations: ["runtime consumers were not present in this repository"] },
    }) as { sessionId: string; bundleRoot: string; sourceRepositoryId: string; selectedSchemas: string[];
      skeletons: readonly { identity: string; path: string; type: string }[] };
    assert.deepEqual(prepared.selectedSchemas.sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    assert.deepEqual(prepared.skeletons.map((item) => item.type).sort(), ["Domain", "Flow", "Function", "Repository", "System"]);
    const skeletonBundle = loadOkfBundle(prepared.bundleRoot, { requireAgentBaseRootIndex: true });
    assert.deepEqual([...skeletonBundle.concepts.values()].map((concept) => concept.type).sort(),
      ["Domain", "Flow", "Function", "Repository", "System"]);
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

    const finalized = await actions.finalize(prepared.sessionId) as {
      proposal: { id: string; phase: string; selectedSchemas: string[] };
      inspection: { applicable: boolean; coverage: { partial: boolean; limitations: string[] } };
    };
    assert.equal(finalized.proposal.phase, "prepared");
    assert.equal(finalized.inspection.applicable, true);
    assert.equal(finalized.inspection.coverage.partial, true);
    assert.deepEqual(finalized.inspection.coverage.limitations, ["runtime consumers were not present in this repository"]);
    const status = await actions.status() as { pendingCount: number };
    assert.equal(status.pendingCount, 0, "preview was not accepted or published");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
