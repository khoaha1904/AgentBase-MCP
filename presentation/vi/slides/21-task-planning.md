# Slide 21 — Task Planning handoff

> Status: canonical Vietnamese slide specification.

## Mục tiêu

Cho thấy Feature Discovery không tự viết implementation plan. Nó tạo một handoff
có cấu trúc; Task Planning dùng handoff đó để selective investigation trên
exact source.

## Nội dung hiển thị

- Input: accepted route, evidence và open questions.
- Task Planning kiểm tra candidate paths trong hai repository.
- Output cần có task, dependency, acceptance criteria và remaining unknowns.

## Lời thoại

Feature Discovery dừng ở scope và câu hỏi. Sau khi owner xác nhận retry policy,
DLQ, alarm và recovery ownership, handoff này mới đi sang Task Planning. Ở phase
đó agent không scan lại mọi thứ. Nó dùng route vừa có để chọn repository, sau
đó Code Graph và exact source mới quyết định file nào thực sự cần đổi. Output
không chỉ là một danh sách việc chung chung; mỗi task cần dependency, acceptance
criteria, citation và unknown còn lại. Như vậy shared knowledge giúp thu hẹp,
còn source giữ cho plan cụ thể và hiện hành.
