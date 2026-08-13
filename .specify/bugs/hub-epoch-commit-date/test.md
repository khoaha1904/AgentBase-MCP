# Bug Verification: Hub Proposal Commits Appear Decades Old

- **Slug**: hub-epoch-commit-date
- **Tested**: 2026-08-12
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The fixed epoch no longer appears in generated proposal commits. Unit and real
local-Git tests confirm both author and committer dates equal the immutable
proposal creation time, with recovery and the full repository suite green.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Local Git E2E reads `%aI` and `%cI` from the generated commit | pass | Both normalize to `2026-08-12T00:00:00.000Z`. |
| New / updated tests | `node --test src/app/hub-okf/submit.test.ts src/app/hub-okf/local-e2e.test.ts src/app/hub-okf/recovery.test.ts` | pass | 8 passed, 0 failed. |
| Regression suite | `npm run verify` | pass | 180 passed, 0 failed. |
| Specification/type/architecture/diff gates | `npm run verify` | pass | 0 architecture errors; two unchanged file-size warnings. |

## Output Excerpts

- Focused suite: `tests 8`, `pass 8`, `fail 0`.
- Canonical suite: `tests 180`, `pass 180`, `fail 0`.

## Residual Risks

- The already merged proposal commit retains its immutable 2000-01-01 date.
  Correcting it would require rewriting shared Git history and is intentionally
  not part of this fix.

## Recommendation

Close the bug — verified end-to-end with local Git commit metadata.
