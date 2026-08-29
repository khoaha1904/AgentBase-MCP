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

1. Full JSON Schema 2020-12/output-schema audit.
2. OAuth 2.1/OIDC issuer and audience validation for remote deployments.
3. Tasks extension only for a demonstrated long-running workflow.
4. Benchmark runner decomposition after protocol behavior is stable.

## Risks and recovery

The phase does not change public tool names, storage, credentials or transport
entrypoints. If a client compatibility regression appears, remove the explicit
policy wiring and retain the isolated policy module while the affected client
is identified.
