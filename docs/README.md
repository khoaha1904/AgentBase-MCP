# AgentBase-MCP documentation

This directory contains only current product truth. It is intentionally small
and progressively loaded; do not read every contract for every task.

## Session route

At session start, read only:

1. `AGENTS.md` for repository rules;
2. this file for current state and document routing;
3. `specs/CURRENT.md` for the active or most recently completed capability;
4. Git status.

Then load the smallest document set matching the task:

| Question or change | Read next |
|---|---|
| Product outcome, naming, scope or authority | `docs/PRODUCT.md` |
| Source ownership, dependencies or runtime structure | `docs/ARCHITECTURE.md` |
| Repository workflow and verification | `docs/contracts/foundation.md` |
| Codebase Memory, graph lifecycle, refresh or MCP tools | `docs/contracts/code-graph.md` |
| Observations, OKF proposals or schema catalog | `docs/contracts/okf.md` |
| Local Hub, GitHub publication or synchronization | `docs/contracts/hub.md` |
| Installer, credential or client registration | `docs/contracts/installation.md` |
| Agent-authored OKF benchmark | `docs/contracts/benchmark.md` |

Read an active numbered artifact under `specs/` only when implementing that
capability. Completed numbered artifacts are historical change records, not
current product authority.

## Authority order

When sources disagree, separate intended behavior from observed behavior:

1. the latest user decision controls the requested change;
2. the relevant tracked contract controls currently accepted behavior;
3. an approved active capability controls its not-yet-accepted change scope;
4. implementation and focused tests prove what the checkout actually does;
5. completed capability artifacts and Git history explain history only.

`docs/.archived/` is a local, Git-ignored snapshot of superseded documentation.
It may explain history but must never override tracked current docs. Git history
is the portable archive.

## Current checkpoint

- Active capability: `022-single-repository-ingest`. V14 passed lifecycle only
  1/3 and exposed that catalog 6 conflates technology detection, concept
  promotion and rendering. Catalog 7.0 passes the offline gate; the generated
  Flow-skeleton defect exposed by its first V15 qualification is fixed and
  verified offline. The owner-authorized V15 requalification now passes the
  lifecycle and produces a valid reviewable bundle, but still needs semantic
  revision for Domain navigation, Flow coverage and Terraform evidence scope.
- Initial Ingest now resolves a durable Repository identity, requires bounded
  Domain confirmation, uses the graph only as a private map and stops at one
  sparse, inspectable proposal preview. Partial coverage is valid and visible;
  integrity failure is Incomplete.
- New Initial Ingest preparation renders exact and suggested candidate recommendations into
  editable OKF skeleton files with valid lifecycle/provenance frontmatter and
  navigation. Suggested skeletons visibly require proposal review; the agent
  enriches knowledge instead of rebuilding document syntax from memory.
- Capability 018 is complete with 339 passing offline tests. Its V11 real run is
  accepted for confirmed Domain and shared-navigation qualification; no V12
  numeric-snapshot iteration was authorized.
- The latest V15 Health run `2026-08-21T135125Z` proves the Terraform
  source-truth guard but is invalid before Finalize: Flow guidance omits the
  exact `order/source/target` serialization required by validation. The agent
  exhausted its repair budget guessing field names. This is an MCP contract
  defect; no OKF bundle was scored.
- V15 Health run `2026-08-21T142407Z` proves the exact Flow shape fix, but is
  invalid before Inspect because its Flow uses embedded labels rather than
  existing concept identities as endpoints. Finalize correctly blocked it; the
  scorer did not run.
- V15 Health run `2026-08-21T143803Z` passes the full lifecycle with a valid
  reviewable bundle and complete reference/embedded coverage. It remains
  `needs_revision`: Domain navigation/prose is weak, Flow provenance is 83%,
  and manual review flags likely Interface/Resource over-promotion to supply
  Flow endpoints.
- The post-run semantic correction is implemented offline. Interface/Resource
  promotion now needs compatible candidate-owned semantic boundary evidence;
  new Domain drafts navigate their prepared Systems; Flow guidance requires
  trigger/outcome/interaction provenance. Benchmark ratios expose counts and
  `n/a`, name unjudged identities, require final validation coverage and no
  longer require Flow for the one-runtime Terraform fixture. Requalification
  remains separately owner-authorized.
- V15 run `2026-08-21T150816Z` retained a guidance-contract failure: the agent
  correctly embedded DynamoDB/delivery details but MCP rejected promotion
  evidence attached to Function intent. Other roles now accept that evidence as
  non-authoritative intent; the strict Interface/Resource gate is unchanged.
- Replacement `2026-08-21T151424Z` passed that first restriction but exposed a
  second: Function structured promotion evidence was still forced to be
  semantic. Other roles now accept candidate-owned structured evidence; the
  Interface/Resource semantic gate and Terraform source-truth guard remain.
- Run `2026-08-21T151815Z` passed guidance and correctly declined Resource, then
  exposed promotion-field drift in the Prepare parser. That adapter is aligned.
  Benchmark policy is now sequential: stop after a blocked probe; replicate
  only a valid unblocked run; reserve run three for final acceptance.
- Probe `2026-08-21T152548Z` passed the complete lifecycle and all applicable
  reference metrics at 100%. It correctly kept DynamoDB, schedule and delivery
  details embedded and omitted an artificial Flow. Manual review found every
  generated category index entry duplicated, while validation/scoring missed
  the defect; AB-BENCH-048 therefore stopped the sequence before a replica.
- OKF authoring uses one entity-centered graph: repositories provide evidence,
  Domain remains optional, and system/component/interface/resource/
  infrastructure identities are not copied into repository trees.
- Catalog 7.0 has eight Initial Ingest roles: Repository, Domain, System,
  Component, Function, Interface, Flow and Resource; Entity/Metric are
  enrichment-only. One Terraform-family detector accepts source-truthful
  Terraform/Terragrunt evidence and the AWS profile classifies technology.
  SAM/CloudFormation remains unsupported rather than being mislabeled.
  Internal queues/topics/data/hosts embed in a useful parent unless independent
  boundary evidence promotes them. Foreign extensions remain open-world compatible.
- Hub retrieval is progressively scoped through root, Domain and System
  navigation, deterministic search and bounded inbound/outbound traversal. A
  broad ambiguous query asks for Domain scope instead of returning Hub-wide
  bodies.
- Re-ingest continuity contains only that source repository's prior concepts,
  canonical subject, immediate neighbors and navigation paths; changed-set
  validation does not receive the whole Hub.
- The benchmark quality model, with catalog
  5.0.0 relationship semantics, separates
  validity, owner-review usefulness, non-exhaustive coverage and token/time
  telemetry. Three-source offline qualification retains
  frontend, backend and infrastructure evidence in one canonical system graph.
- Confirmed Domain authoring now carries explicit owner evidence, produces
  Commerce → Shopping Cart navigation and protects existing shared index lines
  from replacement, deletion, reordering or restyling.
- Shopping Cart V11 run `2026-08-15T172701Z` is valid and reviewable with all
  eight reference concepts found and 100% schema agreement. Its incomplete TTL
  evidence is not treated as a resolved policy or repaired by storing more
  volatile numbers. Open Hub PR #7 remains the earlier V9 proposal.
- Capability 019 is complete. It retains
  conflicting live claim references without durable volatile scalars, binds
  query-time resolution to the authorized repository, persists proposal-coupled
  governed questions and turns attributed answers into separately reviewable
  Maintainer Guidance without choosing or deleting source truth.
- Shopping Cart V12 run `2026-08-17T063359Z` exercised that authoring contract
  but is retained as invalid: target-kind/index conformance failed and the
  required retention references were omitted. It does not qualify PR #7 rebuild
  or publication.

## Superseded assumptions

Do not revive these older ideas from historical artifacts:

- `agentbase-next`, lowercase legacy repositories and `knowledger-hub` are not
  product identities. The products are AgentBase-MCP and AgentBase-Hub.
- AgentBase-Hub is not a temporary proposal checkout or remote-only store. Its
  owned local `main` is active knowledge; remote publication is later and
  explicit.
- Installation does not select or create a Hub. Hub setup is lazy and Code
  Graph works with no Hub.
- OKF is not a custom single report or a fixed universal taxonomy. AgentBase
  targets Google OKF v0.2 bundles with an open-world concrete schema catalog.
- Users do not supply or globally install the graph binary. AgentBase owns the
  exact package-private Codebase Memory version.
- One-shot provider calls are not the normal path. One scoped session per
  evidence round is the default; one-shot is explicit rollback.
- An unchanged accepted graph does not need re-indexing. Exact freshness reuse
  skips indexing but still performs queries and safety checks.
- Benchmark OKF must be authored by a real explicit host agent; manually written
  bundles and observation-only runs are not equivalent baselines.

## Documentation maintenance

Update current truth once, in the narrowest document above. Do not add a new
handoff, roadmap, ADR or evidence diary that repeats it. A user-visible behavior
change belongs in one numbered capability and updates the affected current
contract when accepted. Keep stable `AB-*` requirement IDs for traceability.
