import assert from "node:assert/strict";
import test from "node:test";
import { callOkfSchemaTool, OKF_SCHEMA_TOOLS } from "./okf-schema-tools.ts";

function body(value: ReturnType<typeof callOkfSchemaTool>) {
  const first = value.content[0];
  assert.equal(first?.type, "text");
  return JSON.parse(first.type === "text" ? first.text : "") as Record<string, unknown>;
}

test("[AB-SCHEMA-001..003][AB-SCHEMA-006..011] MCP lists, reads and selects concrete versioned schemas", () => {
  assert.deepEqual(OKF_SCHEMA_TOOLS.map((tool) => tool.name), [
    "list_okf_schemas", "get_okf_schema", "select_okf_schemas", "validate_okf_concept", "validate_okf_relationships",
    "get_okf_authoring_schemas", "validate_okf_bundle", "validate_okf_changes",
  ]);
  assert.equal(body(callOkfSchemaTool("list_okf_schemas", {})).catalogVersion, "5.0.0");
  const lambda = body(callOkfSchemaTool("get_okf_schema", { type: "AWS Lambda" })).schema as {
    type: string; investigationQuestions: string[]; metadataGuidance: { field: string }[];
  };
  assert.equal(lambda.type, "AWS Lambda");
  assert.ok(lambda.investigationQuestions.length >= 6);
  assert.ok(lambda.metadataGuidance.some((item) => item.field === "handler"));
  const selected = body(callOkfSchemaTool("select_okf_schemas", { signals: ["terraform module", "aws sqs queue"] }));
  assert.equal(selected.advisory, true);
  assert.deepEqual((selected.recommendations as { type: string }[]).map((item) => item.type), ["AWS SQS Queue", "Terraform Module"]);
});

test("[AB-SCHEMA-013] MCP returns only selected complete schemas in one bounded call", () => {
  const selected = body(callOkfSchemaTool("get_okf_authoring_schemas", {
    signals: ["terraform module", "aws sqs queue"],
  }));
  assert.equal(selected.advisory, true);
  const schemas = selected.schemas as { type: string; investigationQuestions: string[] }[];
  assert.deepEqual(schemas.map((schema) => schema.type), ["AWS SQS Queue", "Terraform Module"]);
  assert.ok(schemas.every((schema) => schema.investigationQuestions.length > 0));
  assert.equal(schemas.some((schema) => schema.type === "Repository"), false);

  const excessive = callOkfSchemaTool("get_okf_authoring_schemas", {
    signals: Array.from({ length: 65 }, (_, index) => `signal-${index}`),
  });
  assert.equal(excessive.isError, true);
});

test("[AB-SCHEMA-004][AB-SCHEMA-005] MCP validates known policy and preserves unknown-type conformance", () => {
  const generated = "generated: { by: agentbase/0.0.0, at: 2026-08-12T00:00:00Z }";
  const valid = callOkfSchemaTool("validate_okf_concept", { path: "custom.md", content: `---\ntype: Custom Type\nstatus: draft\n${generated}\n---\nBody\n` });
  assert.equal(valid.isError, undefined);
  assert.equal(body(valid).knownSchema, false);
  const invalid = callOkfSchemaTool("validate_okf_concept", { path: "repository.md", content: "---\ntype: Repository\n---\nBody\n" });
  assert.equal(invalid.isError, true);
  assert.equal((body(invalid).failures as string[]).some((failure) => failure.includes("requires title")), true);
});

test("[AB-SCHEMA-012][AB-BENCH-030] MCP validates bounded relationship content without filesystem authority", () => {
  const generated = "generated: { by: agentbase/0.0.0, at: 2026-08-15T00:00:00Z }";
  const lambda = [
    "---", "type: AWS Lambda", "status: draft", generated, "sources:", "  - id: table-read",
    "    resource: repository://repository-orders-aaaaaaaaaaaa/src/worker.ts#L1-L10",
    "relationships:", "  - { kind: reads-from, target: orders, evidence: [table-read] }",
    "---", "", "Uses [orders](orders.md).", "",
  ].join("\n");
  const table = `---\ntype: Database Table\nstatus: draft\n${generated}\nrelationships: []\n---\n\nOrders.\n`;
  const valid = callOkfSchemaTool("validate_okf_relationships", { concepts: [
    { identity: "lambda", path: "lambda.md", content: lambda },
    { identity: "orders", path: "orders.md", content: table },
  ] });
  assert.equal(valid.isError, undefined);
  assert.equal(body(valid).valid, true);

  const invalid = callOkfSchemaTool("validate_okf_relationships", { concepts: [
    { identity: "lambda", path: "lambda.md", content: lambda.replace("Uses [orders](orders.md).", "No link.") },
    { identity: "orders", path: "orders.md", content: table },
  ] });
  assert.equal(invalid.isError, true);
  assert.match((body(invalid).failures as string[]).join("\n"), /no resolving Markdown link/);
  const schema = OKF_SCHEMA_TOOLS.find((tool) => tool.name === "validate_okf_relationships");
  assert.equal(schema && "output_path" in schema.inputSchema.properties, false);
});

test("[AB-SCHEMA-014] MCP validates concept policy and relationships in one bounded bundle call", () => {
  const generated = "generated: { by: agentbase/0.0.0, at: 2026-08-15T00:00:00Z }";
  const lambda = [
    "---", "title: Worker", "description: Processes orders.", "type: AWS Lambda", "status: draft", generated,
    "sources:", "  - id: table-read", "    resource: repository://repository-orders-aaaaaaaaaaaa/src/worker.ts#L1-L10",
    "relationships:", "  - { kind: reads-from, target: orders, evidence: [table-read] }", "---", "", "Uses [orders](orders.md).", "",
  ].join("\n");
  const table = [
    "---", "title: Orders", "description: Stores orders.", "type: Database Table", "status: draft", generated,
    "sources:", "  - id: table-definition", "    resource: repository://repository-orders-aaaaaaaaaaaa/template.yaml#L1-L10",
    "relationships: []", "---", "", "Orders table.", "",
  ].join("\n");
  const concepts = [
    { identity: "lambda", path: "lambda.md", content: lambda },
    { identity: "orders", path: "orders.md", content: table },
  ];
  const valid = callOkfSchemaTool("validate_okf_bundle", { concepts });
  assert.equal(valid.isError, undefined);
  assert.equal(body(valid).valid, true);

  const invalid = callOkfSchemaTool("validate_okf_bundle", { concepts: [
    { ...concepts[0], content: lambda.replace("title: Worker\n", "").replace("Uses [orders](orders.md).", "No link.") },
    concepts[1],
  ] });
  assert.equal(invalid.isError, true);
  const result = body(invalid);
  assert.match(JSON.stringify(result.concepts), /requires title/);
  assert.match((result.relationshipFailures as string[]).join("\n"), /no resolving Markdown link/);

  const schema = OKF_SCHEMA_TOOLS.find((tool) => tool.name === "validate_okf_bundle");
  assert.equal(schema && "output_path" in schema.inputSchema.properties, false);
  const excessive = callOkfSchemaTool("validate_okf_bundle", {
    concepts: Array.from({ length: 65 }, (_, index) => ({ identity: `${index}`, path: `${index}.md`, content: lambda })),
  });
  assert.equal(excessive.isError, true);
  const oversized = callOkfSchemaTool("validate_okf_bundle", {
    concepts: [{ identity: "large", path: "large.md", content: "x".repeat(262145) }],
  });
  assert.equal(oversized.isError, true);
});

test("[AB-SCHEMA-021] changed-set validation uses unchanged summaries instead of the whole Hub", () => {
  const lambda = [
    "---", "title: Worker", "description: Processes orders.", "type: AWS Lambda", "status: draft",
    "generated: { by: agentbase/0.0.0, at: 2026-08-15T00:00:00Z }", "sources:", "  - id: table-read",
    "    resource: repository://repository-orders-aaaaaaaaaaaa/src/worker.ts#L1-L10",
    "relationships:", "  - { kind: reads-from, target: data/orders, evidence: [table-read] }",
    "---", "", "Uses the [orders table](../data/orders.md).", "",
  ].join("\n");
  const changes = [{ identity: "components/worker", path: "components/worker.md", content: lambda }];
  const targets = [
    { identity: "data/orders", path: "data/orders.md", type: "Database Table" },
    ...Array.from({ length: 100 }, (_, index) => ({
      identity: `unrelated/${index}`, path: `unrelated/${index}.md`, type: "Custom Type",
    })),
  ];
  const valid = callOkfSchemaTool("validate_okf_changes", { changes, targets });
  assert.equal(valid.isError, undefined);
  assert.equal(body(valid).valid, true);
  const missing = callOkfSchemaTool("validate_okf_changes", { changes, targets: targets.slice(1) });
  assert.equal(missing.isError, true);
  assert.match((body(missing).relationshipFailures as string[]).join("\n"), /missing concept data\/orders/);
  const excessive = callOkfSchemaTool("validate_okf_changes", {
    changes, targets: Array.from({ length: 513 }, (_, index) => ({
      identity: `${index}`, path: `${index}.md`, type: "Custom Type",
    })),
  });
  assert.equal(excessive.isError, true);
});
