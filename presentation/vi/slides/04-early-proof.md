# Slide 04 — Một route đã review thu hẹp bài toán

## Vai trò của slide

Cho mixed audience thấy payoff trước khi giải thích technology.

## Thông điệp duy nhất

Shared knowledge biến một yêu cầu ngắn nhưng mơ hồ thành impact surface có fact,
evidence và unknown rõ ràng.

## Nội dung hiển thị

```text
“Retry và visibility cho luồng CUR Analyzer -> backend chạm vào đâu?”

iroco2-lambdas -> Analyzer SQS -> iroco2-backend -> Analysis aggregate

KNOWN: producer · consumer · owning repositories
OPEN: shared queue identity · retry/redrive · alarm owner
```

Callout: `Không phải câu trả lời hoàn chỉnh — là đúng điểm bắt đầu.`

## Lời thoại dự kiến

“Với câu hỏi này, Published Hub đưa ra hai repository và producer/consumer
evidence liên quan thay vì để agent scan mọi repository ngay từ đầu. Nó đồng
thời giữ shared queue identity và policy vận hành ở trạng thái cần xác nhận. Giá
trị không phải là giả vờ đã có đáp án hoàn chỉnh; giá trị là cả product và
engineering cùng bắt đầu từ một scope có thể kiểm tra.”

## Câu chuyển

“Muốn route này tiếp tục có ích cho lần sau, knowledge phải là tài sản được duy
trì chứ không phải output tạm thời của một prompt.”

## Nguồn

- Iroco2 qualification snapshot, Published Hub commit
  `bf2e99273acc83469a70f2a5b1dd06c93d9d01d5`.
- `domains/iroco2/knowledge/iroco2-cur-analyzer.md` and
  `domains/iroco2/knowledge/iroco2-backend.md` at that commit.
