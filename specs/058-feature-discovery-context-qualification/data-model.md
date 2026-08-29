# Data Model: On-Demand Feature Discovery Qualification

## Scenario

- suite/version
- Feature text and synthetic tracker context
- pinned Hub URL, branch and commit
- required active local profile identity and Published commit
- shared prompt version, model, effort and timeout
- allowed tools and session limits
- hidden priority-tier expected probes

The profile has no production/test field. `hub-3` is only the selected
development fixture named by this suite.

## Retrieval trace

- exact Published commit
- ordered completed/failed tool calls
- safe arguments and serialized result byte counts
- total searches, reads and result bytes
- lifecycle violations and Hub limitations

The trace is benchmark evidence, not Hub knowledge or ordinary runtime state.

## Discovery draft

- `overview`: string, at most 1,200 characters
- `affected_areas`: up to 16 `{ identity, reason, evidence_refs: string[] }`
  values
- `relevant_relations`: up to 16 `{ source, predicate, target, evidence_refs }`
  values
- `discovery_questions`: up to 16 unresolved questions
- `known_unknowns`: up to 16 explicit gaps or ambiguities
- `evidence_refs`: up to 16 unique `{ id, path, commit }` values

Each free-text item is at most 500 characters. Both arms share the schema.
Nested `evidence_refs` contain IDs from the top-level array. Assisted identities,
relation endpoints and Published path/commit references must resolve inside its
trace. Malformed or duplicate/unresolved output makes the arm incomplete.

## Arm result

- arm: `discovery-only` or `discovery-plus-agentbase`
- immutable prompt/input digests
- agent identity and process outcome
- raw structured output
- retrieval trace (`null` for direct)
- elapsed time and token usage
- failures

## Comparison

- critical/important/optional matched totals per arm
- unsupported critical claims
- traceability and tool-admission results
- efficiency deltas, diagnostic only
- deterministic gate outcome
- owner review: `not_required`, `pending`, `accepted` or `rejected`
- final status: `passed`, `needs_review`, `needs_revision` or `incomplete`
- explicit reasons and limitations

One real comparison may receive one immutable owner-review record. It never
rewrites either arm, trace or deterministic assessment.
