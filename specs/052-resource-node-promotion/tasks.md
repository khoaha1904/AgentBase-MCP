# Tasks: evidence-backed resource nodes

## Phase 0 — Documentation and consistency gate

- [X] T001 Reconcile the high-level schema-selection, relation and visualization
  decisions with the node policy and common-AWS coverage boundary.
- [X] T002 Add low-level node eligibility/provider coverage requirements and
  link this capability from `specs/CURRENT.md`.
- [X] T003 Freeze the behavior-family conformance matrix and fixture contracts.

## Phase 1 — P0 node and messaging semantics

- [X] T004 Add requirement-linked tests for stable identity, query/link value,
  operational boundary and interaction evidence gates.
- [X] T005 Reuse and verify provider-neutral standalone-vs-embedded promotion while
  preserving existing explicit embedded behavior and Question outcomes.
- [X] T006 Add SQS Resource-node fixtures and canonical Lambda publish/trigger
  relation validation.
- [X] T007 Add SNS topic/fan-out fixtures and bounded incomplete-evidence cases.

## Phase 2 — P1 common-service coverage

- [X] T008 Add EventBridge messaging/integration profile cases.
- [X] T009 Add S3, DynamoDB and RDS shared/independent Resource cases; keep
  private declarations embedded.
- [X] T010 Add two-repository Lambda–SQS–Lambda and SNS fan-out qualification
  with strong identity and interaction evidence.
- [X] T011 Add provider-profile conformance fixture showing future GCP/Azure
  mapping reuse without provider-specific schema or predicate.

## Phase 3 — Projection, query and qualification

- [X] T012 Verify accepted Resource nodes flow through Published projection and
  static Domain site without rendering embedded rows as fake nodes.
- [X] T013 Verify MiniSearch returns embedded resource terms through their parent
  while promoted Resource nodes are directly searchable and relation-aware.
- [X] T014 Reset the generated Crawler snapshot and record that a fresh
  resource-bearing model qualification is deferred until new Hub data exists.

## Phase 4 — Completion

- [X] T015 Reconcile high-level, low-level, spec, code and verification artifacts.
- [X] T016 Run `npm run spec:check`, focused tests, `npm run verify` and
  `git diff --check`; mark the capability complete only when all pass.
