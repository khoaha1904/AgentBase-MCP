# 11.04 — Git and PR workflow

> Trạng thái: Implemented for knowledge publication and dedicated Hub-CI upgrade PRs.

## Outcome

MCP biến explicit accepted proposal IDs thành dependency-safe Hub PRs bằng
dedicated Hub token. Local accepted ancestry chỉ là storage order; publication
base được tính theo Repository dependency và exact Published `main`.

## Entry contract

- User/Agent gọi `submit_hub_okf_proposals` với non-empty exact proposal IDs.
- Proposal phải là accepted Local Draft trong admitted pending ancestry.
- MCP fetch/admit exact remote repository, `main`, proposal commit/digest và
  existing branch/PR identity trước mutation.
- Calling Agent không nhận token và không được thay bằng `gh`, ambient Git
  credential hoặc publisher khác.

## Publication units

### Independent Repository Init

Mỗi Init của Repository khác nhau replay exact proposal contribution trên cùng
Published `main`, dùng branch và PR riêng:

```text
main ── PR Init A
  └── PR Init B
```

Hai PR có thể cùng mở dù chưa merge. Local commit order A → B không làm B phụ
thuộc A và bytes của A không được leak vào PR B.

### Same-Repository Init/Refresh

Proposal cùng Repository tạo exact stack:

```text
main ← Init branch ← Refresh branch ← next Refresh branch
```

Mỗi PR chỉ chứa delta của proposal đó. Khi predecessor đã merge, MCP retarget
proposal kế tiếp về `main` trong explicit reconciliation; PR identity được giữ.

### First bootstrap

First bootstrap là ngoại lệ duy nhất có thể publish nhiều initial knowledge
commits thành một batch PR, vì đó là một transaction tạo remote Hub authority.

## Exact replay and shared indexes

MCP không push local `main` nguyên khối. Nó replay exact accepted proposal patch
trên publication base của unit, vì local tree có thể chứa draft của repository
khác.

Append-only shared `index.md` chỉ mang navigation lines do proposal chọn thêm.
Khi Published `main` đã thêm navigation tương thích, MCP có thể union các exact
unique append-only lines với cùng heading. Conflict khác, heading drift hoặc
non-navigation bytes phải dừng trước push; MCP không đoán merge result.

## Branch and PR behavior

- Branch identity derive deterministic từ proposal/publication identity.
- Retry reuse exact matching branch và open PR; multiple/mismatched candidates
  fail closed.
- New PR body derive từ immutable accepted proposal, inspection và Git metadata:
  Purpose, Scope, Changes, Uncertainty, Evidence/Validation, Reviewer Action.
- Missing optional inspection detail được ghi `unavailable`; model không viết
  narrative mới lúc publish.
- MCP có thể push/update chính branch do nó quản lý và retarget base khi
  predecessor đã Published.
- MCP không force-push, merge, approve, close PR, delete branch hoặc sửa repository
  settings.

## Reconciliation when Published main advances

1. fetch exact remote `main`;
2. recognize proposals đã merge bằng proposal/patch identity;
3. xử lý remaining branches tuần tự;
4. merge new admitted base vào isolated branch candidate;
5. auto-resolve chỉ safe append-only index conflicts;
6. validate candidate rồi mới update cùng remote branch/PR;
7. conflict khác dừng trước push và giữ local/open PR state.

Không chạy song song vì tuần tự đơn giản hơn, giữ base rõ và tránh tự tạo
conflict coordination.

## Failure and retry

- Failure trước branch push không tạo PR.
- Multi-unit submit có thể hoàn thành vài independent PR rồi dừng; receipt giữ
  completed units và retry tiếp phần còn lại, không rollback PR đã tạo.
- Network/permission failure giữ Local Draft và yêu cầu retry/credential repair.
- Existing remote branch/PR drift không bị overwrite.
- MCP never mutates remote `main`; maintainer merge remains the publication gate.

## Hub-CI upgrade PR

CI installation is a separate reviewed lifecycle, not an OKF proposal. Preview
binds exact remote `main` and deterministic CI-bundle digest. Explicit submit may
create or recover only `agentbase/hub-ci-<digest>` whose sole diff is the exact
workflow, standalone validator and version/checksum manifest. Any extra file,
changed base, ambiguous PR or byte drift stops. The same dedicated Hub token is
used internally; the caller cannot provide a token, branch name or bundle bytes.

## Current implementation gap

Core workflow và deterministic PR summary đã implement. Batch Ingest và Domain
Enrichment publication units vẫn phụ thuộc capability tương ứng. Visual HTML
review và explicit lifecycle presentation thuộc các phần 11.02/11.05, không làm
Git transport phức tạp hơn.
