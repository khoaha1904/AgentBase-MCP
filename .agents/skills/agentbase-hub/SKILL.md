---
name: agentbase-hub
description: Inspect and operate AgentBase Hub lifecycle when the user asks about Hub status, local-only use, remote connection or switching, synchronization, recovery, initialization, or publication readiness.
---

# AgentBase Hub control

Use `get_hub_status` first. It is read-only; report its partial local, credential,
remote, PR and recovery states without exposing machine paths or credentials.

- An unconfigured installation is valid. Code Graph stays available, and the
  first Ingest authoring workflow creates the local-only Hub automatically.
- Connect an existing remote only after the user supplies its credential-free
  HTTPS repository URL and exact target branch. Have the user run the following
  masked terminal command with the exact identity; never request or pass the
  token through chat or an MCP tool. Resolve the AgentBase-MCP root from this
  skill's own path and give the user this absolute, cwd-independent command:

  `node /ABSOLUTE/AGENTBASE_MCP_ROOT/scripts/installation/configure-hub-token.mjs --repository-url https://HOST/OWNER/REPOSITORY.git --target-branch BRANCH`
- GitHub.com and GitHub Enterprise Server use the same connect flow. Do not add
  an API URL: MCP derives it from the repository host.
- One Hub profile is active. Connecting a different host/repository/branch
  switches profiles; never copy, merge, search or publish knowledge across them.
- Synchronize only when the user explicitly requests it. Status never pulls.
- If status returns `recovery-required`, show the bounded transaction IDs and
  call `recover_hub_okf` with the chosen `transaction_id` before retrying sync.
- Initialization, Accept and PR creation are distinct. MCP may create a branch
  or PR only when the user requested that action; it never merges a PR.

For ordinary Ingest, Refresh, Batch or Domain Enrichment, hand off to the
corresponding product skill after Hub status is usable.
