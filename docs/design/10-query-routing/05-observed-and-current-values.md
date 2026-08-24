# 10.05 — Observed snapshots and current values

> Trạng thái: Snapshot-in-concept implemented; current-source composition còn ở host flow.

## Outcome

Value query luôn snapshot-default khi Hub có observation phù hợp. Snapshot là
câu trả lời hoàn chỉnh nếu đã đủ user intent. Current source chỉ được đọc thêm
cho explicit current/compare request hoặc khi task thực sự cần exact code; nó
không overwrite Hub, không trở thành accepted knowledge và không cần một live
resolver.

## User intents

| Intent | Query behavior |
|---|---|
| Known/observed value | Trả relevant snapshots + age/provenance; không probe source. |
| Current value | Trả snapshot trước, sau đó thử authorized current-source read. |
| Compare/history | Trả Published snapshots; Local Draft comparison belongs to proposal review. |
| Why values differ | Trả conflict positions, sources, Question và Guidance; không chọn winner. |

Agent không hỏi user chọn “snapshot mode” hay “source mode”.

## Snapshot-default pipeline

```text
find exact Hub concept/view
        ↓
read_hub_okf_concept
        ↓
present snapshot value + layer + source + observed time/age
        ↓ only if current/code is explicitly or operationally required
authorize exact repository binding
        ↓
normal graph/search/snippet or bounded file read
        ↓
present current result separately; never write back
```

Nếu concept có nhiều sources/roles cho cùng property, pipeline giữ tất cả
relevant snapshots. Nó không chọn entry mới nhất hoặc configuration role làm
truth trước khi source read.

## Source-read budget

Không cần quota manager hay counter. Budget là một stopping rule đơn giản:

- snapshot đủ trả lời thì dừng;
- đọc source khi user yêu cầu current/exact code, task implementation cần nó,
  hoặc thiếu source sẽ khiến câu trả lời không thể hoàn thành an toàn;
- không đọc source chỉ vì snapshot đã cũ, source có sẵn, đang có conflict hay có
  thể thu thập thêm dữ liệu.

Nhờ vậy query thông thường không tạo thêm transient position/conflict. Conflict
đã tồn tại trong Hub vẫn được trả đầy đủ.

## Comparison outcomes

| Snapshot | Current-source result | Response |
|---|---|---|
| Present | Not requested | Observed snapshot only, `source_access: not-checked`. |
| Present | Same exact typed scalar | Show snapshot and separately say authorized current source also reports the same value. |
| Present | Different scalar | Show both as conflict; include both provenances and applicable Question/Guidance. |
| Present | Ambiguous/missing | Return snapshot + age and exact degradation reason; do not guess current. |
| Present | Unauthorized/unavailable | Return snapshot + age; current verification unavailable. |
| Missing | Resolved current source | Return current-source evidence only, clearly not Hub knowledge; do not create a snapshot. |
| Missing | No current evidence | Return unknown/missing evidence, not a placeholder value. |

Equality is exact typed scalar equality. `7`, `"7"` and `"7 days"` are not
automatically equal; unit conversion or semantic coercion would be a new
explicit capability.

## Current-source resolution

- Start from exact observed Repository identity, file reference and property.
- Optional line span is an evidence hint at observed revision, not a durable
  current locator.
- Use existing graph/search/snippet or bounded direct file read inside the
  authorized root. One file may support many properties.
- Clear exact evidence may produce `resolved`; multiple plausible matches are
  `ambiguous`.
- Missing current path is `path-missing`; do not broad-search for a moved symbol
  or silently repair the reference.
- If exact current source revision/dirty state is available, include it. If the
  tool does not report it, do not invent a commit or imply clean source.

The Agent may quote a short safe current scalar/result, but raw graph rows,
whole config files and provider responses remain private working context.

## Age and freshness presentation

- Compute exact age from stored `observed.at`; show human-readable age plus exact
  timestamp when detail matters.
- Age is context only, never a trust score or automatic stale state.
- No global 7/14/30-day threshold, automatic Refresh or scheduled source probe.
- A newer source revision known from the explicit current operation may be
  reported as `source-advanced`; ordinary snapshot query remains `not-checked`.

Current-path failure does not invalidate historical provenance. Historical
integrity failure is a separate governed issue and may become a reviewed
Question; query itself changes nothing.

## Published and Local Draft values

Ordinary query returns only Published snapshots. Local Draft values remain
visible through proposal inspection and PR review, never as ordinary Hub query
results before publication and synchronization.

Current source is a third transient position, not a publication layer. It never
receives a proposal ID or appears as Published/Local Draft until a later reviewed
Refresh/Enrichment proposal accepts it.

## Safety and bounds

- Apply the shared obvious-sensitive guard to current-source output.
- Published concept read is exact; authoring/publication/CI block unsafe bytes.
- Do not read known secret-bearing paths for value resolution.
- Respect existing concept/value/query bounds and return omitted counts.
- Query performs no write-back, Question transition, Refresh, Enrichment or
  publication.

## Minimal implementation impact

Exact concept read already exposes the snapshot. Current-source composition
belongs in a query skill over existing source tools; no parser, resolver, target
registry, cache, dependency or new persistence is needed.
