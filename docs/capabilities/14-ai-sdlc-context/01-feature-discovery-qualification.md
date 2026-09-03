# 14.01 — Feature Discovery qualification

> Status: deterministic qualification implementation approved; ECS real pair
> `2026-08-29T03-56-31Z` passed the deterministic gate and remains pending
> immutable owner review.

## Reusable baseline

- Published Hub search already provides BM25+ ranking, Domain scoping, bounded
  summaries/excerpts, direct relation context and exact revision identity.
- Exact read already returns one validated Published Markdown concept with
  provenance.
- When explicitly invoked, the released `agentbase-query` workflow already
  routes standalone Domain and cross-repository questions through search then
  exact read. It is not eligible merely because another workflow needs context.
- The Crawler fixture contains three repositories, two Lambda functions, the
  shared `crawler-jobs` SQS Resource, result storage and directed relations.
- The ECS Full-Stack fixture is a pinned public AWS/Terraform application with
  frontend/backend components, ECS, DynamoDB, S3, SNS and CodePipeline. Its
  source-backed OKF result is retained as prior benchmark evidence.
- AgentBase-Benchmark already owns immutable prompts, expected probes, isolated
  model execution and durable comparison results.

## Gap and simplified decision

No evidence currently proves that a Discovery workflow recognizes a repository
context gap, queries AgentBase and uses the returned Published knowledge well.
Prebuilding a context packet would test AgentBase's guess about the Feature, not
the intended on-demand workflow, and would add selection and storage behavior
that the product does not need.

Phase 1 therefore adds no packet builder, context store, query algorithm, public
skill or MCP tool. It qualifies the two existing read-only Hub tools directly.

## Fixed Feature scenarios

Feature:

> Add retry handling and operational visibility for failed Crawler jobs.

Both arms receive the same synthetic tracker context:

> Operations reports that some crawler jobs stop after queue delivery. Teams
> cannot determine whether those jobs will run again or who owns recovery.
> Discovery should identify affected system boundaries and unresolved product,
> operational and ownership questions; it must not prescribe implementation.

The pinned Published input is the operator-approved qualification Hub at commit
`3d0127bf2dee3eddbc54d72576e2d81fb94a9790`. That snapshot has been audited: it
contains the publisher → `crawler-jobs` queue → worker path, the worker's
S3/DynamoDB effects and source references. It does not contain accepted
DLQ/retry/alarm/operational-owner knowledge for that path. Retry wording on an
unrelated Glue component is not evidence for this path. The queue provider
identity also has one open Question.

The second scenario uses the pinned `aws-samples/amazon-ecs-fullstack-app-terraform`
revision `98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4` and the Published Domain
`domains/digital-experience`. Feature:

> Standardize the backend readiness endpoint as `/health` and update the ECS
> target-group health checks without breaking the product API.

This scenario tests whether Discovery can connect the backend HTTP contract,
frontend consumer, ECS Terraform wiring and blue/green delivery flow. It must
not claim live deployment state, rollback behavior or backward compatibility
that the pinned source does not prove.

`hub-3` is a development fixture selected through the ordinary peer-profile
model; it is not a secondary product Hub. Before a real pair, the developer
must make that exact profile active and synchronized. The runner verifies the
active identity and Published commit, copies the local Published checkout into
disposable state, and performs no anonymous remote clone, credential read or
profile mutation.

## On-demand A/B contract

Both arms use the same generic Discovery prompt, model/version, reasoning
effort, Feature/tracker input, timeout and structured output schema. Expected
probes remain hidden and arms run sequentially.

1. `discovery-only` has no AgentBase server or application source.
2. `discovery-plus-agentbase` receives no prepared Hub content. Its isolated MCP
   server exposes only `search_hub_okf` and `read_hub_okf_concept`; the workflow
   decides the search terms and exact reads. The shared prompt says that when
   `search_hub_okf` is available, this fixed scenario must perform at least one
   targeted search because tracker context cannot establish system boundaries.
   The direct arm has no such tool and continues without evidence.

The assisted session is bounded to at most three searches, each with `limit <=
8`, at most five exact reads and 64 KiB of completed Hub tool-result bytes. It
may use global search only explicitly. Any other MCP tool, application-source
read, Code Graph access, Local Draft access or limit breach makes the arm
incomplete. At least one search must complete in this fixed scenario; otherwise
the run has not exercised the capability being qualified.

The shared prompt states the call-count and per-search limits so the workflow
can comply before admission; the runner remains authoritative and rejects any
breach. This is execution guidance, not Hub content or ranking behavior.

Within that budget, generic guidance prioritizes exact concepts on the affected
direct flow and its immediate effects over broad Domain/Repository overview
reads. A Hub fact mentioned in overview must also appear as an exact
evidence-bearing affected identity or relation endpoint. The guidance does not
name expected fixture concepts or reveal hidden probes.

These are benchmark admission limits around current tools, not changes to their
public runtime schemas. The model sees ordinary tool results only; there is no
second retrieval representation.

## Discovery output

Both arms return the same structured discovery draft:

- `overview`: concise Feature interpretation, at most 1,200 characters;
- `affected_areas`: up to sixteen `{ identity, reason, evidence_refs }` values;
- `relevant_relations`: up to sixteen
  `{ source, predicate, target, evidence_refs }` values;
- `discovery_questions`: up to sixteen unresolved questions;
- `known_unknowns`: up to sixteen explicit gaps or ambiguities;
- `evidence_refs`: up to sixteen unique `{ id, path, commit }` values.

Each free-text item is at most 500 characters. Assisted system-specific claims
 must use evidence-ref IDs whose Published path/commit resolves to its retained
search/read trace. A retained reference may be an exact concept path or a
`repository://`/`agentbase://` source URI embedded in a pinned concept read;
affected identities and relation endpoints must also occur in that trace. When
the tool is used, tracker-only labels such as Operations belong
in overview/questions/unknowns rather than evidence-bearing affected areas or
relations. Missing fields, invalid types, duplicate IDs, unresolved references
or prose outside the structure makes the arm incomplete.

This generic prompt is a qualification proxy, not the company's private
Discovery skill. A pass demonstrates useful on-demand AgentBase behavior under
controlled inputs; it does not prove private-skill integration.

## Expected probes

| Priority | Expected discovery outcome |
|---|---|
| Critical | Identifies Crawler Domain and worker processing boundary |
| Critical | Identifies `crawler-jobs` SQS as publisher/worker transport |
| Critical | Does not claim an existing DLQ/retry/alarm without evidence |
| Important | Identifies publisher and worker as separate repositories/functions |
| Important | Identifies S3 and DynamoDB result effects |
| Important | Asks about retry semantics, failure ownership and observability |
| Optional | Uses targeted Published evidence without prescribing delivery tasks |

## Result gate

The assisted arm passes only when:

- it misses no critical probe found by the baseline;
- it adds no unsupported critical claim;
- it matches at least one important probe missed by the baseline;
- all assisted system-specific claims resolve to the pinned Hub tool trace;
- its tool use stays inside the allowlist and session limits.

Elapsed time, token usage and tool-result bytes are diagnostics only. They can
explain cost but can neither produce nor compensate for a quality pass.
Deterministic identity/relation/reference checks cannot prove arbitrary prose,
so a real gate-satisfying result remains `needs_review` until the owner accepts
the supported-claim and no-worse assessment.

## Storage, failure and recovery

- Ordinary use retains search/read results only in the host AI session according
  to host policy. AgentBase creates no context record in Hub, Local Draft,
  `~/.agentbase` state or another store.
- Qualification retains prompts, safe Published tool trace, raw arms and reports
  only under AgentBase-Benchmark `results/`; disposable workspaces and isolated
  AgentBase state stay temporary.
- A mismatched pinned commit or unavailable assisted MCP server stops the
  affected pair as `incomplete` without changing the active user Hub profile.
- If one arm fails, times out, exceeds tool limits or emits malformed output,
  retain its evidence and continue the other arm; the pair remains `incomplete`.
- One immutable owner review accepts or rejects a real comparison. Duplicate
  review fails without rewriting either arm or the deterministic assessment.

The first ECS pair (`2026-08-29T03-56-31Z`) is deterministic-gate passing and
stored under AgentBase-Benchmark. Direct matched only `compatibility-question`;
assisted matched `backend-health-interface`, `frontend-consumer`,
`blue-green-delivery` and `compatibility-question`, with no unsupported claims.
It is intentionally not auto-accepted: the owner must review the supported
prose and decide whether the improvement is useful for the intended Discovery
workflow.

Two additional pairs broadened the signal without adding repositories. The
Crawler pair (`2026-08-29T04-08-19Z`) also passed deterministic checks and added
the critical publisher/queue/worker path plus two important outcomes. The ECS
compatibility pair (`2026-08-29T04-12-41Z`) was `incomplete`: the direct arm
emitted a forbidden command event and the assisted draft used an undeclared
evidence ID. The runner correctly rejected both. After the direct runner
disabled its shell and the scenario used the shared three-search ceiling, rerun
`2026-08-29T04-21-39Z` passed deterministic checks, kept the critical backend
interface, added blue-green delivery, and made no unsupported claim. The failed
attempt remains retained as compliance evidence.

## Impact

This qualification adds benchmark data and a focused runner only. Ordinary Hub
query latency, Ingest/Refresh time, Hub bytes, local storage, MCP surface and
public `abs` commands remain unchanged. A real pair remains separately opt-in,
may take several minutes and may consume model quota.
