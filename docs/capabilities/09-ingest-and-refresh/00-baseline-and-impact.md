# 09 — Baseline and impact checkpoint

> Status: Single-repository and Batch Initial Ingest, AWS/SQS Enrichment,
> freshness CI and bounded workspace Scan are implemented.

## Current baseline

- The Repository graph round manages source identity, freshness, evidence and cleanup.
- Hub prepare creates a private authoring session from the exact active Hub head.
- The Agent authoring workspace keeps a separate base/bundle and bounded continuity.
- Finalize validates, locks and materializes an immutable proposal.
- Inspect, Accept, pending commits, pull-request publication and recovery are separated.
- Refresh protects protected bytes and evidence from other repositories.

Baseline sources:

- [Repository graph/evidence](../../../src/app/repository-okf/README.md)
- [Hub authoring session](../../../src/app/hub-okf/authoring/authoring-session.ts)
- [Refresh reconciliation](../../../src/app/hub-okf/authoring/refresh.ts)
- [Hub MCP boundary](../../../src/app/hub-okf/mcp/mcp-tools.ts)

## Closed gaps

`agentbase-ingest` and `agentbase-refresh` connect graph reading, evidence-bearing
guidance, prepared skeletons, changed-document validation, finalize and inspect.
The evidence digest for a new proposal is derived from validated guidance and
exact source state instead of opaque caller input.

## Remaining gaps

Public `agentbase-scan` is implemented under a bounded Published-only contract.
Batch Refresh and mixed Init/Refresh remain outside the MVP; Batch Initial Ingest
checkpoint/retry and the Hub CI freshness projection are implemented.

## Result

The implementation preserves deterministic graph, proposal, validation, Git
publication and recovery boundaries. The remaining work continues as independent
vertical slices; it does not reopen the single-repository flow as a general
orchestration framework.
