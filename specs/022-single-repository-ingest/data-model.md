# Data Model: Single-Repository Initial Ingest

## Repository Identity Hint Set

Read-only checkout facts used to resolve, never redefine, Hub identity.

- `displayName`
- normalized remote aliases
- Git root/lineage hints
- current commit or dirty digest
- optional immutable forge repository identifier when evidenced
- checkout limitations

## Repository Resolution

- `canonicalRepositoryId`
- outcome: `existing`, `new` or `ambiguous`
- matched strong hints and stored aliases
- unmatched/current aliases proposed for addition
- ambiguity candidates and reason

Transition:

```text
hints → existing strong match → reuse canonical ID
     → no match              → assign initial ID
     → multiple/fork match   → stop for user decision
```

## Domain Preflight

- proposed exact Domain identity/title
- match kind: `existing`, `new` or `ambiguous`
- supporting relative document paths/excerpts
- user-supplied assignment, if any
- mismatch warnings
- final confirmed Domain and owner-guidance evidence resource

No full investigation begins before the final confirmation.

## Evidence Observation

Common fields:

- stable observation ID within the run
- candidate ID
- exact relative path and line span or source symbol/config target
- evidence role: implementation, declaration/configuration or documentation
- bounded statement/semantic signal

Resource observation fields:

- source tool: `terraform` or `terragrunt`
- exact source-native resource/module type
- logical address
- optional declared dependency/region-alias hints

The source label must match the exact path. Terraform uses `.tf`/`.tf.json`;
Terragrunt uses `terragrunt.hcl`. Provider resources reached through Terragrunt
cite the referenced Terraform module rather than the orchestration file.

The caller does not supply provider, product or schema output fields.

## Candidate

- run-local candidate ID
- proposed role/name
- identity hint and identity-basis explanation
- independent query/link-value explanation
- supporting observation IDs
- optional released provider-neutral suggested type, explicitly supplied as
  evidence-bound agent intent rather than verified truth
- optional standalone promotion record for Interface/Resource: one enumerated
  boundary basis plus exact candidate-owned semantic observation IDs
- missing evidence/ambiguity

State:

```text
discovered → investigating → qualified → concept/relation/evidence update
                           ↘ unresolved → Question or limitation
                           ↘ no value   → discarded
```

Only qualified candidates enter schema guidance. Candidate state is not stored
in Hub and has no Published lifecycle.

## Guidance Recommendation

- candidate ID
- status: `exact`, `suggested`, `embedded`, `ambiguous` or `unsupported`
- proposed disposition: standalone concept or embedded knowledge
- parent candidate/identity when embedded
- promotion basis and exact supporting observation IDs
- provider-neutral schema type or bounded fallback
- matched/missing observation IDs
- technology metadata supported by evidence
- catalog version
- detector profile ID/version, when used
- provider profile ID/version, when used
- complete schema authoring guidance
- warnings and limitations

`exact` requires one deterministic structured mapping. `suggested` is a
reviewable semantic classification. `embedded` retains detected technology and
evidence in a parent without creating a concept. Technology detection does not
override promotion; conflicting promotion evidence is `ambiguous`.
Interface/Resource suggestion additionally requires a matching semantic role
and a compatible promotion record. A declaration or suggested type alone
returns no standalone schema.

## Embedded Knowledge

- run-local candidate ID and stable display name
- parent candidate/identity
- provider-neutral kind and concise role
- optional provider/product/source-tool/resource-type metadata
- exact source IDs

Embedded knowledge is rendered inside the parent Markdown body. It has no OKF
identity, standalone path, lifecycle or graph relationship. Refresh may later
propose promotion when cross-repository or independent operational evidence is
available; missing later evidence never deletes accepted knowledge implicitly.

## OKF Authoring Layers

- **Concept Schema** defines what belongs in one concept: semantic role,
  required fields, useful sections, evidence rules and allowed relations.
- **OKF Document Template** is the shared deterministic encoding for a valid
  OKF concept document and navigation file.
- **OKF Skeleton** is a concrete proposal file rendered from the selected
  schema, candidate, canonical Repository/Domain context and exact evidence.
  The agent enriches its knowledge body and relations; it does not recreate the
  lifecycle or provenance frontmatter. A suggested skeleton includes a visible
  limitation that its type remains subject to proposal review.

## Observed Snapshot

Optional child of an attributed claim observation:

- primitive/identifier value
- observed time
- source commit or dirty digest
- exact source ID/reference inherited from the claim
- explicit semantics: observed, not current

It is absent by default and invalid when it is not one scalar/single-line
identifier of at most 256 UTF-8 bytes, is secret-like, unnecessary or
unsupported by exact source. Proposal review is the final sensitivity guard.

## Initial Ingest Outcome

Successful variants:

- `no-change`
- `proposal-preview`, with `partial: true|false`

Both include repository/Domain identity, source revision, limitations and stage
diagnostics. Proposal preview additionally includes immutable proposal identity,
diff digest and bounded inspection.

Failure variant:

- `incomplete`, with failed stage, exact diagnostic and retry guidance

Incomplete output has no acceptable/queryable proposal. One validation repair
may transition back to `proposal-preview`; a second automatic repair is not
allowed.
