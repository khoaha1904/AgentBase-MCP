# 05.04 — Source references

> Trạng thái: Technical design draft.

## Canonical reference

Repository evidence tiếp tục dùng:

```text
repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>
```

Reference không chứa absolute checkout root, cache path, credential hoặc raw
provider identity. Proposal metadata/evidence bundle bind repository revision,
dirty digest, engine identity và limitation của evidence round.

## Rules

- Source ID ổn định trong concept và mọi attributed claim trỏ tới source ID đó.
- Path phải relative, normalized và thuộc repository đã authorized.
- Line range là evidence location, không phải durable symbol identity.
- Giá trị dễ thay đổi dùng live-reference contract của phần 08. Snapshot nhỏ là
  tùy chọn nhưng phải bind exact revision/thời điểm và không được viết như
  timeless prose hoặc current truth.
- Không có quyền source vẫn có thể đọc Hub claim/provenance; việc resolve current
  value phải trả degraded result rõ ràng.

## Reuse

Giữ `RepositoryEvidenceBundle`, `repository://` resources, source-integrity
checks và live-claim contract hiện tại. Phần 05 không thêm source parser, graph
database hoặc remote clone.
