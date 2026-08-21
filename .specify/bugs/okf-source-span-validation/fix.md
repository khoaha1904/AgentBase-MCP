# Bug Fix: Finalize accepts repository source spans beyond the file

- **Slug**: okf-source-span-validation
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Initial Ingest now binds the user-authorized source checkout to private session
state and rejects impossible current-repository citations at Finalize. A failed
check leaves the authoring session available for correction and retry.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/query/runtime-actions.ts` | modified | Passes the authorized local source root into the session. |
| `src/app/hub-okf/authoring/authoring-session.ts` | modified | Keeps the root private and checks new current-repository citations against real files before proposal preparation. |
| `src/app/hub-okf/authoring/initial-ingest.test.ts` | updated test | Reproduces an out-of-range span, repairs it and Finalizes the same session. |
| `specs/022-single-repository-ingest/*` | updated | Records AB-INGEST-014 and its completed task/evidence. |
| `docs/contracts/okf.md` | updated | Publishes the current source-validation boundary. |

## Scope

- Checks only sources owned by the current authorized repository.
- Requires a path beneath that checkout, a regular file and an in-range end line.
- Does not dereference foreign repositories or add scanning, parsing,
  completeness scoring or provider-specific behavior.
- Does not copy the local checkout path into Hub knowledge or proposal metadata.

## Deviations from Assessment

None.

