# 09.02 — Refresh and change detection

> Status: Single-repository Refresh is implemented and qualified.

## Default Refresh focus

Refresh neither scans the full repository nor looks only at changed files:

1. **Changed:** source paths/symbols changed since the observed revision;
2. **Known gaps:** Questions, limitations, broken/aging references and ambiguous
   matches related to the repository;
3. **Small discovery pass:** a bounded architecture overview to find important
   candidates previously missed.

Priority follows that order. The discovery pass uses the graph cache when fresh
and does not open an unbounded source scan.

## Build-up semantics

- Partial but valid knowledge is expanded across multiple Refresh runs.
- Unchanged source can still create a new proposal when a known gap or discovery
  pass finds useful evidenced knowledge.
- No useful change is a successful no-op, not a failure.
- A concept missing from one discovery does not prove that an old concept
  disappeared. An exact Git/source diff can create an evidence-backed removal
  candidate but does not materialize deletion outside proposal review.

## Explicit full refresh

The user can request a full refresh to rerun broad discovery, for example after a
skill/profile upgrade or when repository knowledge is clearly incomplete. Full
means a broad bounded investigation, not reading every file or requiring 100% completeness.

A full refresh retains source authority, candidate gates, one guidance call,
validation and the one-repair budget from normal Refresh.

This is the approved future **Full Discovery Refresh**, not implemented by
Capability 046. Capability 046 only brings exact remote-default SourceSnapshot
authority into normal Refresh and broad discovery into new Init; it does not
silently reinitialize a Published repository. A qualification Hub can
intentionally reset/reingest disposable data to measure the new Init.

## Reconciliation

Refresh changes only the current repository's contribution and retains foreign-source
evidence/protected bytes. Changed source can add/update evidence. Absence without
evidence creates only a finding/Question; exact deletion/rename/history evidence
passes through the reconciliation rules in Section 09.06.

## Freshness output

A successful Refresh updates the observed revision/time for the processed
repository contribution. Query presents age/revision; it does not trigger Refresh
automatically. Partial coverage is not recorded as a full-repository freshness guarantee.

## Qualification note

Refresh V2/V3 must read the exact Git diff of every changed path before gaps and
discovery. Two Terra runs on the ECS fixture both update `/status` to `/health`
in the server route and Terraform target groups, changing only Interface knowledge
and the Repository observation. The old README still stating `/status` is
retained as a limitation; the model does not choose one source and erase the conflict.
