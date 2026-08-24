# 01 — Repository reading

> Trạng thái: Core local reading flow đã implement. Lazy multi-repository
> workspace routing đã được duyệt ở design và chờ implementation audit sau khi
> hoàn tất review 12 phần; remote clone vẫn ngoài scope.

High-level decision:
[MCP đọc một dự án như thế nào?](../../present/01-how-mcp-reads-a-repository.md)

## Phân rã

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — graph, evidence và
  skill baseline; xác định phần tái sử dụng và gap.
- [`01-skill-orchestration.md`](01-skill-orchestration.md) — Ingest/Refresh
  skill điều phối Agent và MCP.
- [`02-code-graph-lifecycle.md`](02-code-graph-lifecycle.md) — tạo, dùng, làm
  mới và loại bỏ Code Graph.
- [`03-source-evidence-resolution.md`](03-source-evidence-resolution.md) — từ
  graph quay lại source để lấy evidence.
- [`04-reading-boundaries-and-failures.md`](04-reading-boundaries-and-failures.md)
  — local/workspace boundary, giới hạn đọc và failure outcome.
- [`05-runtime-requirements.md`](05-runtime-requirements.md) — current graph,
  refresh và MCP `AB-*` requirements.

## Implementation delta hiện tại

`agentbase-query`, `use-codebase-memory`, Initial Ingest và Refresh đã nối
Published Hub, managed Codebase Memory, exact source reads và evidence
validation. Graph vẫn private/rebuildable và chỉ dùng cho repo local/workspace.
Batch Ingest đã xử lý danh sách repository explicit tuần tự ở phần 09. Phần còn
chờ audit là cách host chọn đúng repository khi người dùng đứng ở thư mục cha
chứa nhiều repo; design không yêu cầu combined graph hoặc workspace registry.
