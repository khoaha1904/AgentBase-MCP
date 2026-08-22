# 05.04 — Source references

> Trạng thái: Technical design draft.

## Canonical reference

Repository evidence tiếp tục dùng:

```text
repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>
```

Observed values may share the file-level form without a line fragment. A line
span remains optional review evidence at the observed revision, not a durable
locator.

Reference không chứa absolute checkout root, cache path, credential hoặc raw
provider response. Proposal metadata/evidence bundle bind repository revision,
dirty digest, engine identity và limitation của evidence round.

Provider-derived snapshots use the separately validated bounded
`provider-observation://` source from Part 08.06; they never masquerade as a
Repository source or retain a raw provider response.

## Rules

- Source ID ổn định trong concept và mọi attributed claim trỏ tới source ID đó.
- Path phải relative, normalized và thuộc repository đã authorized.
- Line range là evidence location, không phải durable symbol identity.
- Giá trị dễ thay đổi có query value dùng observed-value contract của phần 08.
  Snapshot nhỏ bind exact revision/thời điểm và không được viết như timeless
  prose hoặc current truth.
- Không có quyền source vẫn có thể đọc Hub claim/provenance; việc resolve current
  value phải trả degraded result rõ ràng.

## Reuse

Giữ `RepositoryEvidenceBundle`, `repository://` resources, source-integrity
checks và observed-value contract. Phần 05 không thêm source parser, graph
database hoặc remote clone.
