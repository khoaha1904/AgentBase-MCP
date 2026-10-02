# Repository discovery runtime requirements

> Status: Accepted source-only replacement for the retired native Code Graph.
>
> Release evidence: Required

Product: [Repository understanding](../../product/01-repository-understanding.md)
Architecture: [Runtime](../../architecture/runtime.md)

## Boundary

`app/agentbase-mcp` composes Hub/schema tools and source discovery. It launches
no graph provider. `app/repository-source` owns Git identity/change discovery.
Host agents investigate source with their normal read/search tools. External
upstream graph MCPs are independent and never configured or proxied by AgentBase.

## Requirements

- **AB-DISC-001** - `discover_repository` accepts one exact preflight-armed Initial
  Ingest root and emits a private five-lane Seed from safe source census.
  Unarmed, different-root and Refresh calls fail without producing a Seed.
- **AB-DISC-002** - Standard reads at most 256 admitted files, each at most
  64 KiB, after at most 4,096 traversed entries. Priority selection reserves
  one quarter of the file budget for ordinary source. All bounds are disclosed.
- **AB-DISC-003** - One expanded pass reads at most 1,024 files on the same
  source, requiring current Seed ID, user confirmation and a coverage reason.
  Stale, repeated, cross-repository and frozen-Receipt expansion fails.
- **AB-DISC-004** - Secret-like paths, generated/dependency/state directories
  and symlinks are excluded before reads. Hints redact credential-like values.
- **AB-DISC-005** - Empty lanes mean not detected, never verified absent.
  Missing identity produces an invalid Seed. Truncation/oversized files remain
  limitations; known evidence may still be dispositioned. No graph counts or
  parser-coverage diagnostic is required to create a new Seed.
- **AB-DISC-006** - Seed/group identity is deterministic for the same observed
  source. Exact source provenance binds Inventory and frozen Receipts; those
  Receipts persist and rebase without native provider or raw-source storage.
- **AB-DISC-007** - MCP exposes Hub, schema and discovery tools with explicit
  annotations and capability filtering. No graph tool or process is exposed.
- **AB-DISC-008** - Installation and release require no provider artifacts,
  native compilation, graph schema manifest or graph qualification. Offline
  product gates reject retired provider paths, imports and package scripts,
  including ignored native build caches. They retain discovery, Hub, release
  integrity and recovery tests. Graph-only fixtures may be removed; unrelated
  proposal, guidance/defer and atomic-recovery assertions remain at their
  current behavior owners.

Legacy graph fields in previously frozen Receipts remain compatibility input;
when present, counts remain nonnegative integers and terminal coverage remains
a boolean. New discovery never fabricates graph metadata. Legacy source/profile values
remain exact historical provenance, not an active provider promise.
