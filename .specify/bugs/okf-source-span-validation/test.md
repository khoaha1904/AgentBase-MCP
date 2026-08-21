# Bug Verification: Finalize accepts repository source spans beyond the file

- **Slug**: okf-source-span-validation
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified offline

## Summary

The retained failure is now covered at the MCP Finalize boundary. An impossible
line range is rejected, the draft can be repaired, and the same session then
Finalizes successfully. The complete deterministic repository gate passes.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Exact regression | focused Initial Ingest lifecycle test | pass | `main.tf#L1-L99` is rejected against a six-line file. |
| Repairability | same focused test | pass | Restoring the valid span allows Finalize in the same session. |
| Type boundary | `npm run typecheck` | pass | Session and runtime contracts agree. |
| Repository gate | `npm run verify` | pass | 50/50 tests and all deterministic checks passed. |

## Residual Risks

- Foreign-repository citations remain intentionally unchecked unless that
  repository is separately available and authorized.
- A model-backed probe is still required to prove the original benchmark case
  is rejected or corrected before proposal creation.

## Recommendation

Commit and push the verified fix, then run one sequential Terraform probe. Run
a replica only if the probe is valid and has no obvious blocker.
