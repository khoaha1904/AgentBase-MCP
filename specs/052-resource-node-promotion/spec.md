# Capability 052 — Evidence-backed resource nodes

> Status: complete; implementation and deterministic qualification passed.

## Objective

Make graph node eligibility explicit and promote independently useful cloud
resources without turning every infrastructure declaration into a concept. The
first implementation slice covers common AWS serverless/data services while the
policy and OKF roles remain provider-neutral.

## Owner decisions

- A node is a persisted concept instance admitted to the Published projection;
  embedded knowledge, governance documents and evidence rows are not nodes.
- Stable identity and independent query/link value remain mandatory. Resource
  promotion additionally needs evidence of an operational or integration
  boundary; detection alone never promotes.
- The first AWS coverage is Lambda (existing baseline), SQS, SNS, EventBridge,
  S3, DynamoDB and RDS. EC2/VM remains hosting evidence unless a separately
  evidenced workload is a Component/Function.
- SQS/SNS transport may be a `Resource` node; a distinct message/event contract
  is an `Interface` node only when it independently passes the same gates.
- Existing `Resource`/`Interface` schemas, canonical predicates, external
  identity envelope, Published Markdown authority and MiniSearch remain in use.
- GCP/Azure and additional AWS products are future profiles, not a schema or
  predicate fork. Provider additions must use a conformance suite and approved
  deviations.
- The current generated Crawler Domain snapshot is reset before fresh
  qualification. Benchmark results, source fixtures and Git history are retained.

## User stories

### US1 — Understandable node semantics (P0)

As a maintainer, I can decide whether an observed item is a standalone node,
embedded knowledge or a Question using a provider-neutral gate.

### US2 — Explicit messaging topology (P0)

As a maintainer, I can see a shared SQS queue or SNS topic between producer and
consumer workloads when identity and interaction evidence are complete.

### US3 — Common-service coverage without graph noise (P1)

As a maintainer, I can qualify common AWS messaging and data resources while
private implementation resources remain embedded and searchable in their parent.

### US4 — Provider-extensible contract (P1)

As a future provider maintainer, I can add a technology profile and fixtures
without changing OKF role names, canonical relationship kinds or projection
schema.

## Non-goals

- No provider-specific OKF schema such as `AWS::SQS::Queue`.
- No automatic promotion from a Terraform resource declaration, keyword or
  display-name match alone.
- No full AWS inventory, account scan, live watcher or provider SDK requirement.
- No message schema inference from queue/topic names.
- No Published concept merge/redirect or destructive migration.
- No semantic/vector search or replacement of the existing MiniSearch query path.
- No promotion of embedded rows to nodes merely for UI density.

## Acceptance evidence

- Requirement-linked tests cover standalone, embedded, ambiguous and unsupported
  outcomes for messaging/data evidence and preserve the existing Lambda path.
- A two-repository Lambda–SQS–Lambda fixture produces one queue `Resource` node,
  two workload nodes and evidenced canonical relations; name-only matching does
  not.
- An SNS fan-out fixture produces one topic `Resource` node only with complete
  publisher/subscriber evidence; incomplete fan-out remains bounded.
- S3, DynamoDB and RDS fixtures prove shared/independent resources can promote
  while private declarations remain embedded.
- Profile conformance tests prove a future-provider-shaped mapping can reuse the
  same role/identity/relation contract without adding a provider-specific type.
- Published projection/UI continues to render accepted nodes and excludes
  embedded rows; query still finds embedded text through the parent concept.
- `npm run spec:check`, focused tests, `npm run verify` and `git diff --check`
  pass. The generated Crawler Domain snapshot is reset before the next
  model-backed qualification. Because the current Crawler fixture has no SQS/SNS
  evidence, this capability uses deterministic two-repository messaging/data
  fixtures for node-promotion proof; a fresh Crawler model run remains deferred
  until new resource-bearing Hub data is authored.
- Any gap affecting schema, authority, provider scope, latency or destructive
  recovery returns to high-level and low-level documents before implementation
  continues.

## Implementation evidence

- Existing provider-neutral promotion logic is reused and covered by guidance
  tests for SQS, SNS, EventBridge, S3, DynamoDB, RDS and an unmapped
  future-provider-shaped resource.
- MiniSearch indexes standalone concept technology metadata from
  `agentbase.technology`; embedded rows remain searchable through their parent.
- Two-repository SQS and SNS fan-out query fixtures prove one Resource identity,
  direct relation context and bounded subscriber visibility. Visualization
  fixtures render the queue as a real `Resource` node.
- `npm test` passes 96/96 tests. `npm run verify` is the final completion gate.
