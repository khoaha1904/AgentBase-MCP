# Slide 05 — Knowledge phải được tích lũy

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đưa ra hướng giải quyết ở mức tư tưởng: agent không nên dựng lại knowledge từ
raw source sau mỗi câu hỏi; knowledge phải trở thành một artifact tồn tại lâu
dài và lớn dần.

## Thông điệp duy nhất

Knowledge cần được tổng hợp một lần, duy trì và tích lũy qua từng source và
từng lần sử dụng.

## Nội dung hiển thị

- Cách thông thường: `Raw sources → Retrieve → Tổng hợp lại → Reset`.
- LLM Wiki: `Sources + Questions → Linked Markdown Wiki → Compounding`.
- Trích dẫn: “The wiki is a persistent, compounding artifact.” — Andrej Karpathy.

## Lời thoại dự kiến

“Quay lại bài toán của team, thứ mình cần không chỉ là một nơi để chứa tài liệu.
Nếu mỗi lần có câu hỏi, agent lại phải đọc source và tự ghép mọi thứ từ đầu,
thì knowledge thực ra không được tích lũy. Lần sau hỏi lại, nó vẫn phải làm lại
gần như toàn bộ quá trình đó.

Andrej Karpathy có mô tả một pattern gọi là LLM Wiki. Thay vì chỉ retrieve từ
raw document, agent xây dựng và duy trì một tập hợp Markdown có cấu trúc, có
liên kết và lớn dần theo thời gian. Ông ấy gọi nó là một persistent, compounding
artifact — một artifact tồn tại lâu dài và càng sử dụng thì càng có giá trị.

Đây khá gần với thứ mình đang tìm: knowledge không cần hoàn thiện ngay từ đầu,
nhưng phải có khả năng build up dần.”

## Câu chuyển sang slide 06

“Pattern này hợp lý, nhưng nếu mỗi team tự định nghĩa Markdown của riêng mình,
chúng ta lại tạo ra một format chỉ mình hiểu.”

## Nguồn

- Andrej Karpathy, LLM Wiki: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
