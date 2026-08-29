# 05 — How repository knowledge enters the Hub

> Status: Proposal, Local Draft and Hub publication foundations are implemented.

## Short answer

Once a Remote Hub is configured, Ingest creates a proposal for user review.
Accept locks the proposal as a Local Draft for that Hub; ordinary queries still
read only synchronized Published knowledge.

```text
Repository ──Ingest──→ Proposal ──review + Accept──→ Local Draft ──PR──→ Published
```

Without a configured Remote Hub, AgentBase only uses Code Graph for local
source; Hub query, Ingest, Refresh and OKF Draft have no authority to run.

## What does a repository contribute?

- new concepts or information for an existing concept;
- relations between concepts;
- evidence pointing to code, configuration or documentation; and
- Questions and limitations when evidence is insufficient.

A repository does not own a separate copy of every concept. Two repositories
may contribute evidence for one shared queue; if it is not clear that they mean
the same resource, the agent keeps a candidate and Question instead of merging incorrectly.

## The Hub keeps the overview; source keeps the detail

The Hub keeps roles, ownership, relations, decisions, Questions and important
references. A function, class, configuration field or small code path is usually
only evidence. When implementation detail is needed, the agent follows a
reference to source or the Code Graph.

## Publication state

A reviewed proposal/change set contains knowledge items such as concepts,
claims, relations, Questions or evidence updates. The user selects or drops
items before Accept; after Accept, the proposal becomes an immutable Local Draft
commit and the publication unit:

| State | Meaning |
|---|---|
| Local Draft | Proposal commit inspected/reviewed locally, not available to ordinary query |
| In Review | Proposal commit is in a PR and remains locally retained |
| Published | Proposal commit was merged and recognized by Hub synchronization |

These are not truth labels. Published knowledge still has provenance and is not
absolute truth. Pending local changes are viewed during proposal review;
ordinary search/read uses only the exact Published commit.

A PR may group consecutive proposal commits from several Ingest or Refresh runs.
Review, retry and cleanup are described in
[section 11](11-review-accept-and-publish.md).

## Each Hub has separate local state

A Hub profile is identified by a normalized remote URL and branch. Each profile
has its own Published clone and Draft workspace. Switching from Hub A to Hub B
opens existing state B or creates new state B; A's Published/Draft state remains
intact, becomes inactive and is never mixed into B.

## Low-level query decision

Search/read uses exact synchronized Published state; proposal inspection owns
pending changes.
