# Implementation Plan: Domain node details

**Branch**: `050-domain-node-details` | **Date**: 2026-08-26
**Spec**: [spec.md](spec.md)

## Summary

Reuse the existing Published visualization projection and static Cytoscape
site. Make the projection's existing complete Domain scope visible on first
render, then add a small browser-side selection drawer and text-only document
overview modal. No new dependency, projection authority, MCP contract or Hub
field is introduced.

## Technical context

- Runtime: Node.js 24 generator plus offline static HTML/CSS/JavaScript.
- Existing dependency: Cytoscape.js 3.34.2; no new dependency.
- Authority: one exact Published `PublishedVisualizationProjection`.
- Browser state: selected node, visible node set, drawer/modal state only.
- Bounds: existing projection node/edge and document/source bounds; displayed
  Markdown overview is assembled from bounded projection values.
- Verification: colocated visualization tests, generated asset assertions and
  `npm run verify`.

## Design

1. Keep `buildPublishedVisualizationProjection` as the sole graph authority;
   its `nodes` already contain every selected primary and boundary concept.
2. Change the initial browser visible set from high-level nodes to all
   projection nodes. Keep focus/filter controls unchanged.
3. Render nodes as circles with label text below. Preserve type, membership and
   Question visual cues through color, border and badge styling.
4. Use the existing details aside as a right-side drawer on wide screens and an
   overlay panel on narrow screens. Populate it with safe `textContent` and
   endpoint titles from projection data.
5. Add a native `<dialog>` document overview. It shows title, type, description,
   identity/path, source references and direct relation summaries as text; it
   never interprets Markdown as HTML or fetches a document.
6. Keep generated output deterministic and static. Increment the generator
   version because browser assets change.

## Data model

No persisted model changes. The browser derives `nodeById`, question metadata,
direct relation summaries and one transient document overview from the existing
projection.

## Constitution check

- Evidence before abstraction: existing projection and visualization fixtures
  are the authority; no inferred edges are added.
- Local-first explicit authority: browser remains offline and Published-only.
- Agent-navigable ownership: changes remain under `app/hub-okf/visualization`.
- Specification/determinism: assets remain reproducible and tests are linked to
  AB-VIS plus capability-050 requirements.

## Risks and recovery

Malformed projection data remains behind the existing fallback. Text-only DOM
insertion prevents knowledge content from becoming executable markup. Closing
the drawer/modal clears only browser selection state; no Hub data changes.
