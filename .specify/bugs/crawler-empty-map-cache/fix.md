# Bug Fix: Crawler map can appear empty after a site rebuild

- **Slug**: crawler-empty-map-cache
- **Fixed**: 2026-08-26
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Generated pages now bind every browser resource to one deterministic build key
derived from generator version and exact Published commit, preventing mixed
renderer, application and projection files after a Pages rebuild.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `docs/design/13-visualization/04-runtime-requirements.md` | modified | AB-VIS-007 now requires build-bound browser resources |
| `src/app/hub-okf/visualization/domain-site.ts` | modified | injects the deterministic build key |
| `src/app/hub-okf/visualization/domain-site-assets/index.html` | modified | versions local CSS and JavaScript URLs |
| `src/app/hub-okf/visualization/domain-site-assets/app.js` | modified | loads Published JSON with the same build query |
| `src/app/hub-okf/visualization/visualization.test.ts` | updated test | pins exact shared cache identity and deterministic output |

## Tests Added or Updated

- `[AB-VIS-006..010][AB-VIS-012..014] static Domain site is reproducible, offline and no-overwrite` — checks the shared exact build key and projection query.

## Local Verification

- `node --test --experimental-strip-types src/app/hub-okf/visualization/visualization.test.ts` → 3/3 passed.

## Deviations from Assessment

None.

## Follow-ups

- Rebuild both published snapshots and verify Crawler through a fresh browser request carrying the generated build key.
