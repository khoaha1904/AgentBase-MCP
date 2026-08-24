# 12 — Version scope

> Trạng thái: MVP capability boundary owner-approved; implementation audit in progress.

High-level decision:
[Giới hạn và phạm vi phiên bản đầu](../../present/12-current-limits-and-open-decisions.md)

## Phân rã dự kiến

- [`01-foundation-requirements.md`](01-foundation-requirements.md) — repository
  engineering and verification requirements.
- [`02-installation-requirements.md`](02-installation-requirements.md) — setup,
  credential and client registration requirements.
- [`03-benchmark-requirements.md`](03-benchmark-requirements.md) — opt-in agent
  benchmark requirements and retained evidence.
- [`04-v1-capability-boundaries.md`](04-v1-capability-boundaries.md) — phạm vi
  bắt buộc và release gap của phiên bản đầu.
- [`05-accepted-limitations.md`](05-accepted-limitations.md) — giới hạn và
  failure modes được chấp nhận.
- [`06-cross-cutting-constraints.md`](06-cross-cutting-constraints.md) —
  local-first, provenance và no-auto-publish.
- [`07-deferred-capabilities.md`](07-deferred-capabilities.md) — capability chỉ
  thêm sau MVP khi có nhu cầu thật.

Không tạo decision register riêng; current decisions đã nằm ở đúng high/low-level
owner và một registry nữa sẽ thành dead-spec duplicate.

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
