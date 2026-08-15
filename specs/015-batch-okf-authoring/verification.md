# Verification: Batch OKF Authoring

## Measured v3 interaction baseline

Retained successful MCP traces establish the optimization target without a new
model call:

| Completed schema/validation activity | Health Aware v3 | Shopping cart v3 |
|---|---:|---:|
| Calls | 20 | 27 |
| Serialized supplied arguments | 32,628 bytes | 45,699 bytes |
| Serialized tool results | 29,016 bytes | 34,074 bytes |

Both traces list the full catalog, select schemas, read four or five schemas,
validate every concept multiple times during repair and validate relationships
twice. Final usage is dominated by cached input repeated across those turns.
Serialized payload bytes are diagnostic and are not presented as token counts.

## Phase 1: batch MCP surface

- Date: 2026-08-15
- Added `get_okf_authoring_schemas`; one bounded signal list returns complete
  guidance only for deterministic selected types.
- Added `validate_okf_bundle`; one bounded content-only request parses concepts,
  reports per-concept draft/schema failures and checks cross-document
  relationships.
- Existing fine-grained tools remain unchanged and available.
- Runtime checks enforce 64 concepts, 256 KiB per concept and 4 MiB total; no
  output path or filesystem authority is accepted.
- `npm run verify`: 294 tests, 0 failures, 0 architecture errors and six
  unchanged reviewed architecture warnings.

## Phase 2: immutable v4 benchmark

- Date: 2026-08-15
- Added immutable `okf-author-v4` and `okf-author-direct-v4`; their shared
  evidence-first contract is byte-equivalent to v3 and contains no fixture key,
  expected path or relationship answer.
- The v4 MCP lifecycle requires `index_repository`,
  `get_okf_authoring_schemas` and `validate_okf_bundle`. v1-v3 lifecycle rules
  remain selected by their historical prompt identities.
- Trace summaries now retain completed authoring call count, serialized argument
  bytes, serialized result bytes and deterministic per-tool detail. Pair reports
  expose those values separately from model tokens.
- Focused agent/scorer verification: 27 tests, 0 failures.
- `npm run verify`: 295 tests, 0 failures, 0 architecture errors and six
  unchanged reviewed architecture warnings.

## Initial v4 model evidence and correction

### Health Aware — `2026-08-15T082239Z`

- Catalog 3.0.0 / v4 MCP is `reviewable`; conformance passed with no hard
  failures.
- Authoring/schema validation fell from 20 v3 calls to 2 v4 calls (90%).
- The two calls supplied 8,032 serialized bytes and returned 9,355 bytes.
- Total model input and elapsed time increased. Per owner direction these stay
  supporting telemetry; they do not override reviewable evidence quality.

### Shopping cart — `2026-08-15T082714Z`

- Catalog 3.0.0 / v4 MCP is `invalid`: source evidence established an AWS SQS
  queue, but selected guidance exposed only generic `Queue`, producing one known
  schema contradiction.
- Authoring/schema validation fell from 27 v3 calls to 2 v4 calls (93%).
- Trace inspection proves a general selector fault: natural signals contained
  AWS, SQS, queue and Lambda words separated by ordinary prose; catalog 3.0.0
  required contiguous phrases and returned neither AWS-specific schema.
- The immutable output is retained as regression evidence. No fixture identity,
  expected key or expected path is added to selection or prompts.

### General correction

Catalog 3.1.0 matches all normalized words of one selection rule within the
same evidence signal, permits plural variants only inside multiword catalog
phrases and preserves exact single-word matching plus specific-type shadowing.
The formerly observed signal now selects AWS Lambda, AWS SQS Queue, Database
Table, API Endpoint and Business Flow rather than generic Queue.

`npm run verify` passed with 296 tests, 0 failures, 0 architecture errors and
six unchanged reviewed architecture warnings before the correction commit.
