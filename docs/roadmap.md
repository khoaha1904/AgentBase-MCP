# Roadmap

## Phase 0: Clean foundation

- Establish repository routing, product vocabulary and architecture rules.
- Select the runtime and minimal toolchain with evidence.
- Add module ownership, dependency and review-size checks.
- Implement one provider-neutral Code Intelligence contract and deterministic
  fake.

Exit: a new session can implement a focused capability without reading legacy
code, and architecture rules fail automatically when violated.

## Phase 1: Local Code Intelligence baseline

- Define conformance fixtures and measurable latency/token-reduction goals.
- Pin and integrate one Codebase Memory MCP version behind the adapter.
- Isolate binary, process and caches from user installations.
- Prove index, refresh, repository map and relevant-subgraph queries.
- Benchmark against direct source reading and at least one alternative engine.

Exit: Part 1 is independently useful to a coding agent without AI-heavy
investigation or cloud credentials.

## Phase 2: Observation bridge

- Define stable observation schema, provenance and analyzer identity.
- Select a deliberately narrow first observation family.
- Prove equivalent observations can emerge from non-identical local graphs.
- Prevent engine-private schema from entering durable knowledge.

Exit: a source revision produces reviewable, reproducible observation batches.

## Phase 3: Governed OKF lifecycle

- Propose OKF changes against existing knowledge.
- Add review, acceptance, conflict, stale, detach and supersede semantics.
- Prove cumulative re-ingest across independent evidence rounds.
- Make missing observations non-destructive by default.

Exit: repeated investigations improve knowledge while preserving provenance and
human control.

## Phase 4: Enrichment and hardening

- Add optional Terraform/Terragrunt or cloud-assisted evidence collectors.
- Add provider permission UX and explicit degradation behavior.
- Harden upgrades, rollback, performance, packaging and multi-repository use.
- Reassess legacy features only when a measured product need remains.
