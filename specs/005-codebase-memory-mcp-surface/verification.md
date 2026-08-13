# Verification: Codebase Memory MCP Surface

- **Date:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`
- **Server SDK:** exact `@modelcontextprotocol/server@2.0.0`
- **Status:** Accepted

## Offline evidence

Focused tests cover the pinned 12-tool manifest/schema drift, omitted mutation
tools, path/persistence/cross-repo policy, lazy one-root binding, raw result
forwarding, idempotent cleanup, official in-memory MCP list/call behavior and
the concise skill contract. The skill also passes structural validation.

Canonical `npm run verify` remains offline and does not launch the native
provider.

## Fresh-process exact qualification

`node scripts/qualify-codebase-memory-mcp.mjs` launched an official MCP client
and `node src/cli.ts mcp` from an unrelated disposable cwd. The server indexed a
copied 12-file TypeScript fixture, then ran architecture and graph search.

```json
{
  "tool_count": 12,
  "premature_read_rejected": true,
  "source_persistence_rejected": true,
  "index_succeeded": true,
  "architecture_succeeded": true,
  "search_succeeded": true,
  "source_unchanged": true,
  "source_persistence_absent": true,
  "elapsed_ms": 14678.579
}
```

Client close completed with no reported gateway/provider cleanup failure, and a
post-run process check found no remaining Codebase Memory child. The temporary
source and qualification scope were removed afterward. Final canonical
verification passed `137/137` tests; production dependency audit reported zero
known vulnerabilities.

## Limitations

- This is one small fixture on one Linux x64 host, not a latency/scale claim.
- One connection intentionally supports one repository.
- The capability proves explicit index/query use, not background freshness.
- HTTP, credentials, cloud evidence and OKF tools remain out of scope.
