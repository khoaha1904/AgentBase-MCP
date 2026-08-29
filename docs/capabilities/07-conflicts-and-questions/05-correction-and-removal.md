# 07.05 — Correction and removal

> Status: Implemented MVP contract.

## Decision

MVP has no per-item `superseded`/`retracted` state or tombstone. When exact
evidence or maintainer direction is sufficient, Refresh/Enrichment may create a
Proposal that corrects or removes AgentBase-owned knowledge.

Proposal preview and PR must state:

- exact concept/knowledge corrected or removed;
- reason and evidence;
- relevant replacement/link when present;
- affected Questions/relations.

Conflict alone, absent evidence in one Refresh, or temporarily unavailable source
permission is insufficient for removal. Protected/human-authored/foreign
knowledge retains existing ownership rules. Git history is audit/restore; rollback
uses a reviewed revert/correction rather than a lifecycle database.
