# Research: Scoped Graph Session

## Current measured problem

Capability 002 admits the managed executable once, then invokes separate
one-shot CLI processes for indexing, architecture, search, trace and each source
snippet. The provider adapter caches the parsed architecture in memory, but the
process startup cost remains per tool call.

ADR 0005 measured roughly 11 seconds for fixture indexing and roughly 9 seconds
for each cold one-shot query on the accepted host. That is walking-skeleton
evidence, not an interactive Part 1 lifecycle.

## Decision: one session per evidence round

Run the exact managed executable in its documented default stdio MCP-server
mode for one evidence round. Connect, index, issue the same bounded tool calls,
close and prove zero remaining process.

Rationale:

- it amortizes provider coordination startup without creating a standing
  product daemon;
- session lifetime aligns with one source-state/mutation validation boundary;
- the existing adapter already accepts an abstract tool invoker, so the public
  evidence and parsing contracts can remain unchanged;
- a failed session can be discarded without corrupting OKF or repository state.

Alternatives considered:

- **Standing daemon/watcher:** potentially fastest repeated refresh, but adds
  background ownership, stale state, concurrency and user-control behavior
  before a scoped session is proven.
- **Keep one-shot only:** safest existing rollback, but repeats the measured
  startup cost and does not advance the latency goal.
- **Hand-written MCP framing/client:** fewer dependencies but recreates protocol
  negotiation, request correlation, cancellation and error semantics.
- **Change provider:** unjustified before testing the provider's intended
  session surface.

## Decision: official exact MCP client dependency

Plan to pin `@modelcontextprotocol/client@2.0.0` exactly after owner approval.
The npm package identifies v2 as the stable client line, requires Node.js 20 or
newer, and has archive integrity
`sha512-8f1OghQ2rjzIOfqgUCP+8GiUWqRs89njoWLNqAe8kWmDePv3s1fZXseej+QXemssEuuOvLLmLO/kqM3IQHtISw==`.
AgentBase already requires Node.js 24.

Rationale:

- use maintained protocol negotiation and typed tool calls rather than
  implementing an MCP subset;
- keep protocol schema inside the provider boundary;
- the stdio transport exposes a PID, bounded message buffer and close behavior
  with graceful/forced termination.

Risks to verify before promotion:

- Codebase Memory `v0.10.1` may negotiate an older protocol version;
- SDK close semantics target the direct child, so real integration must prove
  provider descendants do not survive;
- SDK stderr requires an AgentBase byte cap and failure path;
- all transitive packages become production supply-chain surface and require a
  clean audit.

Compatibility spike result on the accepted Linux x64 host:

- exact client/core `2.0.0` installed with the pinned archive integrity and the
  production audit reported zero known vulnerabilities;
- the client negotiated successfully with the exact admitted provider binary;
- one direct child served index, architecture, search, trace and three snippet
  calls, and neither it nor a descendant remained after close;
- connection took `8858.80ms`, indexing `3833.69ms`, each subsequent query
  `13.98–18.76ms`, close `16.86ms`, and the complete spike `13069.82ms`;
- fixture source digest remained unchanged; cache state stayed outside the
  repository; stderr was empty;
- architecture remained content-text shaped while the other relevant results
  exposed structured content, which is compatible with the existing parsers.

The stop gate therefore passed. Exact sanitized evidence is in
`fixtures/codebase-memory-v0.10.1/session.json`. Final promotion still requires
the three paired rounds; this single result does not select a new default.

Primary sources:

- <https://www.npmjs.com/package/@modelcontextprotocol/client/v/2.0.0>
- <https://github.com/modelcontextprotocol/typescript-sdk>
- local exact provider `--help`, which documents default stdio MCP-server mode
  and one-shot `cli` mode.

## Decision: explicit promotion gate

Alternate arm order across three pairs on the same source, machine, provider,
cache policy and task. Record each raw stage duration. Promote scoped session
only when every round is safe and equivalent and its median total duration is
at most half the one-shot median.

The ratio is a product promotion rule for the accepted environment, not a claim
about all repositories or machines.

## Decision: no hidden fallback

A session error returns a typed failure and completes cleanup. The operator may
explicitly rerun with one-shot. Automatic fallback would double work, obscure
the selected lifecycle and make benchmark/error evidence unreliable.
