# Bug Assessment: Hub Proposal Commits Appear Decades Old

- **Slug**: hub-epoch-commit-date
- **Created**: 2026-08-12
- **Source**: user report and merged private-Hub commit metadata
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

After merging the qualified AgentBase Hub proposal, GitHub displayed its
history as approximately 27 years old. Commit
`f1b4effd8594b02e1961b5e0685d290cc2c1dffe` has both author and committer date
`2000-01-01T00:00:00Z`, while the surrounding merge commits correctly use
2026-08-12.

## Symptom

Every AgentBase-generated Hub proposal commit is dated 2000-01-01, making
GitHub history misleading. Commits should use the proposal's stable creation
time while retaining deterministic retry and recovery behavior.

## Reproduction

1. Prepare and submit any Hub proposal.
2. Inspect the generated commit with `git log --format=%aI%n%cI`.
3. Observe both dates are 2000-01-01 regardless of proposal creation time.

## Suspected Code Paths

- `src/app/hub-okf/submit.ts:35` — hardcodes `COMMIT_TIMESTAMP` to 2000-01-01.
- `src/core/knowledge/proposal.ts` — already persists the proposal `createdAt`
  value required for a stable, meaningful commit timestamp.
- `src/app/hub-okf/local-e2e.test.ts` — creates a real commit but does not assert
  its author/committer dates.

## Root Cause Hypothesis

Confidence: high. The fixed epoch was introduced to keep commit hashes
deterministic, but the immutable proposal metadata already provides a stable
creation timestamp. The epoch is therefore unnecessary and harms history UX.

## Proposed Remediation

**Preferred**: remove the hardcoded epoch. Read and validate `createdAt` from
the immutable proposal metadata and pass it to the bounded Git commit request.
This keeps retries deterministic because the timestamp is persisted before
submission. Reject malformed timestamps before any commit.

**Files likely to change**:

- `src/app/hub-okf/submit.ts`
- `src/app/hub-okf/submit.test.ts`
- `src/app/hub-okf/local-e2e.test.ts`
- `docs/specs/agentbase-hub.md`

**Tests to add or update**:

- Unit submission uses exact persisted `createdAt`, never the year-2000 epoch.
- Local Git E2E verifies author and committer timestamps match proposal creation.
- Recovery behavior remains unchanged because committed state reuses the exact
  stored commit.

## Risks & Considerations

- Existing merged commits are immutable and will retain their old timestamp.
- Rewriting existing Git history is explicitly out of scope.
- Invalid persisted timestamps must fail before Git mutation.

## Open Questions

- None.
