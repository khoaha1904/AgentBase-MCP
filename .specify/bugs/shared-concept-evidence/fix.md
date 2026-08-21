# Bug Fix: Standalone concepts cannot share supporting evidence

- **Slug**: shared-concept-evidence
- **Fixed**: 2026-08-22
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Standalone concepts may now share any known observation in one bounded request
without changing its primary attribution. Embedded evidence, unknown IDs and
Interface/Resource semantic promotion remain strictly validated.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/schemas/guidance.ts` | simplified | Removes role-specific ownership exceptions and permits shared standalone evidence. |
| `src/core/knowledge/schemas/guidance.test.ts` | updated tests | Covers shared System/Flow supporting and promotion evidence plus embedded self-ownership. |
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Describes primary attribution and shared standalone use. |
| `src/app/hub-okf/mcp/mcp-tools.ts` | modified | Aligns Initial Ingest guidance input documentation. |
| `specs/022-single-repository-ingest/*` | modified | Adds AB-SCHEMA-048 and supersedes narrow 046/047 rules. |
| `docs/contracts/okf.md` | modified | Publishes the simplified current attribution contract. |

## Tests Added or Updated

- Existing guidance tests now cover shared System/Flow evidence, shared
  promotion evidence, embedded self-ownership and unknown-evidence guards under
  AB-SCHEMA-048 without increasing the repository test count.

## Local Verification

- Focused guidance test: 8/8 passed.
- TypeScript: passed.

## Deviations from Assessment

None.

## Follow-ups

- Run the complete offline gate, then one sequential Terraform probe.

