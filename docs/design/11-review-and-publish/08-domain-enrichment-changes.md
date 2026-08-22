# 11.08 — Domain Enrichment publication changes

> Trạng thái: Explicit Enrichment proposal/Accept/pending/independent-main PR đã implement offline.

## Outcome

Một confirmed Domain Enrichment run tạo một atomic multi-repository proposal và
một PR từ exact Published `main`. Nó reuse review/Accept/Git lifecycle nhưng
không giả làm Repository Refresh.

## Publication unit

- Input chỉ là Published repositories/candidates/Questions tại exact Hub commit.
- Proposal mode là `enrichment` với one Domain và bounded Repository membership.
- Confirmed, rejected và unresolved outcomes cùng nằm trong một review unit;
  unresolved giữ Question/Limitation và không làm batch fail.
- Sau Accept không split theo repository hoặc candidate.
- PR target `main`; Local Draft/open Init/Refresh PR không làm baseline.
- Remote `main` advance thì reconcile/revalidate cùng branch/PR hoặc dừng
  conflict; không đổi membership âm thầm.

PR Scope phải ghi Domain, repository set, provider/account/region scope,
candidate/Question revisions và profile versions. Evidence chỉ gồm normalized
safe observations, không raw provider output hay credential context.

## Implemented boundary

Proposal metadata dùng explicit `enrichment` mode, Domain, bounded Repository
set và manifest digest; không overload fake Repository ID. Sau Accept nó luôn
là một independent publication unit target `main`. Real GitHub publication vẫn
đi qua existing MCP-managed Hub token và không auto-merge.

Canonical execution/reconciliation nằm ở Parts 06.03 và 09.07. Part 11 chỉ sở
hữu review/Accept/PR boundary.
