---
name: agentbase-batch-ingest
description: Ingest 2-32 explicit authorized local repositories in one confirmed Domain sequentially and stop at one atomic AgentBase Hub proposal preview. Do not use for Batch Refresh, workspace scanning, provider enrichment, Accept or Publish.
---

# Batch Initial Ingest

Build one sparse review unit without mixing repository evidence.

1. Call `prepare_batch_hub_ingest` with only the repository roots supplied by
   the user and one proposed Domain. Read only the returned bounded README/docs
   paths for each repo. Show one matrix with identity, evidence, Domain and
   warnings; do not begin authoring while any row is unresolved.
2. Call `confirm_batch_hub_ingest` once with every exact member, its reviewed
   evidence path and `match` or explicit `override` decision.
3. Process members sequentially in manifest order. For each member, follow the
   Discover → Investigate → Author rules from `agentbase-ingest`, call
   `prepare_hub_okf` in `new` mode with the same confirmed Domain, edit only that
   session's bundle, then call `record_batch_hub_ingest_member` instead of the
   ordinary Finalize tool. Never reuse raw source/graph observations across
   members and never call provider CLI or investigate another repository.
4. A truthful sparse member is complete. On `failed`, stop the sequence, explain
   the exact failure and use `retry_batch_hub_ingest_member` only after the user
   requests recovery. Prepare a new attempt for that member; completed siblings
   remain untouched.
5. If membership changes, call `revise_batch_hub_ingest_membership` with the
   complete replacement member set. Re-author invalidated/dangling work when the
   returned revision requires it; never silently drop a member contribution.
6. After every current member is complete, call
   `finalize_batch_hub_ingest_proposal`, then `inspect_hub_okf_proposal`. Present
   per-repository changes, shared Domain/index navigation, Questions,
   limitations and partial coverage.

Stop before Accept, submit, synchronization, provider enrichment or model
benchmark. Do not scan the workspace, run members in parallel, split a finalized
proposal or convert an existing canonical Repository into Init.
