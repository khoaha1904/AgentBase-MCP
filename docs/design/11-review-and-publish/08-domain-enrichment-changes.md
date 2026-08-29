# 11.08 — Domain Enrichment publication changes

> Status: Explicit Enrichment proposal/Accept/pending/independent-main pull requests are implemented offline.

## Outcome

A confirmed Domain Enrichment run creates one atomic multi-repository proposal
and one pull request from exact Published `main`. It reuses the review/Accept/Git
lifecycle but does not masquerade as a Repository Refresh.

## Publication unit

- Input consists only of Published repositories/candidates/Questions at the exact Hub commit.
- Proposal mode is `enrichment` with one Domain and bounded Repository membership.
- Confirmed, rejected and unresolved outcomes reside in one review unit;
  unresolved retains a Question/Limitation and does not fail the batch.
- After Accept, do not split by repository or candidate.
- The pull request targets `main`; Local Draft/open Init/Refresh pull requests do not form the baseline.
- When remote `main` advances, reconcile/revalidate the same branch/pull request
  or stop on conflict; do not change membership silently.

Pull-request Scope must state the Domain, repository set, provider/account/region
scope, candidate/Question revisions and profile versions. Evidence includes only
normalized safe observations, not raw provider output or credential context.

## Implemented boundary

Proposal metadata uses an explicit `enrichment` mode, Domain, bounded Repository
set and manifest digest; it does not overload a fake Repository ID. After Accept,
it is always an independent publication unit targeting `main`. Real GitHub
publication still uses the existing MCP-managed Hub token and does not auto-merge.

Canonical execution/reconciliation belongs to Parts 06.03 and 09.07. Part 11
owns only the review/Accept/pull-request boundary.
