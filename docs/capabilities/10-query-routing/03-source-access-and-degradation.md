# 10.03 — Source access and degradation

> Status: Local host-source boundary accepted; remote reading is deferred.

Hub access permits the whole Published Hub, without Domain/field ACL. A
repository:// locator gives provenance, not source/provider authority. Source
reads require a separately authorized local root and matching Repository ID;
relative paths remain inside it without symlink escape. No graph/indexing API
or implicit workspace scan is shipped.

## Access and resolution states

| Access | Meaning |
| --- | --- |
| not-checked | Snapshot-only answer; no credential/source probe. |
| available | Exact authorized local identity/path is readable. |
| unavailable | Missing repository/path, mismatched binding or unavailable reader. |
| unauthorized | Reserved for a future remote reader's permission denial. |

Available access does not establish a value: report resolved, ambiguous, missing
or redacted separately. Keep bounded reasons such as repository-not-local,
binding-mismatch, path-missing, source-unavailable or unsafe-value; omit machine
paths, credentials and raw provider responses.

## Failure and safety

A sufficient snapshot stops. Current verification keeps source attribution
separate; changed revisions during a read are indeterminate. Missing paths do
not trigger moved-symbol recovery. Secret paths are not read. Unsafe current
values are redacted without erasing safe Hub evidence; an invalid Hub layer is
never replaced with source labeled as Published knowledge.

A non-local reference remains unavailable. Do not clone, invoke GitHub/gh or
repurpose publication transport. Provider reads require explicit Enrichment.
No access failure creates a proposal or Question. A future remote reader needs
its own approved bounded identity/path/revision and credential-adapter contract.
See [source selection](01-source-selection.md) and [runtime requirements](07-runtime-requirements.md).
