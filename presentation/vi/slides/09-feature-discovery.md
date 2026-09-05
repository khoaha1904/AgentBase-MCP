# Slide 09 — Feature Discovery

## Vai trò của slide

Cho thấy knowledge giúp tìm scope mà không che giấu uncertainty.

## Thông điệp duy nhất

Feature Discovery dùng Published Hub để xác định accepted impact surface và giữ
unknown thành câu hỏi rõ ràng.

## Nội dung hiển thị

```text
CURATED TRACE
User: retry và visibility sẽ chạm vào đâu?
Agent: bắt đầu từ Published Hub của Crawler Domain.
Result: 2 repositories · 1 queue boundary · 2 downstream resources

Accepted route: publisher -> queue -> worker -> storage
Still open: retry · DLQ/redrive · alarm · recovery owner
```

## Lời thoại dự kiến

“Agent bắt đầu từ Published Hub thay vì scan source không giới hạn. Route trả về
là knowledge team đã review. Những phần chưa có evidence không được điền bằng
suy đoán; chúng trở thành Question. Diagram cho thấy accepted scope, còn
Question giữ phần cần owner quyết định.”

## Câu chuyển

“Nếu muốn biết vì sao route đó tồn tại, người nghe cần một cách drill down đến
evidence.”

## Nguồn

- Historical Crawler qualification snapshot at Hub commit
  `45228292aa9ed56ebeb1e42a5216cf6a07133a3c`.
- `docs/product/07-ai-sdlc-context.md`
