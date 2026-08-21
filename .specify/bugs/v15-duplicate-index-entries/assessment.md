# Bug Assessment: Duplicate category index entries pass validation

- **Slug**: v15-duplicate-index-entries
- **Created**: 2026-08-21
- **Source**: benchmark probe `aws-health-aware/2026-08-21T152548Z`
- **Verdict**: valid
- **Severity**: medium

## Report

The finalized OKF bundle contains the same navigation row twice in each of
`components/index.md`, `domains/index.md`, `repositories/index.md` and
`systems/index.md`. Validation passed and the scorer reported all applicable
reference ratios at 100%.

## Symptom

Prepare emits category entries, then agent authoring may append the same target
again. The shared bundle loader accepts the duplicate, so Finalize and scoring
do not surface the malformed navigation.

## Reproduction

1. Prepare an Initial Ingest skeleton with generated category indexes.
2. Append an existing Markdown navigation target to one category index.
3. Load or finalize the bundle; current validation accepts it.

## Suspected Code Paths

- `src/core/knowledge/documents/okf-bundle.ts:validateIndex()` — validates line
  grammar but does not track repeated navigation targets.
- `.agents/skills/agentbase-ingest/SKILL.md` — tells the agent to enrich the
  skeleton but does not explicitly say that navigation is already populated.
- `src/app/hub-okf/authoring/initial-ingest.test.ts` — existing lifecycle test
  can pin the shared rejection without adding another test case.

## Root Cause Hypothesis

Confidence is high. Prepare already produced one correct row per concept. The
agent inspected only index file sizes and appended the same targets. Because
`validateIndex()` checks only syntax, the duplicate survived every lifecycle
gate and became a scorer blind spot.

## Proposed Remediation

**Preferred**: Track normalized Markdown link targets while validating each
index and reject a repeated target with an actionable error. Clarify the ingest
authoring instruction that Prepare owns and pre-populates navigation; agents
must preserve it rather than append existing targets.

Do not make shallow Domain prose a hard validation failure. With only owner
classification and one repository, requiring more prose would encourage
unsupported domain claims; owner review should keep reporting thin content.

**Files likely to change**:

- `src/core/knowledge/documents/okf-bundle.ts`
- `src/app/hub-okf/authoring/initial-ingest.test.ts`
- `.agents/skills/agentbase-ingest/SKILL.md`
- `.agents/skills/agentbase-okf/references/navigation-and-boundaries.md`
- `docs/contracts/okf.md`

**Tests to add or update**:

- Extend the existing Initial Ingest lifecycle test to prove a repeated
  category target is rejected before finalization.

## Risks & Considerations

- Existing Hubs with duplicate index targets will fail validation until the
  duplicate row is removed; this is intentional malformed-draft rejection.
- Distinct targets with identical labels remain valid.

## Open Questions

- None.
