# 06 — Quan hệ giữa nhiều repository và nhiều Domain

> Trạng thái: High-level đã chốt; exact AWS/SQS Domain Enrichment đã implement offline.

## Câu trả lời ngắn

Relation có thể nối concept trong cùng repository, khác repository hoặc khác
Domain. Hub chỉ gom hai đầu mối thành một concept khi có identity đủ mạnh; nếu
chưa chắc, Agent giữ riêng và tạo Question.

```text
Crawler Worker ──publishes-to──→ Vehicle Data Queue ←──consumes── Recommender
```

Một queue/topic cụ thể chỉ trở thành `Resource` node khi có identity ổn định,
giá trị query/link độc lập và evidence về boundary hoặc usage. Nếu chỉ thấy
Terraform declaration hoặc tên biến, nó vẫn là embedded knowledge/candidate;
không tạo node hay edge để làm graph đầy hơn. Transport Resource và message
contract `Interface` là hai lớp khác nhau.

## Agent ghi nhận quan hệ thế nào?

- Một repository có thể khai báo phía quan hệ mà nó chứng minh được, không cần
  chờ repository bên kia được Ingest.
- Agent không tự suy ra consumer, producer hoặc đầu relation chưa thấy.
- Nếu hai nguồn mô tả khác nhau, Hub giữ cả hai claim với provenance và tạo
  Question; không chọn một phía làm sự thật.
- Ingest ưu tiên relation trong repository đang đọc. Relation xuyên repository
  chỉ được ghi ngay khi source hiện tại có evidence trực tiếp về đầu bên kia;
  Ingest không dừng để điều tra toàn Domain.
- Sau khi nhiều repository của một Domain đã Published, Domain Enrichment có thể
  đối chiếu chúng theo batch, xác minh provider và bổ sung relation còn thiếu.

Refresh và reconciliation thuộc lifecycle ở
[phần 09](09-ingest-and-refresh.md); conflict thuộc
[phần 07](07-conflicts-questions-and-maintainer-guidance.md).

## Khi nào hai đầu mối là cùng một resource?

Identity mạnh như ARN hoặc provider resource ID cho phép Agent đề xuất
reconcile. Chỉ giống display name, tên biến hoặc resource name thì chưa đủ.

Khi chưa có identity mạnh, config reference, contract, infrastructure
input/output và endpoint chỉ tạo match candidate. Trong Domain Enrichment,
người dùng có thể cấp một CLI session đã login để Provider Verification kiểm
tra read-only; MCP không login, lưu credential hoặc scan toàn bộ account/region.

Nếu một Published concept đã là canonical và candidate mới chỉ bổ sung evidence,
Domain Enrichment có thể enrich concept đó qua proposal. Duplicate trong cùng
proposal có thể được gom trước Accept.

Nếu hai concept đều đã Published, MVP giữ cả hai và tạo Question/merge
candidate. Nó không tự merge, xóa hoặc tạo redirect; migration đó để sau MVP.

Một lần Domain Enrichment có thể xử lý nhiều repository, Questions và relation
candidate của cùng Domain. Kết quả được gom thành một publication change để
review; verification thành công không tự sửa Published knowledge.

Cùng một logical resource ở nhiều region mặc định vẫn là một concept với nhiều
deployment reference. Chỉ tách khi từng deployment có vai trò, lifecycle hoặc
giá trị query độc lập.

## Identity và giới hạn MVP

Concept ID ổn định và tách khỏi display name. External identity dùng envelope
provider-neutral; AWS/SQS là verification profile đầu tiên. Account và region
được xác nhận explicit khi identity cần scope đó, không thử nhiều region.

Merge/redirect hai Published concepts là post-MVP. Question giữ evidence để một
migration được thiết kế và review sau mà không mất dấu duplicate.
