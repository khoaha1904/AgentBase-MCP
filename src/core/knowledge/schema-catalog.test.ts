import assert from "node:assert/strict";
import test from "node:test";

import { getOkfConceptSchema, listOkfConceptSchemas, selectOkfConceptSchemas, validateConceptAgainstSchema } from "./schema-catalog.ts";
import { parseConceptDocument } from "./okf-document.ts";

test("[AB-SCHEMA-001][AB-SCHEMA-006][AB-SCHEMA-007] catalog 3.1 exposes concrete authoring types", () => {
  assert.deepEqual(listOkfConceptSchemas().map((item) => item.type), [
    "Repository", "Service", "Server", "API Endpoint", "Event", "Database Table", "Queue",
    "AWS Lambda", "AWS SQS Queue", "Terraform Module", "Business Flow",
    "Cross-Repository Relationship", "Open Question", "Maintainer Guidance",
  ]);
  assert.equal(getOkfConceptSchema("AWS Lambda")?.directoryHint, "repositories/<repository>/infrastructure/aws/lambda/<slug>.md");
});

test("[AB-SCHEMA-010][AB-SCHEMA-011] AWS and business schemas guide evidence-led investigation", () => {
  const lambda = getOkfConceptSchema("AWS Lambda");
  assert.ok(lambda?.investigationQuestions.some((question) => question.includes("business purpose")));
  assert.deepEqual(lambda?.metadataGuidance.filter((item) => item.requiredWhenSupported).map((item) => item.field), [
    "business_purpose", "resource_name", "runtime", "handler",
  ]);
  assert.ok(lambda?.relationshipGuidance.some((item) => item.kind === "accesses" && item.targetTypes.includes("Database Table")));
  assert.ok(getOkfConceptSchema("Terraform Module")?.relationshipGuidance.some((item) => item.kind === "declares"));
  assert.ok(getOkfConceptSchema("Business Flow")?.metadataGuidance.some((item) => item.field === "outcome"));
  assert.match(lambda?.limitationGuidance ?? "", /never invent/);
});

test("[AB-SCHEMA-002][AB-SCHEMA-008] selection is sparse and prefers specific supported types", () => {
  assert.deepEqual(selectOkfConceptSchemas(["aws sqs queue", "producer or consumer evidence", "SQS resource identity"]).map((item) => item.type), ["AWS SQS Queue"]);
  assert.deepEqual(selectOkfConceptSchemas(["server entry point", "http server"]).map((item) => item.type), ["Server"]);
  assert.deepEqual(selectOkfConceptSchemas(["HTTP routes backed by handlers"]).map((item) => item.type), ["API Endpoint"]);
  assert.deepEqual(selectOkfConceptSchemas([]), []);
});

test("[AB-SCHEMA-015] selection recognizes natural evidence word order and catalog phrases", () => {
  const selected = selectOkfConceptSchemas([
    "AWS SAM defines an SQS deletion queue and Lambda consumer",
    "Several observed user actions are business behaviors",
  ]).map((item) => item.type);
  assert.deepEqual(selected, ["AWS Lambda", "AWS SQS Queue", "Business Flow"]);
  assert.equal(selected.includes("Queue"), false);
});

test("[AB-SCHEMA-003][AB-SCHEMA-009] repeated instances are allowed and missing evidence stays visible", () => {
  const selected = selectOkfConceptSchemas(["aws lambda function"]);
  assert.deepEqual(selected.map((item) => item.type), ["AWS Lambda"]);
  assert.ok(selected[0]?.missingEvidence.includes("Lambda resource or runtime identity"));
  assert.match(getOkfConceptSchema("AWS Lambda")?.limitationGuidance ?? "", /never invent/);
});

test("[AB-SCHEMA-004][AB-SCHEMA-005] known types add policy while unknown Google OKF types remain valid", () => {
  const known = parseConceptDocument("repositories/a/repository.md", "---\ntype: Repository\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(known), [
    "repositories/a/repository.md: Repository requires title",
    "repositories/a/repository.md: Repository requires description",
    "repositories/a/repository.md: Repository requires generated",
    "repositories/a/repository.md: Repository requires sources",
  ]);
  const unknown = parseConceptDocument("custom.md", "---\ntype: Custom Domain Type\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(unknown), []);
});
