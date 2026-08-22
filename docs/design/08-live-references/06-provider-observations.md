# 08.06 — Provider observations

> Trạng thái: Technical boundary draft; provider adapter chưa implement.

Provider CLI values enter Hub only through confirmed Domain Enrichment and the
bounded verification profiles in Part 06.04. Initial Ingest, Refresh and normal
Hub query never invoke provider CLI.

Canonical ARN/name/account/region authority stays in Part 06
`external_identities`; it is not duplicated as observed values. MCP keeps only
allowlisted non-sensitive operational scalars useful to review, not raw stdout
or full provider responses. A provider observation source
binds provider, profile/operation version, confirmed account/project, required
region/location, exact native resource identity and observation time. Account,
region and ARN/name scope the evidence but are not value entries.

Provider-derived entries use role `provider`, the same
`agentbase.observed_values` bounds and human-readable view. Their source is a
normalized `provider-observation://<provider>/<source-scope-hash>` record admitted
from the proposal's bounded normalized observation. The small source record
persists in Hub as provenance; it contains no credential/profile path or raw
response. `source-scope-hash` is stable across observations and derives from
provider + profile family + authority + location + native identity. Multiple
values from one call share that source ID.

The source entry carries the minimum reviewable record:

```yaml
sources:
  - id: aws-queue-observation
    resource: provider-observation://aws/<source-scope-sha256>
    agentbase:
      provider_observation:
        profile_family: aws.sqs.get-queue-attributes
        profile_version: 1
        authority: "123456789012"
        location: ap-southeast-1
        native_identity: <queue-arn>
        evidence_digest: <sha256>
        observed_at: 2026-08-22T08:00:00Z
```

Each associated value uses exact provider state
`observed: { evidence_digest: <same-sha256>, at: <same-RFC3339> }`. Validator
requires the full normalized record and exact supported profile. Evidence digest
is SHA-256 of canonical JSON containing the persisted source metadata (excluding
the digest) plus sorted associated observed entry IDs/properties/roles/values;
another Hub reader can recompute it without private proposal state. Raw provider
response is discarded after proposal preparation.

Later Enrichment matches the existing stream by owner + property + role +
provider + profile family + authority + location + native identity, preserves
its `AB-OBS-*` ID and updates profile version, digest, time and value.

Access denied, missing region, account mismatch, timeout or unsupported CLI
returns limitation/unresolved candidate and creates no snapshot. Query does not
rerun provider CLI; a new value requires another reviewed Domain Enrichment
proposal.
