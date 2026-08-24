# 09.10 — Workspace scan and workflow routing

> Trạng thái: Owner-approved design; implementation audit pending.

## Mục đích

`agentbase-scan` là public read-only workflow giúp người dùng chọn bước tiếp theo.
Nó không phải Ingest, Refresh, mixed batch hoặc Code Graph discovery.

## Boundaries

- Nhận một explicit workspace root đã được người dùng chọn.
- Inventory tối đa 32 unique Git roots bên trong boundary, bỏ private/internal
  Git directories và dừng descend khi đã tìm thấy một repository root.
- Không scan home/machine, follow symlink ra ngoài, đọc source sâu, README/docs,
  dựng/reuse graph hoặc tạo Proposal.
- Không có Remote Hub thì chỉ trả local repository inventory và `Hub unavailable`.

## Classification

Với active remote profile, Scan dùng exact synchronized Published Hub và Git
metadata nhẹ để trả per repository:

- display/path và strong identity hints;
- `not-in-hub`, `published-unchanged`, `published-source-advanced` hoặc
  `init-local-draft`, `init-in-review`, `refresh-local-draft`,
  `refresh-in-review` hoặc `ambiguous`;
- Published last-observed time/revision khi có;
- suggested `ingest`, `refresh`, `none` hoặc `confirm`.

Tên folder đứng riêng không xác nhận identity. Ambiguous fork/mirror/copy không
được tự phân loại thành Init hoặc Refresh.

Scan/status được đọc profile-local proposal/PR metadata chỉ để tránh đề xuất
Init/Refresh trùng và đưa ra `review`, `submit`, `wait` hoặc `reconcile`. Draft
bytes không tham gia Hub matching hoặc ordinary query.

## User selection

Scan chỉ trình bày options và chờ user. Một repo mới route tới single Initial
Ingest; nhiều repo mới có thể route tới Batch Initial Ingest. Published repo
được chọn chạy single Refresh tuần tự. User có thể chọn subset bất kỳ.

MVP không thêm Batch Refresh hoặc một atomic mixed Init/Refresh manifest. Scan
đơn giản hóa lựa chọn nhưng không thay authority, confirmation, Proposal,
Accept hoặc Publish của workflow đích.
