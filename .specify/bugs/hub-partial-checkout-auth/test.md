# Bug Verification: Partial Hub Checkout Drops Authentication

- **Slug**: hub-partial-checkout-auth
- **Tested**: 2026-08-12
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original private partial-clone failure no longer reproduces. A fresh real
preparation checked out the exact private Hub base, finalized the authored
bundle, and submitted the exact proposal branch and PR without regressions.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Fresh `createHubRuntimeActions(...).prepare(...)` against the private Hub | pass | Returned base `0f2da38d6f31209dd08989ad157977996054d085`. |
| Updated test | `node --test src/app/hub-okf/checkout.test.ts` | pass | 3 passed, 0 failed. |
| Real lifecycle | finalize and submit proposal `7dfd51381de77bcc4803598a` | pass | Created commit `f1b4effd8594b02e1961b5e0685d290cc2c1dffe` and PR #3. |
| Regression suite | `npm run verify` | pass | 179 passed, 0 failed; specification/type/architecture/diff gates passed. |

## Output Excerpts

- Focused checkout suite: `pass 3`, `fail 0`.
- Canonical suite: `tests 179`, `pass 179`, `fail 0`.
- Real PR: `https://github.com/khoaha1904/knowledger-hub/pull/3`.

## Residual Risks

- The available authenticated GitHub credential had broader scopes than the
  intended exact-repository fine-grained token. Secret transport and retention
  boundaries passed, but least-privilege operator configuration remains to be
  tightened.

## Recommendation

Close the bug — verified through the exact real private-Hub path.
