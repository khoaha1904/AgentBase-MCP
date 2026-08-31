# Bug Fix: Embedded resource evidence is not retained in frontmatter

- **Slug**: embedded-resource-source-retention
- **Fixed**: 2026-08-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Initial Ingest now retains embedded candidate evidence in the parent concept's
frontmatter and Finalize restores a removed source record from the frozen
Receipt together with body knowledge.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/authoring/initial-ingest-skeleton.ts` | modified | Adds deduplicated embedded observation sources to parent skeletons. |
| `src/app/hub-okf/authoring/authoring-session.ts` | modified | Restores missing parent source records during Receipt normalization. |
| `src/app/hub-okf/authoring/receipt-authoring.test.ts` | updated test | Removes one embedded source and proves exact restoration. |
| `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md` | modified | Aligns AB-INGEST-019/020 with Published evidence resolution. |

## Tests Added or Updated

- `[AB-MCP-024..030]` now verifies structured and semantic embedded evidence is
  present in the initial parent and remains exactly once after Finalize repair.

## Local Verification

- `node --test --experimental-strip-types src/app/hub-okf/authoring/receipt-authoring.test.ts` → 1/1 passed.
- `npm run typecheck` → passed.
- `npm run verify` → 158/158 tests passed; all static, dependency, secret and spec gates passed.

## Deviations from Assessment

None.

## Follow-ups

- Repair the already-published Crawler documents with the exact missing source
  records, then rebuild the Domain site and require zero related omissions.
