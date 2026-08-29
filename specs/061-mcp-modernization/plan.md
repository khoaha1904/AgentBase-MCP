# Plan: MCP modern protocol readiness

## Baseline

AgentBase already uses official TypeScript SDK v2. The application registers
business tools in `src/app/codebase-memory-mcp/server.ts` and serves stdio.
The SDK can speak both protocol eras, but the application did not make its
compatibility policy explicit.

## Phase 1 (this slice)

- Add one low-level protocol policy module.
- Make the server factory pass the explicit supported protocol list and
  conservative modern cache hints.
- Add focused tests for the policy and preserve the existing high-level tool
  registration.
- Update current product and architecture documentation.

## Deferred phases

1. Modern Streamable HTTP handler and dual-era negotiation tests.
2. Full JSON Schema 2020-12/output-schema audit.
3. OAuth 2.1/OIDC issuer and audience validation for remote deployments.
4. Tasks extension only for a demonstrated long-running workflow.
5. Benchmark runner decomposition after protocol behavior is stable.

## Risks and recovery

The phase does not change public tool names, storage, credentials or transport
entrypoints. If a client compatibility regression appears, remove the explicit
policy wiring and retain the isolated policy module while the affected client
is identified.

