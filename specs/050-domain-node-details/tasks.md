# Tasks: Domain node details

## Phase 1 — Projection and browser behavior

- [X] T001 [US1] Add initial complete-node and boundary visibility assertions in `src/app/hub-okf/visualization/visualization.test.ts`
- [X] T002 [US1] Render every projection node initially and use circular node bodies with labels below in `src/app/hub-okf/visualization/domain-site-assets/app.js`
- [X] T003 [US2] Add right-side drawer controls, endpoint-title relation summaries and safe empty states in `src/app/hub-okf/visualization/domain-site-assets/index.html`, `app.css` and `app.js`
- [X] T004 [US3] Add native text-only document overview dialog with close/Escape behavior in `src/app/hub-okf/visualization/domain-site-assets/index.html`, `app.css` and `app.js`

## Phase 2 — Contracts and qualification

- [X] T005 Update capability 050 status and current high/low visualization requirements in `docs/present/13-visualizing-published-knowledge.md` and `docs/design/13-visualization/`
- [X] T006 Run quickstart and `npm run verify`, then mark capability 050 complete in `specs/CURRENT.md` and `.specify/feature.json`

## Dependencies

T001 precedes T002. T002 precedes T003–T004. T005–T006 require all browser tests.
