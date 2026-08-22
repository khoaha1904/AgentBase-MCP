# 06.03 — Domain Enrichment reconciliation

> Trạng thái: Owner đã chốt Published-only input và một atomic Enrichment Draft; chưa implement.

## Quyết định ngắn

Domain Enrichment chỉ xử lý knowledge đã merge vào Published Hub `main`. User
chọn một Domain cùng repositories/candidates cụ thể; workflow kiểm tra tuần tự
và tạo đúng một Local Draft/PR cho lần enrichment đó.

```text
Published Hub main
  + confirmed Domain
  + selected repositories/candidates/questions
        ↓ sequential bounded reconciliation
one Enrichment proposal → review → Accept → one PR to main
```

Local Draft hoặc repository còn nằm trong một Init/Refresh PR chưa merge không
được dùng làm Enrichment member. Git không có một clean base chung cho nhiều PR
độc lập; chờ chúng merge giữ dependency và review dễ hiểu.

## Run manifest

Trước execution, private run manifest bind:

- exact Published Hub commit;
- one primary Domain identity;
- exact selected Published Repository identities;
- exact relation/identity candidate và Question revisions;
- provider/account/region scope đã được user xác nhận khi cần;
- catalog, detector và provider-profile versions.

Selected Repository phải có primary `part-of` membership trong confirmed
Domain. Published concepts ở Domain khác có thể là read-only relation targets;
điều đó không biến repository hiện tại thành multi-Domain.

Membership có thể sửa ở preview. Sau khi execution bắt đầu, thêm/bỏ member cần
explicit cancel/reconfirm để output không âm thầm khác thứ user đã chọn.

## Sequential reconciliation

Mỗi candidate chạy cô lập và tuần tự:

1. load bounded Published summaries/evidence tại exact Hub commit;
2. compare endpoint identities và interaction evidence;
3. optionally verify exact candidate qua provider CLI read-only;
4. classify outcome;
5. persist a private deterministic checkpoint, không phải Hub knowledge.

Allowed outcomes:

- `confirmed` — đủ để propose identity/relation/question update;
- `rejected` — evidence chứng minh candidate không match;
- `unresolved` — thiếu quyền, thiếu scope hoặc evidence vẫn chưa đủ;
- `failed` — integrity, protocol hoặc state failure khiến attempt không đáng tin.

`unresolved` là một kết quả hợp lệ và giữ Question/limitation; nó không làm batch
fail chỉ vì knowledge chưa đầy đủ. `failed` làm run Incomplete.

## Atomic boundary

Atomic áp dụng cho publication, không yêu cầu mọi candidate phải được xác nhận:

- completed checkpoints được giữ khi một candidate khác failed;
- Incomplete staging chưa xuất hiện trong normal Hub query;
- retry chỉ chạy failed/stale candidates khi manifest và evidence digest còn
  khớp;
- final proposal chỉ tạo khi mọi selected member có trusted terminal outcome;
- một valid partial proposal có thể chứa confirmed changes cùng unresolved
  Questions/limitations;
- sau Accept không split proposal thành nhiều PR.

Muốn loại một failed candidate, user xác nhận membership mới rồi finalize/retry.
Hệ thống không tự bỏ item để biến failure thành success.

## Reconciliation outputs

Một proposal có thể:

- thêm external identity đã xác minh;
- thêm canonical cross-repository/cross-Domain relation;
- đóng, reopen hoặc bổ sung evidence cho Question theo phần 07;
- propose concept merge/redirect theo phần 06.05;
- ghi explicit rejected/unresolved outcome khi nó có review value.

Mọi thay đổi vẫn giữ source repository, source revision, evidence IDs, provider
observation time và limitations. Provider response dump không đi vào proposal.

## Publication dependency

Enrichment proposal là một Domain-scoped publication unit, không phải tập hợp
các per-Repository Init/Refresh units:

- base là exact Published `main` đã dùng cho run;
- source scope là nhiều selected Repository IDs;
- target là Hub `main` qua một PR;
- nếu remote `main` advance, MCP reconcile/revalidate cùng PR hoặc dừng conflict;
- MCP không tự merge, approve, force-push hoặc đổi membership.

Current proposal metadata và publisher chủ yếu bind một source Repository. Khi
implement, chúng cần một explicit `enrichment` mode với bounded repository set;
không overload một fake Repository ID hoặc tạo một PR cho mỗi repository.

## Không làm trong workflow này

- Không Ingest/Refresh source repository.
- Không clone repository hoặc dựng cross-repository Code Graph.
- Không đọc Local Draft/open PR làm knowledge baseline.
- Không scan provider account, service hoặc nhiều regions để tự tìm candidate.
- Không tự Accept/Publish chỉ vì verification thành công.

## Baseline impact

Đây là **Broad change**: reuse proposal/validation/Git lifecycle nhưng mở rộng
single-source proposal metadata, private checkpoints và publication unit. Không
cần service, database, queue hoặc parallel worker mới; sequential execution là
MVP boundary.

