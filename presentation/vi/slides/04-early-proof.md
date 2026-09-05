# Slide 04 — Một route đã review thu hẹp bài toán

## Vai trò của slide

Cho mixed audience thấy payoff trước khi giải thích technology.

## Thông điệp duy nhất

Shared knowledge biến một yêu cầu ngắn nhưng mơ hồ thành impact surface có fact,
evidence và unknown rõ ràng.

## Nội dung hiển thị

```text
“Retry và visibility cho failed Crawler jobs chạm vào đâu?”

Publisher repository -> SQS boundary -> Worker repository -> DynamoDB / S3

KNOWN: reviewed route và owning repositories
OPEN: retry policy · DLQ/redrive · alarm · recovery owner
```

Callout: `Không phải câu trả lời hoàn chỉnh — là đúng điểm bắt đầu.`

## Lời thoại dự kiến

“Với câu hỏi này, Published Hub đưa ra một route đã được review thay vì để agent
scan mọi repository ngay từ đầu. Nó đồng thời giữ lại những gì chưa biết. Giá trị
không phải là giả vờ đã có đáp án hoàn chỉnh; giá trị là cả product và engineering
cùng bắt đầu từ một scope có thể kiểm tra.”

## Câu chuyển

“Muốn route này tiếp tục có ích cho lần sau, knowledge phải là tài sản được duy
trì chứ không phải output tạm thời của một prompt.”

## Nguồn

- Historical Crawler qualification snapshot, Published Hub commit
  `45228292aa9ed56ebeb1e42a5216cf6a07133a3c`.
- `AgentBase-Benchmark/results/crawler/feature-discovery-pipeline-run-visibility/2026-09-01T07-07-06Z/discovery-plus-agentbase/agent-final.txt`
