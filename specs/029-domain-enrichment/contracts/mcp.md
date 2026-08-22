# MCP Contract: Domain Enrichment

## `prepare_domain_enrichment`

Reads only exact Published Hub state and creates a private manifest preview.

Input includes confirmed Domain ID, 1..32 Repository IDs, exact selected
candidate/Question IDs, expected AWS account and 1..16 regions. It accepts no
credential, profile path, executable, command or arbitrary provider flag.

Output includes manifest ID/revision/digest, exact Hub base, admitted membership,
released profile versions, bounded candidates, Questions and calls that would be
made. It performs no provider call and no Hub mutation.

## `run_domain_enrichment`

Input:

```json
{
  "manifest_id": "enrichment-0123456789abcdef01234567",
  "manifest_revision": 1,
  "provider_session_confirmed": true
}
```

The call first verifies the active AWS account, then processes exact candidates
sequentially in their manifest order. It returns confirmed/rejected/unresolved/
failed outcomes and one decision packet. It makes no hidden retry and stops
resource access on account mismatch.

## `revise_domain_enrichment_membership`

Input binds exact manifest revision and a complete replacement Repository/
candidate/Question set. It returns revision + 1, dependency invalidations and
the exact candidates that require another provider call. Outcomes are reused
only when their complete input/evidence/profile digest is unchanged.

No Published or proposal state is changed. An unknown member, non-Published
repository or dangling dependency fails before writing the new revision.

## `finalize_domain_enrichment_proposal`

Input binds manifest ID/revision plus exact recommended/manual decisions. Every
human answer includes Question ID/revision and `human:*` attribution; `defer` is
allowed. Automatic outcomes are referenced, not resubmitted as human answers.

Finalization requires trusted terminal outcomes for all current members and an
unchanged Published base. It emits one ordinary proposal/inspection with mode
`enrichment`, Domain/multi-Repository scope, grouped evidence, Questions and
limitations. It never Accepts or Publishes.

## Existing lifecycle

`inspect_hub_okf_proposal`, `accept_hub_okf_proposal` and
`submit_hub_okf_proposals` accept the new discriminated proposal scope. An
accepted Enrichment proposal is one independent publication unit targeting Hub
`main`; it is never treated as a Repository Init/Refresh stack.

Existing Ingest/Refresh tool schemas and behavior do not change.
