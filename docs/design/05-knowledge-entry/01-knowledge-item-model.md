# 05.01 — Knowledge item and proposal identities

> Trạng thái: Technical design draft.

## Quyết định

AgentBase không tạo một universal `KnowledgeItem` record hoặc database mới.
Mỗi loại knowledge giữ identity tự nhiên trong OKF/Hub, còn proposal commit là
đơn vị review và publication.

| Nội dung | Identity kỹ thuật | Publication |
|---|---|---|
| Concept | normalized OKF path không có `.md` | proposal thay đổi file đó |
| Claim có cấu trúc | stable claim ID trong concept | proposal thay đổi concept |
| Relation | source concept + predicate + target identity | proposal chứa edge |
| Question | stable governed-question ID | proposal attachment/guidance proposal |
| Evidence | source ID trong concept + repository URI | proposal chứa evidence |
| Navigation index | exact path/line dependency | proposal chứa navigation change |
| Proposal/change set | proposal ID + accepted Git commit + diff digest | publication unit |

Prose không có identity riêng chỉ để hỗ trợ item-level state. Nó thuộc concept
document chứa nó. Không thêm ID cho mọi paragraph hoặc YAML field.

## Invariants

- Một proposal bind exact base, source repository, evidence digest, tree/diff
  digest và schema catalog.
- Người dùng chọn/bỏ item trước Accept; final validation khóa exact reviewed tree.
- Accept tạo đúng một immutable commit trên local Hub `main`.
- Một item có thể mang provenance/semantic identity riêng mà không có publication
  state riêng.
- Question lifecycle độc lập publication lifecycle; chi tiết thuộc phần 07.

## Baseline reuse

Giữ `ProposalMetadata`, `LocalProposal`, commit trailers, OKF concept path,
live-claim ID và governed-question ID hiện tại. Không migration Hub content cho
publication unit.
