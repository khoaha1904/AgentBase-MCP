# Data Model: AgentBase Hub PR Lifecycle

## Hub Configuration

- `repository`: exact lowercase-or-case-preserved GitHub `owner/name` identity
- `canonicalHttpsUrl`: derived internally, never user-supplied per command
- `targetBranch`: exact configured branch
- `credentialSource`: MCP-owned runtime injection; value never enters the model

Validation: complete identity, GitHub HTTPS only, no URL credentials, fragments, query strings or alternate host.

## Hub Base

- Hub identity
- target branch
- exact 40-character commit
- observed remote ref
- local clone generation

## Hub Proposal

- immutable proposal ID
- mode: `new | refresh`
- source repository identity and evidence digest
- schema catalog version and selected types
- Hub target/base commit
- proposed tree digest and exact diff digest
- branch name and expected deterministic commit metadata
- phase: `prepared | committed | pushed | pr-opened`
- optional non-secret publication receipt

## Publication Receipt

- Hub owner/name and target branch
- proposal branch
- exact commit
- PR number and canonical GitHub URL
- API-observed head/base identities

## State Transitions

```text
configured
  -> fetched exact base
  -> prepared immutable proposal
  -> revalidated against unchanged base
  -> committed exact reviewed bytes
  -> pushed exact branch/commit
  -> PR opened or exact existing PR recovered
```

Any mismatch transitions to a visible failed state without advancing the recorded successful phase.
