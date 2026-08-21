import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument } from "../documents/okf-document.ts";
import {
  AGENTBASE_OKF_SCHEMA_CATALOG_VERSION,
  getOkfConceptSchema,
  listOkfConceptSchemas,
  selectOkfConceptSchemas,
  validateConceptAgainstSchema,
} from "./catalog.ts";

test("[AB-SCHEMA-030] catalog 7 exposes eight Initial Ingest roles and isolates enrichment", () => {
  assert.equal(AGENTBASE_OKF_SCHEMA_CATALOG_VERSION, "7.0.0");
  assert.deepEqual(
    listOkfConceptSchemas().filter((item) => item.authoringScope === "initial-ingest").map((item) => item.type),
    ["Repository", "Domain", "System", "Component", "Function", "Interface", "Flow", "Resource"],
  );
  assert.deepEqual(
    listOkfConceptSchemas().filter((item) => item.authoringScope === "enrichment").map((item) => item.type),
    ["Entity", "Metric"],
  );
  assert.deepEqual(
    listOkfConceptSchemas().filter((item) => item.authoringScope === "governance").map((item) => item.type),
    ["Cross-Repository Relationship", "Maintainer Guidance"],
  );
});

test("[AB-SCHEMA-030][AB-SCHEMA-036] Initial Ingest selection stays sparse and provider-neutral", () => {
  assert.deepEqual(selectOkfConceptSchemas(["runtime function with independent trigger"]).map((item) => item.type), ["Function"]);
  assert.deepEqual(selectOkfConceptSchemas(["independent workload component"]).map((item) => item.type), ["Component"]);
  assert.deepEqual(selectOkfConceptSchemas(["shared message contract interface"]).map((item) => item.type), ["Interface"]);
  assert.deepEqual(selectOkfConceptSchemas(["business entity with stable identity"]), []);
  assert.deepEqual(selectOkfConceptSchemas(["performance metric definition"]), []);
  assert.deepEqual(selectOkfConceptSchemas(["message queue", "virtual machine", "database table"]), []);
  assert.deepEqual(selectOkfConceptSchemas(["business entity with stable identity"], "enrichment").map((item) => item.type), ["Entity"]);
  assert.deepEqual(selectOkfConceptSchemas(["performance metric definition"], "enrichment").map((item) => item.type), ["Metric"]);
});

test("[AB-SCHEMA-030][AB-SCHEMA-038][AB-SCHEMA-044] schemas describe useful boundaries rather than cloud products", () => {
  assert.equal(getOkfConceptSchema("Function")?.directoryHint, "components/<slug>.md");
  assert.match(getOkfConceptSchema("Component")?.purpose ?? "", /workload|build|ownership/);
  assert.match(getOkfConceptSchema("Resource")?.evidenceRequirements.join(" ") ?? "", /independent/);
  assert.match(getOkfConceptSchema("System")?.evidenceRequirements.join(" ") ?? "", /cooperating/);
  assert.equal(getOkfConceptSchema("Server"), undefined);
  assert.equal(getOkfConceptSchema("Queue"), undefined);
  const flowGuidance = getOkfConceptSchema("Flow")?.flowStepGuidance;
  assert.ok(flowGuidance?.actions.includes("invokes"));
  assert.deepEqual(flowGuidance?.requiredFields, ["order", "source", "action", "target", "mode", "evidence"]);
  assert.match(flowGuidance?.endpointRule ?? "", /identities of concepts.*never use embedded knowledge or free text/);
  assert.match(getOkfConceptSchema("Flow")?.evidenceRequirements.join(" ") ?? "", /supporting concept evidence/);
  assert.match(flowGuidance?.sourceRule ?? "", /prove the trigger, outcome and every described interaction/);
});

test("[AB-SCHEMA-035] catalog-6 authoring types fail while foreign types remain open-world", () => {
  for (const [type, guidance] of [
    ["Software Component", /use Component/],
    ["Business Flow", /use Flow/],
    ["API Surface", /use Interface/],
    ["Server", /re-ingest under catalog 7 promotion rules/],
    ["Queue", /re-ingest under catalog 7 promotion rules/],
    ["Database Table", /re-ingest under catalog 7 promotion rules/],
    ["AWS Lambda", /use Function/],
  ] as const) {
    const concept = parseConceptDocument("legacy.md", `---\ntype: ${type}\n---\nBody\n`);
    assert.match(validateConceptAgainstSchema(concept).join(" "), guidance);
  }
  const foreign = parseConceptDocument("custom.md", "---\ntype: Custom Domain Type\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(foreign), []);
});

test("[AB-SCHEMA-004] catalog-7 concepts retain normal required-field validation", () => {
  const known = parseConceptDocument("repositories/a.md", "---\ntype: Repository\n---\nBody\n");
  assert.deepEqual(validateConceptAgainstSchema(known), [
    "repositories/a.md: Repository requires title",
    "repositories/a.md: Repository requires description",
    "repositories/a.md: Repository requires generated",
    "repositories/a.md: Repository requires sources",
  ]);
});
