# Slide 08 — Demo setup

## Vai trò của slide

Đặt một change request chung cho ba slide ứng dụng tiếp theo.

## Thông điệp duy nhất

Một yêu cầu ngắn có thể cần context xuyên repository trước khi team ra quyết
định hoặc viết task.

## Nội dung hiển thị

```text
CHANGE REQUEST
Bổ sung retry và operational visibility cho luồng CUR Analyzer -> backend.

1. Nó chạm vào đâu?
2. Fact và unknown là gì?
3. Planning cần điều tra source nào?

Feature Discovery -> Domain Hub -> Task Planning
```

## Lời thoại dự kiến

“Đây là một yêu cầu dễ đọc nhưng chưa đủ để implement. Trước hết Feature
Discovery cần xác định impact surface và câu hỏi còn mở. Domain Hub giúp con
người review route và evidence. Sau khi owner quyết định policy, Task Planning
mới đi vào exact source của repository liên quan.”

## Câu chuyển

“Phase đầu tiên không cố viết plan; nó chỉ xác định đúng boundary và điều chưa
biết.”

## Nguồn

- Iroco2 qualification snapshot, Published Hub commit
  `bf2e99273acc83469a70f2a5b1dd06c93d9d01d5`.
