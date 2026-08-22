# 09.04 — Repository identity

> Trạng thái: Canonical identity/aliases implemented cho qualified path; edge cases còn lại.

## Mục tiêu

Repository đổi tên, chuyển organization, đổi remote alias hoặc checkout ở path
khác vẫn được nhận là repository cũ và chạy Refresh.

## Canonical identity

Initial Ingest gán một AgentBase Repository ID đúng một lần và lưu nó trong
Repository concept của Hub. Source references, proposals và contributions dùng
ID này về sau.

```text
repository-vehicle-crawler-a1b2c3d4e5f6
```

ID không được tính lại từ current folder name hoặc current origin URL mỗi run.

## Identity hints

Checkout discovery trả hints để tìm canonical Repository concept:

- normalized current remote URLs;
- display/repository names;
- Git root commit/lineage hints;
- optional immutable forge/provider repository ID khi đã có evidence;
- known aliases đã lưu trong Hub.

Remote URL, name và root commit là evidence/aliases, không phải canonical ID.
Root commit một mình không phân biệt chắc repository với fork.

## Resolution

1. Search active Hub Repository concepts bằng strong hints/aliases.
2. Exact strong match: reuse canonical ID và chọn Refresh.
3. Ambiguous fork/mirror/copy lineage: hỏi user trước khi chọn mode.
4. No match: Initial Ingest tạo ID mới.

Rename/organization transfer chỉ bổ sung alias/evidence. Fork độc lập tạo ID mới
và có thể giữ `forked-from`; mirror dùng cùng ID chỉ khi lineage được xác nhận.

## Duplicate Initial Ingest

Không thêm remote claim/lock. Nếu hai Initial Ingest trùng xảy ra, proposal
được publish trước giữ canonical identity. Owner hủy proposal còn lại, pull Hub
và rerun contribution bằng Refresh như high-level đã chốt.

## Implementation delta

Initial Ingest hiện derive một durable Repository ID từ admitted identity hints
và lưu remotes/root commits làm aliases; Refresh nhận canonical ID từ Hub
Repository concept và cập nhật `observed_source`. Ambiguous fork/mirror/provider
identity recovery đầy đủ vẫn chưa được qualification như một workflow riêng.

Không có remote claim/lock cho duplicate Initial Ingest như owner đã chốt.
