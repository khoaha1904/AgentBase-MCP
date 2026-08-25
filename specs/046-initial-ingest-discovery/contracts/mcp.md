# MCP contract delta — Capability 046

The released tool count and names do not change. Fields below extend existing
tools. Snake-case is the public MCP shape; internal TypeScript may use camelCase.

## `preflight_hub_ingest`

Input stays:

```json
{ "source_repository": "/absolute/user-selected/git-root" }
```

For a new Repository, successful output additionally contains:

```json
{
  "source_authority": {
    "repository_id": "repository-identity",
    "remote": "https://github.example/team/repo.git",
    "default_branch": "main",
    "commit": "40-hex",
    "analysis_source_repository": "/private/exact/worktree",
    "kind": "current-checkout | detached-worktree"
  }
}
```

The analysis path is private runtime routing data, never OKF evidence. Failure to
resolve/access the exact default head is an error for Hub Init. Existing
Repository still routes to Refresh. No active Remote Hub is an error.

## Graph calls and private Seed

`index_repository` receives `analysis_source_repository`. Existing graph tools
and their raw result shapes remain unchanged. The gateway privately captures
Seed-driving normalized facts. Repository switch/source mismatch invalidates the
prior Seed.

## `get_okf_authoring_schemas`

Existing candidate/observation fields remain for schema guidance. Initial Ingest
adds required `discovery_inventory`:

```json
{
  "candidates": ["existing concept/embedded candidate objects"],
  "semantic_observations": ["existing observation objects"],
  "resource_observations": ["existing Terraform/Terragrunt objects"],
  "discovery_inventory": {
    "seed_id": "discovery-seed-<24 hex>",
    "lanes": [
      {
        "lane": "identity-product | runtime-entrypoint | interface-event-trigger | integration-data-channel | deploy-operations",
        "status": "covered | absent-after-check | limited",
        "limitations": ["bounded text"]
      }
    ],
    "items": [
      {
        "id": "inventory-item-...",
        "origin_group_ids": ["discovery-group-..."],
        "disposition": "concept | embedded | question | ignored",
        "candidate_id": "required for concept/embedded",
        "parent_candidate_id": "required for embedded",
        "question_summary": "required for question",
        "reason": "required for ignored",
        "evidence_ids": ["required except a truthful limitation-only item"]
      }
    ],
    "limitations": []
  }
}
```

Rules:

- exactly five unique lanes;
- every P0 Seed group covered exactly once;
- every origin group belongs to the active Seed;
- concept/embedded candidate references must match existing guidance candidates;
- Question/Ignored items bypass schema selection;
- source spans remain inside the active SourceSnapshot;
- invalid coverage returns the existing retryable `INVALID_ARGUMENT` shape.

Successful Initial Ingest output adds:

```json
{
  "discovery_receipt_id": "discovery-receipt-<24 hex>",
  "discovery_digest": "sha256:<64 hex>",
  "coverage": {
    "lanes": [],
    "p0_acknowledged": 0,
    "ignored_counts": {},
    "limitations": []
  }
}
```

Ordinary advisory/Refresh schema guidance may omit `discovery_inventory` and
returns no receipt.

## `prepare_hub_okf`

For `mode: "new"`:

```json
{
  "mode": "new",
  "source_repository": "/private/exact/worktree",
  "subject_directory": "repositories/example",
  "confirmed_domain": {
    "identity": "domains/example",
    "title": "Example"
  },
  "discovery_receipt_id": "discovery-receipt-<24 hex>"
}
```

New mode rejects `guidance_request`, caller-supplied `coverage`, legacy
`signals`, absent/used/invalid receipts and source/Hub-base drift. MCP resolves
the Receipt internally, persists its compact form in the authoring checkpoint
and renders skeletons from its guidance.

Refresh input/behavior remains unchanged.

## `finalize_hub_okf_proposal`

Input name is unchanged. For a capability 046 Init session, Finalize also checks:

- the pinned source snapshot remains accessible and exact; a newer default head
  is reported as `source-advanced` rather than rejected;
- Hub base follows the stage-appropriate reconciliation contract;
- every Receipt concept/embedded/Question expectation materialized;
- ignored groups remain bounded inspection metadata, not Hub documents;
- activity log changes are generated and use valid Hub log grammar.

One repair attempt remains. Remaining P0/materialization/integrity failure is
Incomplete.

## `inspect_hub_okf_proposal`

Initial Ingest inspection additionally returns:

```json
{
  "discovery": {
    "source_revision": "40-hex",
    "lanes": [],
    "embedded_groups": [],
    "relations_and_flows": [],
    "questions": [],
    "ignored_counts": {},
    "ignored_reasons": [],
    "limitations": []
  },
  "activity": {
    "repository_log": "repositories/example/log.md",
    "domain_log": null
  }
}
```

Raw Seed, Inventory, graph rows and local paths are never returned in inspection
or PR body.

## Batch tools

Tool names remain unchanged. Batch Preflight returns source authority per
member. Each member must supply/use its own receipt-bound authoring session.
Record/finalize rejects cross-member receipt/source mismatch. One member failure
keeps the atomic batch Incomplete while exact completed siblings remain reusable.
