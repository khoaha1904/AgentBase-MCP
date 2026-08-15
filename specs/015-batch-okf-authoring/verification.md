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

