# Bug Fix: Partial Hub Checkout Drops Authentication

- **Slug**: hub-partial-checkout-auth
- **Fixed**: 2026-08-12
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The partial-clone checkout phase now receives the existing Hub token through
the bounded askpass environment, allowing Git to lazily fetch missing private
Hub blobs without placing the credential in arguments or persistent config.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/checkout.ts` | modified | Supplies the token to the checkout request. |
| `src/app/hub-okf/checkout.test.ts` | updated test | Pins credential coverage for clone, fetch and checkout. |
| `docs/specs/agentbase-hub.md` | modified | Clarifies partial-clone authentication under AB-HUB-004. |

## Tests Added or Updated

- `checkout fetches an exact base without any remote write` — verifies all
  three possibly networked phases receive the canary via `GitRequest.token`
  while argv remains secret-free.

## Local Verification

- `node --test src/app/hub-okf/checkout.test.ts` → 3 passed, 0 failed.

## Deviations from Assessment

None.

## Follow-ups

- Re-run the real private-Hub preparation reproduction with a fresh state root.
- Run the canonical repository verification gate.
