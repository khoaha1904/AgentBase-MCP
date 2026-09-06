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

## Changed-path accounting

Prepare freezes the exact bounded source-change result used by the authoring
session. Before Finalize, every returned path receives exactly one concise
outcome and reason:

- `updated` — an existing concept changed with exact evidence from the path;
- `new` — a new standalone concept was justified by exact evidence from the path;
- `embedded` — the evidence was retained inside a useful changed parent concept;
- `question` — the path exposed unresolved knowledge that remains visible; or
- `ignored` — the path has no useful shared-knowledge effect for the stated reason.

Materialized outcomes are checked against changed concept bytes and normalized
current-Repository source evidence. Missing, duplicate, extra or unsupported
outcomes fail Finalize while leaving the session repairable. Omitted-path counts
and source-diff limitations remain visible and mark the accounting partial; they
do not become a completeness claim.

## Pre-Finalize validation and structural reachability

When concept documents change, Refresh passes its prepared session ID to
changed-set validation before its one Finalize call. This lets the same authoring
boundary reject a reused source ID whose repository observation moved to a new
revision, instead of discovering that defect only at Finalize.

With no changed concept documents, skip changed-set validation: its input requires
at least one concept. Finalize still validates the normalized session bundle and
complete change accounting, including runtime-materialized observation or coverage
updates. Only Finalize determines `no_change`; inspect a proposal only when one is
returned. Do not invent edits or submit unchanged concepts to satisfy the validator.

A new known standalone concept must have an evidenced structural path through
`part-of`, `implemented-in` or `declared-by` to a Repository or Domain in the
proposal. If no such ownership or containment is supported, keep the knowledge
embedded or record the limitation rather than creating an isolated graph node.
This is a knowledge-connectivity gate, not a requirement to create more concepts
or diagrams.

## Build-up semantics

- Partial but valid knowledge is expanded across multiple Refresh runs.
- Unchanged source can still create a new proposal when a known gap or discovery
  pass finds useful evidenced knowledge.
- No useful change is a successful no-op, not a failure.
- A non-empty accounted source delta still proposes its Repository observation
  checkpoint even when every returned path is `question` or `ignored`; the
  reviewer must see that decision before the checkpoint can be accepted.
- A concept missing from one discovery does not prove that an old concept
  disappeared. An exact Git/source diff can create an evidence-backed removal
  candidate but does not materialize deletion outside proposal review.

## Explicit Coverage Refresh

The user can request `coverage` scope to rerun broad discovery, for example after
a skill/model/profile upgrade or when repository knowledge is clearly
incomplete. Coverage means a broad bounded investigation, not reading every
file or requiring 100% completeness. It reuses the same public
`agentbase-refresh` skill and MCP tools.

A Coverage Refresh checks the five provider-neutral discovery lanes, reuses a
fresh graph cache where possible and resolves retained findings to exact source.
It retains source authority, candidate gates, one guidance call, validation and
the one-repair budget from normal Refresh. It may add knowledge when source is
unchanged.

`delta` remains the default. Coverage is never selected automatically merely
because knowledge is old or sparse, and it does not silently reinitialize a
Published Repository. Coverage orchestration stays in the packaged Refresh
skill; it does not generalize the Initial-Ingest Seed/Receipt materializer or
add a semantic critic.

## Coverage debt

Receipt-bound Initial Ingest also seeds this existing debt from its retained
discovery limitations. Later Prepare exposes the unverified lanes and sampled
or uninspected source scope as known gaps, even when source has not changed.
Legacy Published repositories are not retroactively classified. A Coverage
account must consider those gaps; no-new-output alone proves no completeness.

When the bounded source delta omits paths or has derivation limitations, the
Repository records one compact `agentbase.repository.refresh_coverage` debt.
An explicit Coverage Refresh also records debt when its bounded investigation
is partial or finds knowledge that requires a confirming pass. Future Refresh
Prepare returns this state as a known gap. A non-partial Coverage Refresh clears
it through an ordinary reviewed proposal only when it adds no knowledge.
Ordinary complete Delta Refresh preserves existing debt because it does not
prove the previously missed surface was reviewed.

Coverage debt is current recovery state, not an activity log or completeness
score. It contains a bounded omitted count, current-campaign Coverage pass
count, limitations and observation time; it does not retain source content,
model reports or a history of runs.

## Coverage convergence

Do not run three passes automatically. Stop at the first non-partial Coverage
pass that adds no knowledge and reports no limitation. When a pass adds
knowledge or remains partial, review its proposal before requesting the next
pass. Coverage debt stores only a bounded pass count for the current campaign.
After three non-converged passes, stop Coverage, keep the remaining debt visible
for owner review and use Delta for ordinary changes. The cap bounds cost; it is
not statistical proof or a completeness claim.

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
