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
- one concise Repository knowledge activity entry for successful Init;
- real skill-driven qualification after implementation.

## Non-goals

- a new public scanner or MCP tool;
- full repository/source coverage;
- automatic provider access;
- placeholder external concepts;
- automatic Accept, PR creation or publication;
- concept-role or catalog expansion; the backward-compatible repository-source
  provenance field needed to bind exact observed revision is in scope;
- mandatory subagents, parallel ingest or a runtime model router;
- token optimization before a measured implementation result.

## Required behavior

1. Scan remains read-only and builds no graph. Initial Ingest requires one
   active Remote Hub and selects the exact remote default-branch commit before
   Discover; it never checks out or stashes the user's working tree.
2. After Init/Batch Init Preflight arms an exact analysis root and that root is
   indexed, MCP derives one private Seed by running index diagnostics, a
   fixed explicit architecture baseline and a bounded secret-safe file census.
   It appends a bounded Seed summary to unchanged provider result blocks so the
   Agent can disposition group IDs. Search/trace calls investigate the Seed but
   do not define or mutate it.
3. MCP assigns five lane results and fixed P0 classes. Investigate gives every
   important Seed group one
   `concept`, `embedded`, `question` or `ignored` disposition backed by exact
   authorized repository source/revision or a truthful limitation. The Agent
   interprets meaning but cannot self-declare priority, coverage or absence.
4. Successful guidance freezes one compact Inventory Receipt. Prepare consumes
   the receipt identity, and Validate checks both Seed-to-OKF coverage and normal
   OKF integrity before inspection.
5. A trustworthy selective proposal is Ready for review even with P1/P2 gaps,
   Questions or limitations. Authority, mutation, integrity or unresolved P0
   coverage failure is Incomplete and cannot be queried, accepted or published.
6. Batch applies the same source and discovery contract sequentially per member,
   keeps evidence isolated and produces one atomic proposal. A confirmed-clean
   member-local failure does not stop siblings, but the Batch cannot Finalize
   until every member completes or the user revises membership.
7. Inspection and PR presentation include source revision, lane coverage,
   embedded knowledge, relations/Flows, Questions, limitations and bounded
   ignored reasons. Successful Init updates only the Repository log; failed
   attempts and raw inventory never enter the Hub.
8. Hub-bound source access uses a same-host Hub credential and an AgentBase-owned
   private mirror/worktree outside the user repository. It never uses SSH or
   ambient Git credentials, and secret-like paths are excluded before indexing.
9. Questions reuse the existing SharedQuestion/candidate-evidence model and are
   rendered from a Receipt-bound QuestionPlan. Receipt/session creation is
   idempotent and crash-safe; Hub-base movement never forces unchanged source
   discovery to rerun.
10. Normal Refresh uses the common remote-default SourceSnapshot but retains its
    change-first guidance path without an Init Seed/Inventory/Receipt. Ordinary
    query also never creates a Seed.

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
- A non-terminal coverage page cannot prove absence; P0 overflow or a diagnostic
  that can hide P0 makes the member Incomplete rather than silently truncating.
- A P0 group can be ignored only as a duplicate of an item that will actually
  materialize; generated/out-of-scope signals are classified below P0 earlier.
- An outbound/trigger/datastore boundary may become one P1 Flow candidate and
  one representative trace without creating a process graph.
- A differently named local remote is admitted only when it uniquely matches
  canonical repository identity; ambiguity asks the user instead of assuming
  `origin`.
- An existing Published repository is not silently re-initialized. Broad
  retrofit remains a future Full Discovery Refresh; qualification may explicitly
  reset/re-ingest disposable Hub data.
- The released `agentbase-ingest` skill completes the exact workflow without a
  public scanner tool, model router, provider call, Accept or Publish action.

## Success criteria

- Offline contracts prove exact source isolation, same-host token-only access,
  secret-path exclusion, provider-shape compatibility, deterministic Seed
  construction, paging/overflow handling, disposition and QuestionPlan coverage,
  receipt/session idempotency, Hub-base retry phases, Batch continuation,
  inspection and Repository-log rendering.
- One real skill-driven Sol probe produces a structurally valid proposal and
  independently proves representative source P0 entered the Seed, then verifies
  its proposal disposition without imposing an exact concept inventory.
- A valid probe authorizes at most one sequential identical replica; reports
  separate product defects from benchmark defects and include change versus the
  previous run, elapsed time and token use.

## Owner decisions

The detailed, compaction-safe approved decision record is in
[`decisions.md`](decisions.md). Living high-level and low-level documents are
marked as the pending Capability 046 target until implementation qualifies it.
