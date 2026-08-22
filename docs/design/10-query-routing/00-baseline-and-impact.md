# 10.00 — Baseline and impact

> Trạng thái: Baseline synchronized; snapshot/shared-Question primitives implemented.

## Outcome

Agent chọn Hub, local source/Code Graph hoặc cả hai theo câu hỏi. MCP giữ các
surface đọc nhỏ và deterministic; không thêm một reasoning router hoặc một tool
“trả lời mọi thứ”.

## Baseline có thể tái sử dụng

- Hub search, concept read và relationship traversal đọc một exact active Hub
  commit, có bounds và Domain/type scope.
- `read_hub_observed_values` trả snapshot, source state, age và exact
  Published/Local Draft attribution mà không probe repository.
- Gateway đã expose Code Graph/search/snippet cho một authorized local
  repository binding. Source reading không thuộc Hub query owner.
- Hub Questions hiện có private ledger để hỗ trợ Refresh; shared Question
  documents và conflict-aware shared query còn deferred theo Part 07.
- Remote GitHub credential đã thuộc MCP publication/setup, nhưng chưa có remote
  repository file reader.

## Gap so với high-level

1. Agent routing rules chưa được breakout thành source-selection contract.
2. Active Hub reader chỉ đọc một active commit; chưa tạo logical overlay đồng
   thời giữa Published và selected Local Draft, cũng chưa có per-layer switch.
3. Không có response composition contract thống nhất cho conflict, Question và
   Maintainer Guidance.
4. Snapshot age đã có, nhưng freshness mark trong ordinary search/read response
   và CI freshness report còn deferred.
5. Explicit current-source read reuse graph/file tools, nhưng chưa có bounded
   remote-reference reader.

## Minimal direction

- Giữ routing ở host skill/agent policy; MCP không reasoning thay agent.
- Dùng snapshot-default: snapshot/Hub đủ trả lời thì dừng; source availability,
  age hoặc conflict không tự kích hoạt source read.
- Reuse các query primitives hiện tại và chỉ thêm layer metadata/composition khi
  một independently useful implementation slice cần nó.
- Không bắt query Hub phải có source credential; source failure không làm mất
  Hub knowledge hoặc snapshot.
- Không tự resolve conflict, Refresh hoặc write-back trong query path.

## Impact checkpoint

| Boundary | Impact | Lý do |
|---|---|---|
| Host source selection | Reuse/documentation | Existing Hub và graph tools đã tách đúng responsibility. |
| Published + Local Draft overlay | Contained change | Cần đọc hai exact Hub commits và giữ layer provenance. |
| Conflict/Question composition | Contained after Part 07 | Shared Question runtime chưa tồn tại. |
| Observed/current values | Reuse | Part 08 snapshot query + normal graph/file reads. |
| Remote repository reference read | Broad change | Thêm credentialed GitHub read boundary; deferred. |
| Freshness report/presentation | Separate contained capability | Part 09 freshness contract chưa implement. |

Không có near rewrite. Phần lớn query core hiện tại được giữ; gap lớn nhất có
thể implement độc lập sau này là Published/Local Draft overlay.

## Deferred dependencies

- Shared conflict/Question documents: Part 07.
- Freshness scheduling/report: Part 09.08.
- Remote repository reading and provider access: Parts 01, 06 and 11.
- Query không tự clone, index hoặc gọi provider CLI.
