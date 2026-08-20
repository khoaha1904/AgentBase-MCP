import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument } from "../documents/okf-document.ts";
import { readLiveClaims, validateBundleLiveClaims } from "./live-claims.ts";

const commit = "a".repeat(40);

function concept(id = "AB-CLAIM-session-ttl", extra = "", observed = `{ commit: ${commit}, dirty: false, dirty_digest: null }`, property = "session.ttl"): ReturnType<typeof parseConceptDocument> {
  return parseConceptDocument("systems/checkout.md", [
    "---",
    "type: System",
    "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
    "sources:",
    "  - id: ttl-source",
    "    resource: repository://repository-shop-123456789abc/src%2Fconfig.ts#L7-L9".replace("src%2Fconfig.ts", "src/config.ts"),
    "agentbase:",
    "  live_claims:",
    `    - id: ${id}`,
    "      subject: systems/checkout",
    `      property: ${property}`,
    "      role: configuration",
    "      source_id: ttl-source",
    "      target: { kind: symbol, name: SESSION_TTL_DAYS }",
    `      observed: ${observed}`,
    ...(extra ? extra.split("\n") : []),
    "---",
    "# Checkout",
  ].join("\n"));
}

test("[AB-CLAIM-001..003] reads a provenance-bearing live reference without a scalar snapshot", () => {
  const claims = readLiveClaims(concept());
  assert.equal(claims.length, 1);
  assert.equal(claims[0]?.source.resource,
    "repository://repository-shop-123456789abc/src/config.ts#L7-L9");
  assert.equal("value" in (claims[0] as object), false);
  assert.deepEqual(validateBundleLiveClaims([concept()]), []);
});

test("[AB-CLAIM-001..003] rejects duplicate IDs, missing sources and embedded observed values", () => {
  const duplicate = concept();
  const second = { ...concept(), path: "systems/other.md", conceptId: "systems/other" };
  const failures = validateBundleLiveClaims([
    duplicate,
    second,
    parseConceptDocument("systems/other.md", duplicate.body
      ? [
          "---", "type: System", "status: draft",
          "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
          "sources: [{ id: other, resource: repository://repository-shop-123456789abc/src/other.ts#L1-L1 }]",
          "agentbase:", "  live_claims:", "    - id: AB-CLAIM-session-ttl",
          "      subject: systems/other", "      property: session.ttl", "      role: implementation",
          "      source_id: missing", "      target: { kind: symbol, name: TTL }",
          `      observed: { commit: ${commit}, dirty: false, dirty_digest: null, value: 7 }`,
          "---", "# Other",
        ].join("\n") : ""),
  ]);
  assert.match(failures.join("\n"), /duplicate live claim ID/);
  assert.match(failures.join("\n"), /source_id does not resolve/);
  assert.match(failures.join("\n"), /observed contains unknown fields/);
});

test("[AB-CLAIM-002] dirty observations require a digest while clean observations require a commit", () => {
  const dirtyMissing = concept("AB-CLAIM-dirty").frontmatter;
  const source = [
    "---", "type: System", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
    "sources: [{ id: ttl-source, resource: repository://repository-shop-123456789abc/src/config.ts#L7-L9 }]",
    "agentbase:", "  live_claims:", "    - id: AB-CLAIM-dirty",
    "      subject: systems/checkout", "      property: session.ttl", "      role: configuration",
    "      source_id: ttl-source", "      target: { kind: symbol, name: TTL }",
    "      observed: { commit: null, dirty: true, dirty_digest: null }",
    "---", "# Checkout",
  ].join("\n");
  assert.ok(dirtyMissing);
  assert.match(validateBundleLiveClaims([parseConceptDocument("systems/checkout.md", source)]).join("\n"),
    /dirty observation requires dirty_digest/);
});

test("[AB-CLAIM-005] reads an optional bounded snapshot as observed and explicitly non-current", () => {
  const claim = readLiveClaims(concept("AB-CLAIM-snapshot", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, at: '2026-08-21T01:02:03Z', snapshot: 7 }`))[0];
  assert.deepEqual(claim?.observed.snapshot, {
    value: 7, observedAt: "2026-08-21T01:02:03Z", current: false,
  });
});

test("[AB-CLAIM-005] rejects snapshot without provenance time, unknown fields, multiline, large and secret-like values", () => {
  const failure = (...claims: ReturnType<typeof parseConceptDocument>[]) => validateBundleLiveClaims(claims).join("\n");
  const secretLikeValue = ["AKIA", "ABCDEFGHIJKLMNOP"].join("");
  assert.match(failure(concept("AB-CLAIM-no-time", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, snapshot: 7 }`)), /unknown fields or is incomplete/);
  assert.match(failure(concept("AB-CLAIM-unknown", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, at: '2026-08-21T01:02:03Z', snapshot: 7, current: true }`)), /unknown fields/);
  assert.match(failure(concept("AB-CLAIM-multiline", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, at: '2026-08-21T01:02:03Z', snapshot: "line\\nnext" }`)), /one non-empty line/);
  assert.match(failure(concept("AB-CLAIM-large", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, at: '2026-08-21T01:02:03Z', snapshot: '${"x".repeat(257)}' }`)), /at most 256/);
  assert.match(failure(concept("AB-CLAIM-secret", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, at: '2026-08-21T01:02:03Z', snapshot: '${secretLikeValue}' }`)), /secret-like/);
  const secretProperty = concept("AB-CLAIM-secret-name", "",
    `{ commit: ${commit}, dirty: false, dirty_digest: null, at: '2026-08-21T01:02:03Z', snapshot: 'plain' }`, "session.token");
  assert.match(failure(secretProperty), /secret-like/);
});
