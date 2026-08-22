# 11.06 — Verification and cleanup

> Trạng thái: Transaction cleanup implemented; accepted-artifact cleanup deferred.

## Outcome

Reuse các gate hiện có; không tạo một verification workflow hoặc garbage
collector riêng cho MVP.

## Verification gates

1. **Finalize** kiểm tra exact authored bundle, schema, links, relations,
   Questions, ownership, lifecycle intent và proposal diff.
2. **Accept** kiểm tra exact tree/diff digest, base commit và immutable reviewed
   bytes trước khi tạo Local Draft commit.
3. **Publish/Sync** kiểm tra exact remote/base/branch/proposal identity và clean
   candidate trước khi push hoặc advance local `main`.

Các gate này không đọc lại source chỉ để làm proposal “chắc hơn”. Missing
knowledge vẫn là Question/Limitation; source verification thuộc Refresh hoặc
Domain Enrichment riêng.

Human verification/guidance nếu cần phải đi qua một reviewed proposal. Review
UI hoặc PR action không sửa trực tiếp `verified`, Question hay knowledge bytes.

## Cleanup now

- Successful authoring normalization/staging, isolated worktree và completed
  transaction directory được dọn ngay.
- Failure cần recovery giữ bounded transaction evidence; recovery xong mới dọn.
- Source checkout, valid Code Graph cache, accepted Local Draft commits và Hub
  remote không bao giờ bị cleanup workflow sửa/xóa.
- Cleanup failure được báo; không giả vờ transaction đã biến mất.

## Accepted proposal artifacts

MVP giữ private proposal bundle, inspection và receipts cho retry/PR summary.
Question đã nằm trong reviewed Hub tree; không còn attachment hoặc private rebuild
authority. Chưa có automatic retention, scheduled cleanup hoặc manual delete tool.

Nếu disk usage thực tế chứng minh cần, có thể thêm một bounded cleanup cho
proposal đã được recognized Published: xóa large rebuildable
bundle/inspection, giữ minimal Git/proposal identity nếu còn cần audit. Chỉ thêm
khi disk usage thực tế chứng minh cần.

## Cancellation

- Cancel authoring/Incomplete run chỉ được xóa private unaccepted staging của
  exact run sau khi user yêu cầu.
- Không cancel bằng cách reset Local Draft, drop accepted commit hoặc close PR.
- Proposal đã Accept muốn thay đổi phải tạo proposal mới; cleanup không phải
  lifecycle mutation.

## No additional MVP machinery

Không daemon, TTL, retention policy, status database, cleanup scheduler hay
source re-verifier. Existing deterministic gates và immediate temporary cleanup
là đủ cho MVP.
