# Capability 046 — Initial Ingest discovery quality

> Status: owner design review in progress; behavior, living docs and implementation are unchanged.

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

## Owner decisions

The detailed, compaction-safe decision record is in
[`decisions.md`](decisions.md). Living high-level and low-level documents are
updated only after the owner finishes this sequential review.
