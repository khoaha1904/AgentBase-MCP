# Bug Fix: Repository card label overflow

- **Slug**: repository-card-label-overflow
- **Fixed**: 2026-08-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Repository cards now ellipsize labels within the fixed card width while retaining the complete Repository title in projection data, filters and selection details.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/app/hub-okf/visualization/domain-site-assets/app.js` | modified | Constrained Repository label width and enabled Cytoscape ellipsis. |
| `src/app/hub-okf/visualization/visualization.test.ts` | updated test | Pins the generated Repository label constraint. |

## Tests Added or Updated

- `[AB-VIS-006..010][AB-VIS-012..022] static Domain site is reproducible, offline and no-overwrite` — asserts the generated Repository style uses a card-bounded ellipsis.

## Local Verification

- `node --test src/app/hub-okf/visualization/visualization.test.ts` → 4/4 passed.
- Cytoscape `3.34.2` locally declares and implements `text-wrap: ellipsis`.

## Deviations from Assessment

None.

## Follow-ups

- Rebuild and publish the current Crawler Domain snapshot after the repository gate passes.
