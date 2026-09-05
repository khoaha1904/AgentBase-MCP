# Slide 09 — Feature Discovery

## Vai trò của slide

Cho thấy knowledge giúp tìm scope mà không che giấu uncertainty.

## Thông điệp duy nhất

Feature Discovery dùng Published Hub để xác định accepted impact surface và giữ
unknown thành follow-up rõ ràng.

## Nội dung hiển thị

```text
MINH HOẠ CÁCH SỬ DỤNG — không phải transcript chạy agent
User: retry và visibility sẽ chạm vào đâu?
Agent: bắt đầu từ Published Hub của Iroco2 Domain.
Result: 2 repositories · producer + consumer evidence

Published source-backed route: CUR Analyzer -> Analyzer SQS -> Backend consumer
Still open: deployed identity · desired retry policy · alarm/recovery owner
```

## Lời thoại dự kiến

“Agent bắt đầu từ Published Hub thay vì scan source không giới hạn. Route minh hoạ dựa trên
knowledge đã Published; hội thoại này không phải transcript của một lần chạy agent. Những phần chưa có evidence không được điền bằng
suy đoán; chúng được giữ như điều cần xác nhận. Diagram cho thấy accepted
scope, còn evidence boundary giới hạn điều agent được phép kết luận.”

## Câu chuyển

“Nếu muốn biết vì sao route đó tồn tại, người nghe cần một cách drill down đến
evidence.”

## Nguồn

- Iroco2 qualification snapshot at Hub commit
  `040eb38df7fa83ec771f1bef96d31d286338b020`.
- `docs/product/07-ai-sdlc-context.md`
