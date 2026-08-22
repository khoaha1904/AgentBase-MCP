# Research: Shared Question Documents

## Durable authority

**Decision**: Exact Hub Markdown is the only Question authority.

**Rationale**: Questions are knowledge that must synchronize and remain human
readable. Existing proposal/Git review already supplies durability and history.

**Alternatives considered**: Keep the JSON ledger, dual-write, or add a database.
All create split-brain/recovery work without an MVP need.

## Cutover

**Decision**: Clean-cut unpublished private state and block orphan accepted
Guidance during preflight.

**Rationale**: No Question document has been Published. Drafts can be regenerated,
but accepted Guidance must not lose its context silently.

**Alternatives considered**: Permanent legacy reader or automatic best-effort
migration. Both preserve an authority the product has explicitly rejected.

## Identity and revisions

**Decision**: Derive a 24-hex ID from immutable origin fields; increment revision
once for every accepted document edit.

**Rationale**: Identity survives machine, remote, owner and display-name changes.
Conservative revisions make stale-answer rejection deterministic.

**Alternatives considered**: Hub-local IDs, path/title hashes or event sequence
IDs. They are machine-specific or unstable under harmless edits.

## Answer transaction

**Decision**: One proposal creates Guidance and updates Question; Accept applies
both through the existing tree transition.

**Rationale**: A resolved Question without its Guidance, or Guidance without its
state transition, would be an invalid partial truth.

**Alternatives considered**: Update private state immediately then create a
Guidance proposal. This is the current defect and exposes pre-Accept state.

## MVP boundary

**Decision**: Exact subject-property Guidance, explicit transitions and existing
lifecycle test only.

**Rationale**: This closes shared authority without building batch enrichment,
policy inheritance, automatic conflict reasoning or caching.

**Alternatives considered**: Implement all Part 07 designs now. That would bind
the MVP to unneeded orchestration and inference.
