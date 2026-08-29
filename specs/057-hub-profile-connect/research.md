# Research — AgentBase CLI Surface and Hub Connect

## Decision 1: Use `abs` as the public command

**Decision**: The installed AgentBase executable is named `abs`; OKF is a
knowledge-format term, not a user command namespace.

**Rationale**: The owner needs a product-oriented command with a small, stable
surface. Publishing every lifecycle action makes internal implementation terms
look like user workflows.

## Decision 2: Publish only three commands

**Decision**: Document `abs status`, `abs hub connect` and `abs hub sync`.

**Rationale**: These cover the owner’s recurring local status, Hub selection and
explicit synchronization needs. Ingest, refresh, enrichment, query, review,
publish, validator and benchmark are skill/MCP or developer workflows.

## Decision 3: Keep compatibility routes hidden

**Decision**: Retain `mcp`, `node src/cli.ts` and existing `okf ...` routes for
skills, MCP clients and verification while migrating guidance to `abs`.

**Rationale**: This avoids a risky flag-day rename and does not change MCP tool
names, Hub data, storage identity or authorization.

## Decision 4: Use one shared owner token

**Decision**: `abs hub connect` accepts a token only through a masked terminal
prompt. Empty input reuses the existing owner-private token; a non-empty input
replaces it after validation. The same shared token is used for subsequent Hub
repositories and branches.

**Rationale**: The owner normally has one broad repository credential. A single
default avoids profile-token copying and makes changing URL/branch predictable.
Remote permission checks remain the authority for each destination.

**Alternatives considered**: Per-profile credentials; `gh auth token`; token
arguments or authenticated URLs. Per-profile storage adds setup complexity,
`gh` is not universal, and arguments/URLs expose secrets.

Existing per-profile files are treated as legacy input. If the active profile is
the only available credential and the shared default is absent, one explicit
connect can promote that credential; inactive conflicting files are untouched.

## Decision 5: Keep connect and sync separate

**Decision**: Connect validates and activates only; `abs hub sync` performs an
explicit pull.

**Rationale**: Credential admission and knowledge movement have different
authority and failure boundaries. Combining them would make one command
surprising and harder to recover.

## Recovery boundary

If validation reports failure after a replacement token was entered, restore the
previous shared token and active profile. An uncatchable process termination may
leave only owner-private staged credential state, but never activates the
destination profile.
