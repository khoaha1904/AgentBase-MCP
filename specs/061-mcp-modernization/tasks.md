# Tasks: MCP modern protocol readiness

- [x] T001 Record the high-level and low-level MCP compatibility decision.
- [x] T002 Add the low-level protocol policy module.
- [x] T003 Wire the policy into the AgentBase MCP server factory.
- [x] T004 Add requirement-linked tests for supported versions and cache hints.
- [x] T005 Run focused tests and `npm run verify`.
- [x] T006 Record deferred modern HTTP/auth/tasks work in current documentation.
- [x] T007 Add the stateless modern Streamable HTTP adapter.
- [x] T008 Verify a sessionless modern HTTP tools/list exchange.
- [x] T009 Declare JSON Schema 2020-12 for every advertised tool input.
- [x] T010 Verify legacy and modern tool catalogs preserve their contracts.
- [x] T011 Extract benchmark storage/admission from the oversized runner.
- [x] T012 Verify benchmark scoring and public imports remain compatible.
- [x] T013 Verify modern discovery and legacy stateless initialization on HTTP.
- [x] T014 Extract reusable agent command/prompt portability from benchmark execution.
- [x] T015 Preserve modern related notifications through automatic JSON/SSE response selection.
- [x] T016 Serve stdio through the SDK era-negotiating factory entrypoint.
- [x] T017 Return additive structured content for stable object tool results.
- [x] T018 Extract query-quality qualification from the benchmark runner.

## Result

Phases 1–4 are complete. The server keeps legacy stdio compatibility while
advertising the modern protocol contract through one low-level policy boundary,
and the reusable HTTP adapter serves sessionless modern requests. Remote auth
and Tasks remain explicit follow-up phases. Output schemas wait for stable
per-tool result contracts rather than claiming one generic JSON shape.
