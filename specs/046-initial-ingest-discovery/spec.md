# Capability 046 — Initial Ingest discovery quality

> Status: owner design approved; living docs describe the pending target and
> runtime implementation remains unchanged.

## Objective

Make Initial Ingest discover repository-local knowledge broadly enough to avoid
silent high-value omissions while keeping Published OKF selective, compact,
evidence-backed and reviewable.

The central rule is:

> Discover broadly, publish selectively.

Initial Ingest must exploit the pinned Codebase Memory provider instead of
building another repository scanner. The host Agent remains responsible for
semantic interpretation. MCP owns bounded machine-signal capture, inventory
coverage, evidence/integrity validation and proposal receipts.

## Problem statement

The current workflow permits a truthful sparse proposal, but it applies the
sparsity rule too early. MCP validates only the candidates supplied by the
Agent, so a route, runtime boundary, outbound dependency or useful Flow may be
silently absent even when Codebase Memory or direct source makes it visible.

An audit of `sock-shop-front-end` with the pinned provider produced 124 nodes,
154 edges and 20 HTTP routes. Repository-local outbound service evidence was
also explicit in source, but important cross-service Flow knowledge was added
only by a later Refresh qualification. The desired correction is better Init
discovery, not a concept quota or a second Code Graph.

## Scope

- single-repository Initial Ingest discovery and authoring;
- the per-repository member path reused by Batch Initial Ingest;
- one private per-session Discovery Seed and one compact prepared Inventory Receipt;
- coverage-aware schema guidance, preparation, validation and inspection;
- concise Repository/Domain knowledge activity logs;
- real skill-driven qualification after implementation.

## Non-goals

- a new public scanner or MCP tool;
- full repository/source coverage;
- automatic provider access;
- placeholder external concepts;
- automatic Accept, PR creation or publication;
- schema/catalog expansion;
- mandatory subagents, parallel ingest or a runtime model router;
- token optimization before a measured implementation result.

## Required behavior

1. Scan remains read-only and builds no graph. Initial Ingest requires one
   active Remote Hub and selects the exact remote default-branch commit before
   Discover; it never checks out or stashes the user's working tree.
2. Discover derives one private Seed from normalized pinned-provider signals
   plus a bounded file census and compacts repeated technical rows into
   traceable evidence groups.
3. Investigate closes five lanes and gives every important Seed group one
   `concept`, `embedded`, `question` or `ignored` disposition backed by exact
   authorized repository source or a truthful limitation.
4. Successful guidance freezes one compact Inventory Receipt. Prepare consumes
   the receipt identity, and Validate checks both Seed-to-OKF coverage and normal
   OKF integrity before inspection.
5. A trustworthy selective proposal is Ready for review even with P1/P2 gaps,
   Questions or limitations. Authority, mutation, integrity or unresolved P0
   coverage failure is Incomplete and cannot be queried, accepted or published.
6. Batch applies the same source and discovery contract sequentially per member,
   keeps evidence isolated and produces one atomic proposal without cross-member
   reconciliation.
7. Inspection and PR presentation include source revision, lane coverage,
   embedded knowledge, relations/Flows, Questions, limitations and bounded
   ignored reasons. Successful knowledge changes update concise Repository or
   Domain logs; failed attempts and raw inventory never enter the Hub.

## Acceptance scenarios

- A clean checkout at the exact remote default commit is indexed once and its
  graph may be reused through proposal creation.
- A feature/dirty/different checkout is left byte-for-byte unchanged while Init
  analyzes an isolated exact remote-default worktree/cache.
- Explicit route, entrypoint, runtime, outbound integration and deploy signals
  cannot silently disappear even when only a small number of concepts is useful.
- Twenty related CRUD routes may become one Interface group or embedded summary;
  they are not required to become twenty concepts.
- Conflicting README and technical configuration claims retain their source
  roles; a material conflict creates a grouped Question rather than an invented
  winner.
- A partial/unsupported provider area yields a named lane limitation or
  Incomplete P0 failure instead of appearing as an empty repository.
- The released `agentbase-ingest` skill completes the exact workflow without a
  public scanner tool, model router, provider call, Accept or Publish action.

## Success criteria

- Offline contracts prove exact source isolation, provider-shape compatibility,
  Seed grouping, disposition coverage, receipt handoff, retry invalidation,
  batch isolation, inspection and activity-log rendering.
- One real skill-driven Sol probe produces a structurally valid proposal and
  acknowledges representative P0 evidence without an exact concept inventory.
- A valid probe authorizes at most one sequential identical replica; reports
  separate product defects from benchmark defects and include change versus the
  previous run, elapsed time and token use.

## Owner decisions

The detailed, compaction-safe approved decision record is in
[`decisions.md`](decisions.md). Living high-level and low-level documents are
marked as the pending Capability 046 target until implementation qualifies it.
