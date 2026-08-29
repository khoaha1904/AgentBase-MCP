# 14.04 — Task Planning benchmark contract

## Input

Một immutable scenario gồm User Story `us:health-endpoint`, tracker root,
source repository `amazon-ecs-fullstack` tại commit
`98ee8e693a5ebc4b14f3dfe731bdc786637c1eb4`, prompt version, model và limits.

## Arms

`task-planning-only` chỉ dùng tracker MCP và workspace rỗng.
`task-planning-plus-agentbase` dùng cùng tracker MCP, một AgentBase MCP với
`index_repository`, `get_architecture`, `search_graph`, `trace_path`,
`get_code_snippet`, `search_code`, `index_status`, `check_index_coverage` và
local source checkout được copy vào disposable workspace.

Agent phải index đúng một absolute root, sau đó dùng bounded graph queries. Raw
shell/file reads, tool ngoài allowlist, path escape, source mutation và quá
giới hạn đều làm arm incomplete.

## Output schema

```json
{
  "summary": "...",
  "tasks": [{
    "id": "T1", "title": "...", "reason": "...",
    "scope": ["relative/path"], "dependencies": ["T1"],
    "acceptance": ["..."], "evidence_refs": ["e1"]
  }],
  "questions": ["..."],
  "known_unknowns": ["..."],
  "evidence_refs": [{"id":"e1","path":"...","start_line":1,"end_line":2,"commit":"..."}]
}
```

All arrays are bounded (16 items), task text is bounded (500 chars), IDs are
unique, dependencies refer to existing task IDs and evidence refs resolve to
the retained Code Graph trace. Direct arm may not claim source evidence.

## Expected tiers

- **Critical**: `/health` backend route boundary; both server target groups'
  Terraform health-check wiring; tasks do not invent files or deployment facts.
- **Important**: preserve `/status` compatibility decision; identify consumers;
  add focused tests/verification; keep blue/green implications explicit.
- **Optional**: documentation or cleanup task only when evidence supports it.

The comparison passes only when assisted is no worse on critical probes and adds
at least one important probe. A real model result is `needs_review` until owner
inspection.

## Evidence hiện tại

Run `2026-08-29T05-02-00Z` trả đủ hai task plans. Assisted xác định exact
backend, Terraform và ECS boundaries tốt hơn direct, nhưng run vẫn `incomplete`:
ban đầu dùng 13 graph calls so với budget 12; sau khi recompute với budget 16,
một reference tới `Infrastructure/Modules/ECS/Service/main.tf` không xuất hiện
trong retained trace. Đây là lỗi traceability của output, không được che giấu.
Budget đã được sửa thành 16 sau khi review. Run `2026-08-29T05-10-00Z` tuân thủ
budget nhưng model quota kết thúc trước final JSON. Cả hai được giữ nguyên; cần
một pair mới để qualification sạch.
