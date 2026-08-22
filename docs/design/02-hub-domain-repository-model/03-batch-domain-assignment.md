# 02.03 — Batch Domain assignment

> Trạng thái: Owner-approved design; Batch Ingest runtime deferred after MVP.

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

Sau confirmation, từng repository chạy độc lập. Failure của một repository
không rollback draft hoàn thành của repository khác; reconciliation batch chỉ
dùng các run hoàn thành.

## Runtime shape

Phiên bản đầu không cần batch MCP endpoint. Host skill lặp bounded Hub search,
source preflight và existing per-repository prepare tools, đồng thời giữ một
batch plan trong session context. Durable knowledge chỉ bắt đầu ở proposal.
