# 12 — Version scope

> Status: MVP and Group 1 capability boundaries are implemented and audited
> offline. Group 2 release-artifact assembly and the local application lifecycle
> plus client/skill integration and CI qualification are implemented for
> `linux-x64`; profile-scoped local/Git concurrency is also implemented and
> Group 2 is closed. G5-C1 compact Profile support is implemented and verified;
> G5-C2 quality admission is deferred and inactive.

Product Contract:
[Scope and authority](../../product/00-scope-and-authority.md)

## Contract map

- **Normative requirements:**
  [`01-foundation-requirements.md`](01-foundation-requirements.md) — repository
  engineering and verification requirements.
  [`02-installation-requirements.md`](02-installation-requirements.md) — setup,
  credential and client registration requirements.
  [`03-benchmark-requirements.md`](03-benchmark-requirements.md) — retired runner boundary and historical evidence.
- **Behavior and boundaries:**
  [`04-v1-capability-boundaries.md`](04-v1-capability-boundaries.md) — required
  first-version scope and release gaps.
  [`05-accepted-limitations.md`](05-accepted-limitations.md) — accepted limits
  and failure modes.
  [`06-cross-cutting-constraints.md`](06-cross-cutting-constraints.md) —
  local-first, provenance and no-auto-publish.
  [`07-deferred-capabilities.md`](07-deferred-capabilities.md) — capabilities
  added after MVP only when a real need appears.
- **Additional normative requirements:**
  [`08-cli-runtime-requirements.md`](08-cli-runtime-requirements.md) — public
  `abs` grammar, Group 1 single enterprise credential behavior and provider
  extension boundary.
  [`09-mcp-protocol-requirements.md`](09-mcp-protocol-requirements.md) — supported
  MCP eras, stateless transport behavior and deferred remote authority.
  [`10-release-artifact-requirements.md`](10-release-artifact-requirements.md) —
  deterministic platform release composition and qualification.
  [`11-application-lifecycle-requirements.md`](11-application-lifecycle-requirements.md)
  — stable launcher and transactional local application lifecycle.
  [`12-client-and-skill-integration-requirements.md`](12-client-and-skill-integration-requirements.md)
  — stable client registration and versioned released-skill lifecycle.
  [`13-release-ci-requirements.md`](13-release-ci-requirements.md) — required
  repository verification, derived release evidence and CI-qualified archives.

Do not create a separate decision register; current decisions already belong to
their high/low-level owners, and another registry would become a dead-spec
duplicate.

## Source-only discovery

AgentBase has no parser profile or native graph artifact. `discover_repository`
uses the bounded source census and retains visible unsupported-pattern limits.
This does not qualify additional operating systems or framework understanding.
The previous native engine and all model benchmark runners are retired.

## Current MVP boundary

- Catalog 7 with provider-neutral roles; the accepted compact target uses rich
  Repository dossiers plus only independently justified standalone knowledge.
- Local single-repository Initial Ingest/Refresh plus Batch Initial Ingest.
- Public bounded workspace Scan routes user-selected repositories without graph
  prebuild or mixed-batch machinery.
- Bounded read-only AWS/SQS Domain Enrichment; no provider-wide scan or auto-publish.
- Terraform/Terragrunt and bounded SAM/CloudFormation structured evidence;
  no template execution or deployed-state guarantee.
- Rich PR summary, independent Init PR, same-Repository stack and synchronization
  exist; MCP never merges.
- Shared Question documents, exact-scope Guidance and AWS/SQS three-tier
  enrichment are implemented. Broader inference and provider profiles remain deferred.
- No remote profile means schema guidance/Scan only; every remote URL+branch profile
  isolates Published and Draft state while profiles may share one configured
  enterprise credential. Exact-empty bootstrap writes
  README + root index + CI baseline directly once; later changes use PRs.
- Public terminal surface is the small `abs` command (`status`, `hub connect`,
  `hub sync`); OKF is the shared format name, not a user-facing command group.
