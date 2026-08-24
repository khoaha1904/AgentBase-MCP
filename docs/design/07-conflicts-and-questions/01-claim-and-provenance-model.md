# 07.01 — Claim and provenance model

> Trạng thái: Observed-value Question integration đã implement; broader claim enrichment deferred.

## Quyết định ngắn

AgentBase không tạo universal claim database hoặc ID cho mọi câu văn. Knowledge
giữ identity tự nhiên; chỉ assertion cần reference, conflict hoặc lifecycle độc
lập mới có structured identity.

## Knowledge identities

| Knowledge | Identity/provenance |
|---|---|
| Concept overview | Concept path + inline/source citations. |
| Observed implementation/config value | Stable `AB-OBS-*` + exact file source/revision. |
| Canonical relation | Source concept + predicate + target + evidence IDs. |
| External resource identity | Provider-native match key + evidence IDs. |
| Relation/identity candidate | Stable candidate key inside a Question. |
| Maintainer answer | Human identity + Guidance document + Question revision. |
| Question | Stable Question ID + shared Question document. |

Prose không nhận ID chỉ để engine quản lý nó. Khi một prose assertion trở thành
conflict cần review, Question giữ bounded summary và exact evidence/reference;
không copy toàn bộ source hoặc biến mọi paragraph thành record.

## Nhiều nguồn và conflict

- Cùng một observation từ nhiều nguồn giữ đủ provenance; query có thể group khi
  normalized values giống nhau nhưng không làm mất source.
- Hai observations mâu thuẫn cùng tồn tại. Không overwrite, average hoặc chọn
  theo recency/model confidence/Published status.
- User answer là một attributed position, không xóa repository/provider evidence.
- Missing/ambiguous evidence tạo Question hoặc limitation, không tạo placeholder
  claim.
- Evidence không còn xuất hiện trong Refresh không tự xóa accepted claim.

Source authority và freshness được trình bày để người đọc đánh giá, không biến
thành numeric truth score. Exact evidence có thể đủ để propose correction hoặc
removal, nhưng vẫn cần explicit intent và review.

## Structured claims boundary

Giữ `agentbase.observed_values` cho bounded snapshots có query value. Current
source nếu cần được đọc lại bằng normal MCP file/graph tools; không có semantic
live locator. Không mở rộng snapshots thành nơi lưu mọi business fact, config
dump hoặc provider response.

Relation và external identity dùng natural identities của phần 06. Question có
thể tham chiếu claim IDs, relation/identity candidate keys hoặc exact evidence
resources; vì vậy candidate chưa có canonical claim vẫn có thể được quản trị.

Một typed Question reference luôn namespace đủ để resolve xuyên repositories:

```text
owning concept identity
+ item kind/natural key
+ exact source ID hoặc source resource
+ observed source/provider revision khi có
```

Source ID đứng riêng không phải global identity và không đủ làm shared Question
reference. Không cần global evidence registry; resolver đọc reference tại exact
Hub commit.

## Question versus limitation

- Tạo Question khi có một action/answer cụ thể và resolution sẽ thay đổi useful
  knowledge, relation, identity hoặc Guidance.
- Chỉ ghi limitation khi thiếu detail nhỏ, không ảnh hưởng useful answer hoặc
  chưa có bounded action để xử lý.
- Broken source-file reference tạo Question vì repair/replacement là một action cụ thể;
  stale age warning đứng riêng chưa tự tạo Question.

## Query contract

Query trả:

- current knowledge và provenance;
- competing observations khi liên quan;
- applicable Maintainer Guidance với attribution;
- Open/Needs Review Question và limitations;
- source age/revision khi có.

Query không phát minh một `final_value`. Nếu cần tóm tắt, nó nói rõ các positions
và nguồn nào hỗ trợ từng position.

## Reuse và impact

Tái sử dụng concept sources, observed-value identities, relation evidence,
provider observations và Git history. Thay đổi runtime chủ yếu là cho Question
tham chiếu typed evidence/candidates thay vì bắt buộc claim IDs từ một
repository.
Không thêm database hoặc global confidence engine.
