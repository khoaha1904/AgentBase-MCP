# Bug Assessment: V13 benchmark contract failures

- **Slug**: v13-benchmark-contracts
- **Created**: 2026-08-21
- **Source**: retained V13 benchmark traces from 2026-08-21
- **Verdict**: valid
- **Severity**: high

## Report

All three V13 requalification runs finalized an applicable proposal, but the
official lifecycle gate failed. Every run made two unsuccessful proposal
inspection calls. The Shopping Cart run also required three changed-set
validation calls after treating a `Service` titled “Shopping Cart System” as
though it inherited `System` relationship guidance.

## Symptom

`inspect_hub_okf_proposal` advertises `transaction_id` while its dispatcher
requires `proposal_id`, so no schema-valid invocation can reach inspection.
Separately, authoring guidance does not say clearly enough that relationship
rules follow the exact frontmatter `type`, not words in a title or description.

## Reproduction

1. Read the MCP schema for `inspect_hub_okf_proposal` and invoke it with its
   required `transaction_id`; observe the dispatcher error `proposal_id is required`.
2. Invoke it with `proposal_id`; observe MCP input-schema rejection because the
   advertised schema requires `transaction_id`.
3. Validate a `Service` concept whose title contains “System” and whose
   relationships apply System-specific guidance; observe an unjudged relation
   and an avoidable extra repair cycle.

## Suspected Code Paths

- `src/app/hub-okf/mcp/mcp-tools.ts` — inspect tool input schema advertises the
  wrong identifier name.
- `src/app/hub-okf/mcp/mcp-tool-call.ts` — dispatcher consistently consumes
  `proposal_id`.
- `src/app/hub-okf/mcp/mcp-tools.test.ts` — routing test bypasses schema
  conformance and therefore missed the drift.
- `src/app/codebase-memory-mcp/okf-schema-tools.ts` — changed-set validator
  description omits the exact-type rule.
- `.agents/skills/agentbase-okf/SKILL.md` — authoring workflow likewise omits
  the exact-type rule.

## Root Cause Hypothesis

**Confidence: high.** The inspection failure is a direct schema/dispatcher name
mismatch. The Shopping Cart trace shows a `Service` title influencing relation
selection even though validator policy is keyed only by parsed frontmatter
`type`; the missing instruction allowed that category error.

## Proposed Remediation

**Preferred**: Change the inspection MCP schema to require `proposal_id` and add
a test that asserts both the public schema and dispatcher route agree. Add one
concise instruction to the changed-set validator description and OKF authoring
skill: select relationship guidance only from the exact frontmatter `type`;
display names and prose never change schema.

Do not add lifecycle counters or session state. Those mechanisms would reject
later calls without preventing the avoidable invalid authoring attempt.

**Files likely to change**:

- `src/app/hub-okf/mcp/mcp-tools.ts`
- `src/app/hub-okf/mcp/mcp-tools.test.ts`
- `src/app/codebase-memory-mcp/okf-schema-tools.ts`
- `src/app/codebase-memory-mcp/okf-schema-tools.test.ts`
- `.agents/skills/agentbase-okf/SKILL.md`
- `scripts/checks/check-skills.test.mjs`

**Tests to add or update**:

- Assert the inspect schema requires only `proposal_id` and routes that value to
  `actions.inspect`.
- Assert the changed-set tool and authoring skill expose the exact-type rule.

## Risks & Considerations

- Renaming the advertised field corrects an unusable API rather than preserving
  compatibility with a working caller.
- Guidance can reduce the observed validation mistake but cannot prove every
  future model run will validate in one call.
- A real model benchmark is intentionally excluded until explicitly approved.

## Open Questions

- None.
