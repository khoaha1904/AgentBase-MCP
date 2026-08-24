# 11.04 — Git and PR workflow

> Trạng thái: Implemented for knowledge publication and dedicated Hub Initialization PRs.

## Outcome

MCP biến explicit accepted proposal IDs thành dependency-safe Hub PRs bằng
dedicated Hub token. Local accepted ancestry chỉ là storage order; publication
base được tính theo Repository dependency và exact Published target branch.

## Entry contract

- User/Agent gọi `submit_hub_okf_proposals` với non-empty exact proposal IDs.
- Proposal phải là accepted Local Draft trong admitted pending ancestry.
- MCP fetch/admit exact remote repository, configured target branch, proposal commit/digest và
  existing branch/PR identity trước mutation.
- Calling Agent không nhận token và không được thay bằng `gh`, ambient Git
  credential hoặc publisher khác.

## Publication units

### Independent Repository Init

Mỗi Init của Repository khác nhau replay exact proposal contribution trên cùng
Published target, dùng branch và PR riêng:

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

### Empty-remote bootstrap

Explicit bootstrap là ngoại lệ direct-write duy nhất. Nó tạo target branch của
một exact empty user-created remote với complete released README + root
`index.md` + CI baseline, không replay knowledge proposal. Sau admission, mọi
Init/Refresh/Batch/Enrichment knowledge đều dùng normal PR units. Existing Hub
support repair dùng Initialization PR, không direct write.

## Exact replay and shared indexes

MCP không push local `main` nguyên khối. Nó replay exact accepted proposal patch
trên publication base của unit, vì local tree có thể chứa draft của repository
khác.

Local accepted ancestry always uses internal `main`; remote publication targets
the exact branch stored by the active Hub profile. No workflow substitutes the
literal branch `main` for that configured target.

Append-only shared `index.md` chỉ mang navigation lines do proposal chọn thêm.
Khi Published target đã thêm navigation tương thích, MCP có thể union các exact
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

## Reconciliation when Published target advances

1. fetch exact configured remote target;
2. recognize proposals đã merge bằng proposal/patch identity;
3. xử lý remaining branches tuần tự;
4. merge new admitted base vào isolated branch candidate;
5. auto-resolve chỉ safe append-only index conflicts;
6. validate candidate rồi mới update cùng remote branch/PR;
7. conflict khác dừng trước push và giữ local/open PR state.

Không chạy song song vì tuần tự đơn giản hơn, giữ base rõ và tránh tự tạo
conflict coordination.

The phrase Published base means the dedicated last-successfully-admitted ref,
not `origin/<target>`. Fetch updates a private candidate ref. Only a validated
successful synchronization advances the Published ref; conflict leaves the
Published ref and every Local Draft unchanged.

## Failure and retry

- Failure trước branch push không tạo PR.
- Multi-unit submit có thể hoàn thành vài independent PR rồi dừng; receipt giữ
  completed units và retry tiếp phần còn lại, không rollback PR đã tạo.
- Network/permission failure giữ Local Draft và yêu cầu retry/credential repair.
- Existing remote branch/PR drift không bị overwrite.
- MCP never mutates the configured remote target directly after bootstrap;
  maintainer merge remains the publication gate.

## Hub Initialization PR

For a non-empty existing Hub, support initialization is a separate reviewed lifecycle, not an OKF
proposal. Preview fetches the exact configured remote target without replaying Local Drafts,
preserves an existing README and skips exact current CI. It derives only the
missing README and/or full released CI bundle, then binds their deterministic
digest. Explicit initialize may create or recover only
`agentbase/hub-init-<digest>` with that exact support-file diff. Any extra file,
changed base, ambiguous PR or byte drift stops. The same dedicated Hub token is
used internally; the caller cannot provide a token, branch name or file bytes.
The standard README is human onboarding only; canonical knowledge navigation
remains in `index.md`. Exact-empty bootstrap uses the same released support
bytes directly only because no target branch exists for a PR.

## Current implementation gap

Core workflow và deterministic PR summary đã implement. Batch Ingest và Domain
Enrichment publication units vẫn phụ thuộc capability tương ứng. Visual HTML
review và explicit lifecycle presentation thuộc các phần 11.02/11.05, không làm
Git transport phức tạp hơn.
