---
name: agentbase-domain-enrichment
description: Enrich one Published AgentBase Hub Domain across selected repositories with exact read-only provider evidence and shared Question decisions. Use after related repositories are Published; not for repository Ingest/Refresh, Accept, publication, arbitrary AWS exploration, or cloud mutation.
---

# Enrich one Published Domain

Produce one private manifest and, after reviewable evidence collection, one
ordinary Enrichment proposal. Never log in for the user, read credentials,
Accept, Publish, mutate cloud resources, scan an account, or infer completeness.

Use only `prepare_domain_enrichment`, `revise_domain_enrichment_membership`,
`run_domain_enrichment`, `finalize_domain_enrichment_proposal` and
`inspect_hub_okf_proposal`.

## Workflow

1. Confirm one Published Domain, 1–32 Published Repository IDs, 1–64 exact
   SQS candidates, the expected 12-digit AWS account and 1–16 regions. Keep
   resource identity evidence separate from interaction evidence.
2. Call `prepare_domain_enrichment`. Review the immutable manifest, candidate
   membership, Question revisions and released provider profiles. This step
   performs no AWS call and changes no Hub knowledge.
3. Ask the user to authenticate AWS CLI in their own terminal. Continue only
   after the user explicitly confirms that session. Never request, inspect or
   store access keys, session tokens, profiles or credential files.
4. Call `run_domain_enrichment` once with
   `provider_session_confirmed: true`. The MCP verifies the active account and
   then checks exact queues sequentially. Account mismatch stops resource
   access. Missing/unsupported/unauthorized/not-found evidence remains an
   unresolved limitation; it is not a negative fact.
5. Review automatic, recommended and manual Question decisions. Automatic
   factual answers use exact provider evidence. Present recommendations as
   choices. Ask directly for manual answers and allow `defer`.
6. If membership changes, call `revise_domain_enrichment_membership` with the
   complete replacement set and use the new revision. Unchanged trusted
   outcomes may be reused. Retry only explicitly named failed candidates from
   the exact current revision; never hide a retry loop.
7. Call `finalize_domain_enrichment_proposal` with selected human decisions.
   Call `inspect_hub_okf_proposal` for the grouped proposal and stop before
   Accept. Open Questions and limitations are valid output; do not force
   completeness.

## Provider boundary

Only the released `aws.sts.caller-identity@1` and `aws.sqs.queue@1` read-only
profiles are available in this MVP. Do not pass executable names, shell text,
CLI flags or arbitrary commands through MCP. Other providers and AWS resources
remain future profiles.
