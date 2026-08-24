# 07.05 — Correction and removal

> Trạng thái: Implemented MVP contract.

## Quyết định

MVP không có per-item `superseded`/`retracted` state hoặc tombstone. Khi exact
evidence hoặc maintainer direction đủ rõ, Refresh/Enrichment có thể tạo Proposal
sửa hoặc xóa knowledge do AgentBase sở hữu.

Proposal preview và PR phải nêu:

- exact concept/knowledge bị sửa hoặc xóa;
- reason và evidence;
- replacement/link liên quan nếu có;
- Question/relation bị ảnh hưởng.

Conflict đơn thuần, evidence vắng mặt trong một lần Refresh hoặc source tạm mất
quyền không đủ để xóa. Protected/human-authored/foreign knowledge giữ existing
ownership rules. Git history là audit/restore mechanism; rollback dùng reviewed
revert/correction thay vì một lifecycle database.
