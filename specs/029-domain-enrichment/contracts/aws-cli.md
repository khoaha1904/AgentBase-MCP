# AWS CLI Provider Contract v1

## Authority preflight: `aws.sts.caller-identity@1`

Fixed semantic operation: verify the current user-managed AWS session and exact
12-digit account. The adapter disables pager/auto-prompt/debug, applies bounded
time/output and parses only account identity fields needed for admission.
Only AWS CLI major version 2 is admitted by the first released profiles; another
major returns an unsupported-version limitation rather than guessed commands.

Account mismatch returns a blocking preflight result before any resource call.
Expired/no login returns unresolved setup guidance without credential detail.

## Resource verification: `aws.sqs.queue@1`

Required typed input:

- exact queue name;
- exact owner account ID equal to admitted authority;
- exact confirmed AWS region;
- candidate/evidence digest.

The profile performs an exact queue URL lookup followed by exact queue attribute
read. It does not list queues, tags, regions, resources or accounts.

Allowlisted output:

- normalized queue ARN and non-sensitive queue URL identity;
- account, region, service and resource type derived consistently from ARN;
- `VisibilityTimeout`, `MessageRetentionPeriod` and
  `ReceiveMessageWaitTimeSeconds`; all other attributes are discarded;
- observed time, profile version and canonical digest.

Unknown response fields are discarded. Secret-like content, oversized/malformed
JSON or ARN/scope inconsistency rejects the complete observation.

## Process contract

- fixed executable name `aws`; no user-supplied executable/path;
- direct argv spawn with `shell:false`;
- inherited established session but no environment enumeration or logging;
- pager, auto-prompt, color and debug disabled;
- bounded timeout/stdout/stderr; process terminated on timeout/cancel;
- raw output exists only until parsing completes and is never checkpointed;
- no automatic retry, mutation operation, output file or plugin execution.

## Degraded outcomes

| Condition | Result |
|---|---|
| CLI missing/unsupported | unresolved; install/version guidance |
| login absent/expired | unresolved; user re-login and retry |
| account mismatch | blocking preflight; no resource call |
| region missing/mismatch | unresolved; no fallback region |
| access denied/not found | unresolved limitation; do not infer global absence |
| throttle/network/timeout | failed retryable attempt |
| malformed/oversized/unsafe output | failed integrity attempt; no observation |
