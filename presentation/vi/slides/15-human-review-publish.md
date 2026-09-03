# Slide 15 — Sau Validate, authority chuyển sang con người

> Status: canonical Vietnamese slide specification.

## Vai trò của slide

Nối workflow năm stage với review và publication mà không trộn hai loại authority.

## Thông điệp duy nhất

AgentBase chuẩn bị và kiểm tra proposal; con người Accept, review Git diff và
merge; explicit sync mới tạo Published query authority.

## Nội dung hiển thị

```text
VALIDATED PROPOSAL
   ↓ Finalize · Inspect
LOCAL DRAFT
   ↓ Human Accept · Submit
PULL REQUEST
   ↓ Human review · Merge · Explicit Sync
PUBLISHED OKF
```

Callout: `MCP NEVER APPROVES OR MERGES.`

## Lời thoại dự kiến

“Năm stage vừa rồi kết thúc ở một validated proposal, không phải Published
knowledge.

Finalize khóa đúng bytes và digest để con người inspect chính xác nội dung sắp
được Accept. Accept biến nó thành Local Draft, nhưng Local Draft vẫn chưa xuất
hiện trong ordinary query. Submit chỉ tạo branch và pull request để team review
bằng Git diff bình thường.

MCP không approve và không merge. Sau khi con người merge, vẫn cần explicit sync
để AgentBase ghi nhận đúng Published commit. Chỉ lúc đó knowledge mới trở thành
query authority dùng chung.”

## Câu chuyển sang slide 16

“Khi source thay đổi, mình không cần invent thêm một lifecycle khác. Refresh tái
sử dụng chính năm stage đó.”

## Nguồn

- `AgentBase-MCP/docs/product/03-knowledge-lifecycle.md`
- `AgentBase-MCP/docs/capabilities/11-review-and-publish/01-runtime-requirements.md`
