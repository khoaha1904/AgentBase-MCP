# 03 — MCP nhận diện concept trong repository thế nào?

> Trạng thái: Catalog 7 và Capability 046 Discovery Seed/Inventory coverage đã
> implement; released-skill qualification còn pending.

## Câu trả lời ngắn

Agent dùng Code Graph để tìm thành phần quan trọng, đọc source để kiểm chứng,
rồi đề xuất các concept có ích cho việc hiểu và query hệ thống.

```text
Skill Ingest
     ↓
Code Graph tìm đúng khu vực
     ↓
Source cung cấp bằng chứng
     ↓
Agent đề xuất concept + schema + relation
     ↓
Local Draft để người dùng review
```

Code Graph là bản đồ tìm kiếm, không phải danh sách concept để sao chép vào Hub.
Initial Ingest vì vậy **discover rộng nhưng publish chọn lọc**: MCP phải nhìn
thấy các nhóm tín hiệu quan trọng trước, còn OKF chỉ giữ knowledge có ích.

## Schema và concept khác nhau thế nào?

- **Schema** là khuôn vai trò dùng chung do MCP cung cấp, như System, Component,
  Function hoặc Interface.
- **Concept** là thực thể cụ thể được phát hiện và lưu trong Hub, như Crawler
  API hoặc Vehicle Data Queue.

Một repository có thể đóng góp nhiều concept; nhiều concept có thể dùng cùng
một schema. Không có một danh sách concept cố định để chỉ match vào.

## Khi nào tạo concept?

Một thành phần được đề xuất thành concept riêng khi nó:

- có danh tính riêng; và
- có giá trị để query hoặc liên kết trực tiếp.

Hub ưu tiên ranh giới có giá trị query/navigation. Cloud resource nội bộ thường
là embedded knowledge trong concept cha, không tự động thành một file concept.
Khi Agent đã chọn embedded với parent và evidence hợp lệ, việc MCP chưa nhận ra
provider/product chỉ tạo limitation; nó không được làm knowledge biến mất.

Một discovery group không đạt hai gate không biến mất âm thầm. Agent chọn đúng
một outcome: `materialized`, `question` hoặc `ignored` kèm bounded reason.
Candidate đã xác định concept hay embedded nên Inventory không khai lại. MCP đối
chiếu các outcome này với machine-derived Discovery Seed;
không đặt quota concept và không yêu cầu mọi route/resource thành file.
MCP tự xác định lane và mức P0/P1/P2 từ tín hiệu máy; Agent chỉ diễn giải ý nghĩa
và chọn cách biểu diễn, nên không thể tự tuyên bố “đã kiểm tra đủ”. Một group có
một outcome nhưng có thể tạo nhiều output nếu source thực sự cần.

| Thứ được tìm thấy | Cách biểu diễn |
|---|---|
| System, workload, API hoặc shared resource có ranh giới riêng | Concept |
| SQS, table, bucket, host nội bộ | Embedded knowledge trong concept cha |
| AWS, EC2, Lambda, runtime | Technology metadata |
| Service gọi API hoặc publish message | Relation |
| File, class, helper function | Evidence/reference |
| TTL, timeout dễ thay đổi | [Observed snapshot](08-live-references-for-change-prone-values.md) khi có query value |

## Đối chiếu và xử lý phần chưa rõ

Trước khi tạo mới, Agent đối chiếu với Published Hub local đã đồng bộ và concept
trong proposal hiện tại. Ordinary discovery không search những Local Draft khác.

Một source trực tiếp có thể đủ để đề xuất concept; không có số lượng nguồn tối
thiểu cố định. README hoặc ADR có thể là bằng chứng chính cho business rule và
decision, nhưng nội dung tương lai hoặc mơ hồ chỉ tạo candidate/Question.

Candidate có danh tính rõ nhưng chưa chắc có giá trị query chỉ xuất hiện trong
review. Người dùng có thể promote thành concept, giữ thành Question hoặc bỏ.
Khi nguồn xung đột, Agent không đoán; policy đầy đủ nằm ở
[phần 07](07-conflicts-questions-and-maintainer-guidance.md).

AI quyết định embedded/Question/bỏ qua bằng hai gate trên và phải nêu được lý do
từ evidence. P0 chỉ được bỏ qua bằng nhóm lý do hữu hạn MCP kiểm được. “Bỏ qua”
chỉ có nghĩa không đưa candidate đó vào OKF của run hiện tại; nó không tạo ignore
registry và Refresh sau vẫn có thể phát hiện lại.

## Trạng thái implementation

- Candidate cần identity ổn định, query/link value và exact evidence; không dùng
  confidence score giả chính xác.
- Initial Ingest hiện tạo sparse proposal và cho phép knowledge bổ sung dần.
- Capability 046 thêm compact discovery groups, five-lane Inventory Receipt và
  coverage validation để một sparse proposal không bỏ sót tín hiệu quan trọng
  mà không giải thích.
- Candidate chỉ sống trong proposal workflow; MVP không cần registry hoặc UI
  review riêng. Cross-repository promotion thuộc Domain Enrichment.
