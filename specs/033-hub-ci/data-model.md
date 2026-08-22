# Data Model: AgentBase-Hub CI

## HubCiResult

- exact root tree digest and generation time;
- `passed`, ordered blocking errors and ordered warnings;
- capability-032 freshness projection;
- deterministic Markdown summary.

## HubCiWorkflow

- fixed relative path and format version;
- pinned AgentBase release tag and action commits;
- exact bytes and SHA-256 digest.

## HubCiUpgradeIntent

- Hub repository and target branch;
- exact remote-main base commit;
- workflow path/version/digest and state (`missing`, `current`, `outdated`);
- fixed head branch; no token or local path.

Upgrade is a no-op when current. Otherwise explicit submit creates/reuses one
head commit and one open PR; GitHub merge remains external.

