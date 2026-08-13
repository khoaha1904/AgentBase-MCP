# Bug Assessment: Persistent Hub sessions cannot finalize

- **Slug**: hub-session-persistent-checkout
- **Created**: 2026-08-13
- **Source**: observed while executing approved T043 through the real CLI
- **Verdict**: valid
- **Severity**: high

## Report (summarized)

`okf hub prepare` succeeded against the canonical persistent Hub, but the
immediately following `okf hub finalize` returned `Hub authoring session state
is invalid` without any intervening state or Hub change.

## Symptom

A valid session cannot finalize whenever the configured persistent Hub clone is
outside the private proposal-state directory, which is the required product
layout.

## Reproduction

1. Configure `AGENTBASE_HUB_LOCAL_ROOT` to a canonical persistent clone.
2. Prepare a valid `refresh` session.
3. Finalize the returned session ID; validation rejects its external
   `checkoutRoot` even though prepare admitted and copied it.

## Suspected Code Paths

- `src/app/hub-okf/authoring-session.ts:readHubAuthoringSession()` — requires
  `checkoutRoot` to be under `stateRoot`.
- `src/app/hub-okf/runtime-actions.ts:finalize()` — does not supply the admitted
  configured Hub root for an exact identity comparison.
- `src/app/hub-okf/authoring-session.test.ts` — fixtures place checkout inside
  state root and cannot detect the production layout mismatch.

## Root Cause Hypothesis

Confidence: high. A safety check from the earlier temporary-checkout lifecycle
survived the persistent-Hub correction. It validates directory containment
instead of equality with the configured, already-admitted persistent clone.

## Proposed Remediation

**Preferred**: require finalize/read to receive the configured checkout root,
validate exact normalized equality plus a non-symlink directory, and update
runtime composition to pass `configuration.localRoot`. Make tests use a
persistent checkout outside state root and reject a mismatched expected root.

**Files likely to change**:

- `src/app/hub-okf/authoring-session.ts`
- `src/app/hub-okf/runtime-actions.ts`
- `src/app/hub-okf/authoring-session.test.ts`

**Tests to add or update**:

- external persistent Hub checkout can prepare and finalize;
- tampered/mismatched checkout identity fails before proposal creation.

## Risks & Considerations

- Do not weaken path validation to accept any absolute directory.
- The prepared T043 session must remain retryable after the code fix.

## Open Questions

- None.
