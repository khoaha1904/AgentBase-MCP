# 12.04 — MVP capability boundary

> Status: Bounded source workflows implemented; release qualification is separate.

The [Product scope](../../product/00-scope-and-authority.md) owns outcomes and
non-goals. Implemented source behavior includes optional Hub-free installation,
bounded workspace Scan/discovery, exact-snapshot Ingest/Refresh, sequential Batch
Initial Ingest and separately approved AWS/SQS Enrichment. Schemas are provider
neutral; embedded knowledge promotes only at useful independent boundaries.

Hub profiles are isolated peers. Query uses synchronized Published knowledge;
private proposals provide material inspection before explicit Direct/PR Publish.
Questions/Guidance retain exact scope, evidence and revision. There is no Accept,
stacked publication, automatic Publish or merge. The bounded public abs CLI
handles status/connect/sync; authoring belongs to skills/MCP.

## Verification and evaluation

npm run verify is canonical deterministic source evidence. Artifact/release
qualification follows [Release CI](13-release-ci-requirements.md), not source-test
success alone. The owner-approved local measurement script is defined by
[qualification scope](03-benchmark-requirements.md); model answer evaluation
remains external. There is no application model benchmark or graph provider.

[Accepted limitations](05-accepted-limitations.md) and
[deferred capabilities](07-deferred-capabilities.md) own unsupported boundaries.
