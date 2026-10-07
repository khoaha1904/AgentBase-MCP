import fs from "node:fs";
import path from "node:path";

import { resolveRepositoryIdentity, renderConceptDocument } from "../../src/core/knowledge/index.ts";
import { discoverRepositorySourceState } from "../../src/app/repository-source/index.ts";
import { runGit } from "../../src/providers/github-hub/index.ts";

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${content.trim()}\n`);
}

async function repositories(root, files) {
  const repos = [];
  for (const [id, entries] of Object.entries(files)) {
    const directory = path.join(root, id);
    write(directory, "README.md", `# ${id}\n\nDeterministic wiring fixture.`);
    for (const [relative, content] of Object.entries(entries)) write(directory, relative, content);
    for (const args of [["init", "-b", "main"], ["add", "."],
      ["-c", "user.name=AgentBase", "-c", "user.email=agentbase@localhost", "commit", "-m", "fixture"]]) {
      await runGit({ args, cwd: directory, operation: "generate qualification fixture", commitTimestamp: "2026-10-07T00:00:00Z" });
    }
    repos.push({ id, path: id });
  }
  return repos;
}

export async function createF1(root) {
  const repos = await repositories(root, {
    infrastructure: {
      "terraform/defaults.hcl": 'inputs = { app-name = "fleet", environment = "dev" }',
      "terraform/account/account.hcl": 'inputs = { region = "us-east-1", account-id = "111111111111" }',
      "terraform/terragrunt.hcl": 'inputs = merge(read_terragrunt_config("defaults.hcl").inputs, read_terragrunt_config("account/account.hcl").inputs)',
      "terraform/src/queues/main.tf": `locals { queue_name = "\${var.app-name}-\${var.environment}-task-events.fifo" }
resource "aws_sqs_queue" "tasks" { name = local.queue_name }
resource "aws_sns_topic" "alerts" { name = "prod-fleet-task-alerts" }
resource "aws_dynamodb_table" "results" { name = "fleet-task-results" }
resource "aws_s3_bucket" "archive" { bucket = "fleet-task-archive-\${var.region}-\${var.account-id}" }
resource "aws_sqs_queue" "duplicate" { name = "fleet-duplicate-work" }
variable "label" { default = "daily" }
resource "aws_lambda_function" "daily" { function_name = "fleet-\${var.label}-summarizer" }`,
    },
    producer: {
      "package.json": '{"name":"@fleet/task-publisher","version":"1.0.0"}',
      "terraform/terragrunt.hcl": `inputs = { app-name = "fleet", environment = "qa" }`,
      "terraform/main.tf": `module "worker" {
  source = "git::ssh://git@github.com/fixtures/runtime-modules.git//lambda?ref=v1"
  service-name = "fleet-task-publisher"
  environment-variables = { TASK_QUEUE_URL = "https://sqs.\${var.region}.amazonaws.com/\${var.account-id}/fleet-qa-task-events.fifo" }
}
resource "aws_sqs_queue" "duplicate" { name = "prod-fleet-duplicate-work" }
data "aws_sqs_queue" "missing" { name = "fleet-old-dead-letter" }`,
      "src/main.js": 'const { TASK_QUEUE_URL } = process.env;\nexport async function publish(sqs, body) { return sqs.sendMessage({ QueueUrl: TASK_QUEUE_URL, MessageBody: body }); }',
    },
    consumer: {
      "package.json": '{"name":"@fleet/task-consumer","dependencies":{"@fleet/task-publisher":"^0.9.0"}}',
      "terraform/main.tf": `data "aws_sqs_queue" "tasks" { name = "fleet-prod-task-events.fifo" }
data "aws_dynamodb_table" "results" { name = "prod-fleet-task-results" }
resource "aws_lambda_event_source_mapping" "tasks" { event_source_arn = "arn:aws:sqs:\${var.region}:\${var.account-id}:fleet-prod-task-events.fifo" }
module "worker" {
  source = "git::ssh://git@github.com/fixtures/runtime-modules.git//lambda?ref=v2"
  environment-variables = { RESULT_TABLE = "fleet-task-results" }
}
locals { alarm_topics = { primary = "arn:aws:sns:\${var.region}:\${var.account-id}:fleet-task-alerts" } }
data "aws_s3_bucket" "archive" { bucket = "fleet-task-archive-us-east-1-111111111111" }
locals { endpoint = ["task-service/rest-v1"] }`,
      "src/main.js": 'export async function consume(db, item) { return db.putItem({ TableName: process.env.RESULT_TABLE, Item: item }); }',
      "endpoints.json": '{"endpoints":["task-service/rest-v1","audit-service/rest-v2"]}',
    },
    "spring-client": {
      "pom.xml": '<project><modelVersion>4.0.0</modelVersion><groupId>org.fixture.fleet</groupId><artifactId>inbox-sdk</artifactId><version>2.0.0</version></project>',
      "src/main/resources/application.properties": 'fleet.queue=prod-fleet-task-events.fifo\nqueue.name=${fleet.queue}\nfleet.endpoint.task-service.rest-v1.url=task-service/rest-v1\nexternal.queue=${REMOTE_QUEUE_NAME}',
      "src/main/java/QueueConfig.java": 'class QueueConfig {\n  @Value("${queue.name}") String queue;\n  void poll(Client client) { client.receiveMessage(queue); }\n}',
    },
    "java-consumer": {
      "pom.xml": '<project><modelVersion>4.0.0</modelVersion><groupId>org.fixture.fleet</groupId><artifactId>report-reader</artifactId><version>1.0.0</version><properties><inbox.version>1.7.0</inbox.version></properties><dependencies><dependency><groupId>org.fixture.fleet</groupId><artifactId>inbox-sdk</artifactId><version>${inbox.version}</version></dependency></dependencies></project>',
      "build.gradle": "dependencies { implementation 'org.fixture.fleet:inbox-sdk:1.6.0' }",
      "src/main/resources/application.properties": 'service.endpoint=task-service/rest-v1\nssm.endpoint=/fleet-endpoint/live/task-service/rest-v1',
    },
  });
  const links = [
    ["fleet-task-events-fifo", "infrastructure", "producer", "publishes-to"],
    ["fleet-task-events-fifo", "infrastructure", "consumer", "reads-from"],
    ["fleet-task-results", "infrastructure", "consumer", "writes-to"],
    ["fleet-task-alerts", "infrastructure", "consumer", "depends-on"],
    ["fleet-task-archive", "infrastructure", "consumer", "reads-from"],
    ["fleet-task-events-fifo", "infrastructure", "spring-client", "reads-from"],
    ["org-fixture-fleet-inbox-sdk", "spring-client", "java-consumer", "depends-on"],
    ["fleet-task-publisher", "producer", "consumer", "depends-on"],
  ].map(([name, defining_repo, using_repo, kind]) => ({ name, defining_repo, using_repo, kind }));
  write(root, "concepts/index.md", "---\nokf_version: '0.2'\n---\n# Fixture Hub");
  const spec = { repos, links, questions: [], hub: { concept_directory: "concepts" } };
  write(root, "spec.json", JSON.stringify(spec, null, 2));
  return path.join(root, "spec.json");
}

export async function createF2(root) {
  const repos = await repositories(root, {
    "metrics-api": {
      "src/producer.js": `export async function measure(api, queues, object) {
  const { actual, trial } = await api.fetchMeasurements(object);
  if (actual.length > 0) await queues.publish(process.env.ACTUAL_QUEUE, actual);
  await queues.publish(process.env.TRIAL_QUEUE, trial);
}`,
      "main.tf": `module "measure" {
  source = "./lambda"
  environment-variables = { ACTUAL_QUEUE = "fleet-actual-measurements", TRIAL_QUEUE = "fleet-trial-measurements" }
}`,
    },
    "storage-worker": {
      "src/consumer.js": 'export async function store(db, message, table) { await db.putItem({ TableName: table, Item: message }); }',
      "main.tf": `resource "aws_sqs_queue" "actual" { name = "fleet-actual-measurements" }
resource "aws_sqs_queue" "trial" { name = "fleet-trial-measurements" }
resource "aws_dynamodb_table" "actual" { name = "fleet-actual-results" }
resource "aws_dynamodb_table" "trial" { name = "fleet-trial-results" }
resource "aws_lambda_event_source_mapping" "actual" { event_source_arn = aws_sqs_queue.actual.arn }
resource "aws_lambda_event_source_mapping" "trial" { event_source_arn = aws_sqs_queue.trial.arn }`,
    },
  });
  const identities = new Map(repos.map((repo) => {
    const source = discoverRepositorySourceState(path.join(root, repo.path));
    return [repo.id, resolveRepositoryIdentity({ displayName: source.displayName, ...source.identityHints }, []).repository];
  }));
  const concept = (relative, type, title, description, repo, sourcePath, body, relationships = []) => {
    const repository = identities.get(repo);
    const sources = [{ id: "source", resource: `repository://${repository.id}/${sourcePath}#L1-L5` }];
    const frontmatter = { type, title, description, status: "draft",
      generated: { by: "agentbase/0.1.0", at: "2026-10-07T00:00:00Z" }, sources,
      ...(relationships.length ? { relationships: relationships.map((item) => ({ ...item, evidence: ["source"] })) } : {}),
      ...(type === "Repository" ? { agentbase: { repository: { id: repository.id, display_name: repo,
        aliases: { remotes: repository.remotes, root_commits: repository.rootCommits } } } } : {}) };
    write(root, `concepts/${relative}`, renderConceptDocument({ path: relative, type, conceptId: relative.replace(/\.md$/, ""),
      frontmatter, body }));
  };
  concept("repositories/metrics-api.md", "Repository", "Actual and trial measurements API", "Conditional actual measurements flow; trial always exists.",
    "metrics-api", "src/producer.js", `# Role
Fetch measurements from the external API for each object.

## Runtime and interfaces
The measure entrypoint calls the measurement API and publishes messages.

## Inputs, outputs and conditions
Actual measurements are empty for objects with little traffic. Publish to
[queue A](../resources/queue-a.md) only when actual.length > 0; otherwise
[table X](../resources/table-x.md) receives no data for that object.
Trial measurements always exist and go to [queue B](../resources/queue-b.md),
then [table Y](../resources/table-y.md). Missing actual data is conditional,
not evidence of a storage failure.

## Operations
Retry/DLQ and the API availability policy remain unverified. Read exact sources.
`);
  concept("repositories/storage-worker.md", "Repository", "Measurement storage worker", "Stores actual and trial queue messages in separate tables.",
    "storage-worker", "src/consumer.js", `# Role
Store measurement messages. No message means no new row.

## Inputs and outputs
[Queue A](../resources/queue-a.md) feeds [table X](../resources/table-x.md).
[Queue B](../resources/queue-b.md) feeds [table Y](../resources/table-y.md).
Runtime: store entrypoint, invoked by event source mappings. Retry policy is unverified.
`);
  concept("resources/queue-a.md", "Resource", "Queue A actual measurements", "Conditional actual measurements input for table X.",
    "storage-worker", "main.tf", `# Role
Carries actual measurements from [the API repository](../repositories/metrics-api.md).
Empty actual measurements suppress publication; [table X](table-x.md) stays empty for that object.
Consumed by [storage](../repositories/storage-worker.md). Retry/DLQ unverified.
`);
  concept("resources/queue-b.md", "Resource", "Queue B trial measurements", "Trial measurements input for table Y.",
    "storage-worker", "main.tf", `# Role
Carries always-available trial measurements from [the API](../repositories/metrics-api.md).
Consumed by [storage](../repositories/storage-worker.md) to write [table Y](table-y.md).
Retry/DLQ unverified.
`);
  concept("resources/table-x.md", "Resource", "Table X actual measurements", "Actual measurement rows depend on queue A publication.",
    "storage-worker", "main.tf", `# Role
Stores actual measurements delivered through [queue A](queue-a.md).
No data for a low-traffic object when [the API](../repositories/metrics-api.md)
gets empty actual measurements and skips publication. Trial results do not feed this table.
Writer: [storage worker](../repositories/storage-worker.md). Retention unverified.
`);
  concept("resources/table-y.md", "Resource", "Table Y trial measurements", "Trial measurement rows arrive independently of actual data.",
    "storage-worker", "main.tf", `# Role
Stores trial measurements from [queue B](queue-b.md), written by [storage](../repositories/storage-worker.md).
Trial data always exists even for objects without actual measurements. Retention unverified.
`);
  write(root, "concepts/index.md", "---\nokf_version: '0.2'\n---\n# Measurement Hub\n\n* [API](repositories/metrics-api.md)\n* [Storage](repositories/storage-worker.md)");
  const spec = { repos, links: ["actual", "trial"].map((kind) => ({ name: `fleet-${kind}-measurements`,
    defining_repo: "storage-worker", using_repo: "metrics-api", kind: "publishes-to" })), questions: [
    { id: "conditional-empty", text: "Why does table X have no actual measurements for an object while table Y has trial measurements?",
      expected: [{ concept_id: "repositories/metrics-api" }, { concept_id: "resources/queue-a" }, { concept_id: "resources/table-x" }] },
    { id: "source-evidence", text: "Conditional actual measurements flow", expected: [{ source: "metrics-api:src/producer.js" }] },
  ], hub: { concept_directory: "concepts" } };
  write(root, "spec.json", JSON.stringify(spec, null, 2));
  return path.join(root, "spec.json");
}
