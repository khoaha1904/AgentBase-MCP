import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runGit } from "../../../providers/github-hub/index.ts";
import { createHubRuntimeActions } from "../query/runtime-actions.ts";

test("[AB-INGEST-004..006][AB-INGEST-008] evidence guidance produces one generic inspectable preview and stops", async () => {
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
        { id: "repository", identityHint: "vehicle-events", identityBasis: "checkout root", queryValue: "source identity", evidenceIds: ["readme"] },
        { id: "publisher", identityHint: "publisher", identityBasis: "Terraform address", queryValue: "independent runtime", evidenceIds: ["function"] },
        { id: "events", identityHint: "events", identityBasis: "Terraform address", queryValue: "asynchronous boundary", evidenceIds: ["queue"] },
      ],
      semanticObservations: [{ id: "readme", candidateId: "repository", role: "documentation" as const,
        signal: "repository", source: { path: "README.md", startLine: 1, endLine: 3 } }],
      resourceObservations: [
        { id: "function", candidateId: "publisher", sourceTool: "terraform" as const,
          resourceType: "aws_lambda_function", address: "aws_lambda_function.publisher", source: { path: "main.tf", startLine: 1, endLine: 3 } },
        { id: "queue", candidateId: "events", sourceTool: "terraform" as const,
          resourceType: "aws_sqs_queue", address: "aws_sqs_queue.events", source: { path: "main.tf", startLine: 4, endLine: 6 } },
      ],
    };
    const prepared = await actions.prepare({
      mode: "new", sourceRepository: source, evidenceDigest: `sha256:${"e".repeat(64)}`,
      subjectDirectory: "repositories/vehicle-events", guidanceRequest,
      coverage: { partial: true, limitations: ["runtime consumers were not present in this repository"] },
    }) as { sessionId: string; bundleRoot: string; sourceRepositoryId: string; selectedSchemas: string[] };
    assert.deepEqual(prepared.selectedSchemas.sort(), ["Function", "Queue", "Repository"]);

    const write = (relative: string, content: string) => {
      const target = path.join(prepared.bundleRoot, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    };
    fs.appendFileSync(path.join(prepared.bundleRoot, "index.md"), [
      "", "* [Repository](repositories/vehicle-events.md) - source", "* [Components](components/index.md) - runtime",
      "* [Resources](resources/index.md) - data resources", "",
    ].join("\n"));
    write("components/index.md", "# Components\n\n* [Publisher](publisher.md) - event publisher\n");
    write("resources/index.md", "# Resources\n\n* [Vehicle events](vehicle-events.md) - asynchronous queue\n");
    const generated = "status: draft\ngenerated: { by: agentbase/0.0.0, at: 2026-08-21T00:00:00Z }\n";
    write("repositories/vehicle-events.md", [
      "---", "type: Repository", "title: Vehicle events", "description: Vehicle event source repository", generated.trimEnd(),
      "sources:", `  - { id: readme, resource: repository://${prepared.sourceRepositoryId}/README.md#L1-L3 }`,
      "agentbase:", "  repository:", `    id: ${prepared.sourceRepositoryId}`, "    display_name: vehicle-events",
      "    aliases:", "      remotes: []", `      root_commits: [${preflight.repository.repository.rootCommits[0]}]`,
      "---", "", "# Purpose", "", "Provides the [publisher](../components/publisher.md) and [event queue](../resources/vehicle-events.md).", "",
    ].join("\n"));
    write("components/publisher.md", [
      "---", "type: Function", "title: Vehicle publisher", "description: Publishes vehicle events", generated.trimEnd(),
      "sources:", `  - { id: function, resource: repository://${prepared.sourceRepositoryId}/main.tf#L1-L3 }`,
      "relationships:", "  - { kind: publishes-to, target: resources/vehicle-events, evidence: [function] }",
      "---", "", "# Responsibility", "", "Publishes to the [vehicle event queue](../resources/vehicle-events.md).", "",
      "# Limitations", "", "Runtime consumers are not evidenced in this repository.", "",
    ].join("\n"));
    write("resources/vehicle-events.md", [
      "---", "type: Queue", "title: Vehicle events", "description: Asynchronous vehicle-event boundary", generated.trimEnd(),
      "sources:", `  - { id: queue, resource: repository://${prepared.sourceRepositoryId}/main.tf#L4-L6 }`,
      "---", "", "# Purpose", "", "Carries vehicle events; its deployed ARN is not claimed by source evidence.", "",
    ].join("\n"));

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
