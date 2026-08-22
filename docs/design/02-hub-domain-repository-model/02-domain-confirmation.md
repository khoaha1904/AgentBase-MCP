# 02.02 — Domain confirmation preflight

> Trạng thái: Single-repository và Batch Initial Ingest confirmation implemented.

## Workflow

```text
explicit repository root
→ read bounded root documentation
→ resolve existing Repository assignment
→ search existing Domain summaries
→ present candidate + evidence + warnings
→ user confirms/corrects
→ only then start full Ingest/Refresh
```

## Bounded documentation

Host skill đọc theo thứ tự:

1. root `README*`;
2. root `docs/README*` hoặc `docs/index*`;
3. overview/domain/architecture documents được root README link trực tiếp.

Giới hạn cụ thể về số file/byte thuộc implementation plan, nhưng skill không
recursive-scan toàn bộ docs và không cần Code Graph chỉ để xác nhận Domain.

## Candidate result

Preflight trả:

- repository identity và existing primary Domain nếu có;
- proposed exact Domain identity/title;
- match kind: existing, new hoặc ambiguous/near-name;
- source paths/excerpts dùng để đề xuất;
- warning khi user input và repository evidence không cùng hướng.

AI không tự xác nhận. User input cũng không được tin mù quáng: mismatch phải được
hiển thị, nhưng owner là người quyết định cuối.

## New, Refresh và correction

- Initial Ingest tạo/reuse Domain và Repository assignment sau xác nhận.
- Refresh mặc định dùng assignment hiện có và vẫn hiển thị preflight summary.
- Domain khác existing assignment dừng ordinary Refresh. Một explicit correction
  proposal thay relation, giữ owner evidence và Git history; không đổi âm thầm.
- Nếu Repository concept được bảo vệ, Agent chỉ báo exact mismatch; maintainer
  phải thực hiện reviewed Hub correction trước khi Refresh tiếp tục.
- Exact identity/title được truyền vào existing `confirmed_domain`; runtime không
  tự chạy model hoặc classification service.
