# 07.04 — Conflict presentation

> Trạng thái: Technical design đã chốt; query composition thuộc phần 10 chưa implement.

## Quyết định ngắn

Conflict là một successful knowledge result có uncertainty, không phải ingest/
query failure. MCP trình bày các positions, provenance, Guidance và Question;
không tự tạo `final_value`.

## Human-readable response

Default response cho một conflict cần ngắn và trực tiếp:

```text
⚠ TTL hiện có nhiều nguồn:
- 7 ngày — repository config, observed at commit abc…
- 30 ngày — repository documentation, observed at commit def…
- Maintainer Guidance: 7 ngày — human:khoa, reviewed 2026-08-22
Question: Needs Review — guidance đang mâu thuẫn evidence mới.
```

Người dùng vẫn thấy Guidance rõ ràng nhưng MCP không nói “TTL chắc chắn là 7
ngày”. Với observed value, snapshot/current-source/permission state
được trình bày theo phần 08.

## Structured response semantics

Phần 07 yêu cầu query layer cung cấp bounded groups:

- subject/property hoặc relation/identity candidate;
- distinct positions/observations;
- source role, reference, revision/time và freshness marker;
- applicable active/contested Maintainer Guidance;
- linked Question ID/state;
- limitations và omitted counts.

Exact MCP response schema thuộc phần 10. Conflict không đổi normal query thành
tool error; response vẫn thành công cùng explicit uncertainty marker.

## Khi nào coi là conflict

- structured observations cùng subject/property có normalized values khác nhau;
- canonical relation/identity candidates cạnh tranh nhau với evidence;
- evidence mới contradics active Guidance;
- explicit Question đã ghi nhận semantic conflict không thể normalize an toàn.

MCP không chạy NLP toàn Hub để đoán prose nào mâu thuẫn. Prose conflict chỉ trở
thành governed conflict khi proposal/Question giữ exact evidence và bounded
summary.

## Ordering, không phải ranking truth

Presentation order deterministic để dễ đọc:

1. active/contested Maintainer Guidance, được label rõ là human guidance;
2. observed implementation/config/provider positions; current-source evidence
   chỉ xuất hiện khi user đã explicitly yêu cầu current read;
3. documentation và other source-backed positions;
4. Question/limitations/history links.

Thứ tự này không phải trust score. Recency, source role hoặc human attribution
không âm thầm loại position khác. Duplicate normalized observations có thể group
và liệt kê nhiều provenance sources.

## Context boundaries

- Query chỉ hiện conflicts liên quan trực tiếp answer/traversal hiện tại.
- Không dump mọi Question của Domain/Hub vào một response.
- Bounded omitted count cho biết còn sources/positions chưa hiện.
- Explicit Question query có thể mở full current state và linked evidence.
- Resolved Question vẫn hiện mọi competing position còn current cùng accepted
  resolution. Chỉ positions đã explicit supersede/retract chuyển sang history.

## Hub documents và PR review

- Question Markdown giữ short positions/evidence summary để con người đọc Hub.
- Concept có thể link Question nhưng không copy toàn bộ conflict history.
- PR summary nhóm Questions, conflicts, limitations và Guidance changes trước
  khi reviewer mở raw Markdown diff.
- Open Question được publish bình thường nếu proposal truthful và valid.

## Failure/degraded cases

- Source không còn quyền đọc: giữ Hub position/snapshot và ghi unavailable.
- Reference stale/broken: giữ position cùng marker, không xóa.
- Too many positions: deterministic bound + omitted count, không chọn vài nguồn
  theo model preference.
- Question/cache index hỏng: rebuild từ exact Hub commit; không trả private cache
  như authority.

## Baseline impact

Tái sử dụng Hub query summaries, evidence references, Question/Guidance Markdown
và freshness metadata. Không thêm scorer, confidence engine hoặc persistent
conflict index; query có thể derive bounded presentation từ exact Hub commit.
