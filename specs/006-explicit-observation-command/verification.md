# Verification: Explicit Observation and OKF Schema Catalog

- **Date:** 2026-08-12
- **Result:** Complete
- **Provider:** exact managed `codebase-memory-mcp@0.10.1`
- **Schema catalog:** AgentBase `1.0.0`, Google OKF `0.2`

## Accepted behavior

- `node src/cli.ts observe <repository> <symbol>` performs one explicit graph
  evidence round and prints only the normalized observation bundle.
- Observation does not create, prepare, validate or apply OKF.
- The AgentBase MCP retains its 12 exact Codebase Memory graph tools and adds
  four AgentBase-owned schema tools: list, read, select and validate.
- The initial catalog contains 11 software-knowledge types. Selection is
  evidence-directed and advisory; unknown Google OKF types remain valid.
- Known types receive AgentBase required-field validation after base Google OKF
  and generated-draft policy.

## Real evidence

The explicit observation command ran against the checked-in 12-file TypeScript
fixture for `inspectWorkspace`. It returned one format-version-1 bundle with:

- digest `sha256:6c9790ad92b348d3159c2688ae69bd5b8538aff58f20737f90bc0a34e517f465`;
- four queries and eight facts;
- exactly three cited source files;
- clean provider cleanup;
- no source `.codebase-memory` and no `okf/` side effect.

## Automated verification

- Focused observation/schema/MCP tests: 13/13 pass.
- `npm run verify`: 144/144 pass.
- Specification and type checks pass.
- Architecture: 0 errors; two unchanged file-size warnings at existing 245-
  and 250-line files.
- `git diff --check`: pass.

## Deferred boundary

AgentBase Hub clone/worktree ownership, MCP GitHub token handling, `new` versus
`refresh`, proposal review, branch/push and PR creation are not implemented by
this capability. They require the next Full Feature lifecycle.
