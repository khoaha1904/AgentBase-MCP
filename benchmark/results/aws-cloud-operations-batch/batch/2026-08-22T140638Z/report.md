# aws-cloud-operations-batch — Batch Initial Ingest

- Outcome: invalid
- Proposal: unavailable
- Domain: domains/cloud-operations
- Concepts: 0 {}
- Elapsed: 212787 ms
- Tokens: {"inputTokens":845160,"cachedInputTokens":783616,"cacheWriteInputTokens":0,"uncachedInputTokens":61544,"outputTokens":7973,"reasoningOutputTokens":1605}

## Member attribution

- Unavailable
- Shared paths: none

## OKF findings

- None

## MCP/runtime findings

- Batch Init must finalize exactly one proposal; observed 0
- finalize_batch_hub_ingest_proposal must run exactly once; observed 0
- inspect_hub_okf_proposal must run exactly once; observed 0
- get_architecture must run once per member; observed 1/2
- get_okf_authoring_schemas must run once per member; observed 1/2
- prepare_hub_okf must run once per member; observed 1/2
- record_batch_hub_ingest_member must run once per member; observed 1/2

## Benchmark findings

- combined OKF artifact is unavailable

Deterministic structure and paths cannot prove every authored claim; human review remains required.
