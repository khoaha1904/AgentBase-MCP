# Tasks: MCP reliability hardening

## Phase 0 — Documentation and consistency gate

- [X] T001 Update affected high-level product decisions in `docs/present/01`,
  `09`, `10` and `12`.
- [X] T002 Update low-level requirements for Code Graph, Ingest and Query with
  `AB-MCP-025..026`, `AB-INGEST-021` and `AB-QUERY-017..018`.
- [X] T003 Create this active capability and link it from `specs/CURRENT.md`.

## Phase 1 — P0

- [X] T004 Add failing inline-secret redaction tests and implement deterministic
  hint redaction in the discovery owner.
- [X] T005 Add failing invalid/oversized Published query tests and implement
  explicit failure/omission visibility without Draft fallback.
- [X] T006 Add provider parser contract fixtures for architecture, search, trace
  and snippet responses.

## Phase 2 — P1

- [X] T007 Add bounded architecture boundary/layer promotion or explicit
  not-promoted limitations.
- [X] T008 Reuse the existing valid-partial Crawler qualification evidence and
  generic non-Crawler fixture coverage; record remaining limitations.
- [X] T009 Record the owner-deferred upstream patch upgrade rehearsal; keep the
  pinned v0.10.8 runtime baseline unchanged.

## Phase 3 — P2 measurement

- [X] T010 Add a small Crawler query relevance dataset and report ranking
  metrics; do not add semantic/vector search.

## Phase 4 — Completion

- [X] T011 Reconcile high-level, low-level, spec, code and verification.
- [X] T012 Run `npm run verify`, record evidence and mark the capability complete.
