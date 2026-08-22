# 08.03 — Freshness and broken sources

> Trạng thái: Repository warning report implemented; CI automation deferred.

## Freshness

Query computes exact age from `observed.at` and labels the value observed. Age
is context, not confidence, status or an action trigger. AgentBase defines no
global stale threshold, scheduler or automatic Refresh.

Ordinary Hub query does not probe Git/provider/source. It may report
`source-advanced` only when a newer authorized source revision is already known
from the current operation; otherwise source state is `not-checked`.

## Integrity failure versus current-path failure

A historical source has an integrity failure only when its normalized file
cannot be validated against the pinned observed revision/digest. That challenges
provenance and may propose a shared Question through review.

If the old path is valid at the observed revision but missing from the current
tree, historical provenance remains valid. Explicit current lookup returns
`current-path-unavailable`; Refresh may repair a moved path while preserving the
observed-value ID. Age, missing permission, network failure and source advance
prove neither condition.

Both outcomes preserve the snapshot. No ordinary read creates/resolves Question
state or rewrites provenance.

## Repository freshness report

The read-only Hub freshness action scans at most 512 Repository concepts from
one exact admitted commit. It returns canonical identity when available, title,
path, exact observed time, non-negative age and clean commit or dirty digest.
Missing or malformed observation metadata remains visible as `unknown`.

Unknown rows sort first, followed by observed rows from oldest to newest. The
report labels Published versus Local Draft and never probes source, writes Hub,
creates a Question or triggers Refresh.

## CI report

A future periodic Hub check may adapt this same projection to a Published Hub
checkout. The report is not knowledge authority, changes no concept and triggers
no Refresh. Its exact CI workflow remains separate 09/11 work.
