# 03 — Concept discovery

> Trạng thái: Candidate/guidance foundation và Capability 046 Discovery
> Seed/Inventory coverage đã implement.

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
confidence engine, candidate database hoặc unrelated-Draft search. Outcomes
được review trong proposal hiện tại; cross-repository matching sâu thuộc Domain
Enrichment.

Runtime kiểm tra coverage trước schema selection: important discovery group
phải map sang concept, embedded, Question hoặc ignored reason. Đây là private
session/receipt contract, không phải candidate registry, UI hay public tool mới.
