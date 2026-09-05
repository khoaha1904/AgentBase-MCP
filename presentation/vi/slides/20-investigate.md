# Slide 20 — Investigate

## Vai trò của slide

Tách công cụ navigation khỏi evidence authority.

## Thông điệp duy nhất

Code Graph tìm đường nhanh; exact source xác nhận kết luận.

## Nội dung hiển thị

```text
CODE GRAPH
symbol · caller · dependency path
        ↓ navigate
EXACT SOURCE
repository · revision · path · line span
        ↓ normalize
BOUNDED EVIDENCE

Raw graph stays private, local and rebuildable
```

## Lời thoại dự kiến

“Graph giúp agent tìm symbol, caller và dependency path mà không scan mù. Nhưng
graph không phải canonical knowledge. Kết luận phải quay về exact source trong
snapshot đã khóa. Chỉ evidence bounded có provenance mới được đi tiếp; raw graph
ở local và có thể rebuild.”

## Câu chuyển

“Khi evidence đủ, MCP kiểm soát structure còn agent tập trung vào meaning.”

## Nguồn

- `docs/product/01-repository-understanding.md`
- `docs/architecture/state-and-trust.md`
