# Bug Fix: Parent concept cannot reuse its embedded child's evidence

- **Slug**: parent-embedded-evidence
- **Fixed**: 2026-08-22
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

A standalone concept may now reuse supporting and promotion observations from
its direct embedded children. Unrelated candidates remain rejected, and Flow
promotion evidence remains Flow-owned.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/guidance.ts` | modified | Recognizes only the explicit direct parent-child evidence boundary. |
| `src/core/knowledge/schemas/guidance.test.ts` | updated test | Reproduces accepted parent reuse and rejects an unrelated candidate. |
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Aligns public schema guidance descriptions. |
| `src/app/hub-okf/mcp/mcp-tools.ts` | modified | Aligns Initial Ingest input guidance. |
| `specs/022-single-repository-ingest/*` | modified | Records AB-SCHEMA-047. |
| `docs/contracts/okf.md` | modified | Publishes the direct embedded-child evidence boundary. |

## Tests Added or Updated

- Existing `[AB-SCHEMA-031][AB-SCHEMA-036][AB-SCHEMA-047]` test covers direct
  parent promotion evidence and unrelated-candidate rejection without adding a
  repository test case.

## Local Verification

- Focused guidance test: 8/8 passed.
- TypeScript: passed.

## Deviations from Assessment

Flow promotion evidence remains Flow-owned to preserve the explicitly approved
AB-SCHEMA-046 boundary. This does not affect the reproduced Function case.

## Follow-ups

- Run the complete offline gate, then one sequential Terraform probe.

