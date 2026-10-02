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
  Committed `.terragrunt-cache`, `.terraform`, `.gradle`, `.serverless`, `target`
  and `build` trees are also excluded; their files consume no admitted-file
  budget and produce no discovery signals.
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
- **AB-DISC-009** - Explicit Spring mapping/controller and JAX-RS path/HTTP
  annotations in admitted Java/Kotlin source produce P0
  `interface-event-trigger` evidence. Conventional Controller, Resource and
  Endpoint filenames/directories receive priority selection alongside manifests
  within the existing census bounds and ordinary-source reservation. Selection
  uses filenames without extra source reads; arbitrary names and dynamic
  dispatch remain bounded heuristic limitations.
- **AB-DISC-010** - Each group's eight source-location samples take one location
  per file before a second location from any file, then repeat in deterministic
  rounds. Repeated identical locations consume no extra slot. Full signal counts
  and bounded-sampling limitations remain visible.
- **AB-DISC-011** - Test paths and conventional test filenames, Markdown and
  documentation paths cannot produce runtime-entrypoint or interface-event-trigger
  P0 signals, including template-derived signals. They retain useful identity,
  integration and operations evidence. Java/Kotlin `@SpringBootApplication` and
  Java `public static void main` produce runtime-entrypoint P0 signals in
  production source. Conventional Application/Main filenames receive the same
  bounded priority selection as controllers; arbitrary names remain heuristic.
- **AB-DISC-012** - Java/Kotlin launcher evidence in one file forms one
  runtime-entrypoint group, retaining distinct annotation/main locations and
  full signal count. Separate launcher files and independently declared
  infrastructure runtimes remain separate groups.

Legacy graph fields in previously frozen Receipts remain compatibility input;
when present, counts remain nonnegative integers and terminal coverage remains
a boolean. New discovery never fabricates graph metadata. Legacy source/profile values
remain exact historical provenance, not an active provider promise.
