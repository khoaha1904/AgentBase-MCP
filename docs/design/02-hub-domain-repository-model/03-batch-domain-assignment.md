# 02.03 — Batch Domain assignment

> Trạng thái: Batch Initial Ingest assignment implemented offline; Batch Refresh deferred.

## Scope

Batch chỉ nhận repository roots do người dùng chỉ định trong workspace. Nó không
recursive-scan workspace/home để tự tìm repository.

Host skill chạy Domain preflight cho từng repository trước full Ingest và tạo
một confirmation matrix:

| Repository | Existing | Proposed | Evidence | Warning |
|---|---|---|---|---|
| crawler-api | Crawler | Crawler | root README | — |
| crawler-job | — | Crawler | docs overview | new assignment |
| recommender | Recommendation | Crawler | root README | mismatch |

## Confirmation

- User có thể khai báo một Domain chung cho cả batch.
- Skill vẫn kiểm tra từng repository và không che repository bất thường.
- User sửa Domain hoặc loại repository trước khi xác nhận matrix.
- Không repository nào bắt đầu full Ingest khi matrix còn unresolved row.

Sau confirmation, từng repository chạy tuần tự và có checkpoint riêng. Failure
của một repository không xóa checkpoint hoàn chỉnh của repository khác, nhưng
batch vẫn `Incomplete`: chưa có atomic proposal để Accept, Publish hoặc query
như Published knowledge. Retry hoặc membership revision phải hoàn tất rồi mới
finalize lại toàn batch.

## Runtime shape

Batch Initial Ingest dùng bounded MCP tools cho preflight, manifest, member run,
finalize và inspection. Host skill giữ workflow dễ hiểu cho người dùng; durable
reviewable knowledge chỉ xuất hiện ở atomic proposal sau finalize.
