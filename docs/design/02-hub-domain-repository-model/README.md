# 02 — Hub, Domain và Repository model

> Trạng thái: Domain/Repository và Batch Initial Ingest implemented;
> subproject-scope automation trong monorepo deferred.

High-level decision:
[Hub, Domain và Repository được tổ chức thế nào?](../../present/02-hub-domains-and-repositories.md)

## Phân rã dự kiến

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — Domain baseline và
  quyết định một Git repository có một primary Domain.
- [`01-core-entities.md`](01-core-entities.md) — Hub, Domain, Repository và
  ranh giới ownership.
- [`02-domain-confirmation.md`](02-domain-confirmation.md) — đọc README/docs,
  đề xuất, cảnh báo và xác nhận Domain.
- [`03-batch-domain-assignment.md`](03-batch-domain-assignment.md) — gán Domain
  cho batch và xử lý repository bất thường.
- [`04-monorepo-scopes.md`](04-monorepo-scopes.md) — Git-root identity và
  subproject evidence scope.
- [`05-cross-domain-navigation.md`](05-cross-domain-navigation.md) — liên kết
  sang Domain khác mà không đổi repository ownership.

## Implementation delta hiện tại

Repository primary Domain, owner confirmation, `part-of` validation và explicit
Batch Initial Ingest đã implement. Parent multi-repo chỉ là grouping/routing
scope. Phần còn deferred là tự động dùng monorepo subproject làm bounded source
scope; không thêm registry, database hoặc subproject identity.
