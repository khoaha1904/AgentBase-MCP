# Bug Verification: Flow endpoint guidance permits embedded labels

- **Slug**: v15-flow-endpoint-guidance
- **Tested**: 2026-08-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

Released Flow guidance now exposes the concept-only endpoint invariant without
changing validation or promoting embedded details. All offline gates pass.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction | Read released Flow schema | pass | Endpoint rule is present. |
| Contract test | Existing catalog test | pass | Embedded/free-text exclusions are pinned. |
| Regression suite | `npm run verify` | pass | 50/50 tests. |
| Type/dependency/security | `npm run verify` | pass | All canonical gates pass. |

## Output Excerpts

`tests 50`, `pass 50`, `fail 0`; specification, TypeScript, dependency,
Knip, Gitleaks and diff checks passed.

## Residual Risks

- Model compliance requires a separately authorized benchmark run.

## Recommendation

Close the deterministic guidance bug. Do not add resource concepts merely to
complete Flow endpoints.
