# Bug Fix: Cross-boundary Flow cannot reuse endpoint evidence

- **Slug**: flow-cross-candidate-evidence
- **Fixed**: 2026-08-22
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Schema guidance now permits only an explicitly cross-boundary standalone Flow
to reuse supporting observations from other standalone concept candidates.
Promotion evidence remains owned by the Flow, and every other ownership rule is
unchanged.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/guidance.ts` | modified | Adds the narrow Flow supporting-evidence exception at the shared validator. |
| `src/core/knowledge/schemas/guidance.test.ts` | updated test | Covers accepted reuse plus rejected foreign promotion evidence and non-Flow reuse. |
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Describes the exception in the public guidance tool contract. |
| `src/app/hub-okf/mcp/mcp-tools.ts` | modified | Aligns Initial Ingest guidance input documentation. |
| `specs/022-single-repository-ingest/*` | modified | Records AB-SCHEMA-046 in the living feature contract. |
| `docs/contracts/okf.md` | modified | Publishes the accepted attribution boundary. |

## Tests Added or Updated

- Existing `[AB-SCHEMA-034][AB-SCHEMA-036][AB-SCHEMA-046]` guidance test now
  reproduces the replica request shape without increasing the repository test
  count.

## Local Verification

- Focused guidance test: 8/8 passed.
- TypeScript: passed.

## Deviations from Assessment

The MCP tool descriptions were also aligned so callers are not instructed to
duplicate observations. No runtime boundary beyond the assessed shared
validator changed.

## Follow-ups

- Run the complete offline gate, then one sequential Terraform probe.
