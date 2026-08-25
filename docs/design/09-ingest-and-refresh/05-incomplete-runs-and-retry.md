# 09.05 — Incomplete runs and retry

> Trạng thái: Single-run và Batch Initial Ingest checkpoints/retry implemented;
> Batch Refresh deferred.

## Partial và Incomplete

- **Partial knowledge:** bounded run thành công, proposal hợp lệ nhưng không cam
  kết full repository coverage. Đây là normal successful output.
- **Incomplete run:** process, integrity hoặc validation failure khiến output
  không an toàn để materialize. Nó không query, Accept hoặc Publish được.

## Batch manifest

Local batch run giữ manifest private với confirmed membership, Hub base và một
entry cho từng repository:

```text
pending → running → complete
                  ↘ failed
```

Entry complete bind canonical Repository ID, exact source revision/dirty digest,
evidence digest và completed staging digest. Raw graph/candidate context không
cần durable recovery.

Capability 046 giữ Seed trong connection và nhận Inventory một lần để freeze
immutable Receipt. Prepare atomically tạo persisted authoring session; exact
retry trả cùng session ID, mismatched input bị reject. Raw graph/Inventory không
cần durable checkpoint.

## Retry

- Retry chạy lại failed repository, không chạy lại completed siblings.
- Completed staging chỉ reuse khi exact source identity/digest còn khớp.
- Source đã đổi thì invalidates và rerun đúng repository đó.
- Remote default branch advance chỉ thêm `source-advanced`; pinned exact snapshot
  vẫn valid. Chỉ snapshot đổi/mất/không access hoặc mất authority mới invalidate.
- Với Init, Hub base advance trước Finalize giữ unchanged source/Seed/final
  Inventory, rematch identity, issue Receipt mới và tạo replacement session;
  session bind base cũ không tiếp tục được. Normal Refresh không có Receipt: nó
  reuse source/change analysis và chạy lại prepare/guidance trên base mới. Sau
  Finalize dùng publication reconciliation. Chỉ source snapshot đổi mới rerun
  discovery.
- Retry không tạo duplicate candidate/concept vì cùng batch membership và
  repository checkpoint được thay thế, không append mù.

## Cancellation và cleanup

User có thể cancel Incomplete batch và xóa private staging/cache receipt thuộc
run đó. Cleanup chỉ đụng marker-owned validated private paths; accepted Hub
commits, reusable graph cache hợp lệ và source repository không bị sửa. Cleanup
failure được báo rõ; không tự coi run đã biến mất.

## Bounds

Mỗi attempt vẫn có one-repair limit. Manual retry là attempt mới có visible
history/reason, không phải hidden Agent loop. Batch chỉ finalize khi mọi confirmed
member complete hoặc user explicitly xác nhận membership mới rồi rerun/finalize.
