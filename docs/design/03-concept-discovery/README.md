# 03 — Concept discovery

> Trạng thái: Candidate/guidance foundation đã implement; review UI chưa có.

High-level decision:
[MCP nhận diện concept thế nào?](../../present/03-how-concepts-are-identified.md)

## Phân rã

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — current signal/
  schema baseline, gap và impact.
- [`01-candidate-discovery.md`](01-candidate-discovery.md) — tín hiệu tạo
  candidate từ graph và source.
- [`02-concept-qualification.md`](02-concept-qualification.md) — identity và
  query value để thành concept.
- [`03-evidence-and-provenance.md`](03-evidence-and-provenance.md) — bằng
  chứng, nguồn và giới hạn claim.
- [`04-existing-concept-matching.md`](04-existing-concept-matching.md) — đối
  chiếu Published Hub và Local Draft.
- [`05-candidate-review.md`](05-candidate-review.md) — promote, giữ Question
  hoặc bỏ candidate.

## Implementation delta hiện tại

Initial Ingest guidance hiện yêu cầu identity basis, query/link value,
standalone/embedded disposition và exact owned observations. Không có numeric
confidence engine hay candidate database. Promote/drop UI và cross-repository
matching sâu vẫn deferred.
