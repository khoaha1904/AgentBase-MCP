# Verification: Readable 2D Domain site

**Date**: 2026-08-26

## Result

Implemented and qualified. The Domain-site generator now emits one static 2D
Cytoscape.js map with local assets. It preserves the exact Published projection,
search, filters, lazy neighborhood reveal, one/two-hop focus, details and reset;
Flow-step edges are optional and hidden by default.

Retail and Crawler were rebuilt from Published commit
`59059443f71c358cbeebf84e6a12796f3d54aabe` and published by `domain-hub`
commit `38bdc81bf7bf6ed31c797635deb9a8317141df35`:

- <https://khoaha1904.github.io/domain-hub/retail/>
- <https://khoaha1904.github.io/domain-hub/crawler/>

## Evidence

- Retail: 24 nodes, 40 accepted edges, two Flows and zero open Questions.
- Crawler: seven nodes, six accepted edges, no Flow and one open Question.
- Local interaction check covered search, selection, one-hop focus, Flow toggle
  and reset; the final concentric overview was visually inspected.
- Both live HTML pages, renderer assets and Published JSON snapshots return HTTP
  200 from GitHub Pages.
- Generated output contains no Three.js asset or 3D/WebGL presentation text.
- `npm run verify`: passed; 72/72 tests plus specification, dependency,
  upstream-boundary, secret and whitespace gates passed.

## Enterprise release gate

The public build uses exactly `cytoscape@3.34.2`. Before an internal company
release, confirm that exact version exists in the company registry. AgentBase
must not add a public CDN or registry fallback.
