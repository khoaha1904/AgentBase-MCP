# Bug Fix: V13 benchmark contract failures

- **Slug**: v13-benchmark-contracts
- **Fixed**: 2026-08-21
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Proposal inspection now advertises the same `proposal_id` consumed by its
dispatcher. Changed-set validation and OKF authoring guidance now state that
relationship rules follow the exact frontmatter `type`, never display wording.

## Changes

| File | Change | Notes |
|---|---|---|
| `src/app/hub-okf/mcp/mcp-tools.ts` | modified | Corrected inspect input schema to `proposal_id`. |
| `src/app/hub-okf/mcp/mcp-tools.test.ts` | added regression | Pins schema and dispatch agreement. |
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Added exact-type validation guidance. |
| `src/app/codebase-memory-mcp/okf-schema-tools.test.ts` | added regression | Pins the public tool guidance. |
| `.agents/skills/agentbase-okf/SKILL.md` | modified | Added the same authoring rule. |
| `scripts/checks/check-skills.test.mjs` | updated regression | Pins the skill wording. |
| `scripts/checks/check-specs.test.mjs` | updated fixture | Keeps the shared fixture aligned with existing `AB-INGEST-011` enforcement found by full verification. |

## Tests Added or Updated

- `[AB-INGEST-008] proposal inspection schema and dispatcher use proposal_id`
  verifies the public field and one successful routed inspection.
- The schema-tool contract test verifies exact frontmatter type, display name
  and prose semantics are stated explicitly.
- The skill check verifies the same rule remains in authoring instructions.

## Local Verification

- `node --test --experimental-strip-types src/app/hub-okf/mcp/mcp-tools.test.ts src/app/codebase-memory-mcp/okf-schema-tools.test.ts` → 17 passed, 0 failed.
- `node --test scripts/checks/check-skills.test.mjs` → 3 passed, 0 failed.
- `node --test scripts/checks/check-specs.test.mjs` → 12 passed, 0 failed.
- `npm run verify` → specification checks, TypeScript, dependency rules, Knip,
  Gitleaks, 380 tests and `git diff --check` passed.

## Deviations from Assessment

Full verification exposed a pre-existing stale spec-check fixture outside the
assessment's expected files. The fixture still generated only ten Initial
Ingest IDs while the checker already enforced eleven. It was updated without
changing production behavior.

## Follow-ups

- Do not run another real model benchmark without owner approval. That run is
  still required to measure the model-facing exact-type guidance outcome.
