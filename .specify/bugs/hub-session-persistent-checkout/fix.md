# Bug Fix: Persistent Hub sessions cannot finalize

- **Slug**: hub-session-persistent-checkout
- **Fixed**: 2026-08-13
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Session finalization now validates its stored checkout against the exact
configured persistent Hub root instead of requiring that clone to live inside
private proposal state.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/authoring-session.ts` | modified | Require exact expected checkout root, absolute directory and non-symlink identity |
| `src/app/hub-okf/runtime-actions.ts` | modified | Pass the configured persistent Hub root into finalize |
| `src/app/hub-okf/authoring-session.test.ts` | modified | Exercise external persistent clone and wrong-root rejection |
| `scripts/architecture-baseline.json` | reviewed ceiling update | Composition root grew only for the exact checkout-identity wiring; no file split |

## Tests Added or Updated

- `[AB-HUB-003..008]` now prepares/finalizes with checkout outside state root.
- The same test rejects a mismatched expected checkout before proposal creation.

## Local Verification

- Focused Hub authoring/MCP/CLI tests → 9 passed, 0 failed.
- `npm run typecheck` → passed.
- The first architecture run correctly rejected unreviewed composition growth;
  the exact owner-approved ceiling was then updated to measured values.
- `npm run verify` → 219 passed, 0 failed; architecture 0 errors and 5
  visible warnings.

## Deviations from Assessment

The exact `runtime-actions.ts` architecture mark required a measured ceiling
update. The cohesive composition file was retained rather than split or
artificially compressed.

## Follow-ups

- Complete the separately recorded T043 local acceptance and verify that its
  Hub commit remains unpublished.
