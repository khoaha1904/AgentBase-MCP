# Bug Assessment: MCP detect_changes loses required system PATH

- **Slug**: mcp-detect-changes-path
- **Created**: 2026-08-12T15:18:34+07:00
- **Source**: live ordinary-repository MCP qualification
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

After indexing `agentbase-next` through its own MCP gateway, `detect_changes`
returned `changed_files: ["sh: 1: sort: not found"]` with `isError: false`.
The other exercised read tools completed normally.

## Symptom

The public `detect_changes` tool reports a shell diagnostic as a changed file
instead of returning the repository's actual changed files. A supported MCP
read must either return valid provider data or a visible tool error.

## Reproduction

1. Start `node src/cli.ts mcp` in a fresh MCP client process.
2. Call `index_repository` for the absolute `agentbase-next` root.
3. Call `detect_changes` with `scope: "files"` and `base_branch: "main"`.
4. Observe `sh: 1: sort: not found` inside `changed_files`.

## Suspected Code Paths

- `src/providers/codebase-memory/session.ts:officialConnection()` — replaces
  `PATH` with an empty string for the managed provider child.
- `src/app/codebase-memory-mcp/gateway-session.ts:defaultProviderFactory()` —
  supplies only Codebase Memory variables and locale to that child.
- `src/providers/codebase-memory/session.test.ts` — has no assertion for the
  admitted system-command environment.

## Root Cause Hypothesis

High confidence. The package-private provider binary is selected safely by its
absolute admitted path, but one of its `detect_changes` subprocess pipelines
uses `sort`. AgentBase clears `PATH`, so `/bin/sh` cannot resolve that required
system utility. The provider then serializes the diagnostic as data instead of
marking the MCP call as an error.

## Proposed Remediation

**Preferred**: keep the provider executable selection absolute and package-
private, but give the provider process a fixed system-only executable path
(`/usr/bin:/bin`). Build that environment through a small testable function so
the caller's `PATH`, home and identity variables cannot leak into the child.

Do not inherit `process.env.PATH`, do not discover the provider from `PATH`, and
do not add a dependency or fallback transport.

**Alternative**:

- Add a private directory containing admitted wrappers for every provider
  subprocess. This is narrower in theory but would duplicate and track opaque
  provider implementation needs, increasing maintenance and upgrade risk.

**Files likely to change**:

- `src/providers/codebase-memory/session.ts`
- `src/providers/codebase-memory/session.test.ts`

**Tests to add or update**:

- An offline test proving the provider child receives only the fixed system
  path and never inherits caller-controlled `PATH`, `HOME` or identity values.
- Re-run the real MCP reproduction and assert the shell diagnostic is absent.

## Risks & Considerations

- The fixed system path admits standard host utilities to the provider child;
  it must not include workspace, user or package-manager directories.
- `/usr/bin:/bin` is the exercised Linux boundary. Other operating systems may
  require an explicit future portability decision.
- This fixes subprocess availability but does not make provider-returned data
  intrinsically trustworthy; the real reproduction remains required.

## Open Questions

- None for the exercised Linux x64 deployment target.
