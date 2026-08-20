import assert from "node:assert/strict";
import test from "node:test";

import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  getOkfConceptSchema,
  listOkfConceptSchemas,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
} from "./catalog.ts";
import { parseConceptDocument } from "../documents/okf-document.ts";

test("[AB-SCHEMA-001][AB-SCHEMA-006][AB-SCHEMA-007][AB-SCHEMA-016][AB-SCHEMA-025] catalog exposes schemas distinct from instances", () => {
  assert.deepEqual(listOkfConceptSchemas().map((item) => item.type), [
    "Repository", "Domain", "Domain Entity", "System", "Software Component", "Service", "Function", "Server", "API Surface", "API Endpoint",
    "Event", "Metric", "Database", "Database Table", "Queue", "Object Storage", "Infrastructure Definition",
    "Infrastructure Module", "Deployment", "Business Flow", "Cross-Repository Relationship", "Maintainer Guidance",
  ]);
  assert.equal(AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, "6.0.0");
  assert.equal(getOkfConceptSchema("Function")?.directoryHint, "components/<slug>.md");
  assert.match(getOkfConceptSchema("Server")?.purpose ?? "", /compute host/);
  assert.equal(getOkfConceptSchema("Repository")?.directoryHint, "repositories/<slug>.md");
  assert.equal(getOkfConceptSchema("Domain")?.directoryHint, "domains/<slug>.md");
  assert.equal(getOkfConceptSchema("Domain Entity")?.directoryHint, "entities/<slug>.md");
  assert.equal(getOkfConceptSchema("Metric")?.directoryHint, "metrics/<slug>.md");
});

test("[AB-SCHEMA-026][AB-SCHEMA-027] business entities and metric definitions select without domain-specific types or live values", () => {
  const selected = selectOkfConceptSchemas([
    "business entity Vehicle Listing with stable business identity",
    "performance metric click-through rate with metric definition",
  ]);
  assert.deepEqual(selected.map((item) => item.type), ["Metric", "Domain Entity"]);
  assert.ok(selected.find((item) => item.type === "Domain Entity")?.missingEvidence.includes(
    "stable business identity and meaning or lifecycle evidence",
  ));
  assert.ok(selected.find((item) => item.type === "Metric")?.missingEvidence.includes(
    "stable metric definition and producer or calculation evidence",
  ));
  assert.deepEqual(selectOkfConceptSchemas(["vehicle class", "current value is 42"]), []);
  assert.match(getOkfConceptSchema("Domain Entity")?.investigationQuestions.join(" ") ?? "", /implementation class/);
  assert.match(getOkfConceptSchema("Metric")?.limitationGuidance ?? "", /never invent/);
});

test("[AB-SCHEMA-026][AB-SCHEMA-027][AB-SCHEMA-028] new schemas expose canonical graph guidance and one-type instances", () => {
  const entity = getOkfConceptSchema("Domain Entity");
  const metric = getOkfConceptSchema("Metric");
  assert.ok(entity?.relationshipGuidance.some((item) => item.kind === "part-of" && item.targetTypes.includes("Domain")));
  assert.ok(metric?.relationshipGuidance.some((item) => item.kind === "implemented-in" && item.targetTypes.includes("Repository")));
  for (const type of ["Domain Entity", "Metric"]) {
    for (const title of ["Vehicle", "Listing"]) {
      const concept = parseConceptDocument(`${type === "Metric" ? "metrics" : "entities"}/${title.toLowerCase()}.md`, [
        "---", `type: ${type}`, `title: ${title}`, `description: ${title} knowledge.`,
        "generated: { by: agentbase/test, at: 2026-08-19T00:00:00Z }", "sources: []", "---", "Body",
      ].join("\n"));
      assert.equal(concept.type, type);
      assert.deepEqual(validateConceptAgainstSchema(concept), []);
    }
  }
});

test("[AB-SCHEMA-022] distinct parent and specialization evidence retains both schemas", () => {
  const selected = selectOkfConceptSchemas(["software component", "service"]).map((item) => item.type);
  assert.deepEqual(selected, ["Service", "Software Component"]);
});

test("[AB-SCHEMA-030][AB-SCHEMA-035] provider-neutral schemas guide evidence-led investigation", () => {
  const runtimeFunction = getOkfConceptSchema("Function");
  assert.ok(runtimeFunction?.relationshipGuidance.some((item) => item.kind === "reads-from" && item.targetTypes.includes("Database Table")));
  assert.ok(runtimeFunction?.relationshipGuidance.some((item) => item.kind === "runs-on" && item.targetTypes.includes("Server")));
  assert.ok(getOkfConceptSchema("Infrastructure Module")?.relationshipGuidance.some((item) => item.kind === "implemented-in"));
  assert.ok(getOkfConceptSchema("Business Flow")?.flowStepGuidance?.actions.includes("invokes"));
});

test("[AB-SCHEMA-019][AB-SCHEMA-022] component specializations inherit canonical navigation guidance", () => {
  const service = getOkfConceptSchema("Service");
  assert.ok(service?.relationshipGuidance.some((item) => item.kind === "part-of" && item.targetTypes.includes("System")));
  assert.ok(service?.relationshipGuidance.some((item) => item.kind === "provides" && item.targetTypes.includes("API Surface")));
  assert.deepEqual(getOkfConceptSchema("Business Flow")?.flowStepGuidance?.modes, ["synchronous", "asynchronous"]);
});

test("[AB-SCHEMA-002][AB-SCHEMA-008] selection is sparse and prefers specific supported types", () => {
  assert.deepEqual(selectOkfConceptSchemas(["message queue", "producer or consumer evidence", "queue identity"]).map((item) => item.type), ["Queue"]);
  assert.deepEqual(selectOkfConceptSchemas(["compute host", "virtual machine"]).map((item) => item.type), ["Server"]);
  assert.deepEqual(selectOkfConceptSchemas(["HTTP routes backed by handlers"]).map((item) => item.type), ["API Surface"]);
  assert.deepEqual(selectOkfConceptSchemas(["independent endpoint with endpoint policy"]).map((item) => item.type), ["API Endpoint"]);
  assert.deepEqual(selectOkfConceptSchemas(["terraform root configuration"]).map((item) => item.type), ["Infrastructure Definition"]);
  assert.deepEqual(selectOkfConceptSchemas(["infrastructure module"]).map((item) => item.type), ["Infrastructure Module"]);
  assert.deepEqual(selectOkfConceptSchemas(["repository named commerce-api"]).map((item) => item.type), ["Repository"]);
  assert.equal(selectOkfConceptSchemas(["repository named commerce-api"]).some((item) => item.type === "Domain"), false);
  assert.deepEqual(selectOkfConceptSchemas([]), []);
});

test("[AB-SCHEMA-017][AB-SCHEMA-018] catalog guidance keeps implementation details inside useful boundaries", () => {
  assert.match(getOkfConceptSchema("API Surface")?.purpose ?? "", /related operations/);
  assert.match(getOkfConceptSchema("API Endpoint")?.evidenceRequirements.join(" ") ?? "", /independent/);
  assert.match(getOkfConceptSchema("Function")?.purpose ?? "", /independent trigger/);
  assert.match(getOkfConceptSchema("Infrastructure Module")?.purpose ?? "", /reusable/);
  assert.match(getOkfConceptSchema("Deployment")?.evidenceRequirements.join(" ") ?? "", /external evidence/);
  assert.deepEqual(selectOkfConceptSchemas(["question about an unknown owner"]), []);
});

test("[AB-SCHEMA-015] selection recognizes natural evidence word order and catalog phrases", () => {
  const selected = selectOkfConceptSchemas([
    "message queue with producer and consumer evidence",
    "runtime function with an independent trigger",
    "Several observed user actions are business behaviors",
  ]).map((item) => item.type);
  assert.deepEqual(selected, ["Business Flow", "Function", "Queue"]);
});

test("[AB-SCHEMA-003][AB-SCHEMA-009] repeated instances are allowed and missing evidence stays visible", () => {
  const selected = selectOkfConceptSchemas(["runtime function"]);
  assert.deepEqual(selected.map((item) => item.type), ["Function"]);
  assert.ok(selected[0]?.missingEvidence.includes("independent trigger, deployment, scaling, permission, failure or operational boundary"));
});

test("[AB-SCHEMA-004][AB-SCHEMA-005][AB-SCHEMA-029] additive known types preserve older and foreign concepts", () => {
  const known = parseConceptDocument("repositories/a/repository.md", "---\ntype: Repository\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(known), [
    "repositories/a/repository.md: Repository requires title",
    "repositories/a/repository.md: Repository requires description",
    "repositories/a/repository.md: Repository requires generated",
    "repositories/a/repository.md: Repository requires sources",
  ]);
  const unknown = parseConceptDocument("custom.md", "---\ntype: Custom Domain Type\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(unknown), []);
  const retired = parseConceptDocument("components/old.md", "---\ntype: AWS Lambda\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(retired), [
    "components/old.md: AWS Lambda is retired for AgentBase authoring; use Function",
  ]);
});
