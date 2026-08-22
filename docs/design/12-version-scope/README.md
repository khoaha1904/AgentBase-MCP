# 12 — Version scope

> Trạng thái: MVP scope synchronized; deeper breakout remains deferred.

High-level decision:
[Giới hạn và phạm vi phiên bản đầu](../../present/12-current-limits-and-open-decisions.md)

## Phân rã dự kiến

- [`01-foundation-requirements.md`](01-foundation-requirements.md) — repository
  engineering and verification requirements.
- [`02-installation-requirements.md`](02-installation-requirements.md) — setup,
  credential and client registration requirements.
- [`03-benchmark-requirements.md`](03-benchmark-requirements.md) — opt-in agent
  benchmark requirements and retained evidence.
- `04-v1-capability-boundaries.md` — phạm vi bắt buộc của phiên bản đầu.
- `05-accepted-limitations.md` — giới hạn và failure modes được chấp nhận.
- `06-cross-cutting-constraints.md` — local-first, provenance và no-auto-publish.
- `07-deferred-capabilities.md` — shared draft, fine-grained ACL và automation sau.
- `08-low-level-decision-register.md` — các quyết định kỹ thuật xuyên nhiều phần.

## Current MVP boundary

- Catalog 7 with sparse provider-neutral concepts and embedded resources.
- Local single-repository Initial Ingest/Refresh; no provider CLI or auto-publish.
- Terraform/Terragrunt structured evidence; no SAM/CloudFormation support.
- Sol Init and Terra Refresh are benchmark policy only.
- Main-target Hub PR publication exists; rich template and stacked PR do not.
