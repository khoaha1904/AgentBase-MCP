# Bug Verification: Body-only reference collision

- **Slug**: v13-reference-body-collision
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

Contextual descriptions, bodies and Repository links no longer manufacture a
wrong-schema contradiction, while an explicit System identity typed Service is
still rejected.

## Checks Performed

| Check | Command / Action | Result | Notes |
|---|---|---|---|
| Automated reproduction | Body-only collision regression | pass | Missing System remains missing; lower-level concept is unjudged. |
| Genuine contradiction | Wrong-schema primary-name regression | pass | Explicit mismatched identity remains invalid. |
| Retained evidence | Read-only score of three latest runs | pass | Health becomes reviewable; Shopping remains correctly invalid. |
| Focused suite | `node --test ...guidance.test.ts ...okf-schema-tools.test.ts ...benchmark-okf.test.mjs` | pass | 48/48. |
| Canonical gate | `npm run verify` | pass | 385/385 plus all repository checks. |

## Output Excerpts

```text
Health 090301Z: reviewable, System missing
Shopping 090620Z: invalid, shopping-cart-system is Service
Health 091059Z: reviewable, System missing
tests 385; pass 385; fail 0
```

## Residual Risks

- Retained metrics remain immutable and therefore still contain their original
  raw classification; the corrected interpretation is documented separately.

## Recommendation

Close the benchmark measurement bug. Do not treat the corrected scorer as
evidence that the remaining OKF navigation issue is solved.
