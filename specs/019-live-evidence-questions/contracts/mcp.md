# MCP Contract: Live Evidence and Governed Questions

## Existing authoring lifecycle

`prepare_hub_okf` returns the source identity used to validate live claims:

```json
{
  "source": {
    "repositoryId": "repository-shop-123456789abc",
    "commit": "0123456789012345678901234567890123456789",
    "dirty": false,
    "dirtyDigest": null,
    "limitations": []
  }
}
```

`finalize_hub_okf_proposal` adds optional `questions` (maximum 64). Each item has
`subject`, `property`, `claim_ids` and optional `missing_evidence`. It rejects
unknown claims or claims outside the proposal's admitted source. Normalized
declarations appear in proposal inspection and contribute to the proposal digest
confirmed during acceptance.

## `read_hub_live_evidence`

Input:

```json
{ "path": "systems/checkout/session.md" }
```

Returns accepted concept identity, Hub commit and validated live claim references.
It does not return a cached scalar. The caller then uses the existing
`index_repository`, `search_graph` and `get_code_snippet` tools on the explicitly
authorized source checkout and reports current observations by claim role.

If the indexed repository identity differs, the combined workflow returns
`repository-mismatch`. If path/target lookup is ambiguous or absent it returns
`indeterminate`, `unavailable` or `stale`; it never substitutes an old scalar.

## `list_hub_questions`

Input supports optional `status` (`pending` or `resolved`) and `limit` (1..100).
Output is ordered by update time then ID and includes question revision, subject,
property, claim IDs, linked claim roles/source references, missing evidence and
bounded history.

## `answer_hub_question`

Input:

```json
{
  "question_id": "0123456789abcdef01234567",
  "question_revision": 1,
  "answer": "The intended session TTL is seven days.",
  "maintainer": "human:khoa"
}
```

The call fails for a missing/stale question revision, empty answer, non-human
identity, changed Hub head or conflicting Hub mutation. A pending question becomes
resolved. A later incompatible answer at the exact current revision is appended,
creates separate guidance and reopens the question; no answer overwrites another.
Success returns the new question revision and an immutable Maintainer Guidance
proposal plus its inspection digest. The caller must still use
`inspect_hub_okf_proposal` and `accept_hub_okf_proposal`; accepted Hub bytes do not
change during answer.

## Query presentation rule

The agent presents separately labeled entries, for example:

```text
Documentation: 30 days (README.md, current source revision ...)
Implementation: 7 days (src/config.ts, current source revision ...)
Maintainer guidance: intended value is 7 days (human:khoa, accepted Hub commit ...)
Status: evidence conflicts; no canonical value selected.
```

An unresolved or unavailable source is shown in place of its value. Equal values
may be grouped for readability but their provenance remains visible.
