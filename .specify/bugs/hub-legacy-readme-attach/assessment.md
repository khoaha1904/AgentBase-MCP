# Bug Assessment: Legacy Hub attach requires README

- **Slug**: hub-legacy-readme-attach
- **Created**: 2026-08-22
- **Source**: observed local reproduction
- **Verdict**: valid
- **Severity**: medium

## Report

Attaching the existing `AgentBase-Hub` remote fails with `existing
AgentBase-Hub is missing README.md` even though remote `main` has a valid OKF
v0.2 root. This blocks all MCP-owned publication.

## Symptom

`configure_hub` can authenticate and clone the Hub but refuses to admit it only
because `README.md` is absent. Existing Hub knowledge should be admitted from
its OKF root; README remains mandatory only for a new Hub created by MCP.

## Reproduction

1. Use an unconfigured MCP runtime with its dedicated Hub token.
2. Attach an existing clean GitHub Hub whose `main` has valid `index.md` but no
   `README.md`.
3. Observe attachment fail after OKF validation.

## Suspected Code Paths

- `src/app/hub-okf/workspace/setup.ts` — adds an unconditional README existence
  gate after the authoritative OKF bundle validation.
- `src/app/hub-okf/workspace/local-only-e2e.test.ts` — current cohesive Hub
  lifecycle coverage can retain one legacy-attach regression without adding a
  new test case.

## Root Cause Hypothesis

High confidence. The new-local-Hub documentation requirement was also applied
to existing remote Hubs. `loadOkfBundle(..., { requireAgentBaseRootIndex: true
})` already owns the machine-readable admission contract.

## Proposed Remediation

**Preferred**: remove only the existing-Hub README gate. Keep README generation
unchanged for MCP-created local Hubs. Extend the existing E2E test to attach a
clean historical Hub after deleting README in a committed revision, and verify
that the remote configuration is admitted.

**Files likely to change**:

- `src/app/hub-okf/workspace/setup.ts`
- `src/app/hub-okf/workspace/local-only-e2e.test.ts`
- `docs/design/11-review-and-publish/01-runtime-requirements.md`

**Tests to update**:

- Existing local-only Hub E2E: a valid legacy OKF root without README attaches.

## Risks & Considerations

- A non-Hub repository must still fail OKF root validation.
- New local Hubs must still contain the explanatory README.
- No credential, remote mutation or migration is introduced.

## Open Questions

None.
