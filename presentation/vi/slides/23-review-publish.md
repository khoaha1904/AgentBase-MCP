# Slide 23 — Human review và Publish

## Vai trò của slide

Chi tiết hóa publication boundary mà main deck chỉ tóm tắt.

## Thông điệp duy nhất

Một xác nhận Publish chia sẻ đúng kết quả đã xem, theo policy Direct hoặc PR.

## Nội dung hiển thị

```text
VALIDATED WORKSPACE
  -> Finalize + Inspect
FINALIZED PROPOSAL
  -> Preview + Confirm Publish
HUB POLICY
  -> Direct: push complete commit + recognize Published
  -> PR: team review + merge + sync
PUBLISHED OKF

MCP NEVER APPROVES OR MERGES
```

## Lời thoại dự kiến

“Finalize khóa bytes và digest để inspect chính xác. Người dùng xem thay đổi
quan trọng rồi xác nhận Publish. Direct đẩy commit hoàn chỉnh và ghi nhận nó
cho query; PR tạo pull request, chờ team merge rồi sync. Nếu remote đã nhận
nhưng local chưa ghi nhận được, báo rõ và recovery, không nói publish thất bại
hoàn toàn. MCP không tự approve hay merge PR, không tự chuyển policy khi bị từ
chối. Workspace đang soạn vẫn riêng tư, không xuất hiện trong ordinary query.”

## Câu chuyển

“Cuối cùng, runtime giữ ba boundary này mà không nhúng một model thứ hai vào MCP.”

## Nguồn

- `docs/product/03-knowledge-lifecycle.md`
- `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`
