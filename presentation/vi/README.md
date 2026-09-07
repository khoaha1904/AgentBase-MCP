# AgentBase — nguồn thuyết trình tiếng Việt

[Cách dùng thực tế](practical-use.md) giải thích độ bao quát và minh hoạ từng
use case bằng hội thoại hai cột. Đây là tài liệu đọc riêng, không thêm slide.

[`PLAN.md`](PLAN.md) là narrative contract. [`slides/`](slides/) chứa 15 slide
chính và 9 slide appendix theo đúng thứ tự số.

Mỗi slide giữ các phần sau khi phù hợp:

1. Vai trò của slide.
2. Một thông điệp duy nhất.
3. Nội dung hiển thị.
4. Lời thoại dự kiến.
5. Câu chuyển và nguồn kiểm chứng.

Main deck phải hiểu được với PM, PO và SM nhưng vẫn đủ credibility cho engineer.
Các stage triển khai và runtime architecture nằm sau slide kết thúc, dưới divider
technical deep dive. Không tự đưa appendix trở lại main flow chỉ vì có thêm thời
gian hoặc vì renderer hỗ trợ nhiều slide.

`../preview.html` là snapshot review được generate từ nội dung này. Nó không thay
thế Markdown source và không phải product authority.

## Main deck

1. [`01-opening.md`](slides/01-opening.md)
2. [`02-problem.md`](slides/02-problem.md)
3. [`03-promise.md`](slides/03-promise.md)
4. [`04-early-proof.md`](slides/04-early-proof.md)
5. [`05-compounding.md`](slides/05-compounding.md)
6. [`06-foundation.md`](slides/06-foundation.md)
7. [`07-lifecycle.md`](slides/07-lifecycle.md)
8. [`08-demo-setup.md`](slides/08-demo-setup.md)
9. [`09-feature-discovery.md`](slides/09-feature-discovery.md)
10. [`10-domain-hub.md`](slides/10-domain-hub.md)
11. [`11-task-planning.md`](slides/11-task-planning.md)
12. [`12-refresh.md`](slides/12-refresh.md)
13. [`13-positioning.md`](slides/13-positioning.md)
14. [`14-release-and-pilot.md`](slides/14-release-and-pilot.md)
15. [`15-closing.md`](slides/15-closing.md)

## Optional technical appendix

16. [`16-technical-divider.md`](slides/16-technical-divider.md)
17. [`17-pipeline-overview.md`](slides/17-pipeline-overview.md)
18. [`18-preflight.md`](slides/18-preflight.md)
19. [`19-discover.md`](slides/19-discover.md)
20. [`20-investigate.md`](slides/20-investigate.md)
21. [`21-author.md`](slides/21-author.md)
22. [`22-validate.md`](slides/22-validate.md)
23. [`23-review-publish.md`](slides/23-review-publish.md)
24. [`24-runtime-architecture.md`](slides/24-runtime-architecture.md)
