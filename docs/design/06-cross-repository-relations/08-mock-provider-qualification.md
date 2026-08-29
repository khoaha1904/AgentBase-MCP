# 06.08 — Mock provider qualification

> Status: Implemented in capability 053; there is no production mock mode.

## Purpose

Mock qualification verifies Domain Enrichment when a topology needed for testing
has no AWS account or sufficiently broad Published Domain. It tests candidate
manifest, provider adapter, reconciliation, Question outcomes and proposal
lifecycle; it does not replace real-provider qualification.

## Boundary

```text
source/Published evidence
        ↓
bounded relation hypothesis + confidence
        ↓
temporary Published fixture + exact candidate manifest
        ↓
deterministic mock AWS CLI response
        ↓
existing SQS adapter → reconciliation → Enrichment proposal
```

- The harness is called directly by test/qualification scripts; it exposes no
  public MCP tool or production `--mock` flag.
- The mock process runner receives the exact argv released by `AwsCliAdapter` and
  returns matching shapes for `--version`, STS caller identity, get-queue-url
  and get-queue-attributes.
- Fixture account/region/name/ARN are deterministic, recognizable test values.
  It makes no network calls, reads no credentials and scans no account.
- A candidate hypothesis records source evidence IDs, owning repository,
  predicate, confidence and limitation. Mock names/ARNs never turn it into fact.

## Fixture contract

A minimum fixture has:

1. one Published Domain in a temporary Hub;
2. at least two Repositories in that Domain;
3. source concepts/Questions with valid identity and interaction evidence;
4. one or more shared queue candidates with equal name/account/region;
5. response maps for confirmed, expected-ARN mismatch, unavailable/denied and
   retryable failure;
6. expected proposal assertions: external identity, canonical relation, Question
   state and unchanged Published base.

A Crawler-shaped fixture may use `crawler-events`, `crawler-results` and
`crawler-review` concepts from offline E2E; it must not be mistaken for real
Crawler Domain data.

## Candidate investigation

Investigation is only a bounded pre-fixture step: read selected
Published/source references, group matching/related queue/endpoint names,
compare producer/consumer evidence and record confidence. An uncertain candidate
goes to a Question rather than creating a Resource/edge automatically.

Do not build a generic cross-repository inference engine, list a provider
account, infer a real ARN from a name or automatically Accept/Publish.

## Safety, recovery and verification

Mock state stays in a temporary test root or separate qualification artifact.
When the fixture is wrong, recreating it does not affect the canonical Hub. The
harness stops at proposal/inspection in temporary state and does not call Accept
or Publish. Production MCP retains no mock mode, so mock observation cannot
enter the canonical publication path.

The capability proves that the same adapter/reconciliation path handles:

- confirmed shared queue across source repositories;
- rejected identity when ARN mismatches expected value;
- unresolved access/not-found limitation;
- retryable failure followed by successful retry;
- proposal relation/identity/Question changes while the Published fixture before
  Accept remains unchanged.
