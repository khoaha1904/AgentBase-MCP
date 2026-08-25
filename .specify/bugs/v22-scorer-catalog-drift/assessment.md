# Bug Assessment: V22 scorer catalog drift

- **Slug**: v22-scorer-catalog-drift
- **Created**: 2026-08-25
- **Source**: pasted benchmark result and repository evidence
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

V22 produced a schema-valid proposal with Repository, Domain, Flow, Component,
Function and Question documents. Final scoring marked it invalid by assigning a
generic `data pipeline` System probe to the operational-ownership Question, and
reported four Functions without a useful parent despite an evidenced Flow that
connects them.

## Symptom

A valid sparse proposal is classified as invalid or less useful because the
benchmark scorer treats governance Questions as wrong-schema concept matches and
does not recognize current catalog `Flow` or `Component` roles as useful parents.

## Reproduction

1. Finalize V22 run `2026-08-25T162253Z`.
2. Observe a `System` contradiction against a `Question` document.
3. Observe the function-fragmentation finding despite `flows/apistatemachine.md`.

## Suspected Code Paths

- `scripts/benchmark/benchmark-okf.mjs:251` — useful-parent heuristic retains legacy role names.
- `scripts/benchmark/benchmark-okf.mjs:446` — semantic assignment admits Question documents as required concept candidates.
- `scripts/benchmark/benchmark-okf.test.mjs` — lacks regression coverage for both cases.

## Root Cause Hypothesis

High confidence. The scorer predates the current sparse catalog and shared
Question documents. Generic identity terms can therefore consume a Question as
a wrong-schema match, while the owner-review heuristic overlooks the current
Flow/Component parent roles. This contradicts AB-BENCH-004, AB-BENCH-023,
AB-BENCH-027 and AB-BENCH-074.

## Proposed Remediation

**Preferred**: Exclude `Question` documents from required-concept semantic
assignment, and recognize `Component` and `Flow` alongside retained historical
parent types. Keep missing embedded evidence as a non-blocking coverage finding.

**Files likely to change**:

- `scripts/benchmark/benchmark-okf.mjs`
- `scripts/benchmark/benchmark-okf.test.mjs`

**Tests to add or update**:

- A Question containing generic System terms remains unjudged and leaves the
  reference System missing rather than contradicted.
- Three or more Functions connected by a current-catalog Flow do not trigger the
  legacy fragmentation finding.

## Risks & Considerations

- Real wrong-schema concept contradictions must remain blocking.
- Historical benchmark roles must remain accepted by owner-review diagnostics.
- Missing source probes remain visible and must not be converted into success.

## Open Questions

- None.
