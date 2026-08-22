# 08.02 — Observed snapshots

> Trạng thái: Repository observed snapshots đã implement.

## Outcome

Concept giữ vài values nhỏ có ích để người đọc Hub hiểu ngay, nhưng không biến
Hub thành bản sao config/source. `agentbase.observed_values` là authority duy
nhất; phần Markdown chỉ là view được renderer tạo từ cùng dữ liệu.

## Authoring boundary

Một value chỉ được snapshot khi đồng thời:

- non-sensitive và qua shared sensitive-value guard;
- scalar/single-line, nằm trong bounds của phần 08.01;
- có query hoặc review value rõ ràng;
- attributable tới một admitted Repository/provider source và exact
  source-kind-specific observation state;
- giúp hiểu operation, integration hoặc behavior quan trọng của concept.

Không snapshot để đủ coverage, không copy toàn bộ config/provider response và
không tạo placeholder khi value thiếu. Direct source evidence có thể được ghi
trong Ingest/Refresh; provider-derived values chỉ vào proposal của Domain
Enrichment đã confirm.

## Human-readable view

Nếu concept có observed values, renderer tạo một section ngắn:

```markdown
<!-- agentbase:observed-values:start -->
## Observed values

| Property | Observed value | Role | Source | Observed at |
|---|---:|---|---|---|
| `session_ttl_days` | `7` | configuration | `config/queue.ts` | `abc123`, 2026-08-22 |
<!-- agentbase:observed-values:end -->
```

Table không phải authority thứ hai: renderer derive nó từ structured entries,
validator reject manual drift và Refresh regenerate only this owned section.
Value vẫn phải label `Observed`; table không dùng từ `current`. Source có thể là
một shared file reference cho nhiều rows. Renderer displays normalized property
and literal scalar; it does not invent labels, units or formatting.

The two comments delimit one renderer-owned section. When structured entries
exist, normalization replaces exactly one prior owned section or appends one;
when none exist it removes that section. An unmarked manual `## Observed values`
heading is rejected to avoid two competing views. Rows sort by ID. Cells use
literal normalized property/role, JSON scalar text, repository path without the
URI prefix and full RFC3339 time; backslash and pipe are escaped for a Markdown
table. Renderer never shortens commit/time in persisted bytes—the abbreviated
example above is presentation-only.

## Refresh behavior

- Exact matched stream giữ ID và được update value/source state/time qua reviewed
  Refresh proposal.
- Missing evidence preserves prior snapshot and may add a limitation; absence
  không tự xóa hoặc đổi status.
- Different sources for one subject/property remain separate entries and follow
  Part 07 conflict presentation.
- File move is an explicit source repair that keeps the stream ID.
- No query or source read writes back to Hub; only an accepted proposal does.

## Acceptance boundary

- Maximum 64 entries per concept and existing concept/bundle size limits remain.
- Snapshot section is omitted when no useful values exist.
- Secret-like input is rejected before rendering and publication review remains
  the final safety gate.
- Snapshot age affects presentation only; it never turns value into truth,
  deletes it or schedules Refresh.
