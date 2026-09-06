# Slide 02 — Context nằm giữa các repository

## Vai trò của slide

Đặt một vấn đề mà product, delivery và engineering đều nhận ra.

## Thông điệp duy nhất

Khi một behavior đi qua nhiều repository, system context phải được dựng lại
nhiều lần và rất khó duy trì nhất quán.

## Nội dung hiển thị

```text
Một change request
  -> nhiều repository
  -> dependency và event xuyên boundary
  -> cùng một context được dựng lại cho discovery, planning và implementation

Code ở từng repo                 Liên kết của toàn hệ thống
có source of truth               thường nằm trong đầu người và chat tạm thời
```

## Lời thoại dự kiến

“Team có thể sở hữu nhiều repository độc lập, nhưng một feature hiếm khi dừng ở
một boundary. PM cần biết phạm vi, engineer cần biết dependency, reviewer cần
biết kết luận đến từ đâu. Nếu context đó chỉ tồn tại trong một lần điều tra hoặc
một cuộc chat, phase sau lại dựng lại và có thể đi đến một phiên bản khác.”

## Câu chuyển

“AgentBase bắt đầu bằng một promise khá đơn giản: biến phần context dùng chung
đó thành một tài sản mà team có thể review.”
