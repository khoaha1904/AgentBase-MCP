# Quickstart: Validate Client MCP Registration

## Prerequisites

- Node.js version accepted by `package.json`
- repository dependencies installed
- no need for a GitHub token or Hub
- no real Codex/Claude configuration mutation for the canonical path

## Canonical offline validation

```bash
node --test scripts/client-registration.test.mjs scripts/install.test.mjs
npm run verify
```

Expected outcomes:

- Codex-only, Claude-only and both selections create only exact user-scope fake entries;
- exact reruns are no-ops and conflicts mutate neither client;
- every injected second-client failure rolls back first-client additions;
- interrupted transactions recover on the next fixture run;
- concurrent bytes are not overwritten;
- token masking/preservation and non-interactive behavior remain unchanged;
- no real user client config or credential is read or changed.

## Focused scenario matrix

| Scenario | Expected whole result |
|---|---|
| One absent selected client | `registered` |
| One exact selected client | `already-registered` |
| Both absent | both `registered` |
| Exact + absent | exact unchanged, absent registered |
| Any conflict/unavailable during preflight | failure, zero mutation |
| Second add/verify failure | `rolled-back`, both match pre-state |
| Rollback plus concurrent change | `recovery-required`, concurrent bytes preserved |
| Prior interrupted transaction | recovery completes before new selection |
| Non-interactive | dependency preparation only |

## Optional real smoke action

Actual registration changes user-global Codex/Claude configuration and is not
part of completion. Run it only after a separate owner authorization, with exact
pre-state inventory and recovery location recorded. Verification should inspect
the `agentbase` entry and connect/list tools from both selected clients without
printing unrelated configuration or credentials.
