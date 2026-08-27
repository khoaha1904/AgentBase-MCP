# Capability 053 — Mock Domain Enrichment qualification

> Status: complete; implementation and deterministic qualification passed.

## Objective

Create a fixture-only mock provider path that lets AgentBase qualify
cross-repository Domain Enrichment without an AWS account or a non-empty
Published Crawler Hub. The harness must reuse the real SQS adapter,
reconciliation and proposal lifecycle while keeping synthetic observations out
of canonical Hub truth.

## Owner decisions

- Mock is a test/qualification harness, not a public MCP `--mock` mode.
- Candidate links are bounded hypotheses derived from selected source/Published
  evidence; the harness does not become a generic cross-repository inference
  engine.
- Queue name, account, region and ARN are deterministic fixture values. They are
  useful for testing identity matching, not proof of an AWS deployment.
- The harness runs against a temporary Published fixture and stops at proposal/
  inspection. It does not Accept or Publish mock evidence.
- Existing provider-neutral OKF roles, canonical predicates, external identity
  envelope and `AwsCliAdapter` remain authoritative. No provider/schema fork,
  durable index or production dependency is added.

## User stories

### US1 — Rehearse provider verification without AWS (P0)

As a maintainer, I can run the exact released SQS verification flow against a
deterministic CLI fixture and observe the same normalized outcomes as the real
adapter.

### US2 — Test bounded cross-repository hypotheses (P0)

As a maintainer, I can record a suspected producer/consumer relation with source
evidence, confidence and a fixed queue identity, then see whether Enrichment
reconciles it without silently treating the hypothesis as fact.

### US3 — Qualify proposal safety (P0)

As a maintainer, I can prove confirmed, rejected, unresolved and retryable paths
produce a reviewable proposal/checkpoint while the temporary Published base and
canonical Hub remain unchanged.

### US4 — Keep real qualification separate (P1)

As a maintainer, I can distinguish mock workflow coverage from real AWS
qualification and later replace the fixture adapter with a real session without
changing the candidate/reconciliation contract.

## Non-goals

- No public production mock flag or alternate MCP tool surface.
- No automatic account/service/region scan or generic relation discovery engine.
- No claim that a fixture ARN/name exists in AWS.
- No mock observation in canonical Published Hub, provider truth or real release
  benchmark.
- No SNS/Lambda/provider expansion in this capability; the first slice reuses the
  released AWS/SQS profile.
- No new schema, predicate, database, daemon, dependency or source-repository
  mutation.

## Acceptance evidence

- A temporary Crawler-shaped Published fixture contains at least two selected
  repositories and explicit producer/consumer evidence for one shared queue.
- A deterministic mock runner handles the same bounded argv contract for AWS
  version, STS account, queue URL and queue attributes, returning a stable ARN.
- Candidate preparation preserves evidence ownership, confidence/limitation and
  exact account/region scope; guessed identity or relation alone remains a
  Question/candidate.
- The real `AwsCliAdapter` and reconciliation path produce confirmed relation
  enrichment for a matching queue, reject an expected-ARN mismatch, retain an
  unresolved limitation, and recover a retryable failure on explicit retry.
- Finalization creates only a temporary proposal/inspection artifact. The
  Published fixture has no pre-Accept mutation and the harness does not call
  Accept or Publish.
- No network, real AWS credential, arbitrary command or account-wide list call is
  made during qualification.
- Requirement-linked tests cover `AB-ENRICH-011` through `AB-ENRICH-014` and the
  existing AWS/SQS E2E remains green.
- `npm run spec:check`, focused mock/enrichment tests, `npm run verify` and
  `git diff --check` pass.

## Deferred qualification

The bounded fixture investigation is recorded in
[hypothesis-report.md](hypothesis-report.md). It deliberately separates
workflow confidence from live-resource confidence.

The current Crawler source repository remains useful for Lambda/S3/Glue/
EventBridge qualification, but it has one repository and no SQS/SNS source
resource. A fresh model-backed Crawler run may be performed later after a
resource-bearing multi-repository dataset is authored. This capability's mock
fixture proves workflow safety and reconciliation only; it does not upgrade the
reset Crawler Hub snapshot.

## Implementation evidence

- Added reusable fixture-only `createMockAwsSqsRunner`, which handles only the
  released bounded AWS/SQS process calls and records argv for assertions.
- Reused the real `AwsCliAdapter`, Domain Enrichment reconciliation and proposal
  lifecycle; the existing Crawler-shaped multi-repository E2E now uses the
  shared runner and carries the new requirement IDs.
- Added direct mock runner tests for exact response shape, list/scan rejection,
  unresolved access and retryable failure/retry behavior.
- The bounded hypothesis report records synthetic queue identities and
  confidence/limitations separately from real Crawler source evidence.
- `npm test` passes 98/98; typecheck, spec check and diff check pass.
