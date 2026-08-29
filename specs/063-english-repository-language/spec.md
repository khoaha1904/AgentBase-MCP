# Feature Specification: English repository language

**Status**: In progress. Repository policy and translation inventory are the
first slice; current documentation will be translated in bounded area batches.

## Objective

Standardize every AgentBase-owned repository artifact on English while letting
agents communicate with users in the language used by each user.

## References

```yaml
current_refs:
  - AGENTS.md
  - docs/README.md
baseline:
  - path: AGENTS.md
    commit: e3a4735
  - path: docs/README.md
    commit: e3a4735
```

## Scope

- Translate current AgentBase-owned documentation into English.
- Keep specs, source, comments, tests and commit messages English.
- Preserve requirement IDs, file paths, links, code, commands and semantics.
- Make agent conversation follow the user's language without changing artifacts.
- Add a deterministic repository-language check after the current migration is
  complete.

## Non-goals

- No product, architecture, workflow, schema or runtime behavior change.
- No translation of vendor snapshots, generated output or immutable external
  evidence.
- No file or directory rename merely to restyle existing English names.
- No rewrite of historical meaning, requirement IDs or accepted terminology.

## Requirements

- **AB-LANG-001**: Every AgentBase-owned repository artifact is written in
  English.
- **AB-LANG-002**: Agents communicate with a user in the language used by that
  user; conversation language never changes repository artifact language.
- **AB-LANG-003**: Translation preserves requirements, identifiers, links,
  code examples, commands and observable runtime behavior.
- **AB-LANG-004**: Third-party vendor snapshots, generated output and immutable
  external evidence retain their original bytes.
- **AB-LANG-005**: Migration proceeds in reviewable batches with focused scans,
  repository checks and separate commits.
- **AB-LANG-006**: After migration, a deterministic check rejects newly added
  non-English AgentBase-owned text while respecting the explicit exclusions.

## Success criteria

No Vietnamese text remains in AgentBase-owned tracked artifacts, exclusions are
unchanged, all links and requirement IDs remain valid, and `npm run verify`
passes without runtime contract changes.
