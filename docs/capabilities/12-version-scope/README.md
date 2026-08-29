# 12 — Version scope

> Status: MVP capability boundary implemented and audited offline.

High-level decision:
[Current limits and first-version scope](../../product/12-current-limits-and-open-decisions.md)

## Planned decomposition

- [`01-foundation-requirements.md`](01-foundation-requirements.md) — repository
  engineering and verification requirements.
- [`02-installation-requirements.md`](02-installation-requirements.md) — setup,
  credential and client registration requirements.
- [`03-benchmark-requirements.md`](03-benchmark-requirements.md) — opt-in agent
  benchmark requirements and retained evidence.
- [`04-v1-capability-boundaries.md`](04-v1-capability-boundaries.md) — required
  first-version scope and release gaps.
- [`05-accepted-limitations.md`](05-accepted-limitations.md) — accepted limits
  and failure modes.
- [`06-cross-cutting-constraints.md`](06-cross-cutting-constraints.md) —
  local-first, provenance and no-auto-publish.
- [`07-deferred-capabilities.md`](07-deferred-capabilities.md) — capabilities
  added after MVP only when a real need appears.
- [`08-cli-runtime-requirements.md`](08-cli-runtime-requirements.md) — public
  `abs` grammar, shared-token connect, compatibility and verification boundary.

Do not create a separate decision register; current decisions already belong to
their high/low-level owners, and another registry would become a dead-spec
duplicate.

## Current MVP boundary

- Catalog 7 with sparse provider-neutral concepts and embedded resources.
- Local single-repository Initial Ingest/Refresh plus Batch Initial Ingest.
- Public bounded workspace Scan routes user-selected repositories without graph
  prebuild or mixed-batch machinery.
- Bounded read-only AWS/SQS Domain Enrichment; no provider-wide scan or auto-publish.
- Terraform/Terragrunt structured evidence; no SAM/CloudFormation support.
- Sol Init and Terra Refresh are benchmark policy only.
- Rich PR summary, independent Init PR, same-Repository stack and synchronization
  exist; MCP never merges.
- Shared Question documents, exact-scope Guidance and AWS/SQS three-tier
  enrichment are implemented. Broader inference and provider profiles remain deferred.
- No remote profile means Code Graph/Scan only; every remote URL+branch profile
  isolates Published, Draft and credential state. Exact-empty bootstrap writes
  README + root index + CI baseline directly once; later changes use PRs.
- Public terminal surface is the small `abs` command (`status`, `hub connect`,
  `hub sync`); OKF is the shared format name, not a user-facing command group.
