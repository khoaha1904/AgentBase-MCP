# 09.05 — Incomplete runs and retry

> Status: Single-run and Batch Initial Ingest checkpoints/retry are implemented;
> Batch Refresh deferred.

## Partial and Incomplete

- **Partial knowledge:** a bounded run succeeds with a valid proposal but makes no
  commitment to full repository coverage. This is normal successful output.
- **Incomplete run:** a process, integrity or validation failure makes output
  unsafe to materialize. It cannot be queried, Accepted or Published.

## Batch manifest

A local batch run retains a private manifest with confirmed membership, the Hub
base and one entry per repository:

```text
pending → running → complete
                  ↘ failed
```

A complete entry binds the canonical Repository ID, exact source revision/dirty
digest, evidence digest and completed staging digest. Raw graph/candidate context
does not need durable recovery.

Capability 046 retains the Seed within the connection and accepts the Inventory
once to freeze an immutable Receipt. Prepare atomically creates a persisted
authoring session; an exact retry returns the same session ID, while mismatched
input is rejected. Raw graph/Inventory needs no durable checkpoint.

## Retry

- Retry reruns the failed repository, not completed siblings.
- Completed staging is reused only while the exact source identity/digest still matches.
- A changed source invalidates and reruns only that repository.
- An advancing remote default branch only adds `source-advanced`; the pinned exact
  snapshot remains valid. Only a changed, missing or inaccessible snapshot, or
  loss of authority, invalidates it.
- For Init, a Hub base advance before Finalize retains unchanged source/Seed/final
  Inventory, rematches identity, issues a new Receipt and creates a replacement
  session; a session bound to the old base cannot continue. Normal Refresh has no
  Receipt: it reuses source/change analysis and reruns prepare/guidance on the new
  base. Publication reconciliation applies after Finalize. Discovery reruns only
  when the source snapshot changes.
- Retry does not create duplicate candidates/concepts because it replaces the
  repository checkpoint under the same batch membership instead of appending blindly.

## Cancellation and cleanup

The user can cancel an Incomplete batch and delete private staging/cache receipts
belonging to that run. Cleanup touches only validated marker-owned private paths;
accepted Hub commits, external tool caches and the source repository are
not modified. Cleanup failure is reported clearly; the run is not assumed gone.

## Bounds

Each attempt retains the one-repair limit. A manual retry is a new attempt with a
visible history/reason, not a hidden Agent loop. A Batch finalizes only when every
confirmed member is complete or the user explicitly confirms new membership and
then reruns/finalizes.
