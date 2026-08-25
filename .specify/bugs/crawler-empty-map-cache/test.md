# Bug Verification: Crawler map can appear empty after a site rebuild

- **Slug**: crawler-empty-map-cache
- **Tested**: 2026-08-26
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The rebuilt Crawler snapshot loads one build-bound set of browser files and
renders all seven nodes and six links in a fresh Chrome profile. No regression
was found in the repository gate.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction after fix | generate Crawler, serve it locally and open it with fresh headless Chrome | pass | visible 2D map contains 7/7 nodes and 6/6 links |
| Browser resource identity | inspect requests and generated HTML | pass | CSS, Cytoscape, app and Published JSON share `2-59059443...` |
| Focused regression | `node --test --experimental-strip-types src/app/hub-okf/visualization/visualization.test.ts` | pass | 3/3 tests |
| Repository gate | `npm run verify` | pass | 72/72 tests; spec, dependency, bundle, secret and diff gates passed |

## Output Excerpts

```text
GET /crawler/assets/app.js?build=2-59059443... 200
GET /crawler/data/domain.json?build=2-59059443... 200
tests 72; pass 72; fail 0
```

## Residual Risks

- A browser already holding the original unversioned page may require one hard
  refresh or its existing ten-minute cache entry to expire. Subsequent generated
  builds carry deterministic browser identities.

## Recommendation

Close the bug after rebuilding the Pages output from this MCP source.
