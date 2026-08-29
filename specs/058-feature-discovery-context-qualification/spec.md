# Feature Specification: On-Demand Feature Discovery Context Qualification

**Feature Branch**: `main`

**Created**: 2026-08-29

**Status**: Deterministic implementation approved; ECS pair
`2026-08-29T03-56-31Z` passed deterministic checks and remains pending owner
review.

## Objective

Prove whether a Feature Discovery workflow can query existing Published Hub
tools on demand and materially improve system understanding before AgentBase
adds any integration skill or runtime surface.

## User stories

### US1 — Reproducible on-demand comparison (P1)

As the product owner, I can compare the same Discovery task without AgentBase
and with bounded AgentBase Hub access, without prebuilding context or reading
application source.

**Acceptance**:

1. Both arms bind the same Feature, tracker context, generic prompt, model,
   effort, output schema, timeout and pinned qualification dataset.
2. The assisted arm receives no prepared Hub content and decides what to query
   through only `search_hub_okf` and `read_hub_okf_concept`. The same prompt
   requires one targeted search when Hub search is available because this fixed
   tracker input has an explicit system-context gap.
3. Neither arm reads application source, Code Graph, Local Draft or hidden
   expectations.

### US2 — Trustworthy result gate (P1)

As the product owner, I receive a result that separates critical correctness,
important usefulness and optional detail instead of declaring a winner from
token, time or tool-volume telemetry.

**Acceptance**:

1. Critical misses, unsupported critical claims or forbidden/unbounded tool use
   make the assisted result `needs_revision` or `incomplete`.
2. A pass requires no-worse critical quality plus at least one important probe
   that the baseline missed. Efficiency remains diagnostic only.
3. Every AgentBase-derived fact remains traceable to the pinned Hub tool trace.
4. A deterministic scorer cannot auto-pass real model prose; owner review must
   confirm supported claims and the no-worse decision.

## Requirements

- **FR-001 / AB-CONTEXT-001..002**: Use on-demand Published Hub context with no
  prefetch, stored context, source or Code Graph fallback.
- **FR-002 / AB-CONTEXT-003..005**: Expose only existing bounded Hub search/read,
  enforce session limits and surface insufficient knowledge honestly.
- **FR-003 / AB-CONTEXT-006**: Keep paired inputs/settings equivalent, vary only
  the two-tool assisted capability and run arms sequentially.
- **FR-004 / AB-CONTEXT-007..008**: Score priority-tier probes, tool admission,
  traceability and the no-worse-plus-important-improvement gate.
- **FR-005 / AB-CONTEXT-009**: Store prompts, scenario, expectations and durable
  qualification results in AgentBase-Benchmark; ordinary use stores no context
  artifact and per-run state remains isolated.
- **FR-006 / AB-CONTEXT-010**: Do not add `agentbase-add-context`, another skill,
  an MCP tool or a retrieval subsystem until passing evidence exists.

## Fixed qualification scenarios

Feature: **Add retry handling and operational visibility for failed Crawler
jobs.**

Synthetic tracker context: **Operations reports that some crawler jobs stop
after queue delivery. Teams cannot determine whether those jobs will run again
or who owns recovery. Discovery identifies affected boundaries and unresolved
questions without prescribing implementation.**

Pinned Hub: `khoaha1904/hub-3`, branch `main`, commit
`3d0127bf2dee3eddbc54d72576e2d81fb94a9790`.

Expected critical truth includes the Crawler worker boundary, the
publisher→`crawler-jobs` SQS→worker path and no accepted DLQ/retry/alarm
knowledge for that path. Retry wording on unrelated Crawler components is not
evidence for the publisher/queue/worker path.

The second approved fixture is the pinned public repository
`aws-samples/amazon-ecs-fullstack-app-terraform` at commit
`98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`. Its Domain is
`domains/digital-experience`. The feature is **Standardize the backend readiness
endpoint as `/health` and update the ECS target-group health checks without
breaking the product API.** Expected truth includes the backend HTTP interface,
frontend consumer, ECS Terraform health-check wiring and blue/green delivery
flow. The scenario must surface that live deployment state, rollback behavior
and backward compatibility are not proved by the pinned source.

## Success criteria

- **SC-001**: Deterministic tests reject input/revision drift, unavailable
  assisted MCP, no completed search, more than three searches, search limit over
  eight, more than five reads, over 64 KiB of Hub results, any non-allowlisted
  tool/shell/source access, hidden expectation leakage and critical-score
  compensation.
- **SC-002**: One deterministic fake pair retains both raw arms, safe Hub tool
  trace, usage, elapsed time, tiered assessment and traceability evidence without
  invoking a real model.
- **SC-003**: Result classification is `passed` only under AB-CONTEXT-008; a real
  comparison first remains `needs_review`. Otherwise it is `needs_revision` or
  `incomplete` with explicit reasons.
- **SC-004**: Existing MCP tools, Hub bytes, query behavior, local storage,
  public `abs` commands and installed skills remain unchanged.
- **SC-005**: Both arms emit the same structured discovery draft containing
  `overview`, `affected_areas`, `relevant_relations`, `discovery_questions`,
  `known_unknowns` and `evidence_refs`; malformed output cannot pass.

## Edge cases

- Missing/wrong active fixture profile, pinned Published mismatch or unavailable
  assisted MCP marks the pair incomplete without changing the active profile.
- Empty/ambiguous search is retained as an explicit limitation, not replaced by
  source reading or invented facts.
- No completed search in the fixed assisted scenario or any forbidden/bounded
  tool violation makes the arm incomplete.
- One failed, timed-out or malformed arm does not erase the other arm; the pair
  remains incomplete.
- A duplicate owner review fails without changing raw arms, deterministic
  assessment or the first immutable review.

## Non-goals

- Prebuilding a context packet or storing session context in Hub/local state.
- Implementing or installing `agentbase-add-context`.
- Testing Task Planning or Code Graph context.
- Editing or claiming compatibility with the private Discovery workflow.
- Adding semantic/vector search, query ranking, Hub schema or persistent
  context storage.
- Accepting, publishing or mutating tracker/Hub data.

## Owner approval decisions

- Approve the fixed Crawler Feature and on-demand two-tool A/B as the first
  scenario.
- Approve one focused internal `benchmark:context` runner without a new runtime
  dependency or public command.
- Keep any real model pair behind a separate confirmation after deterministic
  checks pass.
