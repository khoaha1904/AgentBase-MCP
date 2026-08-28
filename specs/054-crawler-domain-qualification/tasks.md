# Tasks: Crawler Domain qualification

## Phase 0 — lifecycle and consistency

- [X] T001 Reconcile high-level, low-level and active requirements for the
  three-repository disposable qualification boundary.
- [X] T002 Keep `specs/CURRENT.md` pointed at Capability 054 before runtime work.

## Phase 1 — source dataset

- [X] T003 Add clean `crawler-publisher` and `crawler-worker` fixture repos with
  explicit Lambda/SQS source evidence and reproducible commits.
- [X] T004 Define a deterministic ephemeral Published OKF fixture for the three
  repositories, Resource node and directed relations.

## Phase 2 — qualification path

- [X] T005 Add requirement-linked end-to-end qualification test/harness covering
  projection, query, relation context and static site build.
- [X] T006 Reuse the mock SQS runner and prove a matching queue proposal without
  Published mutation or account-wide scan.
- [X] T007 Generate the fresh `domain-hub/crawler` snapshot from the checked
  qualification projection.

## Phase 3 — completion

- [X] T008 Record counts, source commits and deferred real-data boundary.
- [X] T009 Run focused tests, spec check, full verify and diff check; close only
  after docs/code/tests agree.
