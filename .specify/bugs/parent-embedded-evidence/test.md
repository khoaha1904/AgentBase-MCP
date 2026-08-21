# Bug Verification: Parent concept cannot reuse its embedded child's evidence

- **Slug**: parent-embedded-evidence
- **Tested**: 2026-08-22
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified offline

## Summary

The reproduced Function/direct-embedded-schedule evidence shape now passes.
Unrelated candidate reuse remains rejected, and the full repository gate has no
regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | focused guidance test | pass | Parent uses direct embedded-child promotion evidence. |
| Negative guard | focused guidance test | pass | Unrelated concept cannot use the child's evidence. |
| Type boundary | `npm run typecheck` | pass | Core and MCP descriptions align. |
| Repository gate | `npm run verify` | pass | 50/50 tests and all deterministic checks passed. |

## Output Excerpts

```text
focused: 8 tests, 8 pass, 0 fail
repository: 50 tests, 50 pass, 0 fail
```

## Residual Risks

- Flow promotion remains intentionally stricter than other parent promotion.
- Model output may still expose a different request-shape issue; sequential
  qualification remains the required evidence.

## Recommendation

Close the deterministic bug as verified offline and run one sequential
Terraform probe. Replicate only after a valid unblocked result.

