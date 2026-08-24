# 03.05 — Candidate review

> Trạng thái: Candidate state intentionally transient; dedicated review UI
> không thuộc MVP.

## Lifecycle

Candidate chỉ tồn tại trong Ingest/Refresh proposal preparation và review:

```text
candidate
  ├─ qualified + evidenced → concept/relation/evidence update
  ├─ useful but unresolved → Question
  └─ no independent value  → discard
```

Candidate không phải OKF concept type, publication item hoặc Hub entity. Không
có candidate database, Published Candidate hay candidate migration.

## Review outcome

- Promote chỉ tạo knowledge item đã qua schema/evidence validation.
- Question giữ đúng ambiguity, candidate references và next verification action.
- Discard không để lại Hub content; diagnostics của run có thể đếm hoặc tóm tắt
  lý do bỏ nhưng không publish raw candidate inventory.
- Discard của một run không tạo ignore/suppression record; source mới hoặc
  Refresh sau có thể đưa candidate trở lại.
- Nếu review chưa hoàn tất, candidate nằm trong mutable proposal workspace;
  Accept chỉ nhận các outcome đã materialize thành valid knowledge items.

## Recovery

Interrupted run có thể rebuild candidate từ source/graph. Không cần phục hồi
candidate như durable business data. Chỉ proposal outcome đã validate mới cần
exact recovery theo Hub lifecycle.
