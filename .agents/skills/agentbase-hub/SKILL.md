---
name: agentbase-hub
description: Explicit-only AgentBase Hub control. Use only when the user names $agentbase-hub for lifecycle work or explicitly approves scoped Question handling or exact reviewed Publish from an active AgentBase workflow; never infer lifecycle work from an ordinary request.
---

# AgentBase Hub control

Use `get_hub_status` first. It is read-only; report its partial local, credential,
remote, PR and recovery states without exposing machine paths or credentials.

A Query repair handoff authorizes only its agreed Question preparation, not
connection, switching, migration, Sync or Publish. Revalidate the Hub and exact
Question revision; retain the user's answer and maintainer confirmation. Changed
scope needs renewed agreement. Cancellation preserves private work. Publication
always requires the separate exact-result confirmation below.

Lifecycle tools are `get_hub_status`, `configure_hub`, `preview_hub_bootstrap`,
`bootstrap_hub`, `preview_hub_initialization`, `initialize_hub`,
`prepare_hub_profile_migration`, `finalize_hub_profile_migration_proposal`,
`list_hub_questions`, `answer_hub_question`, `inspect_hub_okf_proposal`,
`publish_hub_okf_proposal`, `synchronize_hub_okf` and `recover_hub_okf`. Invoke
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
- Inspect the prepared proposal and show repository scope, important changed
  boundaries/relations, removals, Questions and limitations. Obtain one explicit
  Publish confirmation for the exact `proposal_id`, `proposal_digest` and
  active `publication.policy` from status. Call `publish_hub_okf_proposal` with
  that `publication_mode`; there is no separate Accept or Local Draft step.
  The operator may select per-Hub policy with `abs hub policy --mode direct|pr`;
  changing policy alone never authorizes publication.
- Direct success is `remote: published` plus `local: recognized`. PR success is
  `remote: in-review`, not Published; show its URL and never merge it. Retry an
  uncertain result only when requested using the same ID/digest/mode. Changed
  base, content or a closed PR requires a new review, not an automatic retry.
- For an explicit legacy Profile migration request, Prepare first and show its
  report plus private `bundle_root`. Never infer homes or moves. The owner or
  authoring agent edits that full-tree workspace, then Finalize receives every
  exact `from_path` to `to_path` move. Inspect, then obtain explicit Publish
  confirmation; never silently migrate knowledge while installing the app.
- For an exactly empty remote Hub, preview then bootstrap the complete README,
  root index and CI baseline directly once. Bootstrap has no mode choice and
  never includes pending knowledge; later knowledge changes follow Hub policy.
- For an explicit Question-review request, call `list_hub_questions` with the
  requested status/bound. Show the relevant evidence and exact revision. Call
  `answer_hub_question` only with the user's selected answer and explicit
  `human:*` maintainer identity, then inspect the returned proposal. Stop before
  Publish unless the user explicitly confirms sharing that exact result.

For ordinary Ingest, Refresh, Batch or Domain Enrichment, hand off to the
corresponding product skill after Hub status is usable. For ordinary read-only
questions, hand off to `agentbase-query`; do not turn them into lifecycle work.
