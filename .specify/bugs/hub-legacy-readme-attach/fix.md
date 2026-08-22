# Bug Fix: Legacy Hub attach requires README

- **Slug**: hub-legacy-readme-attach
- **Fixed**: 2026-08-22
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Existing Hub attachment now admits a clean valid OKF root without requiring an
explanatory README. New MCP-created Hubs still generate README unchanged.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/workspace/setup.ts` | modified | Removed only the redundant existing-Hub README gate. |
| `src/app/hub-okf/workspace/local-only-e2e.test.ts` | updated test | Added legacy no-README attach to the existing cohesive E2E. |
| `docs/design/11-review-and-publish/01-runtime-requirements.md` | modified | Clarified the legacy compatibility boundary. |

## Tests Added or Updated

- Existing local-only Hub E2E now commits README removal and admits the result
  through the real attach validation with a fake clone transport.

## Local Verification

- `node --test src/app/hub-okf/workspace/local-only-e2e.test.ts` — passed.
- `npm run typecheck` — passed.
- `git diff --check` — passed.

## Deviations from Assessment

None.

## Follow-ups

- Reproduce against the real existing Hub through MCP's dedicated credential.
- Run the canonical offline gate after that non-mutating attachment proof.
