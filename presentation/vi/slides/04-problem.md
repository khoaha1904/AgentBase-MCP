# Slide 04 — Vấn đề nằm ở những liên kết

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Chứng minh rằng độ phức tạp đến từ quy mô và các liên kết xuyên repository,
không chỉ từ số lượng code trong từng repository.

## Thông điệp duy nhất

Không ai — kể cả AI agent — có thể tự giữ và suy luận chính xác toàn bộ ngữ
cảnh xuyên repository khi các liên kết chưa được biểu diễn rõ ràng.

## Nội dung hiển thị

- 15 repository trong một domain.
- Hơn 100 node và hơn 150 edge.
- Business logic trải dài qua nhiều repository.
- Con người khó nhớ hết; AI agent khó đọc và nối đúng toàn bộ flow.

## Lời thoại dự kiến

“Domain hiện tại đã lên tới 15 repository, với hơn 100 node và hơn 150 edge.
Kiến thức không nằm trong một repository mà nằm cả trong những liên kết giữa
chúng. Không ai có thể nhớ hết; AI agent cũng không thể chỉ đọc từng repo rồi
tự đoán chính xác toàn bộ hệ thống.”

## Câu chuyển sang slide tiếp theo

“Vậy agent cần loại context nào để có thể lần theo hệ thống này một cách đáng
tin cậy?”

## Không đưa vào slide này

- Chưa giới thiệu AgentBase như lời giải.
- Chưa giải thích MCP hoặc kiến trúc.
