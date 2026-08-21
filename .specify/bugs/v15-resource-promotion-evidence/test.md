# Bug Verification: Resource promotion repeats semantic evidence

- **Slug**: v15-resource-promotion-evidence
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The retained benchmark request shape now passes guidance, while a Resource with
no candidate-owned semantic observation remains rejected. No regression was
found in the complete repository gate.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | AB-SCHEMA-042 structured-promotion test shape | pass | Resource is suggested without duplicated semantic ID. |
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

- Model stability still requires a separately run benchmark probe.

## Recommendation

Close the bug. The deterministic restriction is fixed and verified; proceed to
one sequential model probe when authorized.
