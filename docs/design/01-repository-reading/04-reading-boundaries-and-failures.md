# 01.04 — Reading boundaries and failures

> Trạng thái: Single-repository reading/failure boundary implemented.

## Reading authority

- Một run bind đúng repository root local hoặc workspace đã được user chỉ định.
- Source read phải ở trong admitted root; không follow path/symlink thoát ra ngoài.
- Không tự clone remote repository hoặc mở rộng từ repo sang cả workspace.
- Multi-repository command truyền danh sách root rõ ràng và xử lý mỗi root như
  một unit riêng; phần 09 sở hữu batch orchestration.

## Partial fallback

Graph là discovery accelerator, không phải điều kiện duy nhất để exact source
trở thành evidence:

- graph thiếu coverage một vùng thì Agent dùng bounded source search/read ở vùng
  đó;
- file hoặc language không được provider hỗ trợ có thể dùng docs/config/source
  trực tiếp;
- mọi fallback claim vẫn cần exact source reference;
- proposal ghi rõ coverage limitation và tạo Question khi phần thiếu có thể làm
  thay đổi knowledge quan trọng.

Partial result không được mô tả như full repository coverage. Missing graph row
không chứng minh một concept/relation không tồn tại.

## Failure outcomes

### Tiếp tục với partial Draft

- graph query bị truncate hoặc một vùng unsupported;
- một candidate không resolve được nhưng candidate khác có exact evidence;
- source search fallback cung cấp bounded evidence;
- failure chỉ làm giảm completeness, không phá source integrity.

### Dừng repository run

- repository/source authority không hợp lệ;
- source thay đổi trong lúc evidence round đang chạy;
- provider cleanup không xác định được;
- không còn exact evidence đáng tin nào để tạo useful Draft;
- evidence/proposal state không thể validate hoặc recovery an toàn.

Batch run không rollback Draft hoàn chỉnh của repository khác. Repository lỗi có
failure report riêng và có thể retry; phần 09 quyết định checkpoint/idempotency.

## Baseline impact

Boundary, mutation detection và cleanup hiện tại được giữ nguyên. Gap là graph
round hiện thường fail toàn bộ khi provider path không hoàn chỉnh; implementation
sau này phải phân biệt recoverable coverage limitation với integrity/runtime
failure. Đây là contained change trong evidence outcome và skill routing, không
phải provider rewrite.
