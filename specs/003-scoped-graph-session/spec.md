# Capability 003: Scoped Graph Session

- **Status:** Completed
- **Created:** 2026-08-12
- **Completed:** 2026-08-12
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`

## Outcome

A coding agent can prepare the existing bounded repository evidence through one
observable provider session that exists only for that evidence round. The
result must retain the accepted facts and safety properties while materially
reducing repeated provider startup cost.

This capability hardens Part 1 only. It does not add automatic refresh,
background watching, shared graph storage, Terraform/AWS analysis or new OKF
semantics.

Promotion result: three alternating real pairs retained normalized parity and
clean lifecycle behavior while reducing median total time from `67073.047ms`
to `14405.099ms` (`4.656x`). Scoped session is therefore the default real
evidence transport; one-shot remains explicit rollback.

## Owner decisions treated as settled

- AgentBase continues to own the exact provider package and executable. Users
  do not install or select a binary.
- The optimized lifecycle is one short-lived stdio session per explicit
  evidence round, not a daemon, watcher, UI server or machine-wide service.
- The session uses the same private cache, allowed repository root, normalized
  evidence contract and source-mutation checks as the accepted one-shot path.
- Session failure is visible and leaves no provider process. AgentBase does not
  silently retry the work through another transport.
- The existing one-shot transport remains an explicit diagnostic and rollback
  path until the scoped session proves parity and the accepted speed gate.
- No default changes until a paired real integration on the same machine shows
  exact critical-fact parity, safe cleanup and at least a twofold end-to-end
  speed improvement.
- Automatic file-change detection and refresh remain a later capability. This
  slice establishes a safe fast unit of work first.

## User stories

### User Story 1 — Prepare evidence in one scoped session (P1)

As a coding agent, I can prepare the accepted repository evidence without
starting a new provider process for each architecture, search, trace and
snippet request.

Acceptance:

- one admitted child session serves indexing and all required graph queries for
  exactly one evidence round;
- the session returns the same manifest-declared critical facts within the
  existing three-file bound;
- normalized public evidence contains no transport-private protocol values or
  machine-local roots;
- graceful close is attempted after success or failure, followed by a bounded
  forced termination when needed;
- successful completion leaves no provider process and does not modify source
  or forbidden repository control files.

### User Story 2 — Observe the complete graph round (P1)

As a coding agent, I can run the same bounded graph task through the current
one-shot path and the candidate scoped-session path and receive a comparable
timing report instead of relying on provider marketing or intuition.

Acceptance:

- both arms bind the same provider identity, repository source state and query;
- the report separates admission, indexing, query and cleanup durations;
- each arm reports completion/failure, fact IDs, referenced files, repository
  mutation result and remaining-process result;
- the report records real measurements without claiming that one fixture is a
  universal performance guarantee;
- canonical offline verification does not run the native provider.

### User Story 3 — Keep rollback and failures explicit (P1)

As a maintainer, I can tell which transport ran, inspect why a session failed,
and explicitly select the accepted one-shot lifecycle while investigating or
rolling back the optimization.

Acceptance:

- the selected transport and lifecycle identity are present in diagnostic and
  benchmark results;
- protocol negotiation, tool errors, malformed responses, timeout, output
  limit, premature exit, source mutation and cleanup failure are distinct
  visible failures;
- a scoped-session error never produces a partial successful evidence bundle;
- explicit one-shot selection preserves Capability 002 behavior;
- no command registers an MCP, changes provider configuration or starts a
  standing process.

## Functional requirements

### Measurement and promotion

- **AB-GRAPH-001**: AgentBase MUST provide an opt-in paired lifecycle benchmark
  that runs the same accepted fixture source state and task through one-shot and
  scoped-session transports.
- **AB-GRAPH-002**: Each arm MUST record monotonic admission, indexing, query,
  cleanup and total durations plus provider identity, source identity,
  transport, fact IDs, referenced files, mutation status and process-cleanup
  status.
- **AB-GRAPH-003**: The benchmark MUST compare normalized fact identity and
  source references, and MUST fail parity when either arm is partial, unsafe or
  does not contain all accepted critical facts.
- **AB-GRAPH-004**: Scoped session MUST NOT become the default unless three
  paired rounds on the same supported host show a median total duration no more
  than 50% of one-shot, with full parity and clean lifecycle evidence in every
  round.

### Scoped provider lifecycle

- **AB-GRAPH-005**: AgentBase MUST resolve and admit the exact Capability 002
  managed executable before starting a session and MUST NOT search `PATH` or
  accept a user executable.
- **AB-GRAPH-006**: One scoped session MUST serve index, full-aspect
  architecture, bounded search, trace and exact snippet operations for one
  evidence round, then close.
- **AB-GRAPH-007**: A session MUST use an exact repository allow root and the
  existing private provider cache outside the checkout, and MUST disable UI and
  any product-controlled background watcher behavior.
- **AB-GRAPH-008**: Session startup, individual request, total round, response
  size, stderr size and shutdown MUST be bounded; exhaustion MUST fail closed.
- **AB-GRAPH-009**: Success, error and caller cancellation MUST all attempt
  graceful session close followed by bounded forced termination, and accepted
  completion MUST leave no provider process.
- **AB-GRAPH-010**: Session responses MUST pass through the existing provider
  parser, provider-neutral task-context contract and repository-evidence
  normalization without transport-private schema leakage.
- **AB-GRAPH-011**: Source/control mutation or source-state drift during an
  evidence round MUST reject the entire result.

### Failure, rollback and verification

- **AB-GRAPH-012**: Lifecycle failures MUST distinguish admission, protocol,
  provider tool, malformed output, timeout, output limit, premature exit,
  source mutation and cleanup failure without automatic transport fallback.
- **AB-GRAPH-013**: The one-shot path MUST remain explicitly selectable and
  retain its accepted Capability 002 arguments and safety behavior.
- **AB-GRAPH-014**: Mandatory verification MUST use fake transports and captured
  responses; real session/benchmark commands MUST remain opt-in and require no
  credential or model call.

## Edge cases

- The provider supports one-shot CLI but rejects or cannot negotiate an MCP
  session: fail before indexing and keep one-shot explicit.
- The server exits between two requests: reject the round; do not reuse partial
  facts.
- A request returns an MCP tool error with otherwise valid JSON: report a
  provider-tool failure rather than malformed output.
- Stderr or one protocol message exceeds its cap: close the session and reject
  the round.
- Source changes after indexing but before evidence finalization: reject the
  result as stale/mutated.
- Close hangs or a descendant survives graceful termination: force termination
  within the shutdown budget and fail lifecycle acceptance if cleanup cannot be
  established.
- The paired benchmark warms one arm unfairly: alternate arm order across three
  rounds and disclose the order.

## Assumptions

- The exact provider's documented stdio server is compatible with a maintained
  official MCP client after protocol negotiation is tested.
- The 12-file fixture is suitable for measuring repeated process startup
  overhead, not repository-scale indexing throughput.
- The user already accepted explicit local provider execution; this capability
  adds no network, credentials or AI inference to the runtime path.

## Success criteria

- **SC-GRAPH-001**: Every accepted benchmark arm contains all required timing,
  identity, parity, mutation and cleanup fields; no measured stage is silently
  inferred.
- **SC-GRAPH-002**: Scoped-session output contains 100% of the five accepted
  critical facts within no more than three of 12 authored fixture files and is
  normalization-equivalent to one-shot output.
- **SC-GRAPH-003**: Across three alternating paired rounds on the accepted host,
  scoped-session median total time is at most 50% of one-shot median total time.
- **SC-GRAPH-004**: All successful and injected-failure scenarios finish with
  zero standing provider processes and unchanged repository source/control
  fingerprints.
- **SC-GRAPH-005**: Explicit one-shot rollback still produces the accepted
  evidence contract with no session dependency.
- **SC-GRAPH-006**: Canonical offline verification passes without network,
  credentials, AI calls or native-provider execution.

## Explicit non-goals

- Background daemon, watcher, editor integration or automatic refresh.
- Cross-process or cross-agent session sharing.
- Persistent raw graph publication or repository-committed provider state.
- Provider upgrade, second-engine parity or unsupported-host expansion.
- Direct-source value comparison, OKF authoring changes, Hub, Terraform or AWS.
