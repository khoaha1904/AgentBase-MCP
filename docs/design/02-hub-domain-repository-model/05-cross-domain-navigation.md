# 02.05 — Cross-Domain navigation

> Trạng thái: Owner-approved boundary; enrichment of missing relations deferred.

## Membership versus relation

Chỉ `part-of` truyền Domain membership trong query graph. Các relation như
`publishes-to`, `consumes`, `depends-on` hoặc `implemented-in` nối knowledge
nhưng không đổi primary Domain của Repository.

```text
Crawler Repository ──part-of──→ Crawler Domain
Crawler Worker ──publishes-to──→ Shared Queue ←──consumes── Recommender
```

Shared Queue chỉ có một canonical concept. Domain-scoped query tìm nó qua System/
component paths và cross-domain traversal; không copy Queue vào mỗi Domain.

## Navigation rules

- Root index link bounded Domain/System/Repository entrypoints.
- Domain links Systems và critical flows, không chứa repository tree copy.
- Repository concept giữ source-specific purpose/build/entrypoints và links tới
  canonical Systems/components qua normal relations.
- Inbound navigation được query-time derive; không persist inverse duplicate.
- Integration Contract chỉ thành concept riêng khi có identity/ownership/mapping/
  lifecycle hoặc query value độc lập.

## Reuse

Giữ canonical relationship vocabulary, `deriveDomains`, inbound traversal và
role-oriented paths hiện tại. Phần 02 chỉ bổ sung Repository primary-Domain edge;
matching shared resources thuộc phần 06.
