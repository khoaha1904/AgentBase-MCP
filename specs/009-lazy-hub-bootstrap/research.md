# Research: Lazy Hub Configuration and Bootstrap

## Decision 1 — Persist optional Hub configuration separately from the token

**Decision**: Store one non-secret `hub.json` beside the existing global credential boundary, while keeping the token in the exact existing `env` file.

**Rationale**: Hub identity changes independently from credential bytes and must be atomically switchable without rewriting or exposing the token.

**Alternatives considered**: Rewriting Codex/Claude environment on every Hub choice requires client mutation/restart; one combined env file couples secrets to ordinary config; repository-local config leaks machine authority into shared data.

## Decision 2 — Always expose lazy Hub actions

**Decision**: Build the Hub action surface for every MCP session and load optional configuration per action.

**Rationale**: Status/setup must work before a Hub exists, and newly admitted configuration must work in the same session.

**Alternatives considered**: Omitting Hub tools while unconfigured makes setup impossible through MCP; loading once at server startup requires a restart after configuration.

## Decision 3 — Use one stable local Hub identity

**Decision**: Assign each admitted local Hub a stable non-secret ID, record an exact base commit and make remote identity optional.

**Rationale**: Proposal identity must remain stable when a local-only Hub later gains a remote. A fake GitHub owner/name would conflate local and remote authority.

**Alternatives considered**: Hashing the future remote cannot work before the user creates it; using the local path leaks machine identity; retaining mandatory `HubIdentity` would invent authority.

## Decision 4 — Classify base and knowledge by metadata

**Decision**: The generated initial commit carries an exact base-kind trailer/version. Knowledge remains identifiable only through the established proposal trailers.

**Rationale**: Bootstrap and pending selection must not guess from commit messages or ordinal position.

**Alternatives considered**: Treating the root commit as base fails imported histories; filename heuristics cannot distinguish later documentation changes; sidecar-only identity can drift from Git ancestry.

## Decision 5 — Admit only GitHub HTTPS repository URLs

**Decision**: Accept credential-free `https://github.com/owner/repo` with optional `.git`, normalize it to canonical HTTPS and reject every other component/host/scheme.

**Rationale**: The existing provider and receipts assume one GitHub authority, and exact parsing prevents credential/query injection and remote-identity ambiguity.

**Alternatives considered**: Arbitrary Git URLs expand provider/security scope; SSH depends on ambient keys; accepting `owner/name` alone does not satisfy the owner's link-driven flow.

## Decision 6 — Validate remote emptiness with exact refs

**Decision**: Before first mutation, use bounded authenticated Git ref discovery and require zero heads/tags. Retry may admit only the exact `main` recorded by an existing bootstrap receipt.

**Rationale**: A missing `main` alone does not prove an empty repository, and GitHub empty-repository default-branch responses are not a complete ref inventory.

**Alternatives considered**: Checking only the repository API or `main` can overwrite an unrelated branch/tag history; force push is prohibited.

## Decision 7 — Reuse batch publication after base-only bootstrap

**Decision**: Once base is pushed and remote configuration admitted, pass the full pending proposal prefix to the existing deterministic publication/PR workflow.

**Rationale**: This preserves reviewed commits and existing branch/PR identity, drift checks and recovery rather than creating a second PR implementation.

**Alternatives considered**: Squashing knowledge loses proposal identity; a new bootstrap-specific PR implementation duplicates proven lifecycle policy.

## Decision 8 — Permission guidance stays bounded

**Decision**: Translate Git/GitHub authorization failures into secret-free guidance for repository read, Contents write and Pull requests write, directing replacement through the existing installer.

**Rationale**: MCP cannot inspect or grant token permissions reliably and must not request token bytes through tools/chat.

**Alternatives considered**: Echoing upstream bodies may leak detail; automatically broadening access is impossible and unsafe.
