# 06 — Quan hệ giữa nhiều repository và nhiều Domain

> Trạng thái: High-level đã chốt; automated cross-repository enrichment chưa implement.

## Câu trả lời ngắn

Relation có thể nối concept trong cùng repository, khác repository hoặc khác
Domain. Hub chỉ gom hai đầu mối thành một concept khi có identity đủ mạnh; nếu
chưa chắc, Agent giữ riêng và tạo Question.

```text
Crawler Worker ──publishes-to──→ Vehicle Data Queue ←──consumes── Recommender
```

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

Nếu được xác nhận là cùng resource, Hub giữ một concept chuẩn cùng aliases,
external identities, evidence, relation và lịch sử từ cả hai phía. Việc xác
nhận chỉ tạo Local Draft, không tự thay đổi Published Hub.

Một lần Domain Enrichment có thể xử lý nhiều repository, Questions và relation
candidate của cùng Domain. Kết quả được gom thành một publication change để
review; verification thành công không tự sửa Published knowledge.

Cùng một logical resource ở nhiều region mặc định vẫn là một concept với nhiều
deployment reference. Chỉ tách khi từng deployment có vai trò, lifecycle hoặc
giá trị query độc lập.

## Identity khi merge

Concept ID ổn định và tách khỏi display name. Published + Local Draft giữ ID đã
Published; hai Local Draft cần người dùng xác nhận concept chuẩn. Hai concept
đều Published không bao giờ tự merge và cần explicit review; quy tắc canonical
ID/redirect được chuyển sang low-level.

## Còn để low-level quyết định

- Cấu trúc external identity cho từng provider và IaC resource chưa deploy.
- Cách chọn region, lệnh verification và mapping provider cụ thể.
- Canonical ID, redirect và history khi hợp nhất hai concept đã Published.
