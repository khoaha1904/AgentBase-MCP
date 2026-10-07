# 09.03 — Batch processing

> Status: Sequential Batch Initial Ingest implemented; Batch Refresh deferred.

Prepare receives 2-32 explicit roots and one proposed Domain. Read bounded
member documents, show identity/evidence/warnings and confirm all members before
work. Source snapshots are exact remote default commits; dirty/feature checkouts
use private snapshots without checkout/stash/ambient SSH. Each member owns its
Seed/Receipt/evidence and private bundle.

Process sequentially in manifest order. A member-local failure retains completed
siblings and permits the next only after clean source closure. Shared authority,
uncertain cleanup or integrity failures stop the batch. Retry only named failed
members. Membership changes create a complete replacement revision; re-author
invalidated/dangling work and never silently discard contributions.

Source-name hints compare authorized snapshots with both evidence chains; they
neither prove interaction nor authorize provider calls. Verify before ordinary
relationship authoring. Ambiguous names remain Questions. AWS/SQS Enrichment is
separately approved after Published knowledge exists.

Record member checkpoints rather than ordinary Finalize. Every current member
must complete before one atomic batch proposal. Inspect per-repo revisions,
coverage, Questions and omissions, then obtain separate exact Direct/PR Publish
confirmation. No Accept step, split publication, automatic member omission or
parallel agent work. [Runtime requirements](09-runtime-requirements.md) own
manifest revisions, bounds and recovery; [publication](../11-review-and-publish/12-direct-publication-requirements.md)
owns exact sharing authority.
