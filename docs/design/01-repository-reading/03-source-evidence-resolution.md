# 01.03 — Source evidence resolution

> Trạng thái: Exact local source/reference boundary implemented.

## Quyết định

Code Graph tìm candidate; exact source mới hỗ trợ claim. Hub lưu knowledge,
bounded provenance và reference, không lưu source hoặc graph thứ hai.

```text
graph candidate
      ↓
exact snippet/config/docs read
      ↓
knowledge claim + source reference
      ↓
optional small observed snapshot
```

## Evidence bắt buộc

Attributed claim phải trỏ được về repository identity, source revision và
relative file path; line span là optional evidence hint. Graph summary không có exact
source chỉ là discovery signal; nó không đủ để trở thành claim.

Không resolve được exact source thì Agent giữ limitation, candidate hoặc
Question. Agent không copy raw snippet vào Hub để bù cho reference yếu.

## Snapshot nhỏ

Snapshot là tùy chọn để Markdown vẫn hữu ích khi con người đọc trực tiếp:

- giá trị hiện trực tiếp trong code/config/docs có thể được ghi ngay;
- chỉ giữ scalar hoặc identifier nhỏ có knowledge value;
- luôn kèm source revision và observed time;
- wording phải là `observed`, không tuyên bố đó là current value;
- không snapshot secret, raw source, config dump, provider response hoặc graph.

Tên resource, ARN, region hoặc account ID có thể là identity/metadata hữu ích,
nhưng chỉ ghi khi source hoặc provider evidence xác minh được.

## Provider evidence

Ingest/Refresh không gọi provider CLI chỉ để lấp dữ liệu còn thiếu. Nếu tên,
ARN hoặc non-sensitive value cần AWS/Azure CLI mới lấy được, Ingest giữ
reference/candidate hoặc Question và tiếp tục.

Domain Enrichment sau nhiều repository mới:

1. dùng provider skill sau khi user tự login CLI;
2. resolve bounded candidates của cả batch;
3. bổ sung observed snapshot, identity hoặc relation evidence;
4. đưa mọi thay đổi vào Domain Enrichment Draft để review/publish riêng.

## Baseline gap

Current runtime đã hỗ trợ optional bounded snapshot nhưng còn mang semantic live
target. Phần 08 clean-cutover sang file-level observed values; không mở quyền lưu
arbitrary source content.
