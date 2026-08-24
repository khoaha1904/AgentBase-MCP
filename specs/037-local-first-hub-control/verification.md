# Verification: Local-first Hub Control

## Automated

- `npm run verify`: passed on 2026-08-24.
- Canonical inventory remains 50 tests; all 50 passed.
- Existing journeys now cover one continuous no-Hub → lazy local preflight →
  Accept/query/restart lifecycle, two isolated profiles, canonical legacy
  migration, exact per-profile credentials, failed activation, GitHub Enterprise
  API routing, non-`main` targets, failure-atomic bootstrap retry, rewritten-
  history rejection, OKF candidate integrity and stale-lock recovery.
- `skill-creator` validation passed for `.agents/skills/agentbase-hub/SKILL.md`.

## Live local/remote state

- Migrated the existing single-profile installation to an active pointer,
  owner-private profile metadata and per-profile credential file.
- Recovered `sync-msr3vsov` as already advanced and `sync-mt4n17oe` as restored
  original. A subsequent reproduction transaction was also recovered.
- Published boundary remained `9fcb2aec8790fcfe31f30354c09ac51a0d65fc92`;
  active local head remained `b771176c10d9bf261044a57210089fa7ca4fcc2f`;
  all three Local Draft commits were preserved.
- Compact status reported the configured GitHub.com Hub, `main`, credential
  ready, zero open PRs and remote updates at
  `de018047bdff1b6ef16988b144a02db8c2506923`.
- A real global query against the preserved local overlay returned the expected
  Repository, Domain, System/Component/Flow knowledge.

The live installation evidence above predates the final canonical-ID migration.
That migration is qualified offline and deliberately runs only on the next
explicit mutating action; status remains read-only.

## Expected blocked synchronization

The real sync correctly stopped rather than inventing a merge. Remote and local
contain different Initial Ingest knowledge for the same canonical repository;
the conflict spans concept identity/domain choices, not only append-only indexes.
Recovery removed the candidate transaction without resetting or deleting any
draft. The owner must later cancel the duplicate Init contribution or rebuild it
as Refresh; this data decision is not a runtime defect.

## Deferred external evidence

No new Init/Refresh PR was opened or merged for this capability. The owner has
explicitly kept current PR/merge decisions outside this implementation pass.
Composed offline Git/GitHub journeys cover the publication lifecycle. T025 stays
explicitly deferred until the duplicate Init is resolved and the owner requests
external publication; it does not represent unfinished runtime implementation.
