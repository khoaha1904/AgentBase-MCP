# Bug Assessment: V15 authoring gates reject generated Flow skeletons

- **Slug**: v15-authoring-gates
- **Created**: 2026-08-21
- **Source**: retained V15 benchmark `2026-08-21T122847Z`
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

The first V15 Terraform qualification reached `prepare_hub_okf` with suggested
System, Function, Interface and Flow candidates. Preparation failed with
`generated OKF skeleton is invalid: ... Flow requires flow_steps`. The retained
trace contains one failed prepare call, while the benchmark summary describes
that required tool as not observed. Terraform embedded-resource behavior is
already covered offline and was not the cause of this failure.

## Symptom

An evidence-backed promoted Flow cannot reach the editable authoring workspace
because the generated skeleton omits required `flow_steps` and is validated as
if authoring had already finished. The benchmark then reports a failed required
call as absent.

## Reproduction

1. Prepare a new Initial Ingest request with a suggested Flow candidate.
2. Let `writeInitialIngestSkeletons` render and validate the generated bundle.
3. Observe preparation fail before the caller can populate ordered Flow steps.

## Suspected Code Paths

- `src/app/hub-okf/authoring/initial-ingest-skeleton.ts` — renders generic
  frontmatter and immediately applies final relationship/Flow-step validation.
- `src/app/hub-okf/authoring/initial-ingest.test.ts` — lacks a promoted Flow
  case combined with the existing Terraform embedded-resource case.
- `scripts/benchmark/benchmark-agent.mjs` — required-tool diagnostics use only
  successfully completed tool names even though call counts retain failures.
- `scripts/benchmark/benchmark-agent.test.mjs` — lacks failed-versus-absent
  required-tool wording coverage.

## Root Cause Hypothesis

Confidence: high. The generic skeleton renderer does not distinguish fields
that are structurally required on an editable skeleton from semantic data that
the agent must author. Flow uniquely requires a non-empty, linked, evidenced
step list that cannot be derived safely from the current candidate contract.
The benchmark separately conflates observation with successful completion.

## Proposed Remediation

**Preferred**: Render promoted Flow skeletons with an explicit empty
`flow_steps` placeholder, but exclude only generated Flow skeletons from the
renderer's pre-authoring relationship validation. Normal changed-set validation
continues to reject the Flow until the agent supplies valid steps. This avoids
inventing endpoints or expanding the guidance request. Keep the existing exact
Terraform embedded-resource path and cover both behaviors in one focused
regression. Make benchmark diagnostics say `did not complete successfully`
when a required call was observed but failed, while retaining `not observed`
for a missing call.

**Files likely to change**:

- `src/app/hub-okf/authoring/initial-ingest-skeleton.ts`
- `src/app/hub-okf/authoring/initial-ingest.test.ts`
- `scripts/benchmark/benchmark-agent.mjs`
- `scripts/benchmark/benchmark-agent.test.mjs`

**Tests to add or update**:

- Preparation returns an editable Flow skeleton with `flow_steps: []`, retains
  a Terraform SQS embedded row and final validation rejects unfilled steps.
- Required-tool diagnostics distinguish failed calls from absent calls.

## Risks & Considerations

- Empty Flow steps must never pass final changed-set validation.
- No inferred or placeholder semantic endpoints may enter OKF.
- The immutable V15 prompt and retained benchmark result must not change.

## Open Questions

None.
