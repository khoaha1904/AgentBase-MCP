# Data Model: Domain Enrichment

## Enrichment Manifest

- `formatVersion`: exact private-state format.
- `id`, `revision`: deterministic manifest identity and positive revision.
- `baseCommit`: exact admitted remote Published Hub `main` commit; local pending
  accepted commits are not visible to the manifest.
- `domainId`: one confirmed Domain identity.
- `repositoryIds`: sorted unique Published Repository IDs, 1..32.
- `candidates`: sorted exact candidate IDs and evidence digests, 1..64.
- `questions`: exact Question IDs and revisions, up to 64.
- `providerScope`: `aws`, expected 12-digit account and sorted confirmed regions.
- `profileVersions`: exact released verification profiles.
- `createdAt`: run time; excluded from semantic candidate matching.

The manifest is private, immutable for one revision and contains no credential
or local profile data. Membership revision creates a new revision/digest.

## Enrichment Candidate

- stable candidate ID and kind: `identity | relation | question`;
- exact source concept, optional target concept and canonical predicate;
- identity hints with owned evidence references;
- interaction evidence references independent of identity hints;
- required account/region/resource type and released profile;
- Question ID/revision when governed uncertainty already exists.

Name-only hints are retained but cannot become a strong identity key.

## Provider Observation

- provider/profile/operation version;
- confirmed authority and explicit location;
- candidate ID and exact native identity;
- allowlisted normalized fields only;
- observation time and canonical SHA-256 evidence digest;
- limitations when the outcome is safely degraded.

Raw stdout/stderr, environment, credential/profile paths and secret-like values
are never fields. One provider source may back several small observed values.

## Candidate Outcome

State is exactly one of:

```text
selected → running → confirmed | rejected | unresolved
                   ↘ failed ──explicit retry──→ running
```

- `confirmed`: trusted evidence supports the bounded factual result.
- `rejected`: trusted evidence disproves the proposed match.
- `unresolved`: access/scope/evidence is insufficient; valid terminal outcome.
- `failed`: protocol, timeout, integrity or unsafe-output failure; non-terminal
  for finalization until retry or a new manifest revision excludes it.

Each outcome binds manifest revision, candidate evidence digest, attempt number,
profile version and optional normalized observation digest.

## Enrichment Decision

- tier: `automatic | recommended | manual`;
- exact Question ID/revision when applicable;
- candidate and evidence digests;
- concrete options and one optional recommended option;
- selected option/answer and `human:*` attribution, or `defer`.

Automatic factual outcomes never create human attribution. Unselected
recommendations are not persisted as Guidance.

## External Identity Entry

Portable concept metadata:

- `provider`, `identity_type`, normalized `value`;
- `service`, `resource_type`;
- exact `scope` (`account_id`, `region` for regional AWS resources);
- non-empty evidence source IDs and provider observation time.

The strong AWS ARN key is provider + identity type + normalized ARN; parsed
account/region/service must agree with the entry scope.

## Enrichment Proposal Scope

- mode `enrichment`;
- exact Domain ID and sorted Repository IDs;
- exact manifest revision/digest and provider profile versions;
- normal proposal base/tree/diff/evidence digests and phase;
- candidate outcome and Question revision summary for inspection/PR review.

It is one immutable review unit based on Published `main`. It does not use a
synthetic source Repository and cannot be split after Accept.

## Invariants

- Every selected Repository is Published and directly part of the confirmed
  Domain at `baseCommit`.
- Every regional provider call has one confirmed region; CLI defaults never
  fill missing knowledge.
- Same queue name in another account/region is a distinct deployed identity.
- Identity match alone cannot create an interaction relation.
- All selected items have trusted terminal outcomes before finalization.
- Accepted state remains unchanged until ordinary Accept.
- Manifest/evidence/Question/base drift invalidates affected outcomes before
  proposal creation.
