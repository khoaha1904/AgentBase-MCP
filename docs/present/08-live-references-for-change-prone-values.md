# 08 — Live reference cho dữ liệu dễ thay đổi

> Trạng thái: Live-reference/snapshot contract đã có; provider resolution còn deferred.

## Câu trả lời ngắn

Giá trị quan trọng, hay thay đổi và thường được hỏi có thể giữ live reference
kèm snapshot gần nhất. Hub không sao chép hàng loạt config của repository.

```text
TTL snapshot: 7 ngày
Source: crawler-api / config/queue.ts / VEHICLE_TTL
Commit + observed time: abc123 / 2026-08-20
```

## Khi query

- Có quyền source: Agent resolve reference và trả giá trị hiện tại.
- Không có quyền: Agent trả snapshot cùng commit/thời điểm và cảnh báo có thể
  stale.
- Reference hỏng hoặc không resolve được: giữ snapshot, tạo Question và chờ
  Refresh hoặc người dùng xử lý.

Reference dùng repository, path và symbol/config key; không chỉ dùng số dòng.
Snapshot chỉ dành cho giá trị nhỏ có ích ở mức knowledge. Snapshot luôn được
trình bày là giá trị **đã quan sát** tại source revision/thời điểm cụ thể, không
được diễn đạt như current truth và không cần một TTL engine riêng.

Nếu giá trị hiện trực tiếp trong code, config hoặc docs và không nhạy cảm,
Ingest/Refresh có thể ghi snapshot cùng provenance ngay. Nếu phải gọi provider
CLI mới lấy được tên, ARN hoặc giá trị, Ingest chỉ giữ reference/candidate hoặc
Question; Domain Enrichment mới resolve và bổ sung theo batch.

Provider CLI resolution không chạy trong Ingest. Nó thuộc Domain Enrichment
sau khi người dùng đã login, và chỉ resolve resource/value liên quan tới các
concept, Questions hoặc relation candidates đang được review.

## Quyền và dữ liệu nhạy cảm

Hub là một trust boundary chung. Ai có quyền Hub có thể đọc toàn bộ Published
knowledge; không có ACL theo Domain, concept hoặc field.

Credential, token, secret và giá trị nhạy cảm tương đương không được phép
Ingest hoặc publish, dù Hub chạy nội bộ trên GitHub Enterprise. MCP có thể giữ
tên/reference cho biết một config dùng secret, nhưng không lưu hoặc resolve giá
trị thật.

Nếu phát hiện trong Ingest/Refresh, MCP bỏ riêng giá trị nhạy cảm, cảnh báo nguồn
bị loại và cho các item an toàn tiếp tục. Secret đã nằm trong Local Draft bị
loại khỏi query và không được publish. Nếu đã Published, MCP ngừng trả giá trị,
cảnh báo maintainer gỡ khỏi Hub và rotate credential liên quan. Phiên bản đầu
không xây thêm một hệ thống quản lý security incident riêng.

## Còn để low-level quyết định

- Cú pháp/resolver cho repository, path và symbol.
- Ngưỡng stale và cách xử lý symbol đổi tên/di chuyển.
- Thời điểm phát hiện reference hỏng; outcome high-level luôn là tạo Question.
