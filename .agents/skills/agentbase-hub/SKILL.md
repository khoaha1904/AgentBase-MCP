---
name: agentbase-hub
description: Explicit-only AgentBase Hub control. Use only when the user names $agentbase-hub for lifecycle work or explicitly approves scoped Question handling or exact reviewed Publish from an active AgentBase workflow; never infer lifecycle work from an ordinary request.
---

# Hub control

Start with `get_hub_status`; report profile, Published/Draft/recovery/PR state
without credentials or machine paths. Invoke only the requested action.
Query handoff grants exact Question preparation only; changed scope needs renewed
agreement. Cancellation preserves work. Publish always needs separate approval.

- Connect with `configure_hub` only for the supplied credential-free repo URL and
  exact branch. Owner terminal flow: abs hub connect --url URL --branch BRANCH;
  masked token entry stays in the terminal, never chat/MCP. Empty input reuses
  the stored token. Same flow handles GitHub/GHE; API URL derives from host.
  Profiles are peers, one active; switching never copies/merges knowledge.
- Exactly empty remote: `preview_hub_bootstrap`, then explicitly approved
  `bootstrap_hub` once for README/root/shared/Profile, without CI or knowledge.
  A retained profile token allows this skill to continue after empty-remote connect.
  Non-empty support changes use `preview_hub_initialization` then
  `initialize_hub` with exact base/digest; preserve existing support files.
- `synchronize_hub_okf` requires an explicit request; status never pulls.
  recovery-required uses `recover_hub_okf` for the selected transaction first.
- Explicit legacy migration uses `prepare_hub_profile_migration`; show report,
  owner-confirmed homes and exact moves, then `finalize_hub_profile_migration_proposal`.
  Never migrate during installation or infer placement.
- Question work uses `list_hub_questions`, shows evidence/revision, and calls
  `answer_hub_question` only with selected human answer and explicit human:*
  maintainer. Inspect the proposal before sharing.
- `inspect_hub_okf_proposal` supplies hunks, semantic impact, removals, Questions
  and limitations. Read private full files/include_content when needed. Confirm
  exact proposal_id/proposal_digest and active publication.policy, then
  `publish_hub_okf_proposal` with that publication_mode. Policy selection via
  abs hub policy --mode direct|pr alone is not publication approval.
  Direct succeeds only at remote published/local recognized. PR in-review is
  not Published; show URL, never merge. Uncertain retry is owner-requested with
  the same id/digest/mode; changed base/content or closed PR needs new review.

No Hub is valid for schemas/Scan; other Hub workflows wait for a remote profile.
Route ordinary reading to Query and authoring to its public skill. No separate
Accept/stacked draft step, token helper onboarding or implicit lifecycle action.
