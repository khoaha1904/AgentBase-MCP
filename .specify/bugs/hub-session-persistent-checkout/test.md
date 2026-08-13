# Bug Test: Persistent Hub sessions cannot finalize

- **Slug**: hub-session-persistent-checkout
- **Tested**: 2026-08-13
- **Result**: passed

## Regression proof

- An authoring session whose configured persistent Hub checkout is outside the
  private runtime state root finalizes successfully.
- The same persisted session is rejected when finalization supplies a different
  checkout identity.
- The approved T043 session was retried against the exact configured
  `/home/khoa/workspace/AgentBase/AgentBase-Hub` checkout and produced an
  applicable immutable proposal.

## Complete gate

`npm run verify` passed with 219 tests, 0 failures, specification and type
checks passing, and architecture reporting 0 errors. The five architecture
warnings remain visible review signals; no files were split merely to suppress
them.

## Additional defect found during retest

The first retry exposed that whole-subject deletion needed an explicit narrow
policy and Git-compatible empty-directory handling. Refresh now permits the
operation only when every non-index subject file is a mutable AgentBase draft
and root `index.md` removes exactly that subject link. Reviewed content,
unrelated root edits, and every other reserved-index deletion remain protected.
