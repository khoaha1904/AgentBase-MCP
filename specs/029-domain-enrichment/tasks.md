# Tasks: Domain Enrichment

**Input**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md),
[MCP contract](contracts/mcp.md), [AWS contract](contracts/aws-cli.md)

**Verification policy**: Extend one existing 50-case design-level E2E; do not add
per-function test inventory. Stop at the offline checkpoint before real AWS or a
model benchmark.

## Phase 1: Living Contract and Foundations

**Purpose**: Make the accepted design and reusable value boundaries current
before workflow code.

- [X] T001 Add AB-ENRICH-001..010 and exact AWS/SQS MVP status to `docs/design/06-cross-repository-relations/07-runtime-requirements.md`, `docs/design/06-cross-repository-relations/README.md` and `docs/README.md`
- [X] T002 [P] Add provider-neutral external identity validation and duplicate-key reporting in `src/core/knowledge/governance/external-identities.ts` and export it through `src/core/knowledge/index.ts`
- [X] T003 [P] Add normalized provider-observation validation, digest and observed-value conversion in `src/core/knowledge/governance/provider-observations.ts` and export it through `src/core/knowledge/index.ts`
- [X] T004 Extend `src/core/hub/proposal.ts` with discriminated Repository versus Domain Enrichment scope while retaining exact legacy Init/Refresh reconstruction
- [X] T005 Update architecture ownership for the concrete provider/application boundaries in `docs/design/00-architecture.md` and enforce public-entrypoint imports in `dependency-cruiser.cjs`

**Checkpoint**: Core admits safe identities/observations and represents enrichment
without a fake Repository ID; no provider process or MCP tool exists yet.

---

## Phase 2: User Story 1 — Verify Selected Knowledge (Priority: P1)

**Goal**: Prepare one Published-only manifest, verify exact SQS candidates
sequentially and inspect one truthful proposal.

**Independent test**: Disposable Hub plus fake AWS process yields one verified
relation, one identity-only result and one unresolved limitation without accepted
mutation or list/scan calls.

- [X] T006 [P] [US1] Implement fixed no-shell bounded AWS process execution and typed error classification in `src/providers/aws-cli/process.ts`
- [X] T007 [P] [US1] Define released `aws.sts.caller-identity@1` and `aws.sqs.queue@1` argv/output policies in `src/providers/aws-cli/profiles.ts`
- [X] T008 [US1] Implement account preflight, exact queue lookup/attributes parsing, ARN consistency and secret filtering in `src/providers/aws-cli/adapter.ts` and `src/providers/aws-cli/index.ts`
- [X] T009 [P] [US1] Implement isolated exact-remote-base Published Domain/Repository/candidate admission and immutable manifest revisions in `src/app/hub-okf/enrichment/manifest.ts`
- [X] T010 [US1] Implement identity-versus-interaction reconciliation and confirmed/rejected/unresolved/failed outcomes in `src/app/hub-okf/enrichment/reconciliation.ts`
- [X] T011 [US1] Implement prepare/run/finalize orchestration with sequential checkpoints and no hidden retry in `src/app/hub-okf/enrichment/workflow.ts` and `src/app/hub-okf/enrichment/index.ts`
- [X] T012 [US1] Expose typed prepare/run/finalize actions and schemas without credential or arbitrary-command fields in `src/app/hub-okf/mcp/mcp-tool-actions.ts`, `src/app/hub-okf/mcp/mcp-tool-call.ts` and `src/app/hub-okf/mcp/mcp-tools.ts`
- [X] T013 [US1] Extend the existing disposable-Hub lifecycle case with fake AWS call recording, exact relation/identity/limitation output and accepted-state immutability in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

**Checkpoint**: User Story 1 is independently usable offline. Do not run real AWS
or a model benchmark.

---

## Phase 3: User Story 2 — Resolve Questions in One Review (Priority: P1)

**Goal**: Classify the three resolution tiers and include selected human answers
plus deferred Questions in the same Enrichment proposal.

**Independent test**: One automatic, one recommended and one manual Question
produce exact transitions; unselected recommendations create no Guidance.

- [X] T014 [US2] Add deterministic automatic/recommended/manual decision-packet policy bound to candidate and Question revisions in `src/app/hub-okf/enrichment/reconciliation.ts`
- [X] T015 [US2] Reuse exact-revision Question/Guidance rendering for selected answers and defer Open Questions in `src/app/hub-okf/enrichment/workflow.ts`
- [X] T016 [US2] Add bounded decision inputs and stale-revision rejection to `finalize_domain_enrichment_proposal` in `src/app/hub-okf/mcp/mcp-tools.ts` and `src/app/hub-okf/mcp/mcp-tool-call.ts`
- [X] T017 [US2] Extend the existing lifecycle E2E with all three tiers, attribution and no pre-Accept mutation in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

**Checkpoint**: Missing answers remain truthful Open Questions; no completeness
gate or model reasoning loop is added.

---

## Phase 4: User Story 3 — Recovery and Publication (Priority: P2)

**Goal**: Retry/revise membership safely and carry one Enrichment unit through
existing Accept/publication reconstruction.

**Independent test**: Interrupted candidate retry and one membership revision
either reproduce one valid proposal or stop explicitly; accepted Enrichment is
one independent PR unit targeting main.

- [X] T018 [US3] Implement atomic outcome checkpoints, explicit failed-item retry and digest-based reuse/invalidation in `src/app/hub-okf/enrichment/workflow.ts`
- [X] T019 [US3] Implement exact membership revision and dangling-dependency rejection in `src/app/hub-okf/enrichment/manifest.ts`
- [X] T020 [US3] Extend Accept commit trailers, pending reconstruction and review inspection for Domain/multi-Repository scope in `src/app/hub-okf/review/accept.ts`, `src/app/hub-okf/review/pending.ts` and `src/app/hub-okf/review/inspect.ts`
- [X] T021 [US3] Publish Enrichment as one independent main-based PR and render exact Domain/repository/provider/Question scope in `src/app/hub-okf/publication/publish.ts` and `src/app/hub-okf/publication/review-summary.ts`
- [X] T022 [US3] Extend the existing lifecycle/publication E2E for interruption, retry, revised membership, stale base and one-unit publication in `src/app/hub-okf/workspace/local-only-e2e.test.ts`

---

## Phase 5: Skill, Current Truth and Offline Gate

- [X] T023 Add the host workflow, explicit AWS-login handoff, bounded tool order and degraded outcomes to `.agents/skills/agentbase-domain-enrichment/SKILL.md` and `.agents/skills/README.md`
- [X] T024 Update exact implemented status and retained deferrals in `docs/present/06-cross-repository-and-cross-domain-relationships.md`, `docs/present/07-conflicts-questions-and-maintainer-guidance.md`, `docs/present/08-live-references-for-change-prone-values.md`, `docs/present/09-ingest-and-refresh.md`, `docs/present/11-review-accept-and-publish.md`, `docs/design/06-cross-repository-relations/02-resource-identity-matching.md`, `docs/design/06-cross-repository-relations/03-domain-enrichment-reconciliation.md`, `docs/design/06-cross-repository-relations/04-provider-verification.md`, `docs/design/07-conflicts-and-questions/06-batch-question-resolution.md`, `docs/design/08-live-references/06-provider-observations.md`, `docs/design/09-ingest-and-refresh/07-domain-enrichment.md`, `docs/design/11-review-and-publish/08-domain-enrichment-changes.md` and `docs/design/12-version-scope/07-deferred-capabilities.md`
- [X] T025 Run `npm run depcruise`, focused E2E and `npm run verify`; record exact results and zero test-count/dependency growth in `specs/029-domain-enrichment/verification.md`
- [X] T026 Stop at the mandatory offline benchmark checkpoint, report changes/regressions and request owner approval before any real AWS smoke in `specs/029-domain-enrichment/verification.md`

## Dependencies

```text
Living contract/core scope (T001–T005)
  → provider + Published reconciliation (US1, T006–T013)
    → Question decisions (US2, T014–T017)
      → retry/membership/publication (US3, T018–T022)
        → skill/docs/offline gate (T023–T026)
```

- T002 and T003 may proceed in parallel after T001.
- T006, T007 and T009 touch independent owners and may proceed in parallel after
  the foundational contract is stable.
- Story phases otherwise remain sequential to avoid proposal/provider conflicts.
- Real AWS smoke and model qualification are not implementation tasks; both need
  separate owner approval after T026.

## Implementation Strategy

1. Ship the smallest truthful P1 flow using STS + exact SQS only.
2. Reuse shared Questions instead of creating a second decision store.
3. Add recovery/publication only after the proposal bytes are correct offline.
4. Stop at deterministic E2E. Missing provider types build up later through
   released profiles; they are not a reason to generalize this slice now.

## Phase 6: Convergence

- [X] T027 Bind every candidate evidence dependency to the selected Published Repository membership and reject dangling removal revisions per AB-ENRICH-001 and US3/AC3 (partial)
- [X] T028 Expand the existing lifecycle E2E to at least three distinct Published Repository IDs with confirmed relation, identity-only, rejected, unresolved, failed/retry and no false join per SC-001..003 (partial)
- [X] T029 Cover stale Question finalization, membership removal/reuse and unsafe provider output without accepted or partial mutation per US2/AC4, SC-005 and SC-006 (partial)

## Phase 7: Convergence

- [X] T030 Bind exact current catalog and Terraform detector versions into every immutable manifest digest per AB-ENRICH-001 (partial)

## Phase 8: Convergence

- [X] T031 Retain cross-concept strong-identity duplicates as review limitations/Open Questions without attaching duplicate identities or auto-merging per AB-ENRICH-008 and plan decision 11 (contradicts)

## Phase 9: Convergence

- [X] T032 Require every enrichment human answer/defer to bind the exact Question ID and revision at MCP and Finalize trust boundaries per contracts/mcp.md and AB-ENRICH-007 (partial)

## Phase 10: Convergence

- [X] T033 Persist a safe retained enrichment review summary and render exact account/regions/profile/candidate/Question scope in the PR body per T021 and AB-ENRICH-009 (partial)

## Phase 11: Convergence

- [X] T034 Validate checkpoint candidate/digest/status/provider integrity and recompute exact decision packets before Finalize per AB-ENRICH-006, AB-ENRICH-008 and SC-006 (partial)
