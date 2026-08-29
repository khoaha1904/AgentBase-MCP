# Plan: MCP modern protocol readiness

## Baseline

AgentBase already uses official TypeScript SDK v2. The application registers
business tools in `src/app/codebase-memory-mcp/server.ts` and serves stdio.
The SDK can speak both protocol eras, but the application did not make its
compatibility policy explicit.

## Phase 1 (complete)

- Add one low-level protocol policy module.
- Make the server factory pass the explicit supported protocol list and
  conservative modern cache hints.
- Add focused tests for the policy and preserve the existing high-level tool
  registration.
- Update current product and architecture documentation.

## Phase 2 (complete)

- Add a web-standard `createMcpHandler` adapter.
- Serve modern requests statelessly with per-request server construction.
- Keep the SDK stateless legacy compatibility leg available.
- Verify a sessionless modern `tools/list` exchange.

## Deferred phases

1. Output-schema adoption when stable tool result shapes have been selected.
2. OAuth 2.1/OIDC issuer and audience validation for remote deployments.
3. Tasks extension only for a demonstrated long-running workflow.
4. Further benchmark scoring/report decomposition only where responsibilities
   remain independently cohesive.

## Phase 3 (complete)

Every advertised tool input explicitly declares JSON Schema 2020-12 at the
single registration boundary. Existing provider captures remain immutable and
tool argument contracts do not change. Output schemas remain deferred because
the current tools intentionally return several workflow-specific result shapes.

## Phase 4 (complete)

Benchmark suite discovery, repository admission and result-path ownership moved
out of the scoring/runner file into `benchmark-okf-storage.mjs`. Public exports
remain compatible; scoring and command behavior are unchanged.

## Risks and recovery

The phase does not change public tool names, storage, credentials or transport
entrypoints. If a client compatibility regression appears, remove the explicit
policy wiring and retain the isolated policy module while the affected client
is identified.
