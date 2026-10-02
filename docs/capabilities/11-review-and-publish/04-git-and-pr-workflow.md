# 11.04 — Git and PR workflow

> Status: Policy-bound prepared publication is implemented.

## Entry and authority

The configured Publish action consumes one exact finalized proposal and reviewed
digest under the active Hub's `direct` or `pr` policy. It never accepts a
caller token, arbitrary branch, partial proposal or stacked pending selection.
The application owns credentials and transport; callers do not substitute `gh`.

[Prepared publication](12-direct-publication-requirements.md) owns normative
admission, candidate construction, retry and cleanup. Direct policy writes one
complete commit and recognizes it locally. PR policy pushes a deterministic
proposal branch against the exact configured target and creates/reuses one
matching PR. Batch and Enrichment proposals remain atomic.

## Base changes and retry

Changed target/base or foreign branch/PR bytes stop for renewed preparation and
review. There is no automatic rebase, PR stacking or retargeting. Lost
acknowledgements require exact remote identity checks before retry; closed PRs
are not recreated automatically. No force push, merge, approval, branch deletion
or repository-setting change is part of Publish.

The PR summary derives purpose, scope, changes, uncertainty, evidence/validation
and reviewer action from immutable proposal inspection. Credentials and local
absolute paths never enter it. Ordinary query remains Published-only until
external PR merge and explicit sync.

## Hub Initialization PR

For a non-empty existing Hub, support initialization is a separate reviewed lifecycle, not an OKF
proposal. Preview fetches the exact configured remote target without replaying private proposals,
preserves an existing README and skips exact current CI. It derives only the
missing README and/or full released CI bundle, then binds their deterministic
digest. Explicit initialize may create or recover only
`agentbase/hub-init-<digest>` with that exact support-file diff. Any extra file,
changed base, ambiguous PR or byte drift stops. The same dedicated Hub token is
used internally; the caller cannot provide a token, branch name or file bytes.
The standard README is human onboarding only; canonical knowledge navigation
remains in `index.md`. Exact-empty bootstrap writes only the README, root/shared
indexes and Profile directly because no target branch exists for a PR. It omits
CI; initialization or upgrade adds CI through review after the branch exists.
