# Research: Live Evidence and Governed Questions

## Decision: Store references, observe values on demand

Change-prone claims use an `agentbase.live_claims` extension. Each entry links an
existing `sources[].id`, names a semantic target and records the source commit or
dirty digest seen during authoring. It does not contain the observed scalar.

At query time the agent reads accepted Hub evidence, binds the explicitly
authorized repository with `index_repository`, uses `search_graph` and
`get_code_snippet`, and reports the current observation with the current source
identity. AgentBase validates the reference and binding but does not evaluate
arbitrary programming languages.

**Rationale**: This removes the stale numeric copy while reusing the only source
inspection boundary already present in the product.

**Alternatives considered**: caching the last value preserves the stale-data
failure; a new parser/evaluator is language-specific and speculative; a watcher
adds an unapproved process lifecycle.

## Decision: Keep all evidence roles and never select a winner

Claims are grouped by exact `subject` and `property`, but remain individually
identified and labeled `documentation`, `implementation`, `configuration` or
`maintainer-guidance`. Equal observations may be presented together; incompatible
observations create or reuse one deterministic question. No confidence score,
arrival order or source priority makes a claim true.

**Rationale**: Documentation, implementation and maintainer intent describe
different things. Preserving the labels is more accurate than collapsing them.

**Alternatives considered**: latest-wins loses intent and history; source ranking
silently creates policy; duplicating one question per ingest creates noise.

## Decision: Admit questions with accepted proposals

An authoring session may stage bounded question declarations referring to claim
IDs in its authored bundle. Finalization stores them with the immutable proposal,
shows them in inspection and binds their normalized digest to the proposal digest;
accept applies the reviewed Hub commit and the question-ledger update under the
existing Hub mutation lock. The accepted proposal retains its private declaration
attachment; question reads idempotently reconcile any accepted attachment not yet
projected after an interrupted accept. Unaccepted proposals cannot create durable
questions.

The ledger is private atomic JSON keyed by local Hub identity. It is workflow
state, not an OKF `Open Question` concept and not provider-private graph state.

**Rationale**: A question should survive restart but must not outlive rejected
evidence as if that evidence had been accepted.

**Alternatives considered**: writing during prepare leaks abandoned questions;
portable question Markdown contradicts the current schema direction; in-memory
state fails restart recovery.

## Decision: An answer is evidence plus a proposal

`answer_hub_question` requires a non-empty `human:<identity>`, answer text and the
question's current revision. Under the Hub mutation lock it appends an immutable
answer event, marks a pending question resolved and prepares exactly one new stable
`Maintainer Guidance` concept linked to the question and claims. Accepted Hub
bytes are unchanged until the ordinary inspect/accept step.

A later, different maintainer answer at the exact current revision is also retained
and creates its own guidance proposal; incompatible human answers reopen the
question instead of allowing arrival order to choose one.

The guidance proposal is a narrow specialization of the existing proposal
bundle/diff/state machinery. It permits exactly one new `guidance/<question-id>.md`
file plus additive index navigation, and rejects repository claims that the human
did not make.

**Rationale**: The answer remains durable user evidence even before publication,
while shared knowledge still passes normal review.

**Alternatives considered**: directly committing guidance bypasses review;
waiting to record the answer until acceptance can lose the user's response;
forcing guidance through repository-draft validation misattributes human evidence
to source code.

## Decision: Bound the first slice to one admitted repository

A single MCP connection already binds exactly one repository. Live resolution
therefore succeeds only when each reference has that normalized repository ID.
References to another repository are returned as `repository-mismatch`; the agent
may open a separately authorized connection but AgentBase does not auto-discover
or auto-switch repositories.

**Rationale**: This preserves explicit authority and avoids a machine-local path
registry in portable Hub knowledge.

**Alternatives considered**: persisting checkout paths leaks local topology;
automatic repository discovery violates the authority contract.
