# 06 — Cross-repository relations

> Trạng thái: AWS/SQS runtime slice đã implement offline; chờ real-provider qualification riêng.

High-level decision:
[Quan hệ giữa nhiều repository và Domain](../../present/06-cross-repository-and-cross-domain-relationships.md)

## Phân rã dự kiến

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — phần có thể tái sử
  dụng, gap và impact checkpoint trước khi thiết kế sâu.
- [`01-relation-discovery.md`](01-relation-discovery.md) — canonical relation,
  unresolved candidate và evidence của từng source.
- [`02-resource-identity-matching.md`](02-resource-identity-matching.md) —
  provider-neutral external identity, scope và strong match candidate.
- [`03-domain-enrichment-reconciliation.md`](03-domain-enrichment-reconciliation.md)
  — đối chiếu nhiều Published repositories thành một atomic Enrichment Draft.
- [`04-provider-verification.md`](04-provider-verification.md) — xác minh exact
  candidates read-only qua released provider CLI profiles.
- [`05-concept-merge-and-history.md`](05-concept-merge-and-history.md) — explicit
  canonical selection, retained redirect và Git history.
- [`06-multi-region-resources.md`](06-multi-region-resources.md) — logical
  concept, regional deployment references và split boundary.
- [`07-runtime-requirements.md`](07-runtime-requirements.md) — stable
  `AB-ENRICH-*` requirements cho bounded Domain Enrichment runtime.

## Thứ tự review

Relation candidate phải được chốt trước external identity. External identity là
dependency của reconciliation, provider verification, merge và multi-region;
không thiết kế các nhánh đó song song để tránh tạo nhiều contract mâu thuẫn.
