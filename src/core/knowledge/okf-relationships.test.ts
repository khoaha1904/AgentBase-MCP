import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument, validateOkfRelationships } from "./index.ts";

const generated = "generated: { by: agentbase/0.0.0, at: 2026-08-15T00:00:00Z }";

function concept(documentPath: string, type: string, relationships: string, body: string) {
  return parseConceptDocument(documentPath, `---\ntype: ${type}\nstatus: draft\n${generated}\nrelationships:${relationships}\n---\n\n${body}\n`);
}

test("[AB-SCHEMA-012][AB-BENCH-030] validates targets and links while unknown guidance stays visible", () => {
  const lambda = concept("runtime/lambda.md", "AWS Lambda", "\n  - { kind: accesses, target: orders }", "Uses [orders](../data/orders.md).");
  const table = concept("data/orders.md", "Database Table", " []", "Orders.");
  const valid = validateOkfRelationships([
    { identity: "lambda", concept: lambda }, { identity: "orders", concept: table },
  ]);
  assert.deepEqual(valid.failures, []);
  assert.deepEqual(valid.relationships, [{ source: "lambda", kind: "accesses", target: "orders" }]);

  const missingLink = validateOkfRelationships([
    { identity: "lambda", concept: concept("runtime/lambda.md", "AWS Lambda", "\n  - { kind: accesses, target: orders }", "No link.") },
    { identity: "orders", concept: table },
  ]);
  assert.match(missingLink.failures.join("\n"), /no resolving Markdown link/);

  const missingTarget = validateOkfRelationships([{ identity: "lambda", concept: lambda }]);
  assert.match(missingTarget.failures.join("\n"), /missing concept orders/);

  const unsupported = validateOkfRelationships([
    { identity: "lambda", concept: concept("runtime/lambda.md", "AWS Lambda", "\n  - { kind: triggers, target: orders }", "Uses [orders](../data/orders.md).") },
    { identity: "orders", concept: table },
  ]);
  assert.deepEqual(unsupported.failures, []);
  assert.match(unsupported.warnings.join("\n"), /unjudged by AWS Lambda schema guidance/);
  assert.deepEqual(unsupported.relationships, [{ source: "lambda", kind: "triggers", target: "orders" }]);
});

test("[AB-SCHEMA-005][AB-SCHEMA-012] unknown schemas stay portable and identities are unambiguous", () => {
  const custom = concept("custom.md", "Custom Runtime", "\n  - { kind: uses, target: orders }", "Uses [orders](data/orders.md). ");
  const table = concept("data/orders.md", "Database Table", " []", "Orders.");
  assert.deepEqual(validateOkfRelationships([
    { identity: "custom", concept: custom }, { identity: "orders", concept: table },
  ]).failures, []);
  assert.match(validateOkfRelationships([
    { identity: "same", concept: custom }, { identity: "same", concept: table },
  ]).failures.join("\n"), /duplicate relationship identity same/);
});

test("[AB-SCHEMA-012] absolute bundle-relative Markdown links resolve portably", () => {
  const source = concept("components/cart.md", "Service", "\n  - { kind: uses, target: api }", "Uses [API](/interfaces/cart-api.md). ");
  const target = concept("interfaces/cart-api.md", "API Surface", " []", "Cart API.");
  const validation = validateOkfRelationships([
    { identity: "cart", concept: source }, { identity: "api", concept: target },
  ]);
  assert.deepEqual(validation.failures, []);
  assert.deepEqual(validation.relationships, [{ source: "cart", kind: "uses", target: "api" }]);
  assert.equal(validation.warnings.length, 1);
});
