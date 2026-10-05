# 03.01 — Candidate discovery

> Status: Bounded Agent candidate gates, Capability 046 broad-discovery
> coverage and Capability 051 content-redaction/explicit-limitation handling
> are implemented. Group 5 dossier/standalone quality rules are implemented and
> verified.

## Discovery lanes and Seed

Discover runs five lanes: repository identity/product; runtime/entrypoint;
interface/route/event/trigger; dependency/integration/data/channel; and
deploy/operations. After exact-source Preflight, `discover_repository` runs a
bounded safe-file census to create a private per-connection Discovery Seed. Source
signals are compacted into session-stable evidence groups; repeated low-value
rows keep counts and source samples. The Agent does not invent lane status,
priority or absence.

Investigate submits one Inventory. Each important Seed group maps to exactly one
outcome: `materialized`, `question` or `ignored`. A materialized group may point
to several candidates; a candidate already declares standalone-document or
dossier/parent embedding and its parent, so Inventory does not declare them
again. Coverage groups are not split/merged
in the MVP; each item has one origin group, while multiple groups may contribute
to one candidate. Successful guidance freezes a compact Inventory Receipt; raw
source does not enter the Receipt or Hub.

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
before validation; raw source is not reused.

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

## Selection and census budgets

Census covers common conventions used by most repositories. Special cases are
recorded as limitations and left to the host agent's source investigation.
Prefer removing or narrowing noisy patterns; add a new pattern only for a
widely used standard convention. Exhaustive repository-specific detection is
outside this capability.

Follow the [Product scope](../../product/01-repository-understanding.md#coverage-expansion).
Discovery uses deterministic priority selection after bounded enumeration,
reserving one quarter of the budget for ordinary source. Do not
let file priority imply a service boundary or change evidence admission.

Initial Ingest exposes only `standard` and `expanded` census modes through
`discover_repository`. Standard retains the 256-file ceiling; expanded has a
1,024-file ceiling. Expansion needs
a concrete important coverage gap and explicit owner confirmation, not merely a
large repository or a low concept count. Preserve the exact source scope, disclose the selected budget and remaining limitations, and never
run an automatic escalating loop. Entry traversal, individual file size and
traversal limits remain separately visible; a larger file budget must
not be described as resolving those other limits.

The exact input/confirmation boundary and Seed/Receipt accounting are owned by
[`AB-INGEST-022..023`](../05-knowledge-entry/06-runtime-requirements.md).
An expansion replaces the standard Seed before Receipt creation and uses the
same armed source without indexing. Reject stale/missing consent,
another repository, repeated expansion and frozen Receipts. An agent attests
user confirmation; the runtime cannot independently authenticate chat consent.
Refresh Coverage remains a separate existing investigation, not this census.
No new public skill or ranking AI is introduced.

Seed construction also bounds groups before validation, preserves detected lane
representation and prioritizes P0. Runtime evidence is grouped by file except
for separate Terraform resource blocks. Omitted groups, including P0 overflow,
remain explicit coverage limitations rather than crashing discovery; the exact
selection and accounting contract is
[`AB-DISC-012`, `AB-DISC-016`](../01-repository-reading/05-runtime-requirements.md).
Common configuration key markers are admitted only in standard configuration
formats; UI code and minified/bundled assets remain outside these patterns.

## Candidate sources

The Agent creates candidates from read evidence, not guesses from names:

- root README/docs/ADR for declared purpose, boundary or decision;
- architecture/entrypoint/package boundaries from exact source;
- infrastructure/resource declarations with logical identity;
- an API, event, queue or data contract with integration value;
- an existing Hub concept/relation requiring new source evidence.

A file, function, cloud keyword or import is only a discovery signal;
none becomes a concept automatically.

An explicit `embedded` disposition is provider-independent. When no technology
mapping exists, guidance still returns embedded with provider-neutral metadata and
a limitation; `unsupported` applies only to standalone promotion/schema without
sufficient evidence or catalog support.

## Three standalone qualification gates

Every standalone candidate answers:

1. **Identity:** Can we point to this entity stably?
2. **Query/link value:** Does a user have an independent reason to find it or
   link another concept to it?
3. **Reading boundary:** Would a separate document carry independent ownership,
   lifecycle, contract, Flow, stewardship or cross-document relationship value
   instead of fragmenting its useful parent?

With all gates, the candidate moves to standalone schema selection. A stable and
useful repository-local fact that lacks the third gate moves into the Repository
dossier or another useful parent. Missing identity/value triggers bounded
evidence gathering; if it remains unclear and matters, keep a Question,
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
- Do not create a standalone candidate merely to make the Hub more detailed or
  to give a detected type its own file.
- A retained route, entrypoint, runtime root, API spec, IaC/deploy group, explicit
  service boundary, channel or datastore cannot disappear before an outcome is
  recorded. Evidence omitted by the Seed group bound remains coverage debt in
  capture limitations rather than receiving an invented Inventory outcome.
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

The deterministic workflow owns repository authority, source bounds,
candidate shape, identity checks, schema catalog, validation and retry budget.
The Agent owns semantic interpretation: what boundary the source describes, which
candidate has query value and which ambiguity needs a Question.

Do not hard-code a concept pipeline for AWS/serverless/e-commerce. Source
detectors/provider profiles create evidence signals; the Agent still applies the
two provider-neutral gates. Conversely, the Agent may not expand authority,
schemas or loops because its reasoning finds that useful.

Capability 051 adds two guards in the same boundary: source-line hints redact
credential-like values before entering the Seed, and unsupported source patterns remain explicit limitations rather than
creating guessed candidates.
