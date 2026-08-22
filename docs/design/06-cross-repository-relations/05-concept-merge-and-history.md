# 06.05 — Concept merge, redirect and history

> Trạng thái: Owner đã chốt explicit merge và retained redirect; chưa implement.

## Quyết định ngắn

Hai concepts có strong identity match chỉ tạo merge candidate. User chọn
canonical concept; merge chuyển knowledge hợp lệ sang canonical và giữ concept
cũ thành một redirect `superseded`, không xóa path cũ.

```text
old concept ──redirect──→ canonical concept
```

Provider verification thành công không tự merge, Accept hoặc Publish.

## Merge authority

- Agent có thể đề xuất duplicates cùng evidence và impact.
- User phải xác nhận exact canonical identity và exact losing identities.
- Same name/schema hoặc model confidence không đủ tạo merge proposal.
- Hai Published concepts không bao giờ auto-merge.
- Published concept luôn giữ identity trước một duplicate chưa Published, trừ
  khi user chọn một explicit migration khác.
- Hai unaccepted drafts có thể coalesce trước Accept, nhưng selection vẫn phải
  hiện trong preview và không được đổi một Published identity.

Canonical selection ưu tiên meaning/granularity provider-neutral ổn định và
review impact nhỏ, nhưng không có numeric rule tự chọn winner. Type/granularity
mâu thuẫn phải được resolve trước; redirect không che một schema disagreement.

## Atomic merge proposal

Một merge proposal chứa đầy đủ:

1. canonical concept sau reconciliation;
2. mỗi losing concept đã chuyển thành redirect;
3. navigation/index changes cần thiết;
4. relation, Question và conflict changes phát sinh;
5. preview của identities, evidence và inbound references bị ảnh hưởng.

Thiếu bất kỳ phần bắt buộc hoặc validation failure làm toàn proposal invalid.
Không có trạng thái canonical đã sửa nhưng redirect chưa tạo.

## Canonical reconciliation

Canonical concept nhận only compatible, provenance-bearing knowledge:

- deduplicated external identities;
- source evidence và non-conflicting claims từ cả hai phía;
- canonical relations có endpoint/evidence hợp lệ;
- aliases/human names có query value;
- unresolved conflicts dưới dạng Questions, không bằng cách chọn nguồn thắng.

Merge không copy mọi prose. Nội dung trùng được tóm thành overview; detail vẫn
được truy ra qua evidence/source references. Deprecated, contradicted hoặc
unproven claims không được biến thành current truth chỉ vì source concept bị
supersede.

## Redirect document

Losing path vẫn là một valid Markdown concept với:

- original title/type để người đọc nhận ra path cũ;
- `status: superseded`;
- one `agentbase.redirect` target tới canonical identity;
- merge reason/proposal provenance;
- một visible Markdown link tới canonical document;
- không giữ current claims, live values hoặc canonical outgoing relations song
  song với target.

Redirect target phải tồn tại, resolve bằng Markdown link và là terminal
canonical concept. Redirect chain và cycle bị từ chối; nếu canonical concept
sau này đổi, mọi redirects được cập nhật thẳng tới canonical mới trong cùng
proposal.

## Query và relationship behavior

- Exact query path cũ trả canonical concept cùng thông báo redirect.
- New authoring không được target redirect identity; MCP trả canonical target.
- Existing inbound edges/Markdown links có thể tiếp tục trỏ path cũ và resolve
  qua redirect, nên merge không cần rewrite toàn Hub chỉ để sửa link.
- Query graph normalize redirect target transiently và không hiển thị duplicate
  logical node.
- Một lần sửa sau có thể cập nhật các links hữu ích, nhưng đó không phải merge
  validity gate.

Giữ redirect là lý do không xóa file cũ hoặc tạo một Hub-wide rewrite lớn.

## History và rollback

- Git proposal/PR là immutable review history của merge.
- PR summary nhóm canonical update dưới `Updated` và losing concepts dưới
  `Superseded/Redirected`, kèm reason và affected relations.
- Trước merge remote, đóng/reject PR không thay Published Hub.
- Sau merge remote, rollback dùng explicit revert proposal; không xóa redirect
  hoặc force-reset history âm thầm.
- Knowledge mới đã target canonical sau merge phải được xem trong rollback
  impact; revert Git mù không được coi là safe semantic rollback.

## Failure cases

| Case | Outcome |
|---|---|
| Same ARN nhưng concept roles/granularity khác nhau | Question; chưa merge. |
| Canonical target missing hoặc cũng là redirect | Reject proposal. |
| Evidence/claim conflict | Giữ cả provenance + Question. |
| Inbound link chưa rewrite | Cho phép vì redirect còn resolve. |
| Redirect cycle/chain | Reject trước Accept. |
| Hub base advance/conflict | Reconcile/review lại; không push partial merge. |

## Baseline impact

Đây là **Broad change** vì query graph, validator, proposal preview và
publication đều phải hiểu redirect. Đổi lại, không cần global alias database,
không xóa concept và không rewrite mọi inbound link. Redirect metadata nằm ngay
trong Hub Markdown nên con người và MCP cùng trace được.

