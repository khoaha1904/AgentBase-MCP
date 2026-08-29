# 14.04 — Task Planning benchmark contract

## Input

One immutable scenario contains User Story `us:health-endpoint`, tracker root,
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

## Current evidence

Run `2026-08-29T05-02-00Z` returned both task plans. Assisted identified exact
backend, Terraform and ECS boundaries better than direct, but remained
`incomplete`: it initially used 13 graph calls against budget 12; after
recomputing with budget 16, a reference to
`Infrastructure/Modules/ECS/Service/main.tf` was absent from the retained trace.
This output traceability failure is not hidden. The budget was changed to 16
after review. Run `2026-08-29T05-10-00Z` respected the budget but model quota
ended before final JSON. Both are retained; a new pair is needed for clean
qualification.
