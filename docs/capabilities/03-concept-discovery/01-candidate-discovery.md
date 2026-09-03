# 03.01 — Candidate discovery

> Status: Bounded Agent candidate gates, Capability 046 broad-discovery
> coverage and Capability 051 content-redaction/explicit-limitation handling
> are implemented.

## Discovery lanes and Seed

Discover runs five lanes: repository identity/product; runtime/entrypoint;
interface/route/event/trigger; dependency/integration/data/channel; and
deploy/operations. After indexing, MCP runs a fixed provider baseline and a
bounded safe-file census to create a private per-connection Discovery Seed. Raw
graph nodes are compacted into session-stable evidence groups; repeated low-value
rows keep counts and source samples. The Agent does not invent lane status,
priority or absence.

Investigate submits one Inventory. Each important Seed group maps to exactly one
outcome: `materialized`, `question` or `ignored`. A materialized group may point
to several candidates; a candidate already declares concept/embedded and parent,
so Inventory does not declare them again. Coverage groups are not split/merged
in the MVP; each item has one origin group, while multiple groups may contribute
to one candidate. Successful guidance freezes a compact Inventory Receipt; raw
graph/source does not enter the Receipt or Hub.

The Agent does not create Inventory item IDs, QuestionPlan IDs, output parents or
a second candidate-level evidence list. MCP derives those fields from the active
Seed and the same guidance request. A Seed group's source list is bounded sample
material for understanding and review, not an exhaustive repository-evidence
allowlist. Caller-correctable defects return as one bounded diagnostic set in
the same `INVALID_ARGUMENT`, rather than forcing the Agent to discover errors
one at a time.

An explicitly `embedded` candidate is bound to its parent by candidate-owned
exact evidence and does not depend on a provider profile. The Agent may improve
the human-readable label in a table/prose; Finalize does not use an exact
identity-hint substring as the materialization gate. If exact evidence disappears
from the parent, MCP appends the canonical embedded row from the frozen Receipt
before validation; raw graph is not reused.

`get_okf_authoring_schemas` validates submitted Inventory against the active Seed
and returns `discovery_receipt_id`. New-mode `prepare_hub_okf` consumes that
exact ID rather than trusting a resent mutable guidance payload. Before Prepare,
the Receipt is immutable connection state; Prepare atomically creates one
private authoring session. An exact retry returns the same session; mismatched
use fails.

A Question outcome creates a private QuestionPlan using the existing
SharedQuestion kind. The Agent selects a `candidate_key + evidence_id` already
present in the same guidance request; MCP derives the exact normalized source
resource and SourceSnapshot revision before freezing the candidate-evidence
reference into the Receipt. The Agent does not create a `repository://` URI or
revision. If subject/evidence cannot be bound, retain a limitation and do not
create an orphan Question.

## Candidate sources

The Agent creates candidates from read evidence, not guesses from names:

- root README/docs/ADR for declared purpose, boundary or decision;
- architecture/entrypoint/package boundaries from graph and exact source;
- infrastructure/resource declarations with logical identity;
- an API, event, queue or data contract with integration value;
- an existing Hub concept/relation requiring new source evidence.

A graph node, file, function, cloud keyword or import is only a discovery signal;
none becomes a concept automatically.

An explicit `embedded` disposition is provider-independent. When no technology
mapping exists, guidance still returns embedded with provider-neutral metadata and
a limitation; `unsupported` applies only to standalone promotion/schema without
sufficient evidence or catalog support.

## Two qualification gates

Every candidate answers:

1. **Identity:** Can we point to this entity stably?
2. **Query/link value:** Does a user have an independent reason to find it or
   link another concept to it?

With both gates, the candidate moves to schema selection. Missing a gate triggers
bounded evidence gathering; if it remains unclear and matters, keep a Question,
otherwise omit it from this run when there is no independent value. Omission is
not stored as a suppression rule; a later Refresh can reassess it with new
evidence.

## Minimum candidate record

A workflow candidate carries:

- proposed role/name and identity hint;
- supporting source IDs;
- the signal extracted from each source;
- why it has query/link value;
- remaining missing evidence or ambiguity.

There is no numeric score or confidence percentage. Completeness/limitation
describes the specific missing part instead of a falsely precise number.

## Guards

- A source-free signal cannot authorize an authoring schema.
- One direct source may be sufficient; do not invent a minimum source count.
- Future intent or vague docs are not presented as implemented state.
- Do not create a candidate merely to make the Hub more detailed.
- A route, entrypoint, runtime root, API spec, IaC/deploy group, explicit service
  boundary, channel or datastore cannot disappear before an outcome is recorded.
- MCP fixes P0 classification. Distinct discovery groups may materialize the
  same candidate when they contribute evidence to one knowledge boundary; the
  candidate identity is emitted once. A P0 group is ignored only when it adds
  no distinct evidence, using exact reason `duplicate-covered` and pointing to
  an item that will materialize. Generated/out-of-scope items are placed below
  P0 when the Seed is created and cannot be used as a P0 pass reason.
- An explicit outbound/trigger/datastore boundary may create one P1 Flow
  candidate and representative trace; it does not create a process graph.
- CRUD handlers, helpers, tests, generated/vendor rows and lockfile-only
  dependencies may be grouped/ignored; important does not mean standalone.

## Deterministic/AI balance

The deterministic workflow owns repository authority, graph/source bounds,
candidate shape, identity checks, schema catalog, validation and retry budget.
The Agent owns semantic interpretation: what boundary the source describes, which
candidate has query value and which ambiguity needs a Question.

Do not hard-code a concept pipeline for AWS/serverless/e-commerce. Source
detectors/provider profiles create evidence signals; the Agent still applies the
two provider-neutral gates. Conversely, the Agent may not expand authority,
schemas or loops because its reasoning finds that useful.

Capability 051 adds two guards in the same boundary: source-line hints redact
credential-like values before entering the Seed, and captured architecture
sections without an exact source path become a limitation rather than silently
disappearing or creating an unbounded candidate.
