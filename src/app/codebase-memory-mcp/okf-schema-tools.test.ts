import assert from "node:assert/strict";
import test from "node:test";
import { callOkfSchemaTool, OKF_SCHEMA_TOOLS } from "./okf-schema-tools.ts";

function body(value: ReturnType<typeof callOkfSchemaTool>) {
  const first = value.content[0];
  assert.equal(first?.type, "text");
  return JSON.parse(first.type === "text" ? first.text : "") as Record<string, unknown>;
}

test("[AB-SCHEMA-001..003][AB-SCHEMA-006..011] MCP lists, reads and selects concrete versioned schemas", () => {
  assert.deepEqual(OKF_SCHEMA_TOOLS.map((tool) => tool.name), ["list_okf_schemas", "get_okf_schema", "select_okf_schemas", "validate_okf_concept", "validate_okf_relationships"]);
  assert.equal(body(callOkfSchemaTool("list_okf_schemas", {})).catalogVersion, "3.0.0");
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
  const lambda = `---\ntype: AWS Lambda\nstatus: draft\n${generated}\nrelationships:\n  - { kind: accesses, target: orders }\n---\n\nUses [orders](orders.md).\n`;
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
