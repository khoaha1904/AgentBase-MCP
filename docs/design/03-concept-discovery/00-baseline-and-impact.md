# 03 — Baseline and impact checkpoint

> Trạng thái: Đã chốt hai qualification gates và không numeric scoring.

## Baseline đã implement

- Authoring skill đã yêu cầu concept có stable identity và independent query,
  contract, lifecycle, ownership hoặc graph value.
- Initial Ingest truyền evidence-bearing candidates/observations; free-form
  signals chỉ còn là legacy/fine-grained aid ngoài preparation path mới.
- Hub prepare chỉ cho concept mới dùng selected schema và yêu cầu repository
  source reference.
- Schema/concept/relationship validators chạy sau khi Agent đã viết Markdown.
- Published Hub local và current proposal được dùng để tìm concept hiện có;
  unrelated Local Draft không thuộc ordinary discovery query.

Nguồn baseline:

- [Concept authoring rules](../../../.agents/skills/agentbase-okf/references/concepts.md)
- [Schema selector](../../../src/core/knowledge/schemas/catalog.ts)
- [Hub proposal preparation](../../../src/app/hub-okf/authoring/prepare.ts)

## Gap còn lại

Runtime đã có candidate contract và ownership validation. Không có persistent
candidate registry hoặc review UI theo chủ ý; Agent vẫn là reasoning layer
trong bounded skill workflow.

## Kết quả implementation

Lightweight evidence-bearing boundary đã được thêm qua skill, MCP input và
validation mà không tạo model runtime hay scoring subsystem.

Xây deterministic discovery/scoring engine để tự hiểu mọi language/provider sẽ
là **Broad change/Near rewrite** và không cần thiết: Agent đã là reasoning layer,
MCP nên giữ bounded tools và deterministic guards.
