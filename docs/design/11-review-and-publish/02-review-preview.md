# 11.02 — Review preview

> Trạng thái: Structured inspection implemented; optional visual review deferred.

## Outcome

Review cho người dùng hiểu proposal sẽ thay đổi gì trước Local Accept và trước
PR. Selection diễn ra khi authoring draft còn editable; một proposal đã Finalize
là một atomic review unit và chỉ được Accept toàn bộ hoặc trả lại để sửa.

## MVP flow

```text
editable authoring draft
        ↓ add / edit / remove items
Finalize validates dependencies and locks exact bytes
        ↓
structured inspection + bounded before/after content
        ↓ accept all | return to authoring
immutable Local Draft commit
        ↓ later publication selection
PR preview/body + exact Git diff
```

Preview nhóm `Added`, `Updated`, `Removed`, `Superseded/Retracted` và
`Questions/Limitations`. Mỗi entry giữ path, change kind, allowed state, reason
khi có, bounded before/after bytes và digest. Destructive entry phải giữ
lifecycle reason/evidence; preview không tự suy diễn lý do từ Git diff.

## Atomic selection rule

- Concept, relation, Question, evidence và navigation có thể được chỉnh trước
  Finalize.
- Finalize kiểm tra lại toàn bundle, relation targets, protected bytes,
  Question references và navigation invariants.
- Sau Finalize không có per-item checkbox làm thay đổi bundle đã khóa.
- Review không đạt thì quay lại authoring và Finalize lại; Accept yêu cầu exact
  proposal diff digest và tree digest đã review.
- Publication có thể chọn proposal commits dependency-safe, nhưng không cắt
  item bên trong một accepted proposal.

Quy tắc này tránh phải tạo một selection engine thứ hai có nhiệm vụ tự sửa
relation/index/Question khi user bỏ một item.

## Optional visual review after MVP

Có thể sinh một static local HTML từ immutable inspection data để hiển thị:

- summary và các nhóm thay đổi;
- concept cards với before/after;
- relation graph và affected neighbors;
- Questions, limitations và evidence/provenance;
- exact proposal/tree/diff identity.

HTML là derived view, không phải Hub state hay review authority. Phiên bản đầu
nếu triển khai chỉ cần generate file và mở bằng browser; không cần persistent
server, database, login hoặc write API. Interactive editing/selection chỉ được
xem xét sau khi static view chứng minh có ích, và mọi thay đổi vẫn phải quay về
authoring rồi Finalize lại.

## Failure boundaries

- Truncated content phải ghi rõ và giữ digest; không trình bày như full diff.
- Invalid/non-applicable inspection không được Accept.
- Proposal bytes/base thay đổi sau inspection làm Accept fail closed.
- Preview không đọc source, probe credential, Refresh, Accept hay Publish.

## Current implementation gap

Structured inspection, grouped changes, bounded content và exact-digest Accept
đã có. Host workflow cần diễn đạt rõ bước return-to-authoring khi review không
đạt. Static HTML/graph review chưa thuộc MVP và chưa cần runtime capability.
