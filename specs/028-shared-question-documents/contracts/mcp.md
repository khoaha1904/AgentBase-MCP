# MCP Contract: Shared Questions

## Finalize declaration

`finalize_hub_okf_proposal` continues accepting bounded Question declarations.
The caller supplies natural origin/scope and typed evidence references; it never
calculates ID, revision, path or state. Finalize resolves those fields and places
the rendered Question/index in the ordinary proposed tree before inspection.

## `list_hub_questions`

Input:

```json
{ "status": "open", "limit": 100 }
```

`status` is optional and accepts `open`, `resolved` or `needs-review`. `limit`
remains 1..100. Results come from one exact admitted Hub commit and include ID,
revision, state, kind, subject/property, typed references, missing evidence,
limitations and Guidance links. No private ledger reconciliation, source probe,
model call or network operation occurs.

## `answer_hub_question`

Input:

```json
{
  "question_id": "question-0123456789abcdef01234567",
  "question_revision": 1,
  "answer": "The intended TTL is seven days.",
  "maintainer": "human:khoa"
}
```

The call reads the exact Question from current local Hub head. It returns one
ordinary proposal and inspection whose allowed changed set is:

- create `guidance/<question-id>-r<revision>.md`;
- update `questions/<question-id>.md` to revision + 1 and `resolved`;
- update renderer-owned navigation only if structurally required.

Before Accept, subsequent list/read still returns the accepted prior revision.
Stale revision, changed Hub head, invalid human identity, unsafe answer, invalid
transition or orphan Guidance preflight fails before proposal creation/mutation.

## Accept and synchronization

`accept_hub_okf_proposal` applies the proposal tree normally. It performs no
Question ledger write. After Accept or Git synchronization, list/read derives the
same state from Hub Markdown on every machine.

## Removed private contract

`questions.json` proposal attachments, governed-question ledger files,
reconciliation scans over accepted proposal directories and `pending` status are
not runtime authority after cutover.
