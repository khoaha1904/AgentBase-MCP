# 06.04 — Provider verification

> Status: AWS CLI v2 plus STS/SQS profiles and host skill are implemented
> offline.

## Short decision

The user logs into a provider CLI in the terminal. The skill confirms scope and
calls bounded MCP verification operations; MCP does not accept or run arbitrary
CLI commands created by the Agent.

```text
user login CLI
  → confirm candidate + account + region
  → MCP released verification profile builds read-only argv
  → filtered observation
  → Domain Enrichment candidate outcome
```

CLI verification adds evidence only when source/Hub is insufficient. It is not
required for every relation. Qualification may inject a deterministic mock
process runner at the test boundary; it is internal harness, not a fake provider
session for production, and mock output is never published as AWS evidence.

## Authority boundary

- The user owns login and authorizes MCP to use the current session.
- MCP uses standard CLI credential resolution; tool arguments never accept keys,
  secrets, session tokens or credential-file content.
- MCP does not log in, refresh credentials, change profile/config or persist
  credentials.
- If current MCP cannot see new login state, explicitly reconnect/restart; never
  ask the user for secrets in a prompt.
- Every run binds an explicit provider profile, expected account/authority and
  regional location where applicable.

The AWS adapter may call `sts get-caller-identity` to confirm active account. An
account mismatch stops before a resource call. CLI default region is runtime
setting, not a replacement for confirmed/evidenced candidate region.

## Released verification profiles

Each supported operation belongs to an MCP-released versioned provider profile.
The profile defines supported CLI/version range, exact allowed operation and
argv fields, required native identity/scope, read-only/bounded status, retained
JSON fields, normalization/identity/secret rules, and timeout/output/pagination
behavior.

The Agent selects a semantic goal such as “verify this known queue”; it cannot
pass command strings, executable paths, arbitrary flags, JMESPath, or output
paths. MCP spawns the CLI directly with argv, disables pager/auto-prompt and
does not use a shell.

`list`/`scan` operations are forbidden by default. An operation named `list` is
allowed only when its released profile proves the server-side request is bounded
by exact candidate identity and does not enumerate account-wide data.

## Guidance and current AWS slice

The provider-verification skill uses bounded MCP preflight to read CLI
identity/version, guides out-of-MCP login, presents account/region/candidates for
confirmation, calls released operations and passes normalized observations into
Domain Enrichment. It uses profile/docs shipped with MCP, not model memory to
invent commands. Unsupported CLI versions return a limitation.

MVP releases only `sts get-caller-identity` and resolving a URL plus allowlisted
attributes for one exact SQS queue name + account + region. Lambda, SNS, compute
and other providers are not released. It never lists all queues/functions/topics,
uses Resource Explorer/tag scan, or tries multiple accounts/regions.

## Normalized observations and failures

MCP returns a bounded observation—provider/profile/operation version, confirmed
authority/location, exact candidate/native identity, allowlisted non-sensitive
fields, time, outcome and limitations—not raw provider response. Domain
Enrichment converts it into source-backed identity/relation/Question changes.
Raw stdout/stderr, profile paths and credential context never become OKF evidence.

| Failure | Outcome |
|---|---|
| CLI missing/unsupported | `unresolved`; guide setup/version. |
| Not logged in/expired session | `unresolved`; user logs in then retries. |
| Account mismatch | Stop candidate before resource call. |
| Region missing/mismatch | `unresolved`; do not try other regions. |
| Access denied/not found | Retain provenance/limitation; do not infer global absence. |
| Network/throttle/timeout | Failed/retryable attempt; do not change knowledge. |
| Malformed/oversized output | Hard verification failure; retain no partial raw data. |

There is no hidden retry loop. User-triggered retry is a new attempt with a
visible reason; successful checkpoints from other candidates remain under 06.03.

## Safety and baseline impact

- Do not run mutating APIs, shell, plugin installers or arbitrary executables.
- Do not enable CLI debug because it can expose credential/request details.
- Filter secret-like values before normalized observation and proposal.
- Verification never Accepts, Publishes or changes cloud resources.
- MCP Hub token is only for GitHub Hub/repository actions; provider CLI uses the
  user-login session and the authorities never mix.

The current slice follows the Full Feature route: fixed argv, bounded output and
timeout, no shell, no credential input and no generic cloud runner. Real AWS
smoke remains separately owner-approved after the offline gate.
