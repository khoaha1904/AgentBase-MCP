# Slide 12 — Hai chế độ duy trì knowledge

## Vai trò của slide

Giải thích freshness và khả năng bổ sung phần ingest còn thiếu.

## Thông điệp duy nhất

Delta Refresh giữ knowledge theo thay đổi mới; bounded Coverage Refresh phục hồi
knowledge còn mỏng mà không tạo một workflow thứ ba.

## Nội dung hiển thị

```text
DELTA REFRESH                     COVERAGE REFRESH
exact Git delta                  re-check weak/sparse coverage
fast default                     explicit recovery mode
new and changed evidence         may run with unchanged source

coverage_passes: 0 -> 1 -> 2 -> 3 max
clean no-new-knowledge pass -> stop early

Freshness warns · user starts · absence != deletion evidence
```

## Lời thoại dự kiến

“Default vẫn là Delta Refresh trên exact Git delta. Nhưng nếu ingest đầu còn
mỏng, Coverage Refresh có thể điều tra lại phạm vi yếu kể cả khi source chưa đổi.
Coverage debt được nhìn thấy, campaign dừng sớm khi một pass sạch không tìm ra
knowledge mới và tối đa ba reviewed passes. Đây là recovery bounded, không phải
cam kết completeness.”

## Câu chuyển

“Vậy AgentBase nằm ở đâu so với Markdown thuần hoặc RAG?”

## Nguồn

- `docs/product/03-knowledge-lifecycle.md`
- `docs/capabilities/09-ingest-and-refresh/09-runtime-requirements.md`
