# 12.04 — MVP capability boundary

> Status: MVP boundary implemented and audited offline.

## Required and implemented

- install/register MCP without forcing Hub setup;
- public bounded `agentbase-scan` inventory and workflow suggestions;
- one exact source snapshot with bounded source discovery;
- Catalog 7 provider-neutral concepts with Terraform/Terragrunt evidence;
- single-repository Initial Ingest and Refresh producing reviewable proposals;
- Batch Initial Ingest with recoverable sequential checkpoints and one atomic proposal;
- bounded AWS/SQS Domain Enrichment with read-only provider evidence;
- isolated remote Hub profiles, Published-only query, structured inspection and
  explicit Direct/PR Publish; no remote profile means schema guidance and Scan;
- observed snapshots with provenance, age and no implicit source probe;
- shared Hub Question documents and atomic exact-scope Maintainer Guidance;
- rich deterministic PR summary, independent Init PRs, same-Repository stacks,
  retry/reconciliation and synchronization;
- no automatic Publish or merge.
- one small public `abs` CLI surface (`status`, `hub connect`, `hub sync`);
  lifecycle runners and OKF internals remain hidden skill/MCP/developer routes.

## Release gate

Implementation is audited against this converged boundary. Canonical offline
verification and separately authorized model
qualification are evidence gates; Batch Refresh, additional provider profiles,
remote file reading and HTML review remain deferred. Ordinary Hub query is
intentionally Published-only.

## Evaluation boundary

Offline `npm run verify` remains canonical. The application contains no model
benchmark or native-provider campaign. Historical evidence is retained outside
the runtime; future evaluation needs a concrete owner question and scope.
