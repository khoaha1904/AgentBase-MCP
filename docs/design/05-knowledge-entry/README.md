# 05 — Knowledge entry

> Trạng thái: Proposal/template/Local Hub foundation đã implement; layer UX còn draft.

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
store. Query overlay, shared draft và richer publication presentation còn lại.
