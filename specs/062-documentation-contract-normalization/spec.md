# Feature Specification: documentation contract normalization

**Status**: In progress. Phase 1 defines current documentation authority,
impact review and historical SDD reference rules without moving existing files.

## Objective

Make the boundary between current `docs/` truth and historical `specs/` change
packages explicit enough that a lower-level implementation change cannot silently
drift from its Product or Architecture Contract, while preserving old paths and
historical content.

## Scope

- Define Product, Architecture, Capability, Implementation and Validation roles.
- Define a risk-based change impact gate and upward consistency rule.
- Define mutable current references versus immutable Git baseline references.
- Preserve completed specs and existing paths without bulk migration.
- Establish a later, opt-in rename/mapping phase rather than performing it here.

## Non-goals

- No runtime, schema, tool, provider or user workflow change.
- No mass rename of `docs/present/` or `docs/design/`.
- No rewrite or backfill of completed specs.
- No global implementation or validation directory yet.
- No semantic documentation linter in this phase.

## Requirements

- **AB-DOC-001**: `docs/` remains the mutable current source of truth; completed
  `specs/<id>/` remain historical SDD change packages.
- **AB-DOC-002**: Product, Architecture, Capability, Implementation and
  Validation responsibilities are named and mapped to current paths.
- **AB-DOC-003**: Every change is classified by impact; behavior, boundary,
  scope, schema, security, migration, recovery or lifecycle changes require an
  upward contract review before implementation continues.
- **AB-DOC-004**: New specs may reference current docs for navigation and must
  record baseline path plus Git SHA for historical traceability.
- **AB-DOC-005**: Current-doc evolution does not rewrite completed specs; a new
  behavior change records `supersedes` or `amends` when applicable.
- **AB-DOC-006**: Directory renames, if later approved, update links atomically
  and preserve old-path navigation or mapping until historical references are
  resolvable.

## Success criteria

The repository documentation states one authority model, one impact gate and
one current-versus-historical reference rule; existing paths and completed
specs remain untouched; `npm run verify` passes.
