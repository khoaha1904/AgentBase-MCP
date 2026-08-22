# Research: Reviewable Hub Pull Requests

## Decision: Reuse accepted Git ancestry

An Init followed by Refresh already forms the exact parent chain needed by a
stack. Pushing each accepted commit to its own deterministic branch produces
the required PR diffs without rewriting commits.

**Alternatives considered**: cherry-picking unrelated Init proposals onto
`main` would allow independent PRs but adds conflict resolution, replacement
commit identity and recovery state. It is deferred.

## Decision: Keep compatibility through optional mode trailers

New accepted commits record `new` or `refresh`. Existing commits without the
trailer remain batch-publishable but cannot be automatically stacked.

**Alternatives considered**: inferring mode from content or proposal names is
unsafe; migrating old commits would rewrite immutable local history.

## Decision: Use retained inspection as optional rich metadata

Retained proposal inspection supplies lifecycle groups, Questions and
limitations. Exact accepted Git/proposal fields remain the compatibility
fallback, and absent optional detail is shown honestly.

**Alternatives considered**: copying all review metadata into commit trailers
would make messages large and duplicate OKF detail; recomputing semantic
lifecycle intent from Markdown during publication would create a second scorer.

## Decision: Pass explicit base branch to GitHub adapter

The adapter validates the requested base in list/create responses. It never
changes the configured Hub target or trusts a returned base implicitly.

**Alternatives considered**: constructing a second Hub identity per stack level
would falsely imply a different configured Hub target.
