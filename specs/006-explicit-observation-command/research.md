# Research: Explicit Observation Command

## Decision 1: Preserve provider graph authority

**Decision**: Reuse Codebase Memory indexing and query results through the
existing adapter; do not create an AgentBase node/edge graph model.

**Rationale**: The owner explicitly selected Codebase Memory semantics, and the
product vision makes the detailed graph disposable provider state.

**Alternatives considered**: Normalizing every provider node and edge into a
second graph was rejected as duplication and provider-schema leakage.

## Decision 2: Separate explicit commands

**Decision**: Add `observe` while retaining `okf` as an unrelated explicit
command. Observation output goes to stdout and performs no knowledge action.

**Rationale**: Command separation gives the user an observable authorization
boundary and allows evidence inspection before knowledge synthesis.

**Alternatives considered**: Automatically preparing OKF after graph queries
was rejected by the owner. Renaming the existing opt-in integration command was
rejected to preserve diagnostic compatibility.

## Decision 3: Reuse repository evidence

**Decision**: The first observation output is the existing normalized repository
evidence bundle and digest, not a new relationship schema.

**Rationale**: It already binds exact engine, source revision, query inputs,
facts, sources, completeness and limitations and has deterministic tests.

**Alternatives considered**: A new `CodeRelationshipObservation` record was
rejected because it would prematurely reinterpret provider graph semantics.
