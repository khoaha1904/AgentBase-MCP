# Tasks: Single-Repository OKF Walking Skeleton

- **Status:** Completed; optional benchmark deferred without blocking release
- **Feature:** `002-single-repo-okf-walking-skeleton`

## Phase 1: Managed provider research and spike

Goal: capture real provider behavior and select the one new parser dependency
before shaping runtime contracts.

- [x] T001 Pin and resolve managed dependency `codebase-memory-mcp@0.10.1`, verify npm/package/native identity, then run its package-private binary against an exact disposable fixture copy and record sanitized command, output, process, cache and repository-mutation evidence in `fixtures/codebase-memory-v0.10.1/manifest.json`, `fixtures/codebase-memory-v0.10.1/responses/`, and `specs/002-single-repo-okf-walking-skeleton/research.md`
- [x] T002 Record the managed-package bootstrap, no-`PATH`/no-global-reuse boundary, mutation result, direct-index/mirror choice and rollback boundary in `docs/decisions/0005-codebase-memory-mvp-boundary.md`
- [x] T003 Evaluate maintained YAML parsers for safe frontmatter parsing, duplicate-key/alias/resource/size limits, bare-`verified` normalization and unknown-value round-trip behavior, then record the selected dependency and lockfile evidence in `docs/decisions/0006-okf-v02-yaml-boundary.md`, `package.json`, and `package-lock.json`
- [x] T004 [P] Define sanitized provider-response metadata and accepted structural task evidence in `fixtures/codebase-memory-v0.10.1/fixture.json`
- [x] T005 [P] Add provider cache, mirror, proposal, staging, backup and recovery exclusions while keeping shared `okf/` visible in `.gitignore`

Independent evidence: package install/bootstrap is checksum-verified and no
user-selected repository is indexed before T001; T003 proves exact YAML behavior
with a small dependency rather than hand-written general parsing.

## Phase 2: Foundational contracts and ownership

Goal: establish provider-neutral context, repository evidence and owned
capability boundaries before application code expands.

- [x] T006 Register `core/observations`, `core/knowledge`, `providers/codebase-memory`, and `app/repository-okf` roots with exact public entrypoints in `scripts/module-boundaries.json`
- [x] T007 [P] Add active-capability and future `AB-MVP-*` living-contract gate scenarios in `scripts/check-specs.test.mjs`
- [x] T008 [P] Write repository-overview and task-context contract scenarios derived from the real provider spike in `src/core/code-intelligence/contract.test.ts`
- [x] T009 Extend provider-neutral task-context values, result unions, normalization and conformance helpers in `src/core/code-intelligence/contract.ts`, `src/core/code-intelligence/normalize.ts`, `src/core/code-intelligence/conformance.ts`, and `src/core/code-intelligence/index.ts`
- [x] T010 [P] Write source-state, path-safety and deterministic evidence-digest tests in `src/core/observations/repository-evidence.test.ts`
- [x] T011 Implement the minimal `RepositoryEvidenceBundle` model, normalization and public entrypoint in `src/core/observations/repository-evidence.ts`, `src/core/observations/normalize.ts`, and `src/core/observations/index.ts`
- [x] T012 Adapt the deterministic fake to the task-context conformance without removing the completed foundation map flow in `src/providers/fake-code-intelligence/fake-provider.ts`, `src/providers/fake-code-intelligence/fake-provider.test.ts`, and `src/providers/fake-code-intelligence/index.ts`

Independent evidence: fake and captured fixtures satisfy the same task-context
scenarios while existing `AB-FND-*` behavior remains green.

## Phase 3: User Story 1 — Real bounded repository evidence (P1)

Goal: prepare one current, bounded evidence bundle through a verified one-shot
Codebase Memory process.

- [x] T013 [P] [US1] Write managed-package resolution, missing/offline/integrity/identity, no-`PATH`, timeout, output-limit, exit, malformed-output and conflict tests in `src/providers/codebase-memory/process.test.ts`
- [x] T014 [P] [US1] Write captured `v0.10.1` architecture, search, trace, snippet and mutation-contract tests in `src/providers/codebase-memory/adapter.test.ts`
- [x] T015 [US1] Implement exact managed-package bootstrap/resolution, shell-free bounded child-process invocation and typed provider diagnostics in `src/providers/codebase-memory/managed-package.ts`, `src/providers/codebase-memory/process.ts`, and `src/providers/codebase-memory/errors.ts`
- [x] T016 [US1] Implement the exact-version adapter and public provider factory from captured output in `src/providers/codebase-memory/adapter.ts` and `src/providers/codebase-memory/index.ts`
- [x] T017 [P] [US1] Write commit-plus-dirty-digest discovery and secret/local-state exclusion tests in `src/app/repository-okf/source-state.test.ts`
- [x] T018 [US1] Implement safe source-state discovery and the spike-selected direct-index or stable-mirror preparation in `src/app/repository-okf/source-state.ts` and `src/app/repository-okf/provider-workspace.ts`
- [x] T019 [US1] Compose overview, search, trace and bounded snippets into local evidence in `src/app/repository-okf/prepare-evidence.ts`
- [x] T020 [US1] Add an opt-in managed-binary integration command outside canonical verification in `package.json` and `src/cli.ts`

Independent test: the managed compatible binary produces the accepted bundle,
returns 100% manifest evidence within three files and exits with no standing
provider process; offline/missing native state leaves `npm run verify` green.

## Phase 4: User Story 2 — Conformant OKF bundle proposal (P1)

Goal: produce a linked, source-backed draft bundle without changing current
shared knowledge.

- [x] T021 [P] [US2] Write bounded safe-YAML/frontmatter, duplicate-key, alias/resource, bare-`verified`, required type, generated/draft, normalized repository-source URI and unknown-value round-trip tests in `src/core/knowledge/okf-document.test.ts`
- [x] T022 [P] [US2] Write concept-ID, root index, optional-log consumption, Markdown-link, broken-link warning and tree-digest tests in `src/core/knowledge/okf-bundle.test.ts`
- [x] T023 [US2] Implement the YAML adapter and OKF `v0.2` concept producer/consumer rules in `src/core/knowledge/okf-document.ts`
- [x] T024 [US2] Implement bundle conformance, reserved-file parsing, link discovery and deterministic tree digest in `src/core/knowledge/okf-bundle.ts`
- [x] T025 [P] [US2] Write byte-copy proposal, prepared/generated state, host-write boundary, evidence/base binding, continuity-not-source, no-current-mutation and bundle-diff tests in `src/core/knowledge/proposal.test.ts`
- [x] T026 [US2] Implement byte-copy proposal creation, separate base/producer validation, generated-tree locking and tree/content diff classification in `src/core/knowledge/proposal.ts` and `src/core/knowledge/index.ts`
- [x] T027 [P] [US2] Write the repository-local host-agent workflow for one-concept-per-file, provenance, links, uncertainty and apply authority in `.agents/skills/agentbase-okf/SKILL.md`
- [x] T028 [US2] Implement non-mutating `prepare`, `validate` and `diff` application stages with prepare-to-generated state transitions in `src/app/repository-okf/workflow.ts` and `src/app/repository-okf/index.ts`
- [x] T029 [US2] Route `okf prepare`, `okf validate` and `okf diff` through composition-only argument handling in `src/cli.ts`
- [x] T030 [US2] Add a product-flow test for a root index, repository concept, two linked technical concepts, open question, source attribution and unchanged current bundle in `src/app/repository-okf/workflow.test.ts`

Independent test: the proposed directory is OKF `v0.2` conformant, contains the
required linked concept set and only high-impact visible uncertainty, locks the
validated generated tree, and leaves current `okf/` bytes unchanged.

## Phase 5: User Story 3 — Human guidance and recoverable rebuild (P1)

Goal: preserve human knowledge and recover safely through multi-file bundle
switches.

- [x] T031 [P] [US3] Write conservative default-protection, mutable-AgentBase-draft, raw-byte preservation, unknown-value preservation, owned-draft deletion and conflict-as-draft tests in `src/core/knowledge/proposal.test.ts`
- [x] T032 [P] [US3] Write guidance concept, stable directive shape, persistent suppression and explicit reopen tests in `src/core/knowledge/directives.test.ts`
- [x] T033 [US3] Implement mutable/protected concept classification and persistent AgentBase guidance/defer parsing in `src/core/knowledge/directives.ts` and `src/core/knowledge/index.ts`
- [x] T034 [P] [US3] Write stale-tree, separate conformance/producer failure, protected deletion, exclusive-lock conflict, staged-digest and declared directory-switch interruption tests in `src/core/knowledge/switch.test.ts`
- [x] T035 [US3] Implement atomic repository-local single-writer coordination, validate-first staged sibling switching and exact recovery-manifest state transitions in `src/core/knowledge/switch.ts` and `src/core/knowledge/index.ts`
- [x] T036 [US3] Implement application-level `apply` and startup `recover` orchestration in `src/app/repository-okf/workflow.ts`, `src/app/repository-okf/recovery.ts`, and `src/app/repository-okf/index.ts`
- [x] T037 [US3] Route explicit `okf apply` and `okf recover` commands without auto-apply in `src/cli.ts`
- [x] T038 [US3] Implement the disposable revision-A/revision-B linked-bundle, human-guidance, persistent defer, owned-draft deletion, stale-tree, competing-writer and checkpoint-recovery rehearsal in `src/app/repository-okf/rehearsal.test.ts`

Independent test: rebuild preserves protected concepts and extension values;
explicitly diffed stale AgentBase drafts may disappear; defer persists until
reopen; declared switch interruption states recover deterministically.

## Phase 6: Value evidence, documentation and closure

- [x] T039 Run one real host-agent multi-concept proposal/guidance/rebuild rehearsal and record source state, tree/evidence digests, diff, correction count and limitations in `specs/002-single-repo-okf-walking-skeleton/verification.md`
- [ ] T040 Optional benchmark intentionally deferred: no graph-assisted/direct-source speed comparison or threshold is claimed for this release
- [x] T041 [P] Update the runnable bundle flow and managed-provider bootstrap in `README.md` and `specs/002-single-repo-okf-walking-skeleton/quickstart.md`
- [x] T042 [P] Add accepted `AB-MVP-*` behavior to `docs/specs/single-repository-okf.md` and update validation in `scripts/check-specs.mjs` and `scripts/check-specs.test.mjs`
- [x] T043 Re-measure source/test review budgets, update exact ownership and run the canonical offline gate in `scripts/architecture-baseline.json` and `specs/002-single-repo-okf-walking-skeleton/verification.md`
- [x] T044 Reconcile spec, plan, tasks, contracts, living requirements and implementation; close the capability and update the next checkpoint in `specs/002-single-repo-okf-walking-skeleton/spec.md`, `specs/002-single-repo-okf-walking-skeleton/tasks.md`, `specs/CURRENT.md`, and `docs/handoff.md`

## Dependencies

```text
corrected implementation approval + managed dependency -> T001, T003, T006
T001 -> T002, T004, T005
T001 + T004 + T006 -> T008
T003 + T006 -> T010, T021, T022
T008 -> T009 -> T012
T010 -> T011
T013 -> T015
T014 + T015 + T009 -> T016
T011 + T016 -> T017-T020 -> US1 complete
T003 + US1 + T021 + T022 + T025 -> T023-T030 -> US2 complete
US2 + T031 + T032 + T034 -> T033-T038 -> US3 complete
US1 + US2 + US3 -> T039, T041-T044
US1 + US2 + US3 -> optional T040
```

## Parallel opportunities

- T003 completed independently while the provider path was pending; T004-T005
  use separate setup surfaces after the provider spike.
- T008 and T010 cover separate core contracts after ownership registration.
- T013 and T014 separate process behavior from response translation.
- T021 and T022 separate concept/frontmatter from bundle/navigation rules.
- T025 and T027 can proceed from the accepted OKF contract independently.
- T031, T032 and T034 cover distinct protection, directive and recovery seams.
- Documentation T041 and living-contract work T042 can proceed after behavior
  stabilizes while value evidence is reviewed.

## MVP implementation strategy

The MVP is the complete three-story vertical loop. User Story 1 alone is useful
Part 1 evidence but does not validate the OKF product direction. User Stories 2
and 3 prove a real linked bundle, human correction and safe rebuild. Stop after
T044; do not add cloud, cross-repository, Hub, custom downloader, native
installer/configuration, daemon, ontology, attested-computation,
protected-content deletion, rename or merge work. T040 is useful evidence but
is not a release gate.

## Format validation

All 44 tasks use sequential IDs, exact file paths, story labels only inside
user-story phases and `[P]` only for independent file surfaces.
