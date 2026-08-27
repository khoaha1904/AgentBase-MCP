# Capability 051 — MCP reliability hardening

> Status: complete; documentation gate approved before implementation.

## Objective

Harden the existing Code Graph → Discovery → OKF → Published Query path without
adding a new query language, durable index, vector database, provider or OKF
field. The first qualification domain is Crawler; runtime behavior remains
repository-generic.

## Owner decisions

- P0 safety and failure visibility ship before broader qualification.
- Query remains in design area 10 and uses the existing MiniSearch BM25+
  projection plus exact Published read.
- Invalid Published Markdown must fail clearly; bounded oversized content must
  remain observable as an omission/limitation.
- Discovery hints must redact inline credential-like values before Agent context.
- Architecture boundaries/layers may improve discovery only within existing
  bounds; they must not create an unbounded crawl or model context.
- Crawler is the qualification fixture, not a runtime-specific ontology.
- Semantic/vector search, remote source reading, Batch Refresh and provider
  expansion remain deferred.

## Owner-deferred work

- The upstream Codebase Memory patch-upgrade rehearsal is intentionally deferred
  for this capability. The pinned v0.10.8 runtime remains the qualification
  baseline; no provider admission or runtime upgrade change is made here.

## User stories

### US1 — Safe and truthful discovery (P0)

Source hints never expose inline secrets, and partial provider output remains
visible as a limitation, Question or ignored reason.

### US2 — Truthful Published query (P0)

Search/read never presents a silently incomplete graph as complete and never
falls back to Local Draft or remote candidate bytes.

### US3 — More useful bounded discovery (P1)

Captured architecture boundaries/layers can contribute bounded discovery signal
without making ingest specific to Crawler or unbounded for large repositories.

### US4 — Provider and qualification confidence (P1/P2)

Parser contracts and a Crawler query/ingest qualification provide evidence
beyond unit-test success; the upstream upgrade rehearsal is owner-deferred.

## Non-goals

- No new public MCP tool or query syntax.
- No `summary` field, durable search index, vector database or daemon.
- No automatic publication, semantic winner selection or source write-back.
- No Batch Refresh, remote repository reader or new cloud provider profile.

## Acceptance evidence

- Requirement-linked tests for redaction, malformed/oversized Published behavior,
  parser response contracts and bounded architecture promotion.
- Crawler qualification completes with explicit limitations and no raw secret
  hints.
- At least one non-Crawler fixture confirms generic behavior.
- `npm run spec:check`, focused tests, `npm run verify` and `git diff --check`
  pass.
- The pinned Codebase Memory v0.10.8 baseline remains unchanged; upgrade
  rehearsal is not a release gate for this capability.
- If any gap changes observable workflow, authority, security, schema,
  lifecycle, latency or scope, implementation stops and this spec plus the
  affected high/low-level documents are revised before continuing.

## Current implementation evidence

- P0 redaction, truthful Published query failure/omission behavior and provider
  parser contract tests are implemented.
- Captured architecture boundaries/layers/hotspots/clusters are currently
  reported as explicit not-promoted limitations when they lack exact source
  paths; no unbounded candidate expansion is introduced.
- Focused P0/P1 tests, TypeScript and specification checks pass. The existing
  valid-partial Crawler V22 model run remains the truthful model evidence; this
  hardening slice does not change the authoring prompt or schema contract, so a
  second model run is not required for closure. Its review limitation remains
  explicit. Generic fixture coverage is green.
- Deterministic Crawler lexical qualification covers three representative
  queries with 100% top-five recall in
  `src/core/knowledge/query/hub-query.test.ts`. Capability 049's larger
  1,000-concept qualification remains the baseline metric (100/100 top-five
  recall, 845.539 ms build, 31.542 ms query p95).
- The final repository gate passes: 90 tests, typecheck, dependency checks,
  secret scan, Hub validator and `git diff --check`.
