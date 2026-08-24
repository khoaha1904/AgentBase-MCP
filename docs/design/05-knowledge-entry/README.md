# 05 — Knowledge entry

> Trạng thái: Proposal/template và Published query boundary đã implement;
> remote-required OKF authority cùng exact profile isolation chờ implementation
> audit sau review 12 phần.

High-level decision:
[Kiến thức từ repository vào Hub thế nào?](../../present/05-how-repository-knowledge-enters-the-hub.md)

## Phân rã dự kiến

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — baseline, gap và
  quyết định giữ proposal/change set làm publication unit.
- [`01-knowledge-item-model.md`](01-knowledge-item-model.md) — identity của
  concept, claim, relation, Question, evidence và proposal.
- [`02-overview-boundary.md`](02-overview-boundary.md) — knowledge nào vào Hub,
  chi tiết nào ở source.
- [`03-local-draft-storage.md`](03-local-draft-storage.md) — mapping Local Draft,
  In Review và Published lên Git hiện tại.
- [`04-source-references.md`](04-source-references.md) — reference từ knowledge
  item về source.
- [`05-layer-reconciliation.md`](05-layer-reconciliation.md) — synchronize,
  nhận diện proposal đã Published và giữ pending work.
- [`06-runtime-requirements.md`](06-runtime-requirements.md) — current OKF,
  schema, live-claim và Initial Ingest `AB-*` requirements.

## Implementation delta

Git-backed proposal, exact Markdown skeleton/template, Local Draft commit,
inspection và publication receipt đã có; không thêm database hoặc raw graph
store. Ordinary query is Published-only. Product contract mới yêu cầu không có
remote config thì chỉ Code Graph hoạt động, và mỗi remote URL + branch giữ
Published/Draft state riêng; implementation status sẽ được audit sau Part 12.
