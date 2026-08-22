import assert from "node:assert/strict";
import test from "node:test";

import { parseConceptDocument, type OkfValue } from "../documents/okf-document.ts";
import {
  createObservedValueId,
  normalizeRepositoryObservedValues,
  readObservedValues,
  readObservedValuesForQuery,
  validateBundleObservedValues,
} from "./observed-values.ts";

const repositoryId = "repository-shop-123456789abc";
const commit = "a".repeat(40);
const laterCommit = "b".repeat(40);
const observedAt = "2026-08-21T01:02:03Z";

function authored(options: Readonly<{
  resource?: string;
  property?: string;
  value?: string | number | boolean;
  id?: string;
}> = {}): ReturnType<typeof parseConceptDocument> {
  const resource = options.resource ?? `repository://${repositoryId}/src/config.ts`;
  return parseConceptDocument("systems/checkout.md", [
    "---",
    "type: System",
    "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
    "sources:",
    "  - id: ttl-source",
    `    resource: ${resource}`,
    "agentbase:",
    "  observed_values:",
    ...(options.id ? [`    - id: ${options.id}`] : ["    - subject: systems/checkout"]),
    ...(options.id ? ["      subject: systems/checkout"] : []),
    `      property: ${options.property ?? "session.ttl"}`,
    "      role: configuration",
    `      value: ${typeof options.value === "string" ? `'${options.value}'` : String(options.value ?? 7)}`,
    "      source_id: ttl-source",
    "---",
    "# Checkout",
  ].join("\n"));
}

function normalized(
  concept = authored(),
  previous?: ReturnType<typeof parseConceptDocument>,
  sourceState: Readonly<{ commit: string | null; dirty: boolean; dirtyDigest: string | null }>
    = { commit, dirty: false, dirtyDigest: null },
  at = observedAt,
) {
  return normalizeRepositoryObservedValues(concept, {
    repositoryId,
    sourceState,
    observedAt: at,
    ...(previous ? { previous } : {}),
  });
}

test("[AB-VALUE-001..007] normalizes one clean repository value and derives its exact owned Markdown view", () => {
  const concept = normalized();
  const values = readObservedValues(concept);
  assert.equal(values.length, 1);
  assert.deepEqual(values[0]?.source, {
    resource: `repository://${repositoryId}/src/config.ts`, repositoryId, relativePath: "src/config.ts",
  });
  assert.equal(values[0]?.id, createObservedValueId({
    conceptId: "systems/checkout", subject: "systems/checkout", property: "session.ttl",
    role: "configuration", sourceResource: `repository://${repositoryId}/src/config.ts`,
  }));
  assert.match(concept.body, /<!-- agentbase:observed-values:start -->/);
  assert.match(concept.body, new RegExp(`${commit}, ${observedAt}`));
  assert.deepEqual(validateBundleObservedValues([concept]), []);
});

test("[AB-VALUE-001, AB-VALUE-006] strict validation rejects duplicate IDs, a foreign owner and a missing source", () => {
  const first = normalized();
  const duplicate = first;
  const foreignOwner = { ...first, path: "systems/other.md", conceptId: "systems/other" };
  const missingSource = parseConceptDocument("systems/checkout.md", [
    "---", "type: System", "status: draft",
    "generated: { by: agentbase/0.0.0, at: '2026-08-17T00:00:00Z' }",
    "agentbase:", "  observed_values:", `    - id: AB-OBS-${"1".repeat(24)}`,
    "      subject: systems/checkout", "      property: session.ttl", "      role: configuration",
    "      value: 7", "      source_id: missing",
    `      observed: { commit: ${commit}, dirty: false, dirty_digest: null, at: '${observedAt}' }`,
    "---", "# Checkout",
    "", "<!-- agentbase:observed-values:start -->", "## Observed values", "<!-- agentbase:observed-values:end -->",
  ].join("\n"));
  const failures = validateBundleObservedValues([first, duplicate, foreignOwner, missingSource]).join("\n");
  assert.match(failures, /duplicate observed value ID/);
  assert.match(failures, /subject must equal owning concept systems\/other/);
  assert.match(failures, /source_id does not resolve/);
});

test("[AB-VALUE-004, AB-VALUE-007] accepts optional spans and requires exact clean, dirty or unborn source state", () => {
  const dirty = normalized(authored({ resource: `repository://${repositoryId}/src/config.ts#L7-L9` }), undefined, {
    commit, dirty: true, dirtyDigest: `sha256:${"d".repeat(64)}`,
  });
  assert.equal(readObservedValues(dirty)[0]?.source.startLine, 7);
  const unborn = normalized(authored(), undefined, {
    commit: null, dirty: true, dirtyDigest: `sha256:${"e".repeat(64)}`,
  });
  assert.equal(readObservedValues(unborn)[0]?.observed.commit, null);
  assert.throws(() => normalized(authored(), undefined, { commit: null, dirty: false, dirtyDigest: null }),
    /clean observation requires commit/);
  assert.throws(() => normalized(authored(), undefined, { commit, dirty: true, dirtyDigest: null }),
    /dirty observation requires dirty_digest/);
});

test("[AB-VALUE-001, AB-VALUE-006] Refresh keeps stream identity and unchanged state but stamps changed values and reviewed moves", () => {
  const previous = normalized();
  const unchanged = normalized(authored(), previous, {
    commit: laterCommit, dirty: false, dirtyDigest: null,
  }, "2026-08-22T01:02:03Z");
  assert.deepEqual(readObservedValues(unchanged)[0]?.observed, readObservedValues(previous)[0]?.observed);
  const changed = normalized(authored({ value: 8 }), previous, {
    commit: laterCommit, dirty: false, dirtyDigest: null,
  }, "2026-08-22T01:02:03Z");
  assert.equal(readObservedValues(changed)[0]?.id, readObservedValues(previous)[0]?.id);
  assert.equal(readObservedValues(changed)[0]?.observed.commit, laterCommit);
  const previousId = readObservedValues(previous)[0]!.id;
  const moved = normalized(authored({
    id: previousId, resource: `repository://${repositoryId}/src/runtime-config.ts`,
  }), previous);
  assert.equal(readObservedValues(moved)[0]?.id, previousId);
  assert.equal(readObservedValues(moved)[0]?.source.relativePath, "src/runtime-config.ts");
  const previousAgentbase = previous.frontmatter.agentbase as Readonly<Record<string, OkfValue>>;
  const { observed_values: _omitted, ...withoutValues } = previousAgentbase;
  const omitted = { ...previous, frontmatter: { ...previous.frontmatter, agentbase: withoutValues }, body: "# Checkout" };
  assert.equal(readObservedValues(normalized(omitted, previous))[0]?.id, previousId);
  const removed = normalizeRepositoryObservedValues(previous, {
    repositoryId,
    sourceState: { commit: laterCommit, dirty: false, dirtyDigest: null },
    observedAt: "2026-08-22T01:02:03Z",
    previous,
    removeRepositoryContribution: true,
  });
  assert.deepEqual(readObservedValues(removed), []);
});

test("[AB-VALUE-002, AB-VALUE-005] rejects unsafe, oversized and manually drifted values", () => {
  const secretLikeValue = ["AKIA", "ABCDEFGHIJKLMNOP"].join("");
  assert.throws(() => normalized(authored({ property: "session.token" })), /secret-like/);
  assert.throws(() => normalized(authored({ value: secretLikeValue })), /secret-like/);
  assert.throws(() => normalized(authored({ value: "x".repeat(257) })), /at most 256/);
  const concept = normalized();
  assert.match(validateBundleObservedValues([{ ...concept, body: `${concept.body}\n\n## Observed values` }]).join("\n"),
    /heading must be renderer-owned/);
  assert.match(validateBundleObservedValues([{ ...concept, body: concept.body.replace("session.ttl", "session.changed") }]).join("\n"),
    /section is missing or stale/);
  const agentbase = concept.frontmatter.agentbase as Readonly<Record<string, OkfValue>>;
  const raw = agentbase.observed_values as readonly Readonly<Record<string, OkfValue>>[];
  const historicalUnsafe = {
    ...concept,
    frontmatter: {
      ...concept.frontmatter,
      agentbase: { ...agentbase, observed_values: [{ ...raw[0]!, property: "session.token" }] },
    },
    body: concept.body.replace("session.ttl", "session.token"),
  };
  assert.throws(() => readObservedValues(historicalUnsafe), /secret-like/);
  assert.deepEqual(readObservedValuesForQuery(historicalUnsafe)[0]?.value, "[redacted]");
  assert.equal(readObservedValuesForQuery(historicalUnsafe)[0]?.sensitivityWarning,
    "obvious-sensitive-value-redacted");
});
