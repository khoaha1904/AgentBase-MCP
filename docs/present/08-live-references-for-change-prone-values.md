# 08 — Observed snapshots và source references

> Trạng thái: Snapshot-first, AWS/SQS observation, local freshness report và read-only Hub CI đã implement.

## Câu trả lời ngắn

Hub lưu một số giá trị nhỏ, hữu ích dưới dạng **đã quan sát**, kèm source file,
revision và thời điểm. AgentBase không xây live-reference engine tới từng symbol,
function hoặc config field.

```text
Observed values:
- TTL: 7 ngày
- Batch size: 100

Source: crawler-api / config/queue.ts
Observed: commit abc123 / 2026-08-22
```

Một file reference có thể làm provenance cho nhiều observed values. Hub không
snapshot toàn bộ config, source hoặc provider response.

## Khi query

- Query bình thường trả snapshot cùng revision/time và freshness warning.
- Hub freshness trả danh sách Repository warning-only, ưu tiên unknown rồi cũ nhất;
  không gọi source và không tự Refresh.
- Nếu user hỏi **giá trị hiện tại** và source có local/workspace, Agent dùng MCP
  đọc file/code graph bình thường; không gọi một symbol resolver riêng.
- Source repository khác chỉ được đọc qua bounded MCP repository access bằng
  MCP-managed token. Agent không tự dùng `gh` hoặc credential riêng.
- Không có quyền/source unavailable: trả observed snapshot và nói rõ không xác
  minh được current value.
- File reference hỏng: giữ snapshot; Refresh hoặc maintainer có thể đề xuất một
  shared Question qua proposal để review.

Snapshot không được diễn đạt như current truth. Exact age/revision được hiển thị;
không cần một TTL threshold engine hay tự động Refresh.

## Khi nào lưu snapshot?

- Giá trị nhỏ, non-sensitive, dễ đọc và hữu ích khi con người/query xem Hub.
- Giá trị hiện trực tiếp trong code/config/docs có thể được Ingest/Refresh ghi.
- Canonical ARN/name/account/region nằm ở external identity metadata khi provider
  evidence xác minh, không duplicate thành snapshots. Chỉ operational scalar
  nhỏ mới dùng observed value; provider CLI thuộc Domain Enrichment.
- Thiếu detail nhỏ không có query value thì bỏ, không snapshot cho đủ coverage.

## Quyền và dữ liệu nhạy cảm

Hub là một trust boundary chung: ai đọc được Hub thì đọc được mọi snapshot.
Credential, token, secret, signed URL, connection string và dữ liệu nhạy cảm
tương đương tuyệt đối không được snapshot hoặc publish.

Reference có thể nói config sử dụng một secret hoặc Parameter Store path, nhưng
không lưu/resolve secret value. Giá trị bị loại không làm các knowledge item an
toàn khác fail. Secret đã Published phải bị ngừng trả, gỡ qua reviewed proposal
và rotate ngoài AgentBase khi cần; MVP không xây incident-management system.

## Boundary

- Source reference là provenance/file navigation, không phải executable locator.
- Snapshot là observed knowledge, không phải source thứ hai.
- Đọc current source là normal MCP source-reading action theo nhu cầu.
- Provider lookup chỉ chạy trong confirmed Domain Enrichment, không trong Ingest
  hoặc ordinary Hub query.
