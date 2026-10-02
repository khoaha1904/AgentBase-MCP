---
name: agentbase-batch-ingest
description: Explicit-only AgentBase batch ingest. Use only when the user names $agentbase-batch-ingest for 2-32 authorized local repositories in one confirmed Domain; never for ordinary repository reading, Batch Refresh, scanning, enrichment, or Publish.
---

# Batch Initial Ingest

Build one sparse review unit without mixing repository evidence.

Use only `prepare_batch_hub_ingest`, `confirm_batch_hub_ingest`,
`preflight_hub_ingest`, `prepare_hub_okf`, `record_batch_hub_ingest_member`,
`retry_batch_hub_ingest_member`, `revise_batch_hub_ingest_membership`,
`finalize_batch_hub_ingest_proposal`, `inspect_hub_okf_proposal` and
`discover_repository`, `get_okf_authoring_schemas` and
`validate_okf_changes`. Never use ordinary repository Preflight/Finalize inside
a confirmed batch.

1. Call `prepare_batch_hub_ingest` with only the repository roots supplied by
   the user and one proposed Domain. Read only the returned bounded README/docs
   paths for each repo. Show one matrix with identity, evidence, Domain and
   warnings; do not begin authoring while any row is unresolved.
2. Call `confirm_batch_hub_ingest` once with every exact member, its reviewed
   evidence path and `match` or explicit `override` decision.
3. Process members sequentially in manifest order. For each member, call
   `preflight_hub_ingest` on its original root to arm the exact SourceSnapshot
   already selected by Batch, then follow the Seed → Inventory → Receipt rules
   from `agentbase-ingest`. Call `prepare_hub_okf` in `new` mode with that
   member's Receipt and either the same confirmed Domain compatibility input or
   that member's explicitly confirmed grouped `home_plan`, edit only that
   session's bundle, then call `record_batch_hub_ingest_member` instead of the
   ordinary Finalize tool. Never reuse a Seed, Receipt or evidence across
   members and never call provider CLI or investigate another repository.
4. A truthful sparse member is complete. A member-local `failed` checkpoint
   does not block later siblings after the next repository switch confirms
   clean provider closure. Record it, continue sequentially, then retry only
   failed members. A shared Hub/source authority failure or uncertain source
   state stops the Batch.
5. If membership changes, call `revise_batch_hub_ingest_membership` with the
   complete replacement member set. Re-author invalidated/dangling work when the
   returned revision requires it; never silently drop a member contribution.
6. After every current member is complete, call
   `finalize_batch_hub_ingest_proposal`, then `inspect_hub_okf_proposal`. Present
   per-repository source revision and lane coverage, shared Domain/index
   navigation, Questions, ignored reasons and limitations.

Stop before Publish, synchronization, provider enrichment . Do not scan the workspace, run members in parallel, split a finalized
proposal or convert an existing canonical Repository into Init.
