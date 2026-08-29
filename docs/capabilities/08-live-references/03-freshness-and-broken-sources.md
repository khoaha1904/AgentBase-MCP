# 08.03 — Freshness and broken sources

> Status: Repository warning projection and read-only Hub CI are implemented;
> ordinary answer presentation belongs to Part 10.

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

Unknown rows sort first, followed by observed rows from oldest to newest. CI
runs this projection on the exact Published checkout. Local Draft freshness is
available only to proposal inspection, not ordinary query. The projection never
probes source, writes Hub, creates a Question or triggers Refresh.

## CI report

Hub CI writes warning-only freshness context to the ephemeral GitHub Actions
Summary. It creates no persisted report file, never changes exit status because
of age, changes no concept and triggers no Refresh. Syntax, integrity and
sensitive-value failures remain separate blocking checks owned by Part 11.
