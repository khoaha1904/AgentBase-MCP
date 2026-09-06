# 09.09 — Capability requirements

> Status: Baseline Batch Initial Ingest and Capability 046 per-member
> SourceSnapshot/Seed/Receipt additions are implemented offline. G5-C2
> per-member quality admission is deferred and inactive.

These `AB-BATCH-*` requirements are the normative Batch Initial Ingest portion
of the Ingest and Refresh Capability Contract. Single-repository authoring
requirements remain enforced by the shared OKF authoring runtime.

- **AB-BATCH-001** — A batch binds an exact Hub base, one confirmed Domain and
  2..32 explicit unique local repository roots; it does not scan a workspace for repositories.
  Roots establish selection/identity, while analysis binds the exact accessible
  remote default-branch commit selected during member Preflight.
- **AB-BATCH-002** — Preflight returns a per-repository matrix containing canonical
  identity, bounded README/documentation paths, the proposed Domain and warnings.
  Every row must be explicitly confirmed before authoring.
- **AB-BATCH-003** — Only a canonical Repository can be Initialized. An existing
  Repository must switch to Refresh; duplicate, nested or ambiguous roots fail
  closed. The current checkout is analyzed only when clean and an exact match for
  the remote default commit; every other state uses a detached worktree/cache and
  does not mutate the user workspace.
- **AB-BATCH-004** — Members run sequentially in manifest order and retain separate
  source, graph/evidence, Questions, limitations and staging.
- **AB-BATCH-005** — A truthful sparse member may succeed without a concept
  quota, cross-repository inference or provider verification, but it must satisfy
  compact dossier, deterministic coverage and validation with visible limitations.
- **AB-BATCH-006** — Finalize composes exact completed member diffs onto one base.
  Only shared append-only indexes and navigation for the confirmed Domain are
  built deterministically; a Profile shared Question index is rebuilt from all
  composed Question documents in canonical Question-ID order; every other authored overlap is rejected. The result is an atomic
  `batch-new` proposal.
- **AB-BATCH-007** — A member failure keeps the batch Incomplete. An explicit retry
  reuses a sibling only while source/base/input/staging remain exact; there is no
  hidden retry or duplicate append.
- **AB-BATCH-008** — A membership revision creates a new immutable manifest
  revision, reuses exact checkpoints and lets full-bundle validation block dangling knowledge.
- **AB-BATCH-009** — Inspect, Accept, pending reconstruction and publication keep
  the entire batch as one unit with every Repository ID; an independent pull
  request targets `main` and is not split or merged by MCP.
- **AB-BATCH-010** — Domain Enrichment authority does not change. MCP adds no
  model SDK, database, daemon or parallel runner. Optional external AI review
  creates no Batch state or Finalize gate.
- **AB-BATCH-011** — `agentbase-scan` does not build a graph. Each member creates
  or reuses a graph after source selection and has an isolated Discovery Seed,
  Inventory Receipt, staging and coverage result; one member's evidence does not
  cover another member.
- **AB-BATCH-012** — Failure to resolve/access the exact remote default source
  makes the member Incomplete; the workflow does not fall back to a feature or dirty checkout.
- **AB-BATCH-013** — A recoverable member-local semantic/materialization/provider
  failure proceeds to sequential siblings after confirmed-clean cleanup. Uncertain
  cleanup, process or shared Hub/source authority failure stops the Batch. Finalize
  opens only when every confirmed member is complete or membership is explicitly revised.
- **AB-BATCH-014** — The qualification dataset retains three independent repository
  fixtures and is tested through the Batch Initial Ingest E2E lifecycle; topology
  fixture materialization retains per-member source evidence and does not treat
  mock provider output as canonical Hub truth.
- **AB-BATCH-015** — Qualification must test one chain of Published projection,
  resource/relation query, static Domain-site build and proposal safety; every step
  reports deterministic counts/limitations without adding a production dependency,
  model call or provider scan.
- **AB-BATCH-016** — Batch Finalize emits one `Batch Navigation` section and at
  most one bullet for each canonical navigation target. It moves matching
  member-skeleton bullets into that section without changing other Domain prose.
