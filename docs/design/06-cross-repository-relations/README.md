# 06 — Cross-repository relations

> Trạng thái: Chờ review cách phân rã.

High-level decision:
[Quan hệ giữa nhiều repository và Domain](../../present/06-cross-repository-and-cross-domain-relationships.md)

## Phân rã dự kiến

- `01-relation-discovery.md` — relation một phía và evidence của từng source.
- `02-resource-identity-matching.md` — identity mạnh, alias và match candidate.
- `03-domain-enrichment-reconciliation.md` — đối chiếu nhiều Published
  repository theo batch mà không kéo dài Ingest.
- `04-provider-verification.md` — xác minh bounded candidates read-only qua
  provider CLI trong Domain Enrichment.
- `05-concept-merge-and-history.md` — canonical ID, redirect, aliases và history.
- `06-multi-region-resources.md` — logical resource và deployment references.
