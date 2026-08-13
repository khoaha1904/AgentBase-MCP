# Bug Assessment: Canonical Hub clone is rejected by runtime admission

- **Slug**: hub-migration-remote-identity
- **Created**: 2026-08-13
- **Source**: observed during the approved T042 canonical cutover
- **Verdict**: valid
- **Severity**: high

## Report (summarized)

`create-hub` accepted and retained
`git@github.com:khoaha1904/AgentBase-Hub.git`, but the first configured MCP
`search_hub_okf` call returned `effective Hub remote does not match configured
identity`.

## Symptom

The migration command reports a successful canonical Hub clone, yet the runtime
rejects that clone before any local query. A canonical clone created by the
official migration path must be immediately admissible by AgentBase-MCP.

## Reproduction

1. Run `create-hub` with an SSH GitHub remote.
2. Configure `AGENTBASE_HUB_REPOSITORY` for the same owner/name and point
   `AGENTBASE_HUB_LOCAL_ROOT` at the clone.
3. Call `search_hub_okf`; runtime admission fails on the exact remote string.

## Suspected Code Paths

- `scripts/migrate-product-repositories.mjs:createCanonicalHub()` — accepts SSH
  and HTTPS remotes and leaves the chosen form as `origin`.
- `src/core/hub/identity.ts:assertHubRemote()` — deliberately admits only the
  canonical HTTPS URL derived from the configured repository identity.
- `src/app/hub-okf/local-hub.ts:admitPersistentLocalHub()` — applies that remote
  admission before local query.

## Root Cause Hypothesis

Confidence: high. The migration and runtime contracts use different accepted
remote representations. The migration's successful output is therefore not a
valid runtime state when SSH input is supplied.

## Proposed Remediation

**Preferred**: make `createCanonicalHub` accept one exact repository identity
(`owner/name`), derive the same canonical HTTPS URL as runtime admission, and
clone only that URL. Reject raw SSH/URL authority input so migration cannot
produce a runtime-incompatible origin.

**Files likely to change**:

- `scripts/migrate-product-repositories.mjs`
- `scripts/migrate-product-repositories.test.mjs`
- `specs/008-local-hub-product-correction/quickstart.md`

**Tests to add or update**:

- prove the canonical Hub clone records the derived HTTPS origin;
- prove raw SSH input is rejected before destination mutation.

## Risks & Considerations

- HTTPS network authentication remains memory-only through the existing
  askpass/token boundary during runtime remote actions.
- The already-created canonical clone needs its origin normalized once after
  the code fix; no ref or worktree content changes.

## Open Questions

- None.
