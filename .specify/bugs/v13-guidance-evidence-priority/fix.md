# Bug Fix: Structured evidence priority in schema guidance

- **Slug**: v13-guidance-evidence-priority
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

One exact supported structured resource mapping now determines the candidate
schema without being diluted by incidental semantic role words. Public guidance
also states that an evidenced System is a separate capability candidate, not a
renamed Repository or Service.

## Changes

| File | Change | Notes |
|---|---|---|
| `src/core/knowledge/schemas/guidance.ts` | modified | Gives supported structured mappings precedence; preserves multi-mapping ambiguity. |
| `src/core/knowledge/schemas/guidance.test.ts` | added regressions | Covers Lambda/Table semantic collisions and multiple structured mappings. |
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Exposes evidence priority and System-candidate boundary. |
| `src/app/codebase-memory-mcp/okf-schema-tools.test.ts` | updated | Pins the public contract. |
| `.agents/skills/agentbase-ingest/SKILL.md` | clarified | Separates structured evidence from semantic System assessment. |
| `docs/contracts/okf.md` | clarified | Updates AB-SCHEMA-033/034. |
| `specs/022-single-repository-ingest/spec.md` | clarified | Records the active capability requirement. |

## Tests Added or Updated

- `[AB-SCHEMA-031][AB-SCHEMA-033] exact structured mapping outranks incidental semantic role words`.
- `[AB-SCHEMA-031] multiple exact structured mappings remain ambiguous`.
- MCP description assertions for structured priority and separate System candidates.

## Local Verification

- `node --test src/core/knowledge/schemas/guidance.test.ts src/app/codebase-memory-mcp/okf-schema-tools.test.ts scripts/benchmark/benchmark-okf.test.mjs` → 48 passed.

## Deviations from Assessment

None.

## Follow-ups

- A new model qualification remains separately authorized; no System is forced
  when cooperating-entity evidence is absent.
