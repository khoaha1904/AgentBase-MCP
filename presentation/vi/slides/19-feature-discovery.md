# Slide 19 — Feature Discovery + diagram

> Status: canonical Vietnamese slide specification.

## Mục tiêu

Cho thấy AIT/Feature Discovery dùng Published Hub để thu hẹp scope trước khi
đọc source, đồng thời biến kết quả thành một impact diagram dễ đọc.

## Nội dung hiển thị

- Một trace hội thoại đã được rút gọn.
- Luồng đã biết: publisher → SQS → worker → DynamoDB/S3.
- Các câu hỏi còn mở: retry, DLQ/redrive, alarm và recovery owner.

## Lời thoại

Ở Feature Discovery, agent chưa cần đọc toàn bộ source. Nó bắt đầu từ Published
Hub của đúng Domain. Với câu hỏi này, Hub đưa ra route đã được team review:
publisher gửi job vào SQS, queue kích hoạt worker và worker ghi DynamoDB cùng
S3. Kết quả đó có thể được chiếu thành diagram. Nhưng diagram không tự hoàn
thiện phần còn thiếu: retry behavior, DLQ, alarm và recovery owner vẫn là các
câu hỏi. Đây là điểm mình muốn giữ: hình ảnh giúp thấy scope, còn unknown vẫn
phải nhìn thấy được.
