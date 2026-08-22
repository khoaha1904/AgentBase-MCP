# 04.05 — Catalog cutover record

> Trạng thái: Catalog 7 clean cutover completed.

Catalog 6 design chưa Published và đã được thay trước release. Không có Markdown
converter, dual authoring mode hoặc Hub migration. Type AgentBase đã retired
fail khi author mới với hướng dẫn re-ingest/promotion; arbitrary foreign types
vẫn round-trip theo open-world compatibility.

Các thay đổi semantic trong profile sau khi knowledge đã Published không được
tự rewrite Hub. Chúng cần impact scan, Migration Draft, owner review và PR;
evidence thiếu thì giữ knowledge hiện tại cùng Question.
