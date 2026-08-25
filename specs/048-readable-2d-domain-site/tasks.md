# Tasks: Readable 2D Domain site

## Phase 1 — Dependency boundary

- [x] T001 Replace Three.js with pinned Cytoscape.js in `package.json` and `package-lock.json`

## Phase 2 — User Story 1: readable 2D map

- [x] T002 [US1] Replace the copied renderer asset in `src/app/hub-okf/visualization/domain-site.ts`
- [x] T003 [US1] Replace the 3D browser shell and styles in `src/app/hub-okf/visualization/domain-site-assets/`
- [x] T004 [US1] Render the unchanged Published projection through a deterministic 2D layout in `src/app/hub-okf/visualization/domain-site-assets/app.js`

## Phase 3 — User Stories 2 and 3: inspect and control

- [x] T005 [US2] Preserve search, filters, selection, focus, reset and details in `src/app/hub-okf/visualization/domain-site-assets/app.js`
- [x] T006 [US3] Add the default-off Flow-step toggle in `src/app/hub-okf/visualization/domain-site-assets/`

## Phase 4 — Contracts and qualification

- [x] T007 Update requirement-linked coverage in `src/app/hub-okf/visualization/visualization.test.ts`
- [x] T008 Reconcile high/low-level current truth in `docs/present/13-visualizing-published-knowledge.md` and `docs/design/13-visualization/`
- [x] T009 Run the focused and repository gates, then rebuild and publish Retail/Crawler snapshots in `../domain-hub/`

## Dependencies

T001 precedes T002–T004. T002–T004 precede interaction work. T007–T009 close
the capability only after both user journeys work.
