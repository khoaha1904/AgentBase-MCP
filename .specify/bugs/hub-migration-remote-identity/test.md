# Bug Verification: Canonical Hub clone is rejected by runtime admission

- **Slug**: hub-migration-remote-identity
- **Tested**: 2026-08-13
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The canonical Hub origin was normalized to the derived HTTPS identity and the
original MCP query no longer reproduces the admission failure. Focused and full
regression gates pass.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Launch the real STDIO server and call `search_hub_okf` | pass | 26 tools listed; Hub search returned `isError=false` |
| New tests | `node --test scripts/migrate-product-repositories.test.mjs` | pass | 5 passed, 0 failed |
| Regression suite | `npm run verify` | pass | 217 passed, 0 failed |
| Type and architecture | Included in `npm run verify` | pass | 0 architecture errors; 4 reviewed warnings |

## Output Excerpts

```text
{"toolCount":26,"hasHubSearch":true,"hubSearchError":false,"responseBlocks":1}
tests 217; pass 217; fail 0
```

## Residual Risks

- Remote Hub publication and synchronization still require the dedicated token
  to be injected into the Codex host environment; no token value is stored in
  MCP configuration.

## Recommendation

Close the bug — verified against the real canonical Hub and full offline gate.
