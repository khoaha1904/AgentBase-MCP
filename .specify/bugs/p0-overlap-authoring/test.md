# Bug Verification: P0 overlapping evidence is easy to mis-author

- **Slug**: p0-overlap-authoring
- **Tested**: 2026-08-31
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original ambiguous path is now rejected with exact recovery guidance, and
the intended Terraform-plus-implementation path produces one runtime identity.
No regression was found in the full MCP gate.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Submit prose reason for ignored P0 fixture item | pass | Error directs the caller to shared materialization or exact duplicate coverage. |
| Shared-runtime behavior | Materialize one worker from Terraform and Python P0 groups | pass | Receipt retains both outcomes; skeleton list contains one worker. |
| Updated tests | `node --test --experimental-strip-types src/app/codebase-memory-mcp/discovery-session.test.ts src/app/hub-okf/authoring/receipt-authoring.test.ts` | pass | 4/4 passed. |
| Regression suite | `npm run verify` | pass | 158/158 tests passed. |
| Static/security gates | `npm run verify` | pass | Specs, typecheck, dependencies, Knip, Gitleaks and diff checks passed. |

## Output Excerpts

```text
tests 4
pass 4
fail 0

tests 158
pass 158
fail 0
```

## Residual Risks

- Semantic attribution remains an agent judgment reviewed in the proposal;
  bounded Seed source samples intentionally are not a hard evidence allowlist.

## Recommendation

Close the bug and rerun the real Initial Ingest. Do not add an AWS- or
repository-specific validator branch.
