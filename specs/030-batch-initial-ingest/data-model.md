# Data Model: Batch Initial Ingest

## Batch Manifest

- `id`, `revision`, `formatVersion`;
- exact Hub identity and `baseCommit`;
- confirmed Domain identity/title/evidence;
- ordered unique member IDs and authorized absolute roots;
- catalog/detector versions and manifest digest;
- state: `prepared | confirmed | running | incomplete | ready | finalized`.

Changing membership or confirmed input creates a new revision. Local roots are
private workflow state and never enter Hub Markdown or PR metadata.

## Batch Member

- stable member ID and order;
- canonical Repository ID and identity outcome;
- exact source commit/dirty digest;
- evidence/guidance/session/staging digests;
- state: `pending | running | complete | failed | invalidated`;
- failure/retry history and bounded limitations.

Completed output is reusable only when all bound digests remain exact.

## Batch Composition

- one base tree digest;
- ordered member diff digests;
- per-path ownership map;
- shared index additions with normalized unique targets;
- one coordinator-owned confirmed-Domain navigation projection;
- complete composed tree/diff digest and validation result.

Concept/Question paths have one authoring member. Shared index files may receive
disjoint append-only targets. The confirmed Domain preserves its non-navigation
content and derives navigation from exact member-owned targets; any other
concept overlap is rejected.

## Batch Proposal Scope

- mode `batch-new`;
- exact Domain and sorted/ordered Repository IDs;
- manifest ID/revision/digest;
- ordinary base/tree/diff/evidence/schema values;
- per-member summary for inspection and publication.

It is indivisible after Finalize and publishes as one independent unit to main.
