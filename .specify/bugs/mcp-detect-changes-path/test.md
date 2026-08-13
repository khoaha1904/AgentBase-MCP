# Bug Verification: MCP detect_changes loses required system PATH

- **Slug**: mcp-detect-changes-path
- **Tested**: 2026-08-12T15:22:29+07:00
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original MCP reproduction no longer emits `sort: not found` and now returns
the repository's actual dirty paths. Focused and canonical suites pass without
a cleanup or source-persistence regression.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | fresh client → index `agentbase-next` → `detect_changes` | pass | Returned actual dirty paths; no shell diagnostic. |
| New and provider tests | `node --test src/providers/codebase-memory/provider-environment.test.ts src/providers/codebase-memory/session.test.ts` | pass | 9/9. |
| Regression suite | `npm run verify` | pass | 138/138; specification, types and diff checks pass. |
| Architecture | `npm run architecture:check` | pass | 0 errors; two unchanged baseline file-size warnings. |
| Cleanup | process and source-state inspection | pass | No provider/MCP process and no source `.codebase-memory`. |

## Output Excerpts

```text
changed_files: [".gitignore", "AGENTS.md", "README.md", ...]
cleanup: clean
tests 138; pass 138; fail 0
Architecture check: 0 error(s), 2 warning(s).
```

## Residual Risks

- The admitted system path is qualified on the Linux x64 deployment target;
  portability to hosts without `/usr/bin:/bin` remains outside this fix.
- Codebase Memory still owns shell pipeline behavior; AgentBase pins the exact
  provider version and must requalify future upgrades.

## Recommendation

Close this bug as verified end-to-end. Proceed to product selection for the
first observation-bridge slice rather than expanding MCP lifecycle scope.
