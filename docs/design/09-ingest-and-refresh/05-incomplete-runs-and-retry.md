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

Capability 046 giữ Seed/Inventory mutable chỉ trước Prepare. Guidance thành
công freeze compact Receipt. Trước Prepare, retry chạy lại Discover/Investigate
nhưng có thể reuse verified graph cache cùng exact source revision. Sau Prepare,
Receipt và workspace private có thể resume Author/Validate khi source và Hub base
còn exact; raw graph/source không cần durable checkpoint.

## Retry

- Retry chạy lại failed repository, không chạy lại completed siblings.
- Completed staging chỉ reuse khi exact source identity/digest còn khớp.
- Source đã đổi thì invalidates và rerun đúng repository đó.
- Remote default branch advance invalidates Seed/Receipt/proposal của member
  liên quan; không được chỉ thay graph rồi publish OKF cũ.
- Hub base đã advance thì batch reconcile/revalidate với base mới; chỉ quay lại
  source investigation nếu conflict/missing evidence thật sự yêu cầu.
- Retry không tạo duplicate candidate/concept vì cùng batch membership và
  repository checkpoint được thay thế, không append mù.

## Cancellation và cleanup

User có thể cancel Incomplete batch và xóa private staging/cache receipt thuộc
run đó. Accepted Hub commits, shared graph cache hợp lệ và source repository
không bị sửa. Cleanup failure được báo rõ; không tự coi run đã biến mất.

## Bounds

Mỗi attempt vẫn có one-repair limit. Manual retry là attempt mới có visible
history/reason, không phải hidden Agent loop. Batch chỉ finalize khi mọi confirmed
member complete hoặc user explicitly xác nhận membership mới rồi rerun/finalize.
