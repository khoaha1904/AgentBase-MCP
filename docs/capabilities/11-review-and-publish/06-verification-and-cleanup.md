# 11.06 — Verification and cleanup

> Status: Transaction cleanup is implemented; published-proposal artifact cleanup is deferred.

## Outcome

Reuse existing gates; do not create a separate verification workflow or garbage
collector for the MVP.

## Verification gates

1. **Finalize** checks the exact authored bundle, schema, links, relations,
   Questions, ownership, correction/removal intent and proposal diff.
2. **Inspect** derives the exact byte/semantic preview; it creates no Git commit.
3. **Publish/Sync** checks the exact remote/base/branch/proposal identity and clean
   candidate before pushing or advancing local `main`.

These gates do not reread source merely to make a proposal “more certain.”
Missing knowledge remains a Question/Limitation; source verification belongs to
a separate Refresh or Domain Enrichment workflow.

Human verification/guidance must pass through a reviewed proposal when needed.
A review UI or pull-request action does not directly modify `verified`, Question
or knowledge bytes.

## Cleanup now

- Successful authoring normalization/staging, isolated worktrees and completed
  transaction directories are cleaned immediately.
- A failure requiring recovery retains bounded transaction evidence; cleanup
  occurs after recovery completes.
- Source checkouts, Published commits and private authoring bundles and the
  Hub remote are never modified/deleted by the cleanup workflow.
- Cleanup failure is reported; do not pretend the transaction disappeared.

## Accepted proposal artifacts

The MVP retains the private proposal bundle, inspection and receipts for retry/
pull-request summaries. A Question already resides in the reviewed Hub tree;
there is no attachment or private rebuild authority. There is no automatic
retention, scheduled cleanup or manual delete tool.

If actual disk usage proves it necessary, add bounded cleanup for a proposal
recognized as Published: delete a large rebuildable bundle/inspection while
retaining minimal Git/proposal identity when still needed for audit. Add this
only when actual disk usage proves the need.

## Cancellation

- Canceling authoring/an Incomplete run can delete only private unaccepted staging
  for the exact run after the user requests it.
- Do not cancel by resetting Published state, dropping a shared commit or closing a pull request.
- Changing a finalized proposal requires a new proposal; cleanup is not a lifecycle mutation.

## No additional MVP machinery

No daemon, TTL, retention policy, status database, cleanup scheduler or source
re-verifier. Existing deterministic gates and immediate temporary cleanup are
sufficient for the MVP.
