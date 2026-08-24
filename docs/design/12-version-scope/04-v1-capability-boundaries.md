# 12.04 — MVP capability boundary

> Trạng thái: Boundary owner-approved; implementation audit pending.

## Required and implemented

- install/register MCP without forcing Hub setup;
- public bounded `agentbase-scan` inventory and workflow suggestions;
- one explicit local repository Code Graph and bounded source reads;
- Catalog 7 provider-neutral concepts with Terraform/Terragrunt evidence;
- single-repository Initial Ingest and Refresh producing reviewable proposals;
- Batch Initial Ingest with recoverable sequential checkpoints and one atomic proposal;
- bounded AWS/SQS Domain Enrichment with read-only provider evidence;
- isolated remote Hub profiles, Published-only query, structured inspection and
  atomic Accept; no remote profile means Code Graph only;
- observed snapshots with provenance, age and no implicit source probe;
- shared Hub Question documents and atomic exact-scope Maintainer Guidance;
- rich deterministic PR summary, independent Init PRs, same-Repository stacks,
  retry/reconciliation and synchronization;
- no automatic Accept, Publish or merge.

## Release gate

Implementation must still be audited against this converged boundary before a
release claim. Canonical offline verification and separately authorized model
qualification are evidence gates; Batch Refresh, additional provider profiles,
remote file reading and HTML review remain deferred. Ordinary Hub query is
intentionally Published-only.

## Qualification boundary

Offline `npm run verify` remains canonical. Model benchmark is explicit product
evidence: Sol for Initial Ingest, Terra for Refresh. It does not become runtime
model routing, a completeness gate or a promise that every repository/domain is
covered.
