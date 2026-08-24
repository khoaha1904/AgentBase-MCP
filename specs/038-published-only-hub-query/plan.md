# Implementation Plan: Published-only Hub Query

**Branch**: `038-published-only-hub-query` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

## Summary

Keep the existing Git-backed search and read primitives, anchor their reader to
the admitted Published commit, and delete only redundant public adapters. Keep
authoring readers on `activeHead` and retain internal freshness for Hub CI.

## Technical Context

- TypeScript/Node modular monolith; no new dependency or persistence.
- Owners: `app/hub-okf/query`, `app/hub-okf/mcp`, Hub CLI and product skills.
- Existing query parser/search and ordinary concept Markdown are reused.
- Existing journey tests are edited in place; test count does not grow.

## Implementation Slices

1. Update high-level direction and current `AB-QUERY-*` contracts.
2. Separate Published public readers from active authoring readers.
3. Remove traversal, observed-value and freshness MCP/CLI adapters.
4. Preserve Questions and internal Hub CI freshness.
5. Port the bounded index-link dedupe correction and verify the full gate.

## Constitution Check

The change reduces public surface and state combinations, uses exact existing
Git authority, adds no abstraction/dependency and keeps evidence-bearing
Markdown intact.

