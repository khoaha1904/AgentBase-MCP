# Tasks: MCP modern protocol readiness

- [x] T001 Record the high-level and low-level MCP compatibility decision.
- [x] T002 Add the low-level protocol policy module.
- [x] T003 Wire the policy into the AgentBase MCP server factory.
- [x] T004 Add requirement-linked tests for supported versions and cache hints.
- [x] T005 Run focused tests and `npm run verify`.
- [x] T006 Record deferred modern HTTP/auth/tasks work in current documentation.

## Result

Phase 1 is complete. The server keeps legacy stdio compatibility while
advertising the modern protocol contract through one low-level policy boundary.
Remote HTTP, auth and Tasks remain explicit follow-up phases.
