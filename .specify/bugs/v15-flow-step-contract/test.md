# Bug Verification: V15 Flow step contract is incomplete

- **Slug**: v15-flow-step-contract
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The public schema now exposes the validator-compatible Flow shape, and the
retained `from/to` reproduction receives an actionable diagnostic. No offline
regression was found.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | Existing Initial Ingest E2E with `from/to` | pass | Diagnostic names `source` and `target`. |
| Schema contract | Existing catalog test | pass | Complete six-field list is returned. |
| Regression suite | `npm run verify` | pass | 50/50 tests. |
| Type/dependency/security | `npm run verify` | pass | All canonical gates pass. |

## Output Excerpts

`tests 50`, `pass 50`, `fail 0`; specification, TypeScript, dependency,
Knip, Gitleaks and diff checks passed.

## Residual Risks

- Model-backed behavior is verified separately by the authorized benchmark.

## Recommendation

Close the deterministic bug and proceed with one V15 qualification run.
