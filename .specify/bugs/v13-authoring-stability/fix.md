# Bug Fix: V13 authoring stability and benchmark identity

- **Slug**: v13-authoring-stability
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

OKF/MCP tool contracts now state candidate-local evidence ownership and require
complete Markdown validation content. Separately, V13 benchmark runs now record
the durable Hub Repository identity used for provenance scoring while older
artifacts retain their checkout-ID fallback.

## Changes

| File | Change | Notes |
|---|---|---|
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Added candidate ownership and complete-Markdown schema guidance. |
| `src/app/codebase-memory-mcp/okf-schema-tools.test.ts` | updated contract tests | Pins both public tool descriptions. |
| `src/app/hub-okf/mcp/mcp-tools.ts` | modified | Added candidate-local ownership to prepare guidance. |
| `src/app/hub-okf/mcp/mcp-tools.test.ts` | added regression | Pins prepare's public contract. |
| `.agents/skills/agentbase-ingest/SKILL.md` | modified | States one-candidate evidence ownership. |
| `.agents/skills/agentbase-okf/SKILL.md` | modified | States validation content is complete Markdown bytes. |
| `scripts/checks/check-skills.test.mjs` | updated regression | Pins both shared workflow rules. |
| `scripts/benchmark/benchmark-agent.mjs` | modified | Records V13 durable provenance Repository ID using existing identity resolution. |
| `scripts/benchmark/benchmark-agent.test.mjs` | updated regression | Proves checkout and durable IDs remain distinct. |
| `scripts/benchmark/benchmark-okf.mjs` | modified | Scores the recorded durable ID with historical fallback. |
| `scripts/benchmark/benchmark-okf.test.mjs` | added regression | Pins durable-first and fallback selection. |

## Tests Added or Updated

- `[AB-INGEST-005]` asserts prepare exposes candidate-local evidence ownership.
- OKF schema tool tests assert validation accepts document bytes, not paths or
  wrapper objects, and guidance states matching `candidate_id` ownership.
- `[AB-BENCH-043]` asserts V13 records and selects its durable Hub Repository ID
  while older run artifacts still use `sourceRepositoryId`.

## Local Verification

- Focused MCP tests → 18 passed, 0 failed.
- Focused skill and benchmark tests → 51 passed, 0 failed.
- `npm run typecheck` → passed.
- `npm run verify` → specification checks, TypeScript, dependency rules, Knip,
  Gitleaks, 382 tests and `git diff --check` passed.

## Deviations from Assessment

None.

## Follow-ups

- A model-backed qualification is still separately authorized; this fix does
  not claim tool-description wording guarantees model behavior.
