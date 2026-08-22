# 05.05 — Publication-layer reconciliation

> Trạng thái: Technical design draft.

## Synchronize flow

```text
fetch remote main
      ↓
recognize pending proposals already Published
      ↓
replay remaining proposal commits in isolated candidate
      ↓ validate exact candidate
atomically advance local main and remoteBase
```

Proposal recognition tiếp tục dùng commit ancestry, proposal trailer/diff
identity và stable patch identity. Không đối chiếu chỉ bằng concept title hoặc
resource name.

## Cleanup semantics

- Không xóa từng item hoặc file khỏi một local sidecar.
- Proposal đã recognized Published đơn giản rời pending ancestry khi local base
  chuyển lên remote commit.
- Proposal chưa Published được rebase nguyên khối, giữ proposal identity và
  knowledge bytes nếu validation thành công.
- Query classification được tính lại từ remoteBase/activeHead mới.

## Failure and recovery

- Fetch, conflict hoặc validation failure không đổi active local state.
- Candidate/recovery receipt giữ exact phase và conflict paths.
- Không tự bỏ proposal, force-push, rewrite remote main hoặc hidden retry.
- Conflict cần được giải quyết trước publication tiếp theo.

## Minimal runtime delta

Giữ `accept`, `pending`, `publish`, `synchronize` và recognition hiện tại. Chỉ
cần mở rộng bounded inventory/query metadata để expose layer/proposal state;
không thay Git topology hoặc thêm persistence model.
