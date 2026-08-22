# 10.04 — Conflict-aware responses

> Trạng thái: Technical design đã chốt theo Part 07; shared Question query chưa implement.

## Outcome

Conflict là một successful knowledge result có uncertainty. Query trả các
positions, provenance, applicable Maintainer Guidance và Question; không tạo
`final_value`, trust score hoặc tự chọn nguồn thắng.

## What becomes a conflict group

Query group theo exact governed subject + property hoặc natural
relation/identity candidate key. Nó tạo conflict group khi:

- observed values có cùng subject/property nhưng khác exact typed scalar;
- governed relation/resource identity candidates cạnh tranh nhau;
- evidence mới mâu thuẫn active Maintainer Guidance;
- shared Question đã ghi nhận một bounded semantic conflict.

`7`, `"7"` và `"7 days"` không tự normalize thành một value. MCP không chạy NLP
toàn Hub, convert unit hoặc suy prose conflict. Prose chỉ tham gia khi Question
đã giữ bounded summary + exact evidence.

## Position model

Mỗi position giữ:

- subject/property hoặc candidate identity;
- exact value/relation/identity statement;
- knowledge kind và source role;
- source reference, source/Hub revision, observed time/age khi có;
- Published/Local Draft layer và proposal attribution;
- active, superseded hoặc retracted lifecycle state khi applicable.

Positions có exact typed value/statement giống nhau có thể group để giảm lặp,
nhưng mọi source/provenance vẫn còn. Positions khác nhau không overwrite,
average hoặc collapse theo recency, source role, human attribution hay
publication state.

## Guidance and Questions

- Active Maintainer Guidance được hiển thị như attributed human direction, kèm
  exact scope và Question revision; nó không phải absolute truth.
- `Needs Review` Guidance được label `contested` và giữ evidence mới cạnh nó.
- `Open`/`Needs Review` Question hiện rõ action còn thiếu.
- `Resolved` Question vẫn có thể đi cùng competing current positions; resolved
  chỉ nghĩa hiện không chờ maintainer action tại revision đó.
- Conflict chưa có Question được label `untracked conflict`; query không tự tạo
  Question/proposal.
- Question có missing evidence nhưng chưa có answer vẫn là useful knowledge;
  query không tạo placeholder position.

Specific Guidance có thể trình bày trước broad Repository/Domain/Hub Guidance
để giải thích context, nhưng specificity chỉ là display order. Hai Guidance
mâu thuẫn vẫn giữ conflict.

## Snapshot-default and current source

Với volatile value:

1. đưa mọi relevant Hub snapshots vào positions trước;
2. chỉ nếu user explicitly hỏi current hoặc task thật sự cần exact code, thêm
   current-source result như một position riêng với current source state/access;
3. nếu current source khác snapshot/Guidance, giữ tất cả và mark conflict;
4. source unavailable giữ snapshot + reason, không loại position cũ.

Current read không mutate observation, Question hoặc Guidance. Một Refresh hay
resolution sau đó vẫn phải tạo Local Draft và qua review.

Age, conflict, Question hoặc source availability không tự kích hoạt current
read. Query cũng không đọc source chỉ để chọn một position thắng.

## Human-readable default

Response ngắn trước, detail/provenance sau:

```text
⚠ TTL hiện có nhiều nguồn:
- 7 ngày — configuration snapshot, repo commit abc…, observed 5 days ago
- 30 ngày — documentation snapshot, repo commit def…, observed 12 days ago
- Maintainer Guidance: 7 ngày — human:khoa, subject/property scope
Question: Needs Review — evidence mới đang mâu thuẫn Guidance
```

Agent có thể nói “Guidance hiện hướng dẫn dùng 7 ngày”, nhưng không được nói
“TTL chắc chắn là 7 ngày”.

## Structured composition

Existing query primitives remain separate. Host composition uses a bounded
semantic envelope rather than a new universal answer tool:

```text
status: ok
uncertainty: none | conflict | missing-evidence
subject / property
positions[]
guidance[]
questions[]
limitations[]
omitted_count
```

Every position/guidance/question retains its own layer and provenance. Combined
Published/Local Draft results may visually group identical positions but never
erase layer attribution. Bounded truncation follows the underlying query limits
and reports `omitted_count`; the model does not choose which conflicting source
to hide by preference.

## Current versus historical view

- Default query uses active positions plus relevant Question/Guidance.
- Superseded/retracted positions are excluded from normal current answer.
- Historical/conflict query includes retired positions with reason, evidence
  and replacement.
- A draft tombstone/removal from Part 10.02 remains visible next to Published
  state until publication; it is not silently treated as already retired.

## Failure boundaries

- Invalid reference in one position does not promote another position to truth;
  mark the invalid/broken provenance and preserve safe siblings.
- Shared Question index/cache failure must rebuild from exact Hub documents;
  private ledger/cache never becomes authority.
- Source permission failure returns Hub positions plus degradation reason.
- Unsafe value is redacted per position without hiding the whole conflict.
- Query never changes lifecycle state, answers a Question or publishes Guidance.

## Minimal implementation impact

Host response rules can first live in a query skill using current primitives.
Structured shared conflict composition waits for Part 07 Question documents.
No scorer, confidence engine, conflict database, universal query tool or new
dependency is justified.
