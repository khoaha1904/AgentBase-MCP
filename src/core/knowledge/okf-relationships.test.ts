import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument, validateOkfRelationships } from "./index.ts";

const generated = "generated: { by: agentbase/0.0.0, at: 2026-08-15T00:00:00Z }";

function concept(documentPath: string, type: string, relationships: string, body: string) {
  return parseConceptDocument(documentPath, `---\ntype: ${type}\nstatus: draft\n${generated}\nrelationships:${relationships}\n---\n\n${body}\n`);
}

test("[AB-SCHEMA-012][AB-BENCH-030] validates targets, links and known schema guidance", () => {
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
  assert.match(unsupported.failures.join("\n"), /unsupported by AWS Lambda schema guidance/);
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
