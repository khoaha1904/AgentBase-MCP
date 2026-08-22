# aws-cloud-operations-batch — Batch Initial Ingest

- Outcome: invalid
- Proposal: unavailable
- Domain: domains/cloud-operations
- Concepts: 0 {}
- Elapsed: 187233 ms
- Tokens: {"inputTokens":744883,"cachedInputTokens":664320,"cacheWriteInputTokens":0,"uncachedInputTokens":80563,"outputTokens":6245,"reasoningOutputTokens":1103}

## Member attribution

- Unavailable
- Shared paths: none

## OKF findings

- None

## MCP/runtime findings

- Batch Init must finalize exactly one proposal; observed 0
- finalize_batch_hub_ingest_proposal must run exactly once; observed 0
- inspect_hub_okf_proposal must run exactly once; observed 0
- index_repository must run once per member; observed 1/2
- get_architecture must run once per member; observed 1/2
- get_okf_authoring_schemas must run once per member; observed 1/2
- prepare_hub_okf must run once per member; observed 1/2
- record_batch_hub_ingest_member must run once per member; observed 1/2
- validate_okf_changes must run one or two times per member; observed 1

## Benchmark findings

- combined OKF artifact is unavailable

Deterministic structure and paths cannot prove every authored claim; human review remains required.
