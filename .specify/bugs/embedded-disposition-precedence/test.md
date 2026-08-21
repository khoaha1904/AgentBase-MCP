# Bug Verification: Embedded disposition does not take precedence

- **Slug**: embedded-disposition-precedence
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The benchmark request shape now returns embedded recommendations with no schema,
while parent, evidence and field validation remain covered. The full gate found
no regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | AB-SCHEMA-036 contradictory-hint shape | pass | Embedded wins and reports ignored hints. |
| Focused tests | `node --test --experimental-strip-types src/core/knowledge/schemas/guidance.test.ts` | pass | 8/8 passed. |
| Regression suite | `npm run verify` | pass | 50/50 tests passed. |
| Static and safety checks | `npm run verify` | pass | Spec, type, dependency, Knip, Gitleaks and diff checks passed. |

## Output Excerpts

```text
tests 50
pass 50
fail 0
```

## Residual Risks

- Model stability still requires a new sequential probe.

## Recommendation

Close the deterministic bug and continue with one probe.
