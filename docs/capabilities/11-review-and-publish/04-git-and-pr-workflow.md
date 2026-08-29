# 11.04 — Git and PR workflow

> Status: Implemented for knowledge publication and dedicated Hub Initialization pull requests.

## Outcome

MCP turns explicit accepted proposal IDs into dependency-safe Hub pull requests
using the dedicated Hub token. Local accepted ancestry is only storage order;
the publication base is calculated from Repository dependencies and the exact
Published target branch.

## Entry contract

- The user/Agent invokes `submit_hub_okf_proposals` with non-empty exact proposal IDs.
- The Proposal must be an accepted Local Draft in admitted pending ancestry.
- MCP fetches/admits the exact remote repository, configured target branch,
  proposal commit/digest and existing branch/pull-request identity before mutation.
- The calling Agent does not receive the token and cannot substitute `gh`, an
  ambient Git credential or another publisher.

## Publication units

### Independent Repository Init

Each Init for a different Repository replays the exact proposal contribution on
the same Published target using a separate branch and pull request:

```text
main ── PR Init A
  └── PR Init B
```

Both pull requests can be open before either merges. Local commit order A → B
does not make B depend on A, and A's bytes do not leak into pull request B.

### Same-Repository Init/Refresh

Proposals for the same Repository create an exact stack:

```text
main ← Init branch ← Refresh branch ← next Refresh branch
```

Each pull request contains only that proposal's delta. When its predecessor
merges, MCP retargets the next proposal to `main` during explicit reconciliation;
pull-request identity is preserved.

### Empty-remote bootstrap

Explicit bootstrap is the only direct-write exception. It creates the target
branch of an exactly empty user-created remote with the complete released README,
root `index.md` and CI baseline, without replaying a knowledge proposal. After
admission, all Init/Refresh/Batch/Enrichment knowledge uses normal pull-request
units. Existing Hub support repair uses an Initialization pull request, not a direct write.

## Exact replay and shared indexes

MCP does not push local `main` wholesale. It replays the exact accepted proposal
patch on the unit's publication base because the local tree may contain another
repository's draft.

Local accepted ancestry always uses internal `main`; remote publication targets
the exact branch stored by the active Hub profile. No workflow substitutes the
literal branch `main` for that configured target.

An append-only shared `index.md` contains only navigation lines selected by the
proposal. When the Published target already added compatible navigation, MCP can
union exact unique append-only lines under the same heading. Another conflict,
heading drift or non-navigation bytes must stop before push; MCP does not guess
the merge result.

## Branch and PR behavior

- Branch identity is derived deterministically from proposal/publication identity.
- Retry reuses the exact matching branch and open pull request;
  multiple/mismatched candidates fail closed.
- A new pull-request body is derived from the immutable accepted proposal,
  inspection and Git metadata:
  Purpose, Scope, Changes, Uncertainty, Evidence/Validation, Reviewer Action.
- Missing optional inspection detail is recorded as `unavailable`; the model does
  not write a new narrative during publication.
- MCP can push/update only the branch it manages and retarget its base when the
  predecessor is Published.
- MCP does not force-push, merge, approve, close a pull request, delete a branch
  or modify repository settings.

## Reconciliation when Published target advances

1. fetch the exact configured remote target;
2. recognize merged proposals by proposal/patch identity;
3. process remaining branches sequentially;
4. merge the new admitted base into an isolated branch candidate;
5. auto-resolve only safe append-only index conflicts;
6. validate the candidate before updating the same remote branch/pull request;
7. another conflict stops before push and retains local/open pull-request state.

Do not run in parallel because sequential processing is simpler, keeps the base
clear and avoids creating conflict coordination.

The phrase Published base means the dedicated last-successfully-admitted ref,
not `origin/<target>`. Fetch updates a private candidate ref. Only a validated
successful synchronization advances the Published ref; conflict leaves the
Published ref and every Local Draft unchanged.

## Failure and retry

- A failure before branch push creates no pull request.
- A multi-unit submission can complete several independent pull requests and then
  stop; the receipt retains completed units and retry continues the remainder
  without rolling back created pull requests.
- A network/permission failure retains Local Draft and requires retry/credential repair.
- Existing remote branch/pull-request drift is not overwritten.
- MCP never mutates the configured remote target directly after bootstrap;
  maintainer merge remains the publication gate.

## Hub Initialization PR

For a non-empty existing Hub, support initialization is a separate reviewed lifecycle, not an OKF
proposal. Preview fetches the exact configured remote target without replaying Local Drafts,
preserves an existing README and skips exact current CI. It derives only the
missing README and/or full released CI bundle, then binds their deterministic
digest. Explicit initialize may create or recover only
`agentbase/hub-init-<digest>` with that exact support-file diff. Any extra file,
changed base, ambiguous PR or byte drift stops. The same dedicated Hub token is
used internally; the caller cannot provide a token, branch name or file bytes.
The standard README is human onboarding only; canonical knowledge navigation
remains in `index.md`. Exact-empty bootstrap uses the same released support
bytes directly only because no target branch exists for a PR.

## Current implementation gap

The core workflow and deterministic pull-request summary are implemented. Batch
Ingest and Domain Enrichment publication units still depend on their corresponding
capabilities. Visual HTML review and explicit lifecycle presentation belong to
Sections 11.02 and 11.05 and do not make Git transport more complex.
