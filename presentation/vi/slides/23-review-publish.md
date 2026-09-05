# Slide 23 — Human review và Publish

## Vai trò của slide

Chi tiết hóa publication boundary mà main deck chỉ tóm tắt.

## Thông điệp duy nhất

Chỉ reviewed Git history và explicit sync mới tạo Published query authority.

## Nội dung hiển thị

```text
VALIDATED WORKSPACE
  -> Finalize + Inspect
FINALIZED PROPOSAL
  -> Human Accept
LOCAL DRAFT
  -> Publish selected drafts
PULL REQUEST
  -> Human review + Merge + Explicit sync
PUBLISHED OKF

MCP NEVER APPROVES OR MERGES
```

## Lời thoại dự kiến

“Finalize khóa bytes và digest để inspect chính xác. Human Accept tạo Local
Draft nhưng ordinary query vẫn không thấy nó. Publish selected drafts tạo PR để
team review bằng Git diff. Sau merge, explicit sync ghi nhận Published commit.
MCP không approve và không merge.”

## Câu chuyển

“Cuối cùng, runtime giữ ba boundary này mà không nhúng một model thứ hai vào MCP.”

## Nguồn

- `docs/product/03-knowledge-lifecycle.md`
- `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`
