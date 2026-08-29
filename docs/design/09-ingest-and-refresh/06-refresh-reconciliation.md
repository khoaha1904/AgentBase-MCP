# 09.06 — Refresh reconciliation and removal

> Status: Core single-repository reconciliation is implemented.

## Change evidence

Refresh compares the last observed source revision with current source. A removal
candidate can use:

- exact Git deletion/rename diff;
- a source symbol/configuration/resource declaration missing at the current revision;
- replacement identity and continuity evidence;
- explicit maintainer guidance.

Failure to find something through graph/search and partial coverage are
insufficient removal evidence. A rename/move with continuity updates the
reference/identity hint and does not delete the concept.

## Outcomes

- Source removed but the concept retains foreign-source evidence: remove/update
  the current repository contribution; do not delete the shared concept.
- Concept/knowledge was replaced or confirmed wrong: propose an ordinary
  correction or removal with an exact reason/evidence; Git retains history.
- An AgentBase-owned concept has only current-repository evidence, its source is
  clearly removed and it has no remaining history/query value: file/navigation
  deletion can be proposed.
- Evidence is insufficient: preserve current knowledge and add a Question/limitation.

No outcome applies automatically. Proposal validation protects foreign sources,
protected bytes and relationship targets.

## Review/PR presentation

Proposal inspection and the pull-request summary must group at least:

```text
Added
Updated
Removed
Questions / Limitations
```

Each destructive change shows the concept/path, reason, source revision/diff
evidence, affected relations/navigation and any replacement. The reviewer sees
the Markdown/Git diff but does not have to infer the reason from deleted bytes.

## Implementation delta

Omission or elapsed time does not authorize deletion. Destructive changes use
exact correction/removal intent with evidence; foreign/protected content is
retained. Inspection groups Added, Updated, Removed and Questions/Limitations.
The rich pull-request body presenting these groups belongs to Section 11.
