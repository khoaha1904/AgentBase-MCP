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

- Active capability: `018-confirmed-domain-navigation`; most recent completed
  capability: `017-scalable-hub-navigation`.
- The capability 018 implementation is committed through `3bbbb9d`. Its last
  full offline verification is green with 339 tests.
- OKF authoring uses one entity-centered graph: repositories provide evidence,
  Domain remains optional, and system/component/interface/resource/
  infrastructure identities are not copied into repository trees.
- Catalog 5.0.0 adds one evidenced canonical relationship direction and ordered
  Business Flow steps while preserving open-world compatibility for existing
  foreign extensions.
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
  eight reference concepts found and 100% schema agreement. It remains at an
  explicit review breakpoint because the conflicting cart-retention TTL claims
  are not visible with evidence in an authored `Limitations` section. Its result
  is uncommitted, and open Hub PR #7 remains the earlier V9 proposal.

Question management and external evidence enrichment remain the next product
direction for retaining and resolving missing or unjudged knowledge.

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
