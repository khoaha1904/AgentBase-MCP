# Tasks: mock Domain Enrichment qualification

## Phase 0 — Lifecycle and consistency gate

- [X] T001 Reconcile high-level relation/domain-enrichment decisions with the
  fixture-only mock boundary.
- [X] T002 Add low-level mock provider qualification design and
  `AB-ENRICH-011..014` runtime requirements.
- [X] T003 Add this spec/plan and set it as the active capability without
  rewriting capability 052 history.

## Phase 1 — Candidate and fixture contract

- [X] T004 Inspect selected source/Published evidence and record a bounded
  producer/consumer hypothesis report with confidence and limitations.
- [X] T005 Define an ephemeral Crawler-shaped Published fixture with at least two
  repositories, Questions, evidence IDs and exact queue candidate scope.
- [X] T006 Define deterministic queue response/failure cases and ensure fixture
  values are visibly synthetic and never production Hub input.

## Phase 2 — Mock adapter qualification

- [X] T007 Extract/reuse a mock process runner at the AWS CLI process boundary;
  do not fork `AwsCliAdapter` behavior.
- [X] T008 Test exact argv and normalized response handling for version, STS,
  queue URL and queue attributes; reject list/scan/arbitrary command paths.
- [X] T009 Run Domain Enrichment against the fixture and assert confirmed,
  expected-ARN rejected, unresolved limitation and retryable/retry outcomes.

## Phase 3 — Proposal safety and evidence

- [X] T010 Assert relation/identity/Question changes appear only in temporary
  proposal inspection and Published base bytes/commit remain unchanged.
- [X] T011 Assert no network, real credential, source mutation or canonical
  Accept/Publish call occurs in qualification.
- [X] T012 Keep mock qualification distinct from fresh model-backed Crawler
  qualification and record the deferred real-data boundary.

## Phase 4 — Completion

- [X] T013 Reconcile high-level, low-level, spec, code and tests; run the
  consistency gate.
- [X] T014 Run `npm run spec:check`, focused tests, `npm run verify` and
  `git diff --check`; mark capability complete only when all pass.
