import assert from "node:assert/strict";
import { test } from "node:test";

import { parseConceptDocument } from "../documents/okf-document.ts";
import {
  normalizeConfirmedDomain,
  validateConfirmedDomainAssignment,
} from "./confirmed-domain.ts";

const REPOSITORY = "repository-cart-aaaaaaaaaaaa";

function concept(path: string, type: string, sources: string, relationships = "", title = type === "Domain" ? "Commerce" : "Cart"):
ReturnType<typeof parseConceptDocument> {
  return parseConceptDocument(path, `---
type: ${type}
title: ${title}
status: draft
generated: { by: agentbase/5.0.0, at: 2026-08-16T00:00:00Z }
sources:
${sources}${relationships}
---

[Domain](../domains/commerce.md).
`);
}

test("[AB-SCHEMA-024] confirmed Domain has exact identity and deterministic owner evidence", () => {
  assert.deepEqual(normalizeConfirmedDomain({ identity: "domains/commerce", title: "Commerce" }), {
    identity: "domains/commerce",
    title: "Commerce",
    evidenceResource: "agentbase://owner-guidance/domains/commerce",
  });
  for (const value of [
    { identity: "commerce", title: "Commerce" },
    { identity: "domains/Commerce", title: "Commerce" },
    { identity: "domains/commerce/retail", title: "Commerce" },
    { identity: "domains/commerce", title: " " },
    { identity: "domains/commerce", title: "Commerce", extra: true },
  ]) assert.throws(() => normalizeConfirmedDomain(value), /confirmed Domain/);
});

test("[AB-SCHEMA-024] assignment requires the Domain and an owner-evidenced current-source System edge", () => {
  const domain = normalizeConfirmedDomain({ identity: "domains/commerce", title: "Commerce" });
  const domainConcept = concept("domains/commerce.md", "Domain",
    "  - id: owner-domain\n    resource: agentbase://owner-guidance/domains/commerce\n"
    + `  - id: repo\n    resource: repository://${REPOSITORY}/README.md#L1-L2\n`);
  const system = concept("systems/cart.md", "System",
    `  - id: repo\n    resource: repository://${REPOSITORY}/README.md#L1-L2\n`
    + "  - id: owner-domain\n    resource: agentbase://owner-guidance/domains/commerce\n",
    "relationships:\n  - kind: part-of\n    target: domains/commerce\n    evidence: [owner-domain]\n");
  const concepts = new Map([[domainConcept.conceptId, domainConcept], [system.conceptId, system]]);
  assert.deepEqual(validateConfirmedDomainAssignment(concepts, domain, REPOSITORY, true), []);
  assert.match(validateConfirmedDomainAssignment(new Map([[system.conceptId, system]]), domain, REPOSITORY, true)[0] ?? "", /missing/);
  const wrongTitle = concept("domains/commerce.md", "Domain",
    "  - id: owner-domain\n    resource: agentbase://owner-guidance/domains/commerce\n"
    + `  - id: repo\n    resource: repository://${REPOSITORY}/README.md#L1-L2\n`, "", "Retail");
  assert.match(validateConfirmedDomainAssignment(
    new Map([[wrongTitle.conceptId, wrongTitle], [system.conceptId, system]]), domain, REPOSITORY, true,
  )[0] ?? "", /does not match/);
  const unsupported = concept("systems/cart.md", "System",
    `  - id: repo\n    resource: repository://${REPOSITORY}/README.md#L1-L2\n`,
    "relationships:\n  - kind: part-of\n    target: domains/commerce\n    evidence: [repo]\n");
  assert.match(validateConfirmedDomainAssignment(
    new Map([[domainConcept.conceptId, domainConcept], [unsupported.conceptId, unsupported]]),
    domain, REPOSITORY, true,
  )[0] ?? "", /owner-guidance evidence/);
});
