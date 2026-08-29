# Bug Assessment: Crawler map can appear empty after a site rebuild

- **Slug**: crawler-empty-map-cache
- **Created**: 2026-08-26
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: medium

## Report

> the crawler is not showing any images

## Symptom

A previously visited Crawler Pages URL can show an empty map after the Domain
site changes renderer. The same Published snapshot must render its seven nodes
and six accepted links.

## Reproduction

1. Visit a generated Domain site before rebuilding it with changed browser assets.
2. Publish the rebuild under the same unversioned asset paths.
3. Revisit while GitHub Pages still serves cached files from the prior build.

A fresh Chrome profile renders Crawler correctly, while GitHub Pages confirms a
ten-minute cache lifetime for the reused `assets/app.js` and `assets/app.css`
paths.

## Suspected Code Paths

- `src/app/hub-okf/visualization/domain-site-assets/index.html` — references
  CSS and JavaScript through stable unversioned paths.
- `src/app/hub-okf/visualization/domain-site-assets/app.js` — fetches the
  Published projection through the same stable `data/domain.json` path.
- `src/app/hub-okf/visualization/domain-site.ts` — copies the template without
  binding browser resource URLs to the deterministic build identity.

## Root Cause Hypothesis

Confidence: high. A new HTML page can load an older cached application asset,
or an older page can request files removed by the rebuild. The renderer and
projection are valid; the browser can receive files from different builds.

## Proposed Remediation

**Preferred**: derive one deterministic browser cache key from the Domain-site
generator version and exact Published commit. Inject it into the generated HTML
resource URLs, then reuse the JavaScript module query when fetching
`data/domain.json`. This keeps one static site and requires no cache service.

**Files likely to change**:

- `docs/design/13-visualization/04-runtime-requirements.md`
- `src/app/hub-okf/visualization/domain-site.ts`
- `src/app/hub-okf/visualization/domain-site-assets/index.html`
- `src/app/hub-okf/visualization/domain-site-assets/app.js`
- `src/app/hub-okf/visualization/visualization.test.ts`

**Tests to add or update**:

- Pin that generated HTML references CSS and JavaScript with the same exact
  build key and that projection fetch reuses it.
- Preserve byte-equivalent generation for identical Published input.

## Risks & Considerations

- The generated output must remain deterministic and fully offline.
- This prevents mixed files in future builds; a browser already holding the
  original unversioned page may still need one hard refresh or cache expiry.

## Open Questions

None.
