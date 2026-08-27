# Tasks: Hub Query Quality

**Input**: Design documents from `/specs/049-hub-query-quality/`

**Prerequisites**: Owner approval of the exact new production dependency,
[plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/hub-query-mcp.md](contracts/hub-query-mcp.md)

## Format

`[ID] [P?] [Story] Description`

- **[P]**: Different files and no dependency on an incomplete task.
- **[Story]**: User story from the feature specification.
- Tests are written first and must fail for the intended missing behavior.

## Phase 1: Setup and approval gate

**Purpose**: Add the reviewed standard lexical engine without widening runtime
authority.

- [X] T001 After explicit owner approval, pin `minisearch@7.2.0` in `package.json` and `package-lock.json`, record its license/version in `specs/049-hub-query-quality/plan.md`, and verify it introduces no runtime dependencies

**Checkpoint**: Do not start implementation or modify package files before the
owner approves the dependency.

---

## Phase 2: Foundational transient records

**Purpose**: Define the shared Markdown-section and search-record boundaries
used by every story.

- [X] T002 Add failing bounds, heading-hierarchy, root-section, whitespace-preservation and deterministic-ID tests in `src/core/knowledge/query/hub-markdown-sections.test.ts`
- [X] T003 Implement bounded heading-aware transient section parsing in `src/core/knowledge/query/hub-markdown-sections.ts`
- [X] T004 Add allowlisted tag extraction and section storage to `HubGraphConcept` in `src/core/knowledge/query/hub-query-graph.ts` without exposing arbitrary frontmatter

**Checkpoint**: Valid Published concepts project into deterministic concept and
section records without creating persisted files or changing exact read.

---

## Phase 3: User Story 1 — Find the right concept with ordinary terms (P1) 🎯 MVP

**Goal**: Multi-term Markdown discovery uses established relevance, preserves
exact lookup precedence and returns one concept with a real best-section
excerpt.

**Independent Test**: The curated fixture returns every expected concept in the
top five; exact identity/path/title remains first; repeated section hits
collapse; body-only whitespace matches have a non-empty heading-aware excerpt.

### Tests

- [X] T005 [P] [US1] Add failing BM25+ field, exact-precedence, stable-tie, disabled-prefix/fuzzy, section-collapse and exact-commit lazy-cache/rebuild/failure tests in `src/core/knowledge/query/hub-query-search-index.test.ts`
- [X] T006 [P] [US1] Expand `src/core/knowledge/query/hub-query.test.ts` with failing title/description/tags/heading/body multi-term cases and the current whitespace-offset regression

### Implementation

- [X] T007 [US1] Implement the version-bound MiniSearch adapter, allowlisted section records, conservative boosts, canonical-path tie-break and atomic one-commit in-memory projection cache in `src/core/knowledge/query/hub-query-search-index.ts`
- [X] T008 [US1] Replace substring orchestration with exact pre-pass, lexical section search and one-concept collapse while retaining existing compatibility fields in `src/core/knowledge/query/hub-query.ts`
- [X] T009 [US1] Add Published-commit search/read isolation coverage for the additive result shape in `src/app/hub-okf/query/query.test.ts`

**Checkpoint**: User Story 1 is independently usable through the existing MCP
search/read flow.

---

## Phase 4: User Story 2 — Search the complete Domain context (P1)

**Goal**: Exact Domain scope includes canonical members,
Repository-associated concepts and only direct boundary endpoints.

**Independent Test**: A two-Domain fixture returns all expected associated
concepts and zero unrelated-Domain concepts while explaining each scope role.

### Tests

- [X] T010 [US2] Add failing two-Domain canonical-member, Repository-association, cycle and one-hop-boundary tests to `src/core/knowledge/query/hub-query.test.ts`

### Implementation

- [X] T011 [US2] Extend cycle-safe Domain eligibility with `member`, `repository-associated` and `boundary` evidence in `src/core/knowledge/query/hub-query-graph.ts`
- [X] T012 [US2] Apply Domain eligibility before lexical result composition and emit additive bounded scope evidence in `src/core/knowledge/query/hub-query.ts`

**Checkpoint**: User Stories 1 and 2 pass independently; stored canonical
`part-of` membership remains unchanged.

---

## Phase 5: User Story 3 — Discover accepted relations without guessing documents (P2)

**Goal**: Search and selected results use portable Markdown links plus accepted
AgentBase canonical relations/Flows without inventing topology.

**Independent Test**: Endpoint/predicate/action terms discover the expected
concept and return the stored direct context; portable links remain untyped;
missing topology returns no invented relation.

### Tests

- [X] T013 [P] [US3] Add failing portable link/backlink, accepted inbound/outbound relation, Flow-step and insufficient-topology tests in `src/core/knowledge/query/hub-query-graph.test.ts`
- [X] T014 [P] [US3] Add failing context relevance, direction/evidence, deterministic bound and omitted-count tests in `src/core/knowledge/query/hub-query-search-index.test.ts`

### Implementation

- [X] T015 [US3] Reuse `validateOkfRelationships` and expose resolved portable links, backlinks, accepted relationships and Flow steps from `src/core/knowledge/query/hub-query-graph.ts`
- [X] T016 [US3] Add allowlisted link/relation/Flow index text and bounded direct-context composition without recursive expansion in `src/core/knowledge/query/hub-query-search-index.ts` and `src/core/knowledge/query/hub-query.ts`

**Checkpoint**: All three stories work through the unchanged public tool names
and input fields.

---

## Phase 6: Qualification and handoff

**Purpose**: Prove correctness, bounds, performance and living-contract
alignment.

- [X] T017 Add the deterministic 1,000-concept top-five recall, index-build latency, query latency and bound qualification to `scripts/benchmark/benchmark-okf.mjs`
- [X] T018 Update implemented statuses and final requirement evidence in `docs/design/10-query-routing/06-hub-search-and-ranking.md`, `docs/design/10-query-routing/07-runtime-requirements.md`, `docs/present/10-querying-code-graph-and-hub.md` and `specs/049-hub-query-quality/spec.md`
- [X] T019 Run every command in `specs/049-hub-query-quality/quickstart.md`, then run `npm run verify` and record the successful evidence in `specs/049-hub-query-quality/plan.md`
- [X] T020 Mark capability 049 completed and restore the deferred selector only after all required evidence passes in `specs/CURRENT.md` and `.specify/feature.json`

---

## Dependencies and execution order

### Phase dependencies

- Phase 1 is an owner approval gate.
- Phase 2 depends on T001 and blocks every story.
- User Story 1 depends on Phase 2 and is the MVP.
- User Story 2 depends on the User Story 1 search pipeline, but its fixture and
  scope logic remain independently testable.
- User Story 3 depends on the User Story 1 index/result boundary; its graph tests
  can be prepared in parallel with User Story 2.
- Qualification depends on all selected stories.

### Parallel opportunities

- T005 and T006 cover different test files and can run in parallel.
- After User Story 1, T010 and T013 can be authored in parallel.
- T013 and T014 cover graph and search-index boundaries and can run in parallel.
- Documentation review for T018 can begin while T017 qualification is prepared,
  but status must not change to implemented before evidence passes.

## Implementation strategy

### MVP first

1. Obtain dependency approval and complete Phase 2.
2. Implement User Story 1 only.
3. Run its focused and Published-isolation tests.
4. Stop and evaluate curated recall before adding scope/relation behavior.

### Incremental delivery

1. Add Domain eligibility as the second independently testable slice.
2. Add portable link and accepted relation context as the third slice.
3. Run the 1,000-concept qualification and complete living-doc handoff.
4. Keep semantic search, fuzzy/prefix matching, Pagefind and the Domain-site UI
   outside capability 049.
