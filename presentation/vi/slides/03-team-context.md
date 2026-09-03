# Slide 03 — Một domain, nhiều repository, một hệ thống

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Giới thiệu bối cảnh công việc của team: serverless, event-driven và business
flow không nằm gọn trong một service hoặc một repository.

## Thông điệp duy nhất

Một flow nghiệp vụ có thể trải dài qua nhiều repository và được nối với nhau
bằng các event.

## Nội dung hiển thị

- Một business flow đi qua nhiều repository.
- Giữa các repository là các event hoặc boundary bất đồng bộ.
- AWS và Terraform chỉ là bối cảnh, không phải thông điệp chính.

## Lời thoại dự kiến

“Team mình làm nhiều với các hệ thống serverless, đặc biệt là event-driven.
Điểm khó không nằm ở từng service riêng lẻ, mà ở việc business logic của một
domain trải dài qua nhiều repository và được nối với nhau bằng các event.”

## Câu chuyển sang slide 04

“Khi domain này lớn dần, việc hiểu toàn bộ business flow trở thành một vấn đề.”

## Không đưa vào slide này

- Chưa giải thích AgentBase-MCP hoặc Code Graph.
- Chưa nói giải pháp.
