# Bug Fix: P0 overlapping evidence is easy to mis-author

- **Slug**: p0-overlap-authoring
- **Fixed**: 2026-08-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Initial Ingest now exposes the existing many-groups-to-one-candidate rule and
gives actionable recovery when an agent incorrectly ignores a P0 group that
contributes evidence. Strict duplicate handling remains unchanged.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/core/knowledge/discovery.ts` | modified | P0 failure names the two valid recovery paths. |
| `src/app/codebase-memory-mcp/okf-schema-tools.ts` | modified | Public input schema documents repeated candidate IDs and strict duplicate fields. |
| `src/app/codebase-memory-mcp/discovery-session.test.ts` | updated test | Pins actionable recovery and repeated candidate outputs. |
| `src/app/hub-okf/authoring/receipt-authoring.test.ts` | updated test | Proves Terraform and implementation groups emit one runtime skeleton. |
| `.agents/skills/agentbase-ingest/SKILL.md` | modified | Directs agents to materialize distinct overlapping evidence. |
| `docs/capabilities/03-concept-discovery/01-candidate-discovery.md` | modified | Records the candidate identity rule. |
| `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md` | modified | Extends AB-INGEST-018 with the durable behavior. |

## Tests Added or Updated

- `[AB-MCP-019..023][AB-INGEST-017]` — rejects prose duplicate reasons with
  actionable materialization guidance and accepts repeated candidate outputs.
- `[AB-MCP-024..030]` — two P0 groups backed by `main.tf` and `handler.py`
  materialize one `worker` skeleton.

## Local Verification

- `node --test --experimental-strip-types src/app/codebase-memory-mcp/discovery-session.test.ts src/app/hub-okf/authoring/receipt-authoring.test.ts` → 4/4 passed.
- `npm run spec:check` → passed.
- `npm run typecheck` → passed.
- `npm run verify` → 158/158 tests passed; all static, dependency, secret and spec gates passed.

## Deviations from Assessment

The downstream one-skeleton proof belongs in
`src/app/hub-okf/authoring/receipt-authoring.test.ts`, so that existing test was
extended in addition to the files initially listed.

## Follow-ups

- Retry the failed public repository ingest using materialized overlap for its
  infrastructure and implementation P0 groups.
