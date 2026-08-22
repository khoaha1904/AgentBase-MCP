# 04.02 — Selection, disposition and uncertainty

> Trạng thái: Implemented cho single-repository Init; enrichment còn deferred.

```text
evidence-bearing candidates/observations
        ↓ one bounded guidance call
technology detection → standalone/embedded disposition → generic role
        ↓
MCP-rendered editable OKF skeletons
        ↓
Agent enrichment → changed-document validation
```

Candidate phải có stable identity basis, independent query/link value và exact
owned evidence. Caller không được tự khẳng định provider/product/schema để ghi
đè mapping. Kết quả là `exact`, `suggested`, `embedded`, `ambiguous` hoặc
`unsupported`; không có confidence number.

- `exact/suggested`: có thể tạo skeleton cho role released.
- `embedded`: giữ trong useful parent, không tạo file riêng.
- `ambiguous/unsupported`: giữ evidence + limitation/Question; không ép vào
  type gần giống.

Suggested role luôn mang proposal-review limitation. Exact structured mapping
ưu tiên khi source hỗ trợ nhưng việc bỏ sót low-value evidence chỉ là coverage
diagnostic, không làm proposal truthful-partial trở thành invalid.
