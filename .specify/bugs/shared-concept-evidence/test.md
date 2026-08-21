# Bug Verification: Standalone concepts cannot share supporting evidence

- **Slug**: shared-concept-evidence
- **Tested**: 2026-08-22
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified offline

## Summary

System and Flow candidates now share attributable supporting and promotion
evidence without duplicating observations. Embedded candidates remain
self-owned, and the complete repository gate has no regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | focused guidance test | pass | System cites Function observation for support and promotion. |
| Flow sharing | focused guidance test | pass | Flow shares supporting and promotion evidence. |
| Embedded guard | focused guidance test | pass | Embedded candidate cannot cite another candidate's observation. |
| Repository gate | `npm run verify` | pass | 50/50 tests and all deterministic checks passed. |

## Output Excerpts

```text
focused: 8 tests, 8 pass, 0 fail
repository: 50 tests, 50 pass, 0 fail
```

## Residual Risks

- Shared evidence can support several interpretations; proposal review remains
  responsible for semantic usefulness.
- Model qualification is still required to show the simplified request
  contract is stable in the original repository.

## Recommendation

Close the deterministic bug as verified offline and run one sequential
Terraform probe. Replicate only after a valid unblocked result.
