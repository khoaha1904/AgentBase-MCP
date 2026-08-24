# 09.08 — OKF Freshness

> Trạng thái: Observation metadata, value age, Repository report and warning-only CI implemented.

## Boundary

OKF Freshness mô tả repository/source contribution được quan sát bao lâu và tại
revision nào. Nó độc lập với Code Graph cache freshness và không phán quyết
knowledge đúng/sai.

## Source contribution metadata

Successful Ingest/Refresh giữ tối thiểu:

- canonical Repository ID;
- observed source revision hoặc dirty digest;
- observed/refreshed time;
- partial/known limitations của run.

Concept có nhiều repository sources trình bày freshness theo contribution, không
gán một timestamp giả cho toàn concept.

## MCP query presentation

Query thêm derived information cạnh result, không rewrite Markdown:

```text
observed 47 days ago at revision abc123
```

Ordinary snapshot query không probe source và trả `not-checked`. Nếu một
explicit current-source/Refresh operation đã có authorized source state, response
có thể bổ sung:

- exact source match: observed revision still matches current source;
- source advanced: refresh may be useful;
- repository mismatch/unavailable: freshness comparison unknown, vẫn hiển thị age.

Không có action tự động, không ẩn result và không hạ publication state.

## Scheduled CI summary

The internal Hub CI boundary produces the structured Repository-level
projection in memory. Ordinary MCP/CLI query has no dedicated freshness action.
The projection reads admitted Published bytes and writes no report file.

GitHub Actions reuses that projection weekly and on Hub PR/main checks. It writes
only the ephemeral Actions Summary; freshness never changes the exit status.

A future capability may persist a derived output, for example:

```text
reports/okf-freshness.md
```

Report list Repository ID/title, last observed time, age, revision và known
limitations, sort oldest/unknown để maintainer xem. Version đầu không cần stale
threshold; luôn hiển thị exact age thay vì tự gán nhãn tùy ý.

Report không phải source of truth và có thể rebuild. GitHub Actions summary/
artifact là output đơn giản nhất. Nếu persist file vào Hub Git thì CI tạo PR;
không push thẳng `main` và không kích hoạt Refresh.

## Remaining gap

Persisted Markdown, ordinary-query freshness marks and multi-source contribution
aggregation are not implemented. Per-value snapshot query already exposes exact
age; the first Hub-wide report intentionally stays at the Repository Refresh checkpoint.
