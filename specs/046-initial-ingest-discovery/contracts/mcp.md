# MCP contract delta — Capability 046

The released tool count and names do not change. Fields below extend existing
tools. Snake-case is the public MCP shape; internal TypeScript may use camelCase.

## `preflight_hub_ingest`

Input stays:

```json
{ "source_repository": "/absolute/user-selected/git-root" }
```

For every Hub-bound new or existing Repository routed to Init or Refresh,
successful output additionally contains:

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
resolve/access the exact default head is an error for Hub Init/Refresh. Existing
Repository still routes to Refresh with this same source authority. No active
Remote Hub is an error.

The source remote is canonicalized from HTTPS/SSH/SCP syntax, must uniquely
match repository identity and must use the active Hub host. Fetch uses only the
Hub profile token over canonical HTTPS into an AgentBase-private mirror outside
the source repository. API and fetched commits must match. Ambiguous identity,
cross-host source, insufficient token access or an unsafe private path makes the
member Incomplete; MCP never falls back to SSH or ambient Git credentials.

## Graph calls and private Seed

Only a connection armed by successful new Init/Batch-member Preflight may create
a Seed. When `index_repository` receives that exact `analysis_source_repository`
and indexing succeeds, MCP privately runs:

1. `index_status`;
2. terminal/paged `check_index_coverage` over admitted scopes;
3. `get_architecture` with explicit aspects `overview`, `structure`,
   `dependencies`, `routes`, `languages`, `packages`, `entry_points`,
   `hotspots`, `boundaries`, `layers`, `clusters`;
4. one bounded safe file census.

`file_tree` and `cycles` are excluded. An AgentBase-owned patch in the pinned
Codebase Memory admission/read path hard-denies secret-like paths before any file
open; it is covered by the owned-runtime integrity and provider-compat fixtures.
The exact source worktree is not modified and a census-only denylist is not
sufficient. Search/trace results support Agent investigation but do not mutate
the Seed. Seed readiness requires every fixed step or an explicit diagnostic.
Repository/source switch invalidates it.

The returned MCP content for that armed Init preserves the provider's existing result blocks and
appends one bounded AgentBase `discovery_seed` summary containing Seed ID,
machine-derived lane results, ordered group IDs/kinds/priorities, bounded source
samples and limitations. No input schema or public tool is added. Search/trace
tool outputs remain unchanged. Ordinary query and normal change-first Refresh do
not run this recipe or create/append a Seed. A mismatched/unarmed root cannot
create a Seed; `discovery_inventory` guidance rejects without an active Init
Seed. Future Full Discovery Refresh is a separate deferred opt-in.

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
    "items": [
      {
        "id": "inventory-item-...",
        "origin_group_id": "discovery-group-...",
        "disposition": "concept | embedded | question | ignored",
        "outputs": [
          {
            "candidate_id": "required for concept/embedded",
            "parent_candidate_id": "required for embedded output"
          }
        ],
        "question_plan_id": "required for question",
        "reason": "duplicate-covered for ignored P0",
        "covered_by_item_id": "required for ignored P0",
        "evidence_ids": ["required except a truthful limitation-only item"]
      }
    ],
    "question_plans": [
      {
        "id": "question-plan-...",
        "kind": "existing SharedQuestion kind",
        "origin_group_id": "discovery-group-...",
        "target_candidate_id": "candidate-...",
        "property": "bounded property",
        "scope_key": "bounded scope",
        "candidate_evidence": ["source/revision-bound references"],
        "missing_evidence": ["bounded text"],
        "limitations": []
      }
    ],
    "limitations": []
  }
}
```

Rules:

- lane status and P0 priority are MCP-derived, not accepted from the caller;
- every P0 Seed group covered exactly once and no coverage-group split/merge;
- every origin group belongs to the active Seed;
- concept/embedded candidate references must match existing guidance candidates;
- Question plans use existing SharedQuestion kinds and candidate-evidence;
  unbindable uncertainty must become a limitation before Receipt freeze;
- Question/Ignored items bypass schema selection; ignored P0 permits only
  `duplicate-covered` targeting a non-ignored item that will materialize;
- generated/out-of-scope signals must be classified below P0 before the Seed;
  a later P0 classification conflict becomes a limitation or Incomplete;
- source spans remain inside the active SourceSnapshot;
- non-terminal paging cannot prove absence; P0-hiding diagnostics or more than
  64 P0 groups return Incomplete/`DISCOVERY_OVERFLOW`;
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
`signals`, invalid receipts and source/Hub-base mismatch. MCP first looks up a
persisted session by Receipt ID: an identical request digest returns its session
ID, a mismatch rejects, and only no persisted match requires the active frozen
Receipt. Creation is atomic. Finalized/cancelled sessions are terminal;
skeletons render from Receipt guidance.

Refresh keeps its existing change-first discovery and schema-guidance surface,
but its Preflight, source materialization, drift checks, repository evidence and
Finalize gates use the same exact remote-default SourceSnapshot contract as Init.
Feature/dirty working-tree source remains query-only.

## `finalize_hub_okf_proposal`

Input name is unchanged. For a receipt-bound capability 046 Init session,
Finalize also checks:

- the pinned source snapshot remains accessible and exact; a newer default head
  is reported as `source-advanced` rather than rejected;
- Hub base follows the stage-appropriate reconciliation contract;
- every Receipt concept/embedded/QuestionPlan expectation materialized and each
  Question target/source evidence resolves inside the proposal;
- authored/retained evidence remains bound to its observed source commit;
- ignored groups remain bounded inspection metadata, not Hub documents;
- activity log changes are generated and use valid Hub log grammar.

One repair attempt remains. Remaining P0/materialization/integrity failure is
Incomplete.

Every capability-046-authored Init/Refresh `sources[]` entry whose resource uses
`repository://` includes `observed_revision: <40-hex SourceSnapshot commit>`.
Source-entry identity is `(resource, observed_revision)`: observing the same
path/span at a new commit creates/uses a distinct source ID. Claims retained from
an older revision keep their old source ID/entry until explicitly re-observed;
Repository-level freshness metadata is not a substitute.

For receipt-bound Init, Published Hub-base advance before Finalize retains
unchanged source/Seed/submitted Inventory, rematches identity, issues a new
base-bound Receipt and creates a replacement session without rerunning
discovery; the old session cannot continue. Normal Refresh instead retains its
exact SourceSnapshot/change analysis and reruns existing Refresh preparation/
guidance against the new Published base, with no Seed or Receipt. For either mode,
after Finalize the existing proposal reconciliation contract applies.

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
Record/finalize rejects cross-member receipt/source mismatch. A recoverable
member-local failure continues to later siblings after confirmed-clean cleanup;
uncertain cleanup/process/shared authority failure stops the Batch. Any failed
member keeps the atomic Batch Incomplete while exact completed siblings remain
reusable until retry or explicit membership revision.
