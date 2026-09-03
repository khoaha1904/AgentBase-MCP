# Slide 16 — Refresh tái sử dụng cùng 5 stage

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Đặt Refresh và freshness vào đúng sườn đã học, thay vì giới thiệu thêm các flow
độc lập.

## Thông điệp duy nhất

Refresh chạy lại năm stage trên exact delta giữa hai revision; freshness chỉ là
signal để con người quyết định có bắt đầu hay không.

## Nội dung hiển thị

```text
Observed revision A ── exact Git delta ── Current revision B

Preflight     bind repo + A/B
Discover      changed paths + known gaps
Investigate   exact hunks + affected source
Author        update attributable contribution
Validate      one outcome per returned path

Freshness warns → user starts Refresh
Absence ≠ deletion evidence
```

Safe Crawler snapshot proof:

- Published C0: 6 nodes, 7 edges;
- Published C1: 18 nodes, 31 edges, 1 flow.

## Lời thoại dự kiến

“Refresh không phải một cơ chế hoàn toàn khác. Nó tái sử dụng cùng năm stage,
nhưng input là exact Git delta giữa revision đã quan sát và revision hiện tại.

Preflight khóa repo và hai revision. Discover ưu tiên changed paths cùng known
gaps. Investigate đọc exact hunks và phần source bị ảnh hưởng. Author chỉ cập
nhật contribution có thể quy về thay đổi đó. Validate buộc mỗi path được trả về
có đúng một outcome: updated, new, embedded, question hoặc ignored với lý do.

Freshness chỉ cảnh báo hoặc đề xuất chạy Refresh; người dùng mới là bên bắt đầu.
Và việc không còn nhìn thấy một signal không bao giờ tự động trở thành bằng
chứng để xóa knowledge.

Crawler C0 và C1 ở đây là hai Published snapshot thật của sample domain. Con số
không phải mục tiêu; nó chỉ cho thấy knowledge có thể được build up qua một
delta có kiểm soát.”

## Câu chuyển sang slide 17

“Đó là lifecycle nhìn từ phía knowledge. Bây giờ mình nhìn architecture runtime:
agent và MCP chia responsibility như thế nào?”

## Nguồn

- `AgentBase-MCP/docs/product/04-trust-conflicts-and-freshness.md`
- `AgentBase-MCP/docs/capabilities/11-review-and-publish/01-runtime-requirements.md`
