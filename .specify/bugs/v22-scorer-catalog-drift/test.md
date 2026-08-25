# Bug Verification: V22 scorer catalog drift

- **Slug**: v22-scorer-catalog-drift
- **Tested**: 2026-08-25
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original V22 misclassification no longer reproduces. The same immutable
bundle is now reviewable and no repository regression was found.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | Re-finalize V22 `2026-08-25T162253Z` | pass | `valid_partial`; no contradiction or hard failure. |
| Focused regression | `node --test scripts/benchmark/benchmark-okf.test.mjs` | pass | 6/6. |
| Full regression | `npm run verify` | pass | 72/72 plus all repository gates. |

## Output Excerpts

- Recognized schema agreement: 100%.
- Authoring assessment: `reviewable`.
- Initial Ingest acceptance: `valid_partial`.

## Residual Risks

- The exact Glue crawler source probe remains a visible non-blocking coverage finding.

## Recommendation

Close the scorer bug. The proposal is safe to submit for human review without a
second model run.
