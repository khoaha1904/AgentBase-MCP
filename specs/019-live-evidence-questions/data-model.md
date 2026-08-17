# Data Model: Live Evidence and Governed Questions

## Live Claim Reference

Stored in a concept's open-world frontmatter under `agentbase.live_claims`:

- `id`: stable `AB-CLAIM-<slug>` identity, unique across the bundle
- `subject`: normalized concept identity described by the claim
- `property`: bounded semantic property such as `session.ttl`
- `role`: `documentation`, `implementation` or `configuration`
- `source_id`: exact ID of one entry in the same concept's `sources[]`
- `target.kind`: `symbol`, `function`, `config-field` or `text`
- `target.name`: human-readable bounded locator; never an engine-private symbol ID
- `observed.commit`: 40-hex Git commit or `null`
- `observed.dirty`: boolean
- `observed.dirty_digest`: SHA-256 digest when dirty, otherwise `null`

A clean source requires a commit and null dirty digest. A dirty source retains its
base commit when available and requires a dirty digest. The referenced source must
be a normalized `repository://.../path#Lx-Ly` resource. No field for the observed
scalar exists.

## Live Observation

Transient query output:

- `claim_id`, `role`, `subject`, `property`
- `status`: `resolved`, `unavailable`, `stale`, `indeterminate` or
  `repository-mismatch`
- `value`: optional current scalar/text representation only when resolved
- `resource`, `target`, current `commit`/`dirty_digest`
- `limitations`: bounded reasons that prevent stronger interpretation

Live observations are never written back to OKF or the question ledger.

## Governed Question

Private ledger record:

- `id`: deterministic 24-hex identity derived from local Hub, subject and property
- `revision`: positive integer used for stale-write rejection
- `status`: `pending` or `resolved`
- `subject`, `property`, `source_repository_id`
- `claim_ids`: sorted unique list of accepted live claim identities
- `claims`: reviewed role/source reference snapshots for inspection; never values
- `missing_evidence`: bounded sorted descriptions
- `created_at`, `updated_at`
- `history`: append-only declaration and answer events
- `resolution`: optional answer event and prepared guidance proposal ID

Equivalent pending declarations reuse the record and merge new claim IDs/evidence.
A later incomplete ingest does not remove prior fields or resolve the record.

## Question Declaration

Immutable proposal attachment containing subject/property, linked claim IDs and
missing evidence. Finalization verifies its claims exist in the proposed bundle,
shows the declarations in inspection and includes their normalized digest in the
proposal review digest. Acceptance verifies that reviewed digest before merging
it into the ledger. The private proposal attachment remains the recovery source:
question reads idempotently project an accepted attachment if a process stopped
after the Hub commit advanced but before the ledger write completed.

## Maintainer Answer

Append-only event:

- `answer`: non-empty bounded text
- `by`: explicit `human:<identity>`
- `at`: ISO 8601 timestamp
- `question_revision`: exact prior revision
- `guidance_proposal_id`: the immutable proposal created from this answer

An answer does not assert that documentation or implementation already matches.
Conflicting later answers at the exact current revision append history, create a
separate guidance proposal and reopen the question rather than overwriting an
earlier event.

## Maintainer Guidance Concept

One stable `guidance/<question-id>-r<question-revision>.md` concept with `generated.by` equal to the
answer's human identity, the answer timestamp, question/claim links under the
AgentBase extension and body sections `# Guidance` and `# Scope`. It is portable
only after normal proposal acceptance.
