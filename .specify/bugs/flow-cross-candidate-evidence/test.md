# Bug Verification: Cross-boundary Flow cannot reuse endpoint evidence

- **Slug**: flow-cross-candidate-evidence
- **Tested**: 2026-08-22
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified offline

## Summary

The replica's request shape now passes schema guidance without duplicated
observations. Foreign promotion evidence and cross-candidate reuse by a non-Flow
role remain rejected, and the complete repository gate has no regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | focused guidance test | pass | Cross-boundary Flow reuses Function supporting evidence. |
| Guard preservation | focused guidance test | pass | Flow promotion stays Flow-owned; System reuse fails. |
| Type boundary | `npm run typecheck` | pass | MCP adapters and core contract agree. |
| Repository gate | `npm run verify` | pass | 50/50 tests and all deterministic checks passed. |

## Output Excerpts

```text
focused: 8 tests, 8 pass, 0 fail
repository: 50 tests, 50 pass, 0 fail
```

## Residual Risks

- Model execution may choose not to author a Flow, or may still produce an
  optional low-value Flow; proposal review remains authoritative.
- No third-party or embedded candidate can supply reused supporting evidence.

## Recommendation

Close the deterministic contract bug as verified offline. Run one sequential
Terraform probe; run a replica only if that probe is valid and unblocked.

