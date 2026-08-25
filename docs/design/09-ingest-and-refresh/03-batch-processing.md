# 09.03 — Batch processing

> Trạng thái: Batch Initial Ingest implemented offline; Batch Refresh deferred.

## Input và confirmation

Batch command nhận explicit repository roots và một proposed Domain. Skill đọc
bounded README/docs của từng repo, cảnh báo outlier và hỏi xác nhận Domain một
lần cho batch thay vì lặp lại cùng câu hỏi.

## Execution

Repository được xử lý tuần tự:

```text
preflight batch
  → repo A isolated run
  → repo B isolated run
  → repo C isolated run
  → batch review output
```

- Mỗi repo có source identity, graph namespace, candidates, evidence và outcome
  riêng.
- Agent context không trộn raw source/graph của nhiều repo.
- Repository failure không rollback completed repository staging.
- Recoverable member-local failure tiếp tục sang sibling sau khi cleanup được
  xác nhận; uncertain cleanup/process/shared authority failure dừng cả Batch.
- Cross-repository discovery/provider verification không chạy trong batch
  Ingest; Domain Enrichment làm sau.

Capability 046 Preflight resolves each member's exact remote default commit on
the active Hub host before Discover. A clean exact-matching checkout may be
reused; feature/dirty/different revisions use an AgentBase-private mirror and
detached worktree. Batch never checkout/stash/restore user worktrees or use SSH/
ambient Git credentials. Each member builds/reuses a graph only after source
selection and owns its own Seed/Receipt.

## Vì sao chưa parallel

Parallel graph/Agent runs tăng process/account load và tạo thêm Hub base/rebase
coordination. Version đầu ưu tiên deterministic ordering và recovery. Chỉ cân
nhắc parallel discovery sau khi benchmark chứng minh sequential là bottleneck;
authoring/finalization vẫn phải serialize.

## Atomic batch output

User xác nhận membership trước khi chạy. Một batch tạo đúng một mutable
workspace, một atomic proposal, một Accept và một PR:

```text
confirmed repos 1, 2, 3
       ↓ sequential isolated work
one batch workspace
       ↓ validation/review
one proposal → one Accept → one PR
```

- Membership có thể sửa ở preview trước khi execution/finalization; sau khi
  confirmed run bắt đầu, thay membership cần explicit cancellation/restart hoặc
  failure decision.
- Muốn repo 1+3 publish riêng và giữ repo 2 thì tạo Batch A `[1,3]` và Batch B
  `[2]` từ đầu.
- Knowledge items vẫn giữ repository-specific evidence/ownership bên trong
  batch; atomic chỉ là publication boundary.

## Failure membership

Repository failure làm batch Incomplete; completed repository staging được giữ
và later siblings có thể vẫn hoàn thành.
User retry repository lỗi hoặc xác nhận loại nó và finalize một batch membership
mới. Khi loại một repo khỏi draft đã có, AI bỏ attributable contributions, sửa
hard dangling dependencies hoặc hỏi user nếu meaning mơ hồ, rồi MCP Finalize
deterministic trên toàn membership còn lại. Hệ thống không âm thầm bỏ repo và
không publish partial membership.

Batch không split sau Accept, không reorder item thành nhiều PR và không
auto-Accept. Thiết kế này giữ proposal/change set làm publication unit như phần
05/11 đã chốt.
