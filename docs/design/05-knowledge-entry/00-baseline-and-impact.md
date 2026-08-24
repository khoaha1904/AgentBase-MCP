# 05 — Baseline and impact checkpoint

> Trạng thái: Owner đã chấp nhận proposal/change set làm publication unit.

## High-level trước impact checkpoint

High-level mô tả publication status ở mức từng knowledge item: concept, claim,
relation, Question hoặc evidence update. Người dùng có thể tích lũy Local Draft,
chọn từng item trước PR và chỉ dọn item thực sự Published.

## Baseline hiện tại

Baseline đã có một lifecycle Git hoàn chỉnh:

```text
reviewed proposal
      ↓ accept atomically
one commit on local Hub main       ← queryable local knowledge
      ↓ ordered pending ancestry
one contiguous prefix → one PR     ← remote publication
      ↓ synchronize
recognized commits are removed from pending ancestry
```

- `accept` commit toàn bộ reviewed proposal thành đúng một commit và fast-forward
  local `main`.
- Query đọc một cây duy nhất tại `activeHead`, gồm remote knowledge và mọi pending
  commit local.
- `remoteBase..activeHead` là chuỗi proposal pending có thứ tự.
- Publish chỉ nhận một prefix liên tục của chuỗi này để giữ dependency và tránh
  rewrite/reorder history.
- Proposal ID, source repository, evidence/diff digest và commit identity đã có;
  accept/sync dùng lock, candidate worktree và recovery an toàn.

Nguồn baseline:

- [Hub requirements](../11-review-and-publish/01-runtime-requirements.md)
- [Atomic local accept](../../../src/app/hub-okf/review/accept.ts)
- [Pending ancestry and prefix selection](../../../src/app/hub-okf/review/pending.ts)
- [Active-head query](../../../src/app/hub-okf/query/query.ts)
- [Batch publication](../../../src/app/hub-okf/publication/publish.ts)
- [Synchronization](../../../src/app/hub-okf/publication/synchronize.ts)

## Phần tái sử dụng được

- Git local `main` có thể tiếp tục là Local Draft + Published overlay; không cần
  thêm database hoặc một Hub tạm thứ hai.
- `remoteBase` và pending ancestry đã phân biệt remote-accepted với local-only.
- Proposal commit là đơn vị atomic, có identity/provenance và recovery tốt.
- Một PR đã có thể gom nhiều proposal từ nhiều repository.

## Gap

Baseline quản lý publication ở mức **proposal commit**, không phải từng item bên
trong Markdown:

- concept path có identity, nhưng prose/evidence update không phải item độc lập;
- claim và một số relation có ID riêng nhưng không có publication state riêng;
- query chỉ trả `activeHead`, chưa ghi phần nào Published hay local pending;
- một proposal đã accept là immutable trong pending history;
- publication không thể bỏ proposal ở giữa hoặc chọn một relation/claim nằm bên
  trong một accepted commit.

## Đánh giá impact

- Giữ Git/proposal commit làm publication unit: **Contained change**.
- Giữ Published/Local Draft/In Review cho proposal review; ordinary query chỉ
  Published: **Contained change**.
- Giữ nguyên item-level selection/status sau khi local accept: **Broad change**
  qua OKF identity, accept, pending, query, publish và synchronize.
- Đây chưa phải near rewrite vì Git lifecycle vẫn tái sử dụng được, nhưng sẽ thay
  đáng kể phần Hub đang ổn định và đã có recovery tests.

## Đề xuất tối thiểu

Điều chỉnh high-level để **reviewed proposal/change set** là publication unit:

1. Người dùng chọn/bỏ từng knowledge item trong proposal trước khi local accept.
2. Accept tạo một immutable Local Draft commit để inspect/publish; ordinary
   query chỉ thấy nó sau merge và synchronize.
3. Một PR gom nhiều pending proposal liên tiếp từ nhiều repository.
4. Query đọc exact remote base; proposal review ghi rõ commit đang local/in review.
5. Sau merge, synchronize nhận diện proposal đã Published và giữ proposal còn lại.

Với hướng này, item vẫn có identity/provenance để query và conflict, nhưng trạng
thái publication thuộc proposal chứa thay đổi đó. Nếu một file chứa cả remote và
local edits, Agent nói concept có pending local changes thay vì giả vờ mọi field
có state độc lập.

## Quyết định đã chốt

Proposal/change set là publication unit. Item-level selection diễn ra trước
local Accept. Sau Accept, proposal commit bất biến và đi qua Local Draft, In
Review rồi Published như một đơn vị. High-level phần 05 và 11 đã được cập nhật.

Impact sau quyết định: **Contained change**, không còn broad Hub redesign.
