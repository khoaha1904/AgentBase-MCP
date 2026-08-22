# 03 — MCP nhận diện concept trong repository thế nào?

> Trạng thái: Đã đồng bộ catalog 7 và Initial Ingest hiện tại.

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

| Thứ được tìm thấy | Cách biểu diễn |
|---|---|
| System, workload, API hoặc shared resource có ranh giới riêng | Concept |
| SQS, table, bucket, host nội bộ | Embedded knowledge trong concept cha |
| AWS, EC2, Lambda, runtime | Technology metadata |
| Service gọi API hoặc publish message | Relation |
| File, class, helper function | Evidence/reference |
| TTL, timeout dễ thay đổi | [Observed snapshot](08-live-references-for-change-prone-values.md) khi có query value |

## Đối chiếu và xử lý phần chưa rõ

Trước khi tạo mới, Agent đối chiếu với Published Hub và Local Draft. Concept đã
publish được mọi máy dùng chung Hub nhìn thấy; draft chưa publish chỉ có trên
máy/workspace đã tạo nó.

Một source trực tiếp có thể đủ để đề xuất concept; không có số lượng nguồn tối
thiểu cố định. README hoặc ADR có thể là bằng chứng chính cho business rule và
decision, nhưng nội dung tương lai hoặc mơ hồ chỉ tạo candidate/Question.

Candidate có danh tính rõ nhưng chưa chắc có giá trị query chỉ xuất hiện trong
review. Người dùng có thể promote thành concept, giữ thành Question hoặc bỏ.
Khi nguồn xung đột, Agent không đoán; policy đầy đủ nằm ở
[phần 07](07-conflicts-questions-and-maintainer-guidance.md).

## Trạng thái implementation

- Candidate cần identity ổn định, query/link value và exact evidence; không dùng
  confidence score giả chính xác.
- Initial Ingest đã tạo sparse proposal và cho phép knowledge bổ sung dần.
- Candidate review UI riêng và cross-repository promotion vẫn chưa implement.
