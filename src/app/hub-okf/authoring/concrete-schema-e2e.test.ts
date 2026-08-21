import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getOkfConceptSchema,
  listOkfConceptSchemas,
  parseConceptDocument,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
} from "../../../core/knowledge/index.ts";

type CatalogCase = Readonly<{ type: string; signals: readonly string[] }>;
type EvidenceFixture = Readonly<{
  signals: readonly string[];
  instances: readonly Readonly<{ type: string; slug: string }>[];
  mustNotCreate: readonly string[];
}>;

const fixtureRoot = path.resolve(import.meta.dirname, "../../../../fixtures/okf-schema-catalog");

test("[AB-SCHEMA-007] every initial concrete schema has a validation/selection fixture", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "catalog-cases.json"), "utf8")) as {
    catalogVersion: string;
    cases: readonly CatalogCase[];
  };
  assert.equal(fixture.catalogVersion, "7.0.0");
  assert.deepEqual(
    fixture.cases.map((item) => item.type),
    listOkfConceptSchemas().filter((item) => item.authoringScope === "initial-ingest" && item.selectWhen.length).map((item) => item.type),
  );
  for (const current of fixture.cases) {
    assert.ok(getOkfConceptSchema(current.type));
    assert.ok(selectOkfConceptSchemas(current.signals).some((item) => item.type === current.type));
  }
});

test("[AB-SCHEMA-002][AB-SCHEMA-003][AB-SCHEMA-008][SC-005] provider-neutral runtime rehearsal is sparse and supports repeated types", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "aws-server-evidence.json"), "utf8")) as EvidenceFixture;
  const selected = selectOkfConceptSchemas(fixture.signals).map((item) => item.type);
  assert.deepEqual(selected, ["Function", "Component"]);
  assert.equal(fixture.instances.filter((item) => item.type === "Function").length, 2);
  for (const instance of fixture.instances) {
    assert.ok(selected.includes(instance.type));
    const concept = parseConceptDocument(`repositories/orders/${instance.slug}.md`, [
      "---",
      `type: ${instance.type}`,
      `title: ${instance.slug}`,
      `description: Evidence-backed ${instance.type}`,
      "status: draft",
      "generated: { by: 'agentbase/0.0.0', at: '2026-08-12T00:00:00Z' }",
      "sources:",
      "  - resource: repository://repository-orders-aaaaaaaaaaaa/src/main.ts#L1-L2",
      "---",
      "",
      "# Evidence and Limitations",
      "",
      "Authored only from the fixture evidence.",
      "",
    ].join("\n"));
    assert.deepEqual(validateConceptAgainstSchema(concept), []);
  }
  for (const unused of fixture.mustNotCreate) assert.equal(fixture.instances.some((item) => item.type === unused), false);
  assert.equal(selected.includes("Queue"), false);
});
