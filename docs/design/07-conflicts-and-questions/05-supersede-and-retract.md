# 07.05 — Supersede and retract

> Trạng thái: Owner đã chốt item-level lifecycle; current runtime chủ yếu mới hỗ trợ concept-level intent.

## Quyết định ngắn

Lifecycle áp dụng cho exact knowledge item bị thay thế hoặc sai. Không
supersede/retract cả concept khi phần còn lại vẫn có giá trị.

| State | Ý nghĩa |
|---|---|
| `superseded` | Item từng hợp lệ nhưng đã có replacement mới. |
| `retracted` | Item được xác nhận là sai hoặc invalid trong context đã khẳng định. |

Conflict hoặc age đứng riêng chưa đủ đổi lifecycle state.

## Granularity

- Structured claim: lifecycle theo stable claim ID.
- Canonical relation: lifecycle theo source + predicate + target identity.
- External identity: lifecycle theo provider-native match key.
- Question/Guidance: dùng lifecycle riêng của phần 07.02/07.03.
- Concept: chỉ đổi toàn file khi logical entity bị thay thế hoặc concept itself
  được xác nhận sai.
- Unstructured prose không có item ID: cập nhật đoạn trong owning concept với
  evidence/review; không tạo paragraph ID hồi tố.

## Item lifecycle record

Khi claim/relation/external identity không còn current, owning concept giữ một
bounded `agentbase.lifecycle[]` record gồm:

- item kind và natural item key;
- `superseded` hoặc `retracted`;
- explicit reason;
- evidence IDs và observed revision/time;
- replacement identity khi superseded;
- proposal/human authority khi applicable.

Current item được bỏ khỏi active claim/relation/identity collection để query và
graph không dùng nó. Lifecycle record là compact tombstone trong owning concept,
không tạo một Markdown file riêng cho mỗi retired edge/value. Git giữ full bytes
và revision history.

`superseded` bắt buộc replacement resolve được trong proposal/Hub. `retracted`
không bắt buộc replacement nhưng cần evidence/authority rõ.

## Concept-level lifecycle

- Superseded concept file vẫn tồn tại, link replacement và không hiện như current
  default result.
- Duplicate-concept merge dùng retained redirect của phần 06.05.
- Retracted concept file vẫn tồn tại để inbound links/history không gãy, nhưng
  query/graph loại nó khỏi current traversal.
- Xóa file không thay thế lifecycle review. Physical cleanup nếu có là migration
  riêng, không thuộc normal Refresh/Enrichment.

## Authority và evidence

Lifecycle proposal cần:

- exact item identity;
- reason và current source/provider/human evidence;
- ownership/attribution cho contribution đang đổi;
- affected relations, Questions và replacement;
- explicit destructive intent trong preview.

Missing evidence, stale source, foreign-only contribution hoặc một competing
claim đơn lẻ giữ conflict/Question. MCP không tự retract theo recency, absence,
confidence hoặc vì provider call không có quyền.

## Query behavior

- Default query/traversal chỉ dùng active items.
- Historical/conflict query có thể hiện superseded/retracted items cùng reason,
  evidence và replacement.
- Question `Needs Review` có thể link retired/current items để giải thích quyết
  định còn tranh luận.
- Restore một retracted item cần proposal/evidence mới; không xóa lifecycle
  record âm thầm. Git và proposal history vẫn cho thấy cả hai revisions.

## Review và recovery

PR groups item changes dưới `Superseded` hoặc `Retracted`, không giấu chúng như
generic Markdown deletion. Reviewer thấy reason, evidence, replacement và
affected relations.

Proposal là atomic: active item removal, lifecycle record, replacement/link và
Question changes cùng pass validation. Failure giữ Published state cũ; không có
partial tombstone.

## Baseline impact

Current Refresh intents đã có concept-level remove/supersede/retract và explicit
evidence. Implementation cần mở rộng natural item targeting, query filtering và
validation. Không cần lifecycle database, tombstone directory hoặc per-item PR.
