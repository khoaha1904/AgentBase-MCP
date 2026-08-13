# Data Model: Repository Evidence and OKF v0.2 Bundle Proposal

These entities are the smallest model needed for the single-repository loop.
They do not define a Hub, universal ontology or full review taxonomy.

## Engine identity

- `provider`: fixed `codebase-memory-mcp`;
- `packageName`: fixed exact runtime dependency `codebase-memory-mcp`;
- `providerVersion`: fixed supported value `0.10.1`;
- `packageIntegrity`: accepted npm lockfile integrity;
- `executableSha256`: digest of the resolved package-private executable;
- `adapterVersion`: AgentBase adapter schema version;
- `invocationMode`: fixed `one-shot-cli`.

The package-private executable path is resolved internally and never enters OKF
or user configuration. Bootstrap state distinguishes `ready`, `recovered`,
`unsupported-platform`, `offline`, `integrity-failed` and `identity-failed`.
AgentBase never records or inspects a global executable path.

## Repository source state

- `repositoryId`: deterministic identity for one selected repository;
- `displayName`: human-readable repository name;
- `commit`: current Git commit when available;
- `dirty`: whether relevant authored source differs from that commit;
- `dirtyDigest`: deterministic digest of relevant status/content when dirty;
- `capturedAt`: evidence collection timestamp;
- `limitations`: source-discovery limitations.

`commit + dirtyDigest` identifies the analyzed working state. Dirty content is
allowed; a clean commit is not fabricated.

## Query evidence

- `queryId`: stable within the evidence bundle;
- `kind`: `architecture`, `search`, `trace` or `snippet`;
- `input`: provider-neutral bounded query parameters;
- `result`: normalized provider-neutral facts;
- `sourceReferences`: repository-relative paths and optional line spans;
- `completeness`: `complete` or `partial` for the requested scope;
- `limitations`: ordered safe diagnostics.

Provider-private graph rows, cache paths and absolute source roots do not cross
this boundary.

## Repository evidence bundle

- `formatVersion`;
- engine identity;
- repository source state;
- ordered query evidence records;
- `bundleDigest`: SHA-256 of deterministic normalized content excluding its own
  digest field;
- `generatedAt`.

This bundle is local, disposable input to one OKF proposal round. It is not an
OKF knowledge bundle and is not shared team knowledge.

## OKF knowledge bundle

- `root`: shared repository-relative directory `okf/`;
- `okfVersion`: fixed target `0.2`, declared only in the root `index.md`;
- `concepts`: normalized map from concept ID to concept document;
- optional reserved `index.md` files for progressive disclosure;
- optional reserved `log.md` files for chronological history;
- `treeDigest`: deterministic digest of ordered relative paths and exact bytes.

A knowledge bundle is the unit proposed and applied. Concept identity is a
normalized bundle-relative path without `.md`.

## Concept document

- `conceptId`: derived from bundle-relative path;
- `path`: normalized relative `.md` path, excluding reserved names;
- `frontmatter`: parsed YAML mapping;
- `type`: required non-empty producer-defined string;
- optional standard OKF fields such as `title`, `description`, `resource`,
  `tags`, `sources`, `generated`, `verified`, `status` and `stale_after`;
- `body`: Markdown following frontmatter;
- `links`: normal Markdown links resolved relative to the bundle;
- `unknownFields`: producer or third-party extension values preserved on
  round-trip.

AgentBase-generated concepts require explicit `status: draft`, a valid
`generated` actor/time and no newly invented `verified` event.

## Source entry and attribution

- `id`: stable key when body claims cite the source;
- `resource`: required source artifact or scope descriptor;
- optional `title`, `author`, `usage_count`, `last_modified` and
  `usage_window` signals.

Per-claim attribution uses a Markdown footnote label matching `sources[].id`.
Previous generated concept text cannot be inserted as an independent source.
Repository source code uses the AgentBase producer convention
`repository://<repository-id>/<percent-encoded-relative-path>#L<start>-L<end>`.
Repository IDs are URL-safe stable tokens; resources never contain an absolute
checkout root.

## Mutable and protected documents

A concept is mutable only when all of these are true:

- `generated.by` begins with `agentbase/`;
- `status` is explicitly `draft`;
- no `verified` event has an actor beginning with `human:`.

Every other concept is protected by default, including content with absent
ownership, a non-AgentBase producer, absent status (which means stable in OKF),
or human verification. Protected documents are preserved byte-for-byte during
automatic rebuild. Conflicting new evidence creates a separate draft or
high-impact open question rather than editing the protected concept.

When a mutable concept is modified, unknown frontmatter keys are preserved by
parsed-value equivalence. AgentBase does not promise preservation of YAML
comments, quoting style, anchors or key ordering on a document it owns and
modifies. Protected documents bypass serialization entirely.

## Maintainer guidance concept

A normal concept with:

- `type: Maintainer Guidance`;
- `generated.by: human:<id>`;
- `status: stable` when the maintainer intends it for consumption;
- a Markdown link to the affected concept or question;
- optional AgentBase extension `agentbase.directive`.

The type and extension are AgentBase conventions, not required Google OKF
fields. Other consumers remain conformant by preserving unknown fields.

## Defer directive extension

```yaml
agentbase:
  directive:
    id: AB-DIRECTIVE-<stable-id>
    action: defer
    subject: <concept-or-question-id>
```

The matching item stays suppressed until a maintainer removes the directive or
explicitly reopens it. The directive does not imply falsehood, rejection or
deletion. Automatic evidence-triggered reopening is deferred.

## Bundle proposal

- `proposalId`;
- `baseTreeDigest`: digest of current `okf/`, or empty-tree sentinel;
- `evidenceDigest`;
- `proposedBundlePath`: AgentBase-owned local directory;
- `proposedTreeDigest`;
- normalized entries classified `created`, `modified`, `preserved` or
  `deleted-agentbase-draft` or `prohibited-deletion`;
- proposal state: `prepared`, then `generated` after successful validation;
- separate base-conformance and AgentBase-producer-policy results plus warnings;
- bundle-level human-readable diff.

Preparation byte-copies current `okf/` to create the complete intended next
bundle, not a partial overlay. The host agent may write only inside that exact
proposal's `bundle/` subtree. Successful validation records the generated tree
digest; later edits invalidate that result. Preparation and review do not mutate
current `okf/`.

## Bundle switch and recovery manifest

- atomically created repository-local single-writer lock and operation owner;
- current shared path: `okf/`;
- same-filesystem staged sibling path with an AgentBase-owned unique name;
- same-filesystem backup sibling path with an AgentBase-owned unique name;
- current, next and backup tree digests;
- switch phase: `prepared`, `current-moved`, `next-active`, `finalized` or
  `recovery-required`;
- exact recovery action allowed for that phase.

Apply acquires the exclusive lock, validates first, materializes the staged
sibling, records the manifest, renames current to backup, renames next to
current, verifies the active digest and then finalizes. Startup recovery uses
only the manifest and exact owned paths. Tests inject interruption at each
declared process checkpoint; sudden power-loss durability is not claimed.

## State transitions

```text
absent/current OKF bundle
  -> prepared byte-copy proposal
  -> host-authored proposal bundle
  -> generated tree locked by successful validation + diff
  -> staged next bundle + recovery manifest
  -> explicitly applied current bundle

prepared/generated proposal
  -> stale or invalid (no shared mutation)
  -> regenerated proposal

interrupted switch
  -> deterministic restore previous
  -> or deterministic finish next
  -> never guessed partial success
```

## Invariants

- Every concept has parseable YAML frontmatter and non-empty `type`.
- Reserved files obey their OKF structures.
- Root `index.md` declares `okf_version: "0.2"`.
- Concept IDs equal normalized bundle-relative paths without suffix.
- Generated drafts identify their producer and do not invent verification.
- Source IDs are unique within a concept and claimed footnotes resolve.
- Unknown types/fields survive compatible round trips.
- Every non-AgentBase-draft concept byte remains unchanged during rebuild.
- Equivalent evidence normalization produces one evidence digest.
- Equivalent file bytes and paths produce one tree digest.
- Only an explicitly diffed mutable AgentBase draft may be deleted.
- State-changing operations never proceed without the exclusive repository lock.
- A failed or interrupted switch leaves a valid active bundle or an exact
  manifest-driven recovery path.
