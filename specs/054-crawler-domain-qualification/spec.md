# Capability 054 — Crawler Domain end-to-end qualification

> Status: complete; deterministic qualification and repository verification
> passed without changing canonical Hub truth.

## Objective

Qualify the complete source-to-UI path for a realistic Crawler Domain: three
independent Git repositories are represented by an ephemeral Published fixture
materialized from their exact source commits (the existing deterministic Batch
Initial Ingest E2E covers the three-member lifecycle),
source-backed Lambda and SQS Resource concepts are projected, queried and
rendered into the reset `domain-hub/crawler` static site, then the existing mock
Domain Enrichment path verifies a bounded queue identity proposal.

## Owner decisions

- The existing `serverless-data-pipelines-demo` plus two minimal fixture repos
  (`crawler-publisher`, `crawler-worker`) are the only source dataset in this
  slice.
- Publisher and worker explicitly share the queue name `crawler-jobs`; the
  queue is a provider-neutral Resource node because source evidence gives it an
  independent identity and relation value.
- The qualification Hub and generated site are disposable review artifacts.
  Mock ARN/provider observations remain proposal-only and never enter the
  canonical Hub or query corpus.
- The harness reuses current OKF loader, MiniSearch query,
  visualization projection/site generator and SQS adapter. No new public MCP
  tool, query language, schema, provider profile, dependency or model call is
  introduced.
- SNS, additional AWS products and real AWS/model-backed Crawler qualification
  remain deferred.

## Acceptance criteria

1. Three standalone fixture repositories are clean Git roots and expose
   source-backed Lambda/SQS evidence with stable source commits.
2. The deterministic Published fixture contains all three Repository concepts,
   publisher/worker Function concepts, a standalone SQS Resource concept and
   directed producer/consumer relations with provenance tied to each member.
3. `search_hub_okf` finds `crawler-jobs` as an independent Resource and returns
   bounded relation context; exact Published isolation and deterministic ranking
   remain intact.
4. The projection and static site include every eligible node. The generated
   `domain-hub/crawler/agentbase-build.json` records deterministic counts and the
   site contains no mock ARN, credential, local source path or live endpoint.
5. Mock Domain Enrichment confirms the matching queue candidate and leaves the
   Published fixture unchanged; no list/scan/network/provider mutation occurs.
6. Focused qualification tests, `npm run spec:check`, `npm run verify` and
   `git diff --check` pass.

## Implementation evidence

- Added clean fixture repositories `crawler-publisher` (commit
  `22ff7a718e28b9deb151abcb2b4cf598f3697017`) and `crawler-worker` (commit
  `8cd506e999e897b9978b90affb55bef5826c385d`) beside the existing pipeline
  fixture (`1483d3869ecc148195bce092900d8556332db609`).
- The deterministic harness projects 9 nodes (3 Repository, 2 Function, 3
  Resource and 1 Domain), 12 directed edges and 1 open Question badge.
- MiniSearch finds `resources/crawler-jobs.md` within the Crawler Domain with
  bounded relation context. Mock SQS returns `confirmed`; the Published tree
  digest is unchanged and no list operation is issued.
- Generated `AgentBase/domain-hub/crawler` is an offline snapshot carrying the
  same counts. It contains no mock ARN, credential, local source path or live
  endpoint.
- `npm run verify` passes all 99 tests, including the new requirement-linked
  qualification test.

## Deferred boundary

This proves workflow and source-shape coverage, not that `crawler-jobs` exists
in a live AWS account. A real provider/model run is a separately authorized
follow-up and must replace, rather than silently promote, this fixture.
