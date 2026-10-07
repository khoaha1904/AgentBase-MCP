import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runGit } from "../../providers/github-hub/index.ts";
import { matchRepositoryNames, normalizeSourceName } from "./name-links.ts";

function write(root: string, relative: string, content: string): void {
  const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content);
}

test("[AB-NAME-001..005] source-name matching retains chains and ambiguity without reading excluded files", async () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-source-names-")));
  try {
    const repos = ["resources", "publisher", "duplicate"].map((id) => ({ id, root: path.join(root, id) }));
    for (const repo of repos) { fs.mkdirSync(repo.root); await runGit({ args: ["init", "-b", "main"], cwd: repo.root, operation: "init names fixture" }); }
    write(repos[0]!.root, "defaults.hcl", 'inputs = { app = "fleet", environment = "prod" }');
    write(repos[0]!.root, "src/queues/main.tf", 'locals { queue_name = "${var.app}-${var.environment}-event-delivery" }\nresource "aws_sqs_queue" "events" { name = local.queue_name }\nresource "aws_sqs_queue" "duplicate" { name = "fleet-duplicate-work" }');
    write(repos[1]!.root, "main.tf", 'module "worker" {\n environment-variables = { EVENTS = "https://sqs.${var.region}.amazonaws.com/${var.account_id}/fleet-dev-event-delivery" }\n}\ndata "aws_sqs_queue" "partial" { name = "${var.app}-event-delivery" }\ndata "aws_sqs_queue" "external" { name = "fleet-external-jobs" }');
    write(repos[1]!.root, "src/main.js", 'export async function publish(client) { await client.sendMessage({ QueueUrl: process.env.EVENTS }); }');
    write(repos[2]!.root, "main.tf", 'resource "aws_sqs_queue" "duplicate" { name = "prod-fleet-duplicate-work" }');
    for (const relative of ["tests/main.tf", "docs/main.tf", "fixtures/main.tf", ".terragrunt-cache/main.tf", "out.min.js", "out.chunk.js", ".env"]) {
      write(repos[1]!.root, relative, 'data "aws_sqs_queue" "noise" { name = "private-noise-sentinel" }');
    }
    const result = matchRepositoryNames(repos);
    assert.equal(result.links.length, 1);
    assert.equal(result.links[0]!.kind, "publishes-to");
    assert.equal(result.links[0]!.confidence, "normalized");
    assert.ok(result.links[0]!.evidence.definition.some((item) => item.path === "defaults.hcl"));
    assert.ok(result.links[0]!.evidence.usage.some((item) => item.path === "src/main.js"));
    assert.ok(result.questions.some((item) => item.reason === "duplicate-definition"));
    const partial = result.questions.find((item) => item.confidence === "partial")!;
    assert.ok(partial.repos.includes("resources") && partial.repos.includes("publisher"));
    assert.ok(result.referencedNotDefined.some((item) => item.name === "fleet-external-jobs"));
    assert.doesNotMatch(JSON.stringify(result), /private-noise-sentinel/);
    write(repos[1]!.root, "main.tf", 'data "aws_sqs_queue" "events" { name = "fleet-dev-event-delivery" }\nmodule "worker" { environment-variables = { EVENTS = data.aws_sqs_queue.events.url } }');
    const dataReference = matchRepositoryNames(repos).links.find((link) => link.name === "fleet-event-delivery")!;
    assert.equal(dataReference.kind, "publishes-to");
    assert.ok(dataReference.mechanisms.includes("function-environment"));
    assert.ok(dataReference.evidence.usage.some((item) => item.path === "main.tf" && item.line === 1));
    assert.equal(JSON.stringify(result).includes(root), false);
    assert.throws(() => matchRepositoryNames([repos[0]!]), /2..32/);
    assert.throws(() => matchRepositoryNames([repos[0]!, repos[0]!]), /2..32/);
    assert.equal(normalizeSourceName('arn:aws:sqs:${var.region}:${var.account_id}:Fleet_QA_Event.Delivery.fifo'), "fleet-event-delivery-fifo");
    assert.equal(normalizeSourceName("https://sqs.us-east-1.amazonaws.com/111111111111/fleet-prod-event-delivery"), "fleet-event-delivery");
    assert.equal(normalizeSourceName("fleet-task-archive-us-east-1-111111111111"), "fleet-task-archive");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
