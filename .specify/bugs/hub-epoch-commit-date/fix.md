# Bug Fix: Hub Proposal Commits Appear Decades Old

- **Slug**: hub-epoch-commit-date
- **Fixed**: 2026-08-12
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Hub proposal commits now use the immutable proposal creation timestamp instead
of the hardcoded 2000-01-01 epoch. Retry and recovery remain deterministic
because that timestamp is persisted before submission.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/submit.ts` | modified | Reads, validates and applies persisted `createdAt`. |
| `src/app/hub-okf/submit.test.ts` | updated tests | Pins the exact timestamp and malformed-state rejection. |
| `src/app/hub-okf/local-e2e.test.ts` | updated test | Verifies real Git author and committer dates. |
| `docs/specs/agentbase-hub.md` | modified | Clarifies deterministic, meaningful commit dates under AB-HUB-010. |

## Tests Added or Updated

- `[AB-HUB-009..011] submit commits reviewed bytes...` — asserts the Git commit
  request receives `2026-08-12T00:00:00Z`, not the year-2000 epoch.
- `[AB-HUB-005][AB-HUB-009] submit rejects an invalid persisted creation timestamp before commit`.
- Local Git E2E reads the created commit and verifies both dates match proposal
  creation time.

## Local Verification

- `node --test src/app/hub-okf/submit.test.ts src/app/hub-okf/local-e2e.test.ts src/app/hub-okf/recovery.test.ts` → 8 passed, 0 failed.

## Deviations from Assessment

None.

## Follow-ups

- Existing merged commit `f1b4effd...` intentionally remains unchanged.
- Run the canonical repository verification gate.
