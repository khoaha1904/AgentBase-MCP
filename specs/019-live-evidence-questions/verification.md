# Verification: Live Evidence Questions

## Result

Capability 019 is complete. Accepted OKF can retain distinct volatile source
references without a stored scalar, current queries bind those references to
the explicitly authorized repository, and governed questions turn attributed
maintainer answers into separately reviewable guidance without deleting or
ranking source evidence.

## Requirement evidence

| Requirement | Evidence |
|---|---|
| AB-CLAIM-001..003 | Live-claim validation, duplicate/source/identity rejection, forbidden scalar and refresh-preservation tests |
| AB-QUERY-006..008 | Accepted-Hub extraction, repository binding/mismatch, dirty/change/missing fake graph/snippet workflow and zero stale fallback |
| AB-QUESTION-001..005 | Deterministic private ledger, proposal-digest coupling, accept recovery, restart, attribution/revision and conflicting-answer tests |
| AB-REFRESH-013 | Incomplete refresh rejects claim removal, reviewed reference movement is allowed, and accepted question/guidance survives restart |
| AB-BENCH-042 | Expectation format v8 scores live-reference coverage, resolution statuses, all evidence roles, unavailable behavior and no automatic winner |
| SC-001..007 | Local-only end-to-end lifecycle plus focused failure/recovery and offline benchmark tests |

## Verification commands

- Focused live-claim, query, question, proposal, recovery, MCP, refresh and
  benchmark tests passed.
- Two convergence passes checked 13 functional requirements, 7 success
  criteria, 10 acceptance scenarios, plan decisions and all 5 constitution
  principles; the final pass reported zero remaining findings.
- `npm run verify` passed specification checks, TypeScript, architecture with
  zero errors, the complete offline test suite and `git diff --check`.

## Qualification boundary

- This verification is deterministic and offline. It adds no source parser,
  value cache, watcher, daemon, dependency, credential or network action.
- Capability 018 V11 remains the accepted real Domain/navigation evidence.
- No V12 or other model-backed capability-019 benchmark was run.
- Open AgentBase-Hub PR #7 was not rebuilt, replaced, merged or published.
  External qualification/publication still requires separate owner approval.
