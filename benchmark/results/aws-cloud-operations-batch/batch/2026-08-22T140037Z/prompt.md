You are executing the AgentBase Batch Initial Ingest V1 qualification.

Authorized read-only repositories, in exact order:

1. <SOURCE_1_ROOT> — expected canonical ID repository-aws-health-aware-ef3e83846625
2. <SOURCE_2_ROOT> — expected canonical ID repository-sample-aws-devops-agent-terraform-602f2c2bcf7c

Artifact directory: <OUTPUT_ROOT>
Schema catalog: 7.0.0
Owner-confirmed Domain: Cloud Operations (domains/cloud-operations); evidence agentbase://owner-guidance/domains/cloud-operations

Do not read benchmark expectations, prior results, unrelated workspace paths,
credentials or environment files. Never call AWS/provider CLI. Stop before
Accept, Publish, bootstrap, submit or synchronization.

## Batch workflow

1. Call `get_hub_status` once, then `configure_hub` once with `mode: new`.
2. Call `prepare_batch_hub_ingest` once with the two roots above and proposed
   Domain `domains/cloud-operations`, title `Cloud Operations`. Read only the
   bounded root README/docs paths returned for each member. Confirm that both
   repositories implement operational systems in that owner-supplied Domain;
   AWS/Terraform similarity alone is not the reason.
3. Call `confirm_batch_hub_ingest` once. Cover every exact returned member with
   decision `match` and one exact returned README/docs evidence path.
4. Process members sequentially in manifest order. Never investigate the second
   while authoring the first, and never reuse one member's source evidence in
   another member's concept.
5. For each member:
   - Call `index_repository` exactly once and `get_architecture` exactly once.
   - Detect useful boundaries from graph plus bounded source reading. Promote
     only stable independently useful Repository, System, Component, Function,
     Interface, Flow or Resource knowledge. Internal queues, tables, roles,
     infrastructure and hosts stay embedded unless independently shared or
     operational. Sparse truthful output is success.
   - Call `get_okf_authoring_schemas` exactly once with evidence-bound candidates.
     Structured Terraform mappings are exact; semantic roles are suggestions.
     Use only catalog 7 types and provider-neutral schemas.
   - Call `prepare_hub_okf` exactly once in `new` mode with that member's root,
     its own normalized `repositories/<slug>` subject, the unchanged confirmed
     Domain, the same guidance request and honest partial coverage.
   - Author only inside its returned bundle. Use its returned canonical
     Repository ID and exact `repository://<id>/<path>#Lx-Ly` evidence. Desired
     Terraform state does not prove deployed account, region, ARN or runtime.
   - Keep progressive Domain/System/Repository navigation, useful Markdown and
     explicit limitations. Do not create a second code graph or copy source.
   - Call `validate_okf_changes` once, with at most one exact repair call.
   - Call `record_batch_hub_ingest_member` once using the confirmed manifest,
     exact member ID and session ID. Do not call standalone Finalize. If record
     fails, stop and report the failed checkpoint; do not retry in this probe.
6. After both records complete, call `finalize_batch_hub_ingest_proposal` once,
   then `inspect_hub_okf_proposal` once. Verify one applicable `batch-new`
   proposal, both Repository IDs, member paths and shared Domain/index paths.
7. Do not copy or create benchmark artifacts yourself; the harness retains the
   exact finalized proposal. Your final response lists proposal ID, canonical
   identities, per-member promoted concepts, embedded knowledge, Questions and
   limitations.

## Authoring rules

- Create one Repository concept per source and use owner-guidance evidence for
  each `part-of` Domain relation. A System is separate from Repository/Domain.
- Use canonical child-to-parent `part-of`; never persist inverse `contains`.
- Every declared relation targets an authored concept and has a resolving link.
- Flow endpoints are promoted concept identities, not embedded resource labels.
- Snapshot-first: write a small non-sensitive value when directly evidenced;
  otherwise record a bounded source reference or limitation. Never invent a
  current cloud value.
- Root/category indexes use existing AgentBase grammar. Preserve generated
  navigation and do not add duplicate entries.
