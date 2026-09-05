# Slide 19 — Discover

## Vai trò của slide

Giải thích vì sao Initial Ingest phải sparse và bounded.

## Thông điệp duy nhất

Discover chọn candidate có giá trị độc lập thay vì sao chép codebase thành
Markdown.

## Nội dung hiển thị

```text
RAW SIGNALS
symbols · modules · resources · interfaces · docs
                 ↓ bounded selection
CANDIDATE SET
concept · relation · Question · ignored with reason

Sparse by design
```

## Lời thoại dự kiến

“Nếu mọi function hoặc Terraform resource đều thành document, Hub chỉ là một bản
copy nhanh stale của source. Discover chọn một tập candidate bounded có giá trị
để hỏi, giải thích hoặc liên kết. Signal chưa rõ thành Question; phần không đáng
lưu được ignore với lý do.”

## Câu chuyển

“Candidate mới là giả thuyết điều tra, chưa phải fact.”

## Nguồn

- `docs/capabilities/03-concept-discovery/06-capability-requirements.md`
