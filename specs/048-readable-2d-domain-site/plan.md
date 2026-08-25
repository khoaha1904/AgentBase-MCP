# Implementation Plan: Readable 2D Domain site

**Branch**: `046-initial-ingest-discovery` | **Date**: 2026-08-26 | **Spec**: [spec.md](spec.md)

## Summary

Keep the current Published visualization projection and one-shot generator, but
replace the custom Three.js scene with a Cytoscape.js 2D map. Copy the pinned
local browser asset into each generated snapshot exactly as the old renderer
asset was copied.

## Technical context

- **Runtime**: Node.js 24 MCP plus generated static HTML/CSS/JavaScript.
- **Dependency change**: remove `three@0.183.0`; add exact
  `cytoscape@3.34.2` (MIT, no external dependencies).
- **Storage**: unchanged Published projection JSON and build receipt.
- **Testing**: existing `node:test` visualization suite plus real static HTTP
  qualification for Retail and Crawler.
- **Constraints**: offline assets, no React/Vite/backend, no remote asset, no
  new MCP action, no projection or OKF change.
- **Enterprise gate**: confirm exact `cytoscape@3.34.2` availability in the
  company registry before enterprise release; current public development and
  Pages qualification do not prove that private-registry fact.

## Constitution check

- Modular-monolith ownership remains in `app/hub-okf/visualization`.
- The existing public entrypoint and deterministic projection are reused.
- One runtime dependency replaces one runtime dependency.
- No secret, graph database, provider or external lifecycle is added.

## Technical shape

1. Copy pinned `cytoscape.min.js` instead of two Three.js assets.
2. Translate the unchanged projection to local node/edge elements in the
   browser and use the library's built-in deterministic concentric layout.
3. Preserve existing controls and details; add one Flow display checkbox.
4. Replace 3D/WebGL fallback wording with a generic visualization fallback.
5. Rebuild Retail and Crawler snapshots and publish the generated diff.

## Source impact

- `package.json` and `package-lock.json`
- `src/app/hub-okf/visualization/`
- `docs/present/13-visualizing-published-knowledge.md`
- `docs/design/13-visualization/`
- `specs/048-readable-2d-domain-site/`

## Recovery

Generation remains atomic and refuses non-empty output. A missing or drifted
Cytoscape asset fails before output replacement. Existing generated sites stay
unchanged until explicitly regenerated.
