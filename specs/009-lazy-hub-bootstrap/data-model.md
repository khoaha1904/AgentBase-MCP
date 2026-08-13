# Data Model: Lazy Hub Configuration and Bootstrap

## ActiveHubConfiguration

Common fields:

- format version
- stable local Hub ID
- lifecycle kind: `local-only` or `remote`
- absolute owned local root
- exact Hub base commit
- OKF schema catalog version

Remote-only fields:

- exact GitHub `owner/name`
- canonical HTTPS URL
- target branch `main`

Rules:

- Absence of the file means `unconfigured`; no empty/sentinel record exists.
- The file contains no token and is an owner `0600` regular non-symlink file
  under an owner `0700` directory.
- Unknown fields, unsafe paths/modes/ownership, unsupported versions and invalid
  field combinations fail closed.
- A configured Hub cannot be replaced by setup actions in this capability.

## HubBaseCommit

- exact commit
- stable local Hub ID
- base format version
- created time
- exact base-kind trailer
- tree containing introductory `README.md` and OKF v0.2 `index.md`

The base is not a knowledge proposal. It is the lower ancestry boundary for a
local-only Hub and remains immutable through remote attachment/bootstrap.

## KnowledgeCommit

- established proposal ID/trailers
- parent commit
- accepted commit
- subject/source/evidence/diff/catalog identity

Every commit above a local-only base must be a valid contiguous knowledge commit
before bootstrap. Unknown ordinary commits make the history ambiguous and fail.

## HubSetupResult

- status: `local-only` or `remote`
- stable local Hub ID
- local root
- exact base/active commit
- optional non-secret repository identity

## BootstrapIntent

- deterministic transaction ID
- exact normalized repository identity/URL
- mode: `all-to-main` or `base-to-main-knowledge-pr`
- exact base commit
- exact active head
- ordered proposal IDs and commits
- creation time

Intent becomes immutable before remote mutation.

## BootstrapReceipt

- intent
- phase: `prepared`, `main-pushed`, `remote-admitted`, `knowledge-published`, `completed`
- exact observed/pushed remote `main`
- optional deterministic publication receipt/PR identity
- last safe recovery instruction

No credential, authenticated URL, machine-external authority override or
knowledge content is stored.

## State Transitions

```text
unconfigured
  | attach existing (clone + validate + atomic admit)
  v
remote

unconfigured
  | create local (init + base commit + atomic admit)
  v
local-only -- accept K1..Kn --> local-only with pending knowledge
  | bootstrap all-to-main
  v
remote (remote main = active head, pending = none)

local-only
  | bootstrap base-to-main-knowledge-pr
  v
remote (remote main = base, K1..Kn pending/published through one PR)
```
