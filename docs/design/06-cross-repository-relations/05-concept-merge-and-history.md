# 06.05 — Published concept merge boundary

> Trạng thái: Explicitly deferred beyond MVP; this file is not an implementation contract.

## Quyết định MVP

- Duplicate trong current proposal có thể coalesce trước Accept.
- Candidate mới có thể enrich một Published canonical concept khi không cần xóa
  một Published identity khác.
- Hai concepts đều Published thì giữ nguyên cả hai và tạo Question/merge
  candidate có strong identity evidence.
- Provider verification không tự merge, Accept hoặc Publish.
- Không có redirect document, automatic canonical selection hoặc Hub-wide link
  rewrite trong MVP.

Same name, schema hoặc model confidence không đủ để xem hai concepts là một.
Question phải giữ exact identities, evidence và lý do nghi ngờ duplicate để xử
lý sau mà không mất provenance.

## Khi nào xem xét lại?

Chỉ mở capability riêng sau khi Hub thực tế có Published duplicates cần xử lý.
Lúc đó design phải chốt canonical selection, history, old-path behavior,
relationship rewrite và rollback trước implementation. Bản redirect chi tiết cũ
không còn là current authority.
