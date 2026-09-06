# 11.05 — Publication state

> Status: Direct/PR publication and Git-backed recognition are implemented.

## Authority

Publication is established by exact remote Git ancestry, not a receipt or
successful PR creation. Private receipts retain ownership and retry checkpoints;
they are neither Hub knowledge nor semantic-completeness certificates.

| Event | Result |
|---|---|
| Finalize | Immutable private proposal; no shared mutation |
| Confirm Direct Publish | One complete remote commit, then local recognition |
| Remote success, local recognition failure | Report split outcome; retain exact recovery |
| Confirm PR Publish | Matching branch/PR; knowledge remains unpublished |
| External merge and explicit sync | Locally recognized Published knowledge |
| Closed PR or changed base | Unpublished work retained; explicit recovery/review |
| Network uncertainty | Unknown remote outcome; verify exact identity before retry |

A completed direct retry recognizes its existing commit even after later sync.
A receipt alone never upgrades unknown remote status to success. Ordinary Hub
query reads the last successfully recognized Published revision.

[Prepared publication](12-direct-publication-requirements.md) owns exact
admission and recovery requirements. There is no Accept state, automatic
merge/rebase or separate publication-status database.
