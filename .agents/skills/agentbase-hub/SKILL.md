---
name: agentbase-hub
description: Explicit-only AgentBase Hub control. Use only when the user names $agentbase-hub for Hub status, connection, Questions, acceptance, synchronization, recovery, initialization, or publication readiness; never infer a lifecycle action from an ordinary request.
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

- An unconfigured installation is valid and Code Graph stays available. Hub
  query, Ingest, Refresh and OKF Draft work wait until a remote Hub is active.
- Connect an existing remote only after the user supplies its credential-free
  HTTPS repository URL and exact target branch. The owner-facing terminal flow
  is one command: `abs hub connect --url https://HOST/OWNER/REPOSITORY.git
  --branch BRANCH`. The command asks for a token in a masked terminal prompt;
  an empty prompt reuses the existing shared owner-private token. Never request
  or pass a token through chat or an MCP tool.
- The legacy masked token helper and `okf hub configure` route are internal
  compatibility paths only; do not present them as the normal user workflow.
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
