# 07 — Dữ liệu xung đột, Questions và Maintainer Guidance

> Trạng thái: Governance foundation và AWS/SQS batch Question resolution đã implement.

## Câu trả lời ngắn

Hub cho phép nhiều claim mâu thuẫn cùng tồn tại nếu mỗi claim giữ đúng nguồn.
Question ghi điều chưa rõ; câu trả lời của người dùng là evidence có phạm vi,
không phải sự thật tuyệt đối.

Question cũng là shared Hub knowledge. Trước Accept nó nằm trong proposal; sau
Accept nó vẫn là Local Draft chỉ dành cho review. Chỉ sau khi PR merge và máy
khác synchronize Published Hub thì Question mới xuất hiện trong ordinary query.
Private machine ledger nếu có chỉ là cache dựng lại được, không phải authority.

## Xung đột được giữ thế nào?

- Nhiều nguồn cùng hỗ trợ một claim được giữ làm provenance.
- Nhiều claim mâu thuẫn được trình bày song song; Hub không tự chọn theo độ mới
  hoặc trạng thái Published.
- Nguồn quá mơ hồ để tạo claim được giữ cùng candidate/Question.
- Question và limitation chưa giải quyết vẫn có thể publish nếu ghi rõ điều chưa
  biết và nguồn liên quan.

## Vòng đời của Question

```text
Open ──người dùng xử lý──→ Resolved
                             │ evidence mới mâu thuẫn
                             ↓
                         Needs Review
                             │ người dùng xử lý lại
                             └──────────────→ Resolved
```

- `Open`: đang chờ câu trả lời hoặc điều tra.
- `Resolved`: hiện không còn chờ câu trả lời; không có nghĩa một claim đã thành
  sự thật tuyệt đối.
- `Needs Review`: guidance cũ gặp evidence mới mâu thuẫn.

Sau khi người dùng đánh giá evidence và cập nhật guidance nếu cần, Question từ
`Needs Review` trở lại `Resolved`.

Trạng thái Question độc lập với trạng thái xuất bản. Ví dụ, một Question
`Resolved` vẫn có thể chỉ là Local Draft; một Question `Open` vẫn có thể đã
Published.

## Maintainer Guidance

Câu trả lời của người dùng được lưu thành user evidence hoặc Maintainer
Guidance, không xóa nguồn cũ. Trong MVP, Guidance chỉ áp dụng cho exact
Question/subject đang hỏi. Một quyết định rộng hơn được viết thành update của
Domain/System concept qua Proposal bình thường, không dùng scope engine riêng.

Evidence mới cùng hướng được bổ sung vào provenance. Evidence mới mâu thuẫn đưa
Question về `Needs Review`, đồng thời vẫn giữ guidance và lịch sử cũ.

Questions không cần chặn từng lần Ingest. Domain Enrichment có thể gom Questions
của nhiều repository trong cùng Domain, lấy thêm provider evidence và cho người
dùng xử lý theo batch. Mọi câu trả lời, state transition và relation phát sinh
vẫn tạo Local Draft mới trước khi publish.

Domain Enrichment tự xác minh trước. Kết quả deterministic chỉ cần show cùng
evidence; trường hợp có lựa chọn hợp lý nhưng chưa đủ authority được hỏi với một
recommended option; trường hợp chưa có đáp án đáng tin được hỏi trực tiếp cùng
context/example và có thể defer. Recommendation chưa được người dùng chọn không
trở thành Maintainer Guidance.

## Knowledge đã sai hoặc lỗi thời

MVP không thêm trạng thái `superseded/retracted`. Khi evidence hoặc maintainer
đã xác nhận rõ, Refresh tạo Proposal sửa hoặc xóa exact knowledge/concept cũ.
Preview và PR phải nêu thứ bị xóa, lý do và evidence; Git giữ lịch sử và cho phép
revert.

Chỉ có hai nguồn mâu thuẫn thì chưa đủ để tự xóa một phía. Hub vẫn giữ cả hai
positions cùng provenance và Question cho tới khi có căn cứ thay đổi rõ ràng.
