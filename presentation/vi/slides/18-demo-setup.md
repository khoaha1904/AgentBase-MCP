# Slide 18 — Demo setup

> Status: canonical Vietnamese slide specification.

## Mục tiêu

Chuyển từ kiến trúc sang một tình huống sử dụng cụ thể. Đây là demo sản phẩm,
không phải benchmark chất lượng.

## Nội dung hiển thị

- Một change request an toàn trên sample domain Crawler.
- Ba câu hỏi demo phải trả lời:
  1. phần nào của hệ thống bị ảnh hưởng;
  2. điều gì đã biết và chưa biết;
  3. phase tiếp theo cần điều tra hoặc thay đổi ở đâu.

## Lời thoại

Đến đây mình đã giải thích các thành phần và boundary. Bây giờ mình sẽ dùng một
tình huống cụ thể để nối chúng lại. Giả sử team muốn bổ sung retry và
operational visibility cho các Crawler job bị lỗi. Đây là một yêu cầu ngắn,
nhưng để lên kế hoạch an toàn, agent phải tìm đúng luồng xuyên repository, tách
fact khỏi unknown và tạo được một handoff đủ rõ cho Task Planning.
