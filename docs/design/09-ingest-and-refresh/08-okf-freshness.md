# 09.08 — OKF Freshness

> Trạng thái: Observation metadata implemented; query/CI warning deferred.

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

## Scheduled CI report

CI có thể parse Hub theo lịch và tạo một derived report tổng hợp, ví dụ:

```text
reports/okf-freshness.md
```

Report list Repository ID/title, last observed time, age, revision và known
limitations, sort oldest/unknown để maintainer xem. Version đầu không cần stale
threshold; luôn hiển thị exact age thay vì tự gán nhãn tùy ý.

Report không phải source of truth và có thể rebuild. GitHub Actions summary/
artifact là output đơn giản nhất. Nếu persist file vào Hub Git thì CI tạo PR;
không push thẳng `main` và không kích hoạt Refresh.

## Baseline gap

Legacy live-evidence query chỉ có `ready`, `unavailable` và
`repository-mismatch`; snapshot-first runtime chưa replace contract đó hoặc
render age. Proposal/source state đã có phần lớn revision/time inputs, nhưng
multi-source contribution freshness và derived report chưa implemented.
