# 05.04 — Source references

> Status: Technical design draft.

## Canonical reference

Repository evidence continues to use:

```text
repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>
```

Observed values may share the file-level form without a line fragment. A line
span remains optional review evidence at the observed revision, not a durable
locator.

A reference contains no absolute checkout root, cache path, credential or raw
provider response. Every authored/retained source entry binds the exact observed
repository revision; proposal metadata/evidence bundles also bind the overall
source snapshot, engine identity and evidence-round limitation. Refresh must not
relabel older retained claims with a new revision merely because the Repository
advanced.

Provider-derived snapshots use the separately validated bounded
`provider-observation://` source from Part 08.06; they never masquerade as a
Repository source or retain a raw provider response.

## Rules

- A stable Source ID is kept in the concept and every attributed claim points to
  it.
- The path is relative, normalized and inside the authorized repository.
- A line range is an evidence location, not durable symbol identity.
- A changing value with query value uses the observed-value contract in section
  08. A small snapshot binds exact revision/time and is not timeless prose or
  current truth.
- Hub claims/provenance remain readable without source access; resolving a
  current value returns a clearly degraded result.

## Reuse

Keep `RepositoryEvidenceBundle`, `repository://` resources, source-integrity
checks and the observed-value contract. Section 05 adds no source parser, graph
database or remote clone.
