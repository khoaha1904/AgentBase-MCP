# Bug Assessment: Body-only name mention becomes schema contradiction

- **Slug**: v13-reference-body-collision
- **Created**: 2026-08-21
- **Source**: retained V13 qualification runs `090301Z`, `090620Z` and `091059Z`
- **Verdict**: valid
- **Severity**: high

## Report

The benchmark assigned the missing `aws-health-aware-system` reference to a
Function or Object Storage concept because their Markdown bodies linked to the
`aws-health-aware` Repository. It then emitted a hard System schema
contradiction instead of reporting the System as missing reference knowledge.

## Symptom

A body-only mention of all reference identity terms can match a concept with a
different schema. Ordinary navigation links therefore turn missing coverage
into an invalid authoring assessment.

## Reproduction

1. Score a missing System reference with identity terms `aws`, `health`,
   `aware`.
2. Include a valid lower-level concept whose title/identity is unrelated but
   whose body links to the `aws-health-aware` Repository.
3. Observe the lower-level concept assigned to System and reported as a hard
   wrong-schema contradiction.

## Suspected Code Paths

- `scripts/benchmark/benchmark-okf.mjs:scoreSemanticBenchmark()` — wrong-schema
  eligibility searches identity terms across the full Markdown body.
- `scripts/benchmark/benchmark-okf.test.mjs` — covers genuine wrong-schema
  identity and greedy collisions, but not a body-only repository link.

## Root Cause Hypothesis

**Confidence: high.** Strict semantic matching uses `allTermsMatch` from primary
identity plus body for every candidate. Schema mismatch is therefore not
required to carry a strong primary identity claim before becoming a hard
contradiction.

## Proposed Remediation

**Preferred**: Keep full-body semantic support for same-schema candidates, but
require every identity term in canonical identity/title/description before a
wrong-schema candidate may be classified as a contradiction. Otherwise leave
the actual concept unjudged and the reference missing.

**Files likely to change**:

- `scripts/benchmark/benchmark-okf.mjs`
- `scripts/benchmark/benchmark-okf.test.mjs`
- `docs/contracts/benchmark.md`

**Tests to add or update**:

- A body-only Repository link cannot turn a missing System into a contradiction.
- A concept whose primary identity really claims the expected entity with the
  wrong schema remains an invalid contradiction.

## Risks & Considerations

- The fix must retain earlier greedy-assignment and genuine wrong-schema
  regressions.
- Historical metrics remain immutable; corrected behavior applies to new or
  explicit read-only scoring only.

## Open Questions

- None.
