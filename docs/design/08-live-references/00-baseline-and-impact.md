# 08.00 — Baseline and impact

> Trạng thái: Repository snapshot-first runtime đã implement và verify offline.

## Outcome

Hub giữ một số observed values nhỏ cùng file-level provenance để người và MCP
đọc được ngay. Khi user cần current value, Agent dùng normal MCP source reading
trên repository đã authorize; AgentBase không sở hữu symbol/config resolver hoặc
live-value state machine riêng.

## Runtime hiện tại

- `agentbase.observed_values` giữ subject/property/role, useful scalar, repository
  source và exact source state/time. Finalize sinh stable ID và owned Markdown
  table; model/host không tự hash ID hoặc tự ghi source state.
- Repository evidence URI đã giữ canonical Repository ID, normalized relative
  path và optional exact line evidence.
- `read_hub_okf_concept` đọc exact Published Markdown gồm snapshot và
  provenance; không bind hoặc probe repository.
- Refresh reconcile theo item: omission preserves, current Repository chỉ sửa
  contribution của nó, foreign observations phải giữ nguyên và exact reviewed
  correction/removal owns deletion.
- Shared obvious-secret guard chặn authoring/publication/Hub CI. Exact Published
  Markdown read không tạo một field-level transformation layer riêng.
- Normal Code Graph/search/snippet tools đã đọc authorized local source; không
  cần một resolver/cache/parser mới.
- Repository observed-source metadata và phần 09 đã định nghĩa exact age/revision
  warning, không dùng threshold làm truth.
- Phần 06 đã chốt provider observation; phần 07 đã chốt shared Question.

## Clean cutover đã thực hiện

Legacy `agentbase.live_claims` model từng mang semantic target để host resolve
current source. Runtime đã bỏ contract và action đó, không dual-read/dual-write:

- snapshot là primary shared value;
- one file source may support multiple values;
- line range chỉ là optional evidence hint;
- current-value lookup dùng ordinary MCP file/graph reading khi explicitly asked;
- historical-integrity failure có thể đề xuất shared Question; một moved current
  path chỉ degrade lookup và không chạy moved-symbol recovery.

Không có Published concept theo contract cũ nên không cần migration layer.

## Capability còn deferred hoặc chờ audit

1. Remote repository file read qua MCP-managed token chờ implementation audit.
2. Provider profiles ngoài bounded AWS/SQS Domain Enrichment hiện tại.
3. Ordinary answer wording/mark cho snapshot age thuộc Part 10; Hub CI freshness
   projection đã implement warning-only.

## Impact checkpoint

| Boundary | Impact | Lý do |
|---|---|---|
| Observed-value/file-source contract | Contained clean cutover | Xóa semantic locator fields và reuse existing snapshot/source validation. |
| Snapshot query/freshness | Implemented foundation | Read exact Published bytes; CI derives age/revision separately. |
| Explicit local current-source read | Reuse | Existing graph/search/snippet tools; no live resolver. |
| Historical integrity + shared Question | Contained after Part 07 | Dedicated proposal; current-path move only degrades lookup. |
| Remote repository read | Broad change | MCP GitHub token, exact file authorization and degradation. |
| Sensitive-value filtering | Broad safety boundary | Shared guard across authoring/query/publication. |
| Provider observations | Broad but already scoped | Domain Enrichment only, reuse 06.04. |

Tổng thể đây là simplification: xóa một concept/runtime responsibility thay vì
thêm subsystem. Không cần symbol registry, source mirror, watcher, TTL scheduler
hoặc background resolver.

## Dependency boundaries

- Exact local source reading thuộc phần 01.
- Shared Question/conflict semantics thuộc phần 07.
- Freshness và Domain Enrichment orchestration thuộc phần 09.
- Snapshot/current-source response composition thuộc phần 10.
- GitHub/provider credentials thuộc phần 06/11.
