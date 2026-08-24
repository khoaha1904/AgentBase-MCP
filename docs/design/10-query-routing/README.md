# 10 — Query routing

> Trạng thái: Published-only Hub query và current-source composition được điều
> phối bởi public skill `agentbase-query`; MCP vẫn deterministic. Remote file
> reader là first post-phase query capability, ngoài MVP hiện tại.

High-level decision:
[Query từ Code Graph và Hub](../../present/10-querying-code-graph-and-hub.md)

## Phân rã dự kiến

- [`00-baseline-and-impact.md`](00-baseline-and-impact.md) — current query surfaces,
  reusable boundaries, gaps và impact checkpoint.
- [`01-source-selection.md`](01-source-selection.md) — chọn Hub, source/Code Graph
  hoặc kết hợp mà không thêm reasoning router vào MCP.
- [`02-published-and-draft-overlay.md`](02-published-and-draft-overlay.md) —
  superseded overlay và exact Published-only query boundary.
- [`03-source-access-and-degradation.md`](03-source-access-and-degradation.md) —
  explicit source authority, failure states và snapshot fallback.
- [`04-conflict-aware-responses.md`](04-conflict-aware-responses.md) — bounded
  positions, provenance, Question và Guidance mà không chọn truth winner.
- [`05-observed-and-current-values.md`](05-observed-and-current-values.md) —
  snapshot-default stopping rule và current-source comparison outcomes.
