# 01 — Repository reading

> Trạng thái: Core local reading và lazy multi-repository workspace routing đã
> implement. Capability 046 thêm approved remote-default snapshot riêng cho Hub
> Init; arbitrary remote clone/query vẫn ngoài scope và implementation còn pending.

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
Published Hub, owned Codebase Memory, exact source reads và evidence
validation. Graph vẫn private/rebuildable và chỉ dùng cho repo local/workspace.
Batch Ingest xử lý danh sách repository explicit tuần tự ở phần 09. Public Scan
inventory bounded Git roots; query skill chọn một root rõ ràng hoặc hỏi lại và
gateway thay repository session tuần tự. Không có combined graph hoặc workspace
registry.

Capability 046 giữ gateway/provider này nhưng thêm machine-derived Discovery
Seed, compact signal groups và bounded source census. Hub Init có thể materialize
exact remote default commit trong detached worktree/cache; nó không đổi authority
của ordinary query hoặc tự clone repository ngoài workflow đã chọn.
