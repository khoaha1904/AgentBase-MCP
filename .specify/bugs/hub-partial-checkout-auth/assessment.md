# Bug Assessment: Partial Hub Checkout Drops Authentication

- **Slug**: hub-partial-checkout-auth
- **Created**: 2026-08-12
- **Source**: real AgentBase Hub qualification
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

`prepare_hub_okf` successfully cloned and fetched the configured private Hub,
then failed at `checkout Hub base` with Git status 128.

## Symptom

A private Hub using `--filter=blob:none` can require a lazy authenticated blob
fetch during checkout. `checkoutHub` supplies the token to clone and fetch but
not to checkout, so preparation fails before authoring.

## Reproduction

1. Configure the private repository `khoaha1904/knowledger-hub` and target
   `agentbase/bootstrap-okf-v2` using a memory-only GitHub credential.
2. Call `createHubRuntimeActions(...).prepare(...)` with a fresh state root.
3. Observe `checkout Hub base: Git exited with status 128`.

## Suspected Code Paths

- `src/app/hub-okf/checkout.ts:33` — partial clone deliberately omits blobs.
- `src/app/hub-okf/checkout.ts:46` — checkout omits the token even though it may
  cause the partial-clone promisor remote to fetch missing blobs.
- `src/app/hub-okf/checkout.test.ts` — the test checks token absence from argv,
  but not credential propagation to every network-capable Git phase.

## Root Cause Hypothesis

Confidence: high. Git checkout is usually local, so its possible network access
under partial-clone semantics was missed. The bounded askpass mechanism already
supports safe credential injection; the call site simply does not request it.

## Proposed Remediation

**Preferred**: pass the existing token to the bounded checkout request. The
token remains in the allowlisted child environment and temporary askpass only;
it is not added to argv, Git config, logs or state.

**Files likely to change**:

- `src/app/hub-okf/checkout.ts`
- `src/app/hub-okf/checkout.test.ts`
- `docs/specs/agentbase-hub.md`

**Tests to add or update**:

- Assert clone, fetch and checkout receive the credential through `GitRequest.token`.
- Continue asserting no command argument contains the token canary.
- Re-run the real preparation reproduction with a fresh state root.

## Risks & Considerations

- Credential lifetime remains bounded to one Git subprocess.
- Error redaction and askpass cleanup remain owned by `runGit`.

## Open Questions

- None.
