---
name: agentbase-hub
description: Inspect and operate AgentBase Hub lifecycle and review governed Questions. Use for Hub status, local-only use, remote connection or switching, Question answering, proposal acceptance, synchronization, recovery, initialization, or publication readiness.
---

# AgentBase Hub control

Use `get_hub_status` first. It is read-only; report its partial local, credential,
remote, PR and recovery states without exposing machine paths or credentials.

Lifecycle tools are `get_hub_status`, `configure_hub`, `preview_hub_bootstrap`,
`bootstrap_hub`, `preview_hub_initialization`, `initialize_hub`,
`list_hub_questions`, `answer_hub_question`, `inspect_hub_okf_proposal`,
`accept_hub_okf_proposal`, `list_pending_hub_okf`,
`submit_hub_okf_proposals`, `synchronize_hub_okf` and `recover_hub_okf`. Invoke
only the action explicitly requested after status establishes its preconditions.

- An unconfigured installation is valid. Code Graph stays available, and the
  first Ingest authoring workflow creates the local-only Hub automatically.
- Connect an existing remote only after the user supplies its credential-free
  HTTPS repository URL and exact target branch. Have the user run the following
  masked terminal command with the exact identity; never request or pass the
  token through chat or an MCP tool. Resolve the AgentBase-MCP root from this
  skill's own path and give the user this absolute, cwd-independent command:

  `node /ABSOLUTE/AGENTBASE_MCP_ROOT/scripts/installation/configure-hub-token.mjs --repository-url https://HOST/OWNER/REPOSITORY.git --target-branch BRANCH`
- After the terminal command succeeds, call `configure_hub` with the same
  credential-free repository URL and target branch.
- GitHub.com and GitHub Enterprise Server use the same connect flow. Do not add
  an API URL: MCP derives it from the repository host.
- One Hub profile is active. Connecting a different host/repository/branch
  switches profiles; never copy, merge, search or publish knowledge across them.
- Synchronize only when the user explicitly requests it. Status never pulls.
- If status returns `recovery-required`, show the bounded transaction IDs and
  call `recover_hub_okf` with the chosen `transaction_id` before retrying sync.
- Initialization, Accept and PR creation are distinct. MCP may create a branch
  or PR only when the user requested that action; it never merges a PR.
- For an exactly empty remote Hub, preview then bootstrap the complete README,
  root index and CI baseline directly once. Bootstrap has no mode choice and
  never includes pending knowledge; later knowledge changes use normal PRs.
- For an explicit Question-review request, call `list_hub_questions` with the
  requested status/bound. Show the relevant evidence and exact revision. Call
  `answer_hub_question` only with the user's selected answer and explicit
  `human:*` maintainer identity, then inspect the returned proposal. Stop before
  Accept or Publish unless the user explicitly requests each later action.

For ordinary Ingest, Refresh, Batch or Domain Enrichment, hand off to the
corresponding product skill after Hub status is usable. For ordinary read-only
questions, hand off to `agentbase-query`; do not turn them into lifecycle work.
