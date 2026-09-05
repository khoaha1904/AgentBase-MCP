import assert from "node:assert/strict";
import test from "node:test";

import {
  agentBaseCandidateHome,
  legacyConfirmedDomainHomePlan,
  normalizeAgentBaseInitialIngestHomePlan,
  validateAgentBaseInitialIngestHomePlan,
} from "./initial-ingest-home-plan.ts";
import { normalizeConfirmedDomain } from "./confirmed-domain.ts";
import { agentBaseProfileConceptPath } from "../documents/agentbase-profile.ts";

test("[AB-HOME-003][AB-HOME-006] normalizes one bounded deterministic home plan and derives Profile paths", () => {
  const plan = normalizeAgentBaseInitialIngestHomePlan({
    default_home: { kind: "domain", identity: "domains/orders", title: " Orders " },
    exceptions: [
      { candidate_id: "shared-api", home: { kind: "shared" } },
      { candidate_id: "billing", home: { kind: "domain", identity: "domains/billing", title: "Billing" } },
    ],
    participations: [
      { candidate_id: "shared-api", domain: { identity: "domains/orders", title: "Orders" } },
      { candidate_id: "billing", domain: { identity: "domains/billing", title: "Billing" } },
    ],
  });
  assert.equal(plan.defaultHome.kind, "domain");
  assert.deepEqual(plan.exceptions.map((entry) => entry.candidateId), ["billing", "shared-api"]);
  assert.equal(agentBaseCandidateHome(plan, "shared-api").kind, "shared");
  assert.equal(agentBaseCandidateHome(plan, "other").kind, "domain");
  assert.deepEqual(validateAgentBaseInitialIngestHomePlan(JSON.parse(JSON.stringify(plan))), plan);
  assert.equal(agentBaseProfileConceptPath({ kind: "domain", selector: "domains/orders" }, "Repository", "checkout"),
    "domains/orders/repositories/checkout.md");
  assert.equal(agentBaseProfileConceptPath({ kind: "shared" }, "Function", "worker"),
    "shared/knowledge/worker.md");
  assert.throws(() => agentBaseProfileConceptPath({ kind: "shared" }, "Domain", "orders"), /must match its Domain home/);
});

test("[AB-HOME-003..005][AB-HOME-008] rejects ambiguous plans and makes legacy participation explicit", () => {
  const exact = {
    default_home: { kind: "shared" },
    exceptions: [{ candidate_id: "api", home: { kind: "shared" } }],
    participations: [{ candidate_id: "api", domain: { identity: "domains/orders", title: "Orders" } }],
  };
  assert.throws(() => normalizeAgentBaseInitialIngestHomePlan({ ...exact, extra: true }), /unknown or missing/);
  assert.throws(() => normalizeAgentBaseInitialIngestHomePlan({ ...exact,
    exceptions: [...exact.exceptions, exact.exceptions[0]] }), /duplicated/);
  assert.throws(() => normalizeAgentBaseInitialIngestHomePlan({ ...exact,
    participations: [...exact.participations,
      { candidate_id: "worker", domain: { identity: "domains/orders", title: "Other" } }] }), /conflicting titles/);

  const domain = normalizeConfirmedDomain({ identity: "domains/orders", title: "Orders" });
  const compatibility = legacyConfirmedDomainHomePlan(domain, ["system", "repository", "system"]);
  assert.deepEqual(compatibility.participations.map((entry) => entry.candidateId), ["repository", "system"]);
  assert.deepEqual(compatibility.exceptions, []);
  assert.equal(compatibility.defaultHome.kind, "domain");
});
