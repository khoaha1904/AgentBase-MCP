# Data Model: Local-First AgentBase Hub

## LocalHubIdentity

- canonical local root
- exact configured remote repository and URL
- remote target branch (`main` for the corrected product)
- admitted remote base commit
- local active `main` commit
- schema/catalog version

Validation: paths are absolute owner-private non-symlink paths; remote identity
matches configuration; local active history descends from the admitted base or
is covered by an active synchronization transaction.

## LocalProposal

- proposal ID
- mode (`new` or `refresh`)
- subject identity and canonical subject path
- source repository identity and evidence digest
- selected concrete schema IDs and catalog version
- parent commit
- accepted commit
- proposed tree and diff digests
- created/accepted time
- publication state (`pending`, `publishing`, `published`, `conflict`)

The accepted commit carries portable proposal trailers. Private recovery state
may duplicate admitted fields but cannot override Git ancestry or content.

## PendingProposalSet

- exact admitted remote base
- ordered first-parent proposal list
- local active head
- dependency-safe selectable prefixes

The pending set is derived, not independently edited. A proposal whose parent
is another pending proposal depends on that ancestor for publication ordering.

## Publication

- publication ID
- selected proposal IDs and commits in order
- remote base
- deterministic branch
- branch head commit
- phase (`prepared`, `pushed`, `pr-opened`, `merged-recognized`)
- pull-request receipt

Only one publication transaction may mutate refs at a time. Failure after push
reuses the exact branch head.

## SynchronizationTransaction

- transaction ID and phase
- original local-main ref
- fetched remote-main ref
- recognized published proposal IDs
- remaining proposal commits
- candidate rebased head
- conflict metadata, if any

The original local ref remains authoritative until candidate validation passes.
Recovery either resumes the recorded candidate or restores the original admitted
state without deleting commits.

## OkfConceptSchema

- stable type and catalog version
- specificity and optional fallback relationship
- selection signals
- required/optional frontmatter fields
- evidence requirements and limitation rules
- recommended body sections
- allowed/expected relationship targets
- canonical path hints

Common rules are reusable catalog definitions but not emitted concept types.

## HubQuery

- query text or exact concept path/type/tag filter
- local Hub commit being queried
- bounded result limit
- returned concept identity, summary, links and provenance

Queries reject an unadmitted/dirty active tree and never read unaccepted authoring
workspaces as active knowledge.

## InstallerClientSelection

- selected clients: `codex`, `claude-code`, or both
- registration state: `deferred` in this capability
- completion summary

Selection is ephemeral in the initial slice and never changes a client config.

## GlobalHubCredential

- exact key: `AGENTBASE_HUB_GITHUB_TOKEN`
- non-empty opaque token value
- resolved XDG/fallback path
- owner-private directory and file modes
- source precedence: process environment, then admitted global file

The value is never included in receipts, summaries, errors or test output.
Creation and explicit replacement are atomic; skipped entry has no empty state.

## State transitions

```text
prepared workspace
  -> finalized/reviewed
  -> accepted local proposal commit
  -> pending
  -> selected publication
  -> pushed
  -> PR open
  -> remote merged
  -> synchronized/published-recognized
```

Conflict is a visible recoverable state from accept precondition, publication
base admission or synchronization rebase. It is never resolved automatically.
