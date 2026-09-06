# 07.02 — Shared Question lifecycle

> Status: The Shared Question MVP and Group 5 compact home-aware placement are
> implemented and verified.

## Decision summary

A Question is a governance document in the Hub. A Proposal contains the Question
for review; Accept puts it into the remote-profile Local Draft; merging the pull
request shares it with every machine.

```text
proposal staging → accepted Local Draft → PR → Published Hub main
```

The runtime does not need a private ledger or cache. An exact Hub tree reconstructs
the complete current Question state.

## Shared representation

Each Question is a bounded Markdown document. Compact Profile 1.0 places it at
`<subject-home>/questions/` when subject home is unambiguous and under
`shared/questions/` otherwise; a legacy-unprofiled Hub retains `questions/`.
The owning home index links useful open Questions directly. The document retains:

- a stable Question ID and human-readable title;
- a kind: conflict, missing evidence, relation candidate, identity candidate or
  maintainer decision;
- subject/property/scope;
- the current governance state;
- typed claim/candidate/evidence references;
- missing evidence and limitations;
- links to applicable Maintainer Guidance/resolution evidence;
- a visible short explanation for a human reviewer.

A Question is an MCP-rendered governance document with `type: Question`, not a
Concept Schema/role for the model to select during Ingest. Its compact canonical
path is `<home>/questions/<question-id>.md`; the legacy path is
`questions/<question-id>.md`. Compact Profile creates no category index.

Top-level `status` remains the ordinary OKF document lifecycle (`draft`,
`stable`, ...), independent of publication and governance. The current Question
state is stored at `agentbase.question.state` and is exactly `open`, `resolved`
or `needs-review`. The dedicated Question validator checks the exact nested contract:

```yaml
type: Question
status: draft
agentbase:
  question:
    id: <stable-id>
    revision: 1
    state: open
    kind: conflict
    origin_subject: <immutable identity at creation>
    origin_property: <immutable property at creation>
    subject: <canonical identity or stable candidate subject>
    property: <bounded property>
    scope_key: <immutable bounded origin key>
    references:
      - reference_kind: owned-item
        owner: <owning concept identity>
        item_kind: claim
        item_key: <natural key>
        source_id: <ID resolved in owner's sources[]>
        observed_revision: <optional source/provider revision>
    missing_evidence: []
    limitations: []
    guidance: []
```

Allowed kinds are `conflict`, `missing-evidence`, `relation-candidate`,
`identity-candidate` and `maintainer-decision`. Exact fields are bounded;
unknown nested fields, invalid state transition, unresolved typed reference,
duplicate Question ID/path or duplicate index target fail validation. MCP owns
initial rendering, a short readable body and state transitions; the Agent does
not write Question bytes or invent an ID, revision or state.

References are an exact tagged union:

- `owned-item`: `owner + item_kind + item_key + source_id`, where `source_id`
  resolves inside the owner concept;
- `candidate-evidence`: `candidate_key + source_resource`, where the exact
  normalized repository/provider/AgentBase resource proves the candidate.

Both variants may add `observed_revision`; it is required when the referenced
observation has a source/provider revision and forbidden from standing in as a
value. Candidate references never invent a placeholder owner concept.

One Question has at most 64 references, 64 missing-evidence entries, 64
limitations and 16 Guidance links. IDs/keys are at most 256 UTF-8 bytes; human
summaries/reasons are at most 512 bytes each; the ordinary 64 KiB frontmatter
and 256 KiB concept-document bounds still apply. The owning home index contains
each rendered Question target at most once. These are safety bounds, not
completeness targets.

A Question does not contain raw source, a provider response dump, a secret or
duplicated concept prose. Git retains revision history; the file needs only the
current state and references and does not append the entire event ledger to frontmatter.

## Stable identity

A Question ID has the form `question-<24 lowercase hex>` and is created once from
the SHA-256 hash of the canonical UTF-8 JSON array `[1, kind, origin_subject, origin_property,
scope_key]`; array order and JSON string escaping are fixed by contract.
`origin_*` fields never change; current `subject/property` may follow an accepted
rename/redirect. The Git Hub is already the namespace, so the input contains no
machine-local Hub ID or remote name. The scope key contains no wording, evidence
list, timestamp or current display name.

The ID and its layout-qualified path do not change after creation. A future
reviewed legacy-to-Profile migration may rewrite the directory while preserving
the ID; a subject rename/redirect updates only the current reference and does
not derive the ID again.

New Question starts at revision `1`. Every accepted modification to the Question
document—including title/body wording—must increment revision by exactly one;
an unchanged Question or navigation-only index change does not. This conservative
rule keeps stale-answer checks deterministic across machines.

## Lifecycle

```text
Open ──accepted resolution/guidance──→ Resolved
  ↑                                      │
  └──────── explicit reopen ─────────────┤
                                         │ conflicting new evidence
                                         ↓
                                    Needs Review
                                         │ accepted review
                                         └────────→ Resolved
```

- **Open:** an answer/evidence is still missing.
- **Resolved:** no action/question remains for a maintainer at the current
  revision; this does not mean that the conflict disappeared or one position
  became absolute truth.
- **Needs Review:** accepted guidance still exists but conflicts with new evidence.

State changes only through a reviewed and Accepted proposal. An answer that has
not been Accepted does not make a Published Question Resolved. An Open Question
can be Published; Question state is independent of publication state.

Competing current positions remain queryable when the Question is `resolved`. A
position leaves the current view only through a reviewed correction/removal with
a reason and evidence; Git retains the history.

## Authoring boundary

Only the dedicated MCP Question renderer may create or modify a Question. It
validates exact previous→next ID, revision, state transition, typed references
and protected fields before the ordinary proposal digest/Accept lifecycle.
Generic Ingest/Refresh authoring cannot edit Question bytes, and implementation
must not broaden the generic mutable-draft predicate to make this work.

## Creation

A Question can be created from:

- competing claims;
- missing evidence for an otherwise useful concept;
- an unresolved relation/resource identity candidate from Section 06;
- a required explicit maintainer decision;
- new evidence that conflicts with accepted guidance.

Creation requires at least one exact evidence/candidate reference or an explicit
human decision request. Pure model speculation cannot create a Question.

In baseline ordinary Ingest/Refresh, `property` is a stable token that already
exists in `agentbase.observed_values` for the same subject, not the full question.
Each `observation_ref` must match the exact property, role and source ID. If the
concept has no matching observation, the Agent preserves uncertainty in prose or
Limitations and omits the Question declaration; it does not create a fake
observation merely to pass validation.

The Question is created in the same proposal as the knowledge/candidate that
caused it when possible. If the source concept does not yet exist, the Question
still uses a stable candidate scope and evidence resources; no placeholder
concept is needed.

Capability 046 Initial Ingest extends this creation path with a private QuestionPlan
in the Discovery Receipt: the plan uses exactly the kinds/references above and
binds the target candidate/final subject, property/scope, missing evidence and
limitations. The Agent selects only candidate/evidence IDs from the current
request; MCP derives the normalized source resource and exact revision from the
observation plus active SourceSnapshot, then freezes the existing
`candidate-evidence` reference. Finalize renders only after the subject and
evidence materialize; otherwise uncertainty remains a limitation. The Agent does
not send a URI/revision or final Question bytes.

## Resolution

A resolution proposal atomically:

1. adds Maintainer Guidance or provider/source-backed resolution evidence;
2. updates the Question state/references;
3. adds any resulting relation/identity/knowledge change;
4. retains competing historical evidence.

Another answer at a stale Question revision is rejected. A conflicting new
answer does not overwrite the old answer; it creates a reviewed revision and the
appropriate state transition.

## Synchronization and recovery

- Published Question authority is the exact Hub commit.
- Local accepted Questions participate in normal pending-proposal review;
  ordinary query sees them after publication and synchronization.
- Pull/synchronize receives a Question as ordinary Hub Markdown.
- If a cache is added later, it must bind the Hub commit and be rebuildable; the
  MVP has no Question cache.
- An interrupted Accept/Publish uses the existing proposal/Git recovery; no
  private ledger write determines truth after the commit.

## Clean cutover

Question ledger v1 was never published and is not shared authority. When the
runtime switches to Question documents, preflight scans accepted Guidance with
`agentbase.question`. If there is no orphaned Guidance, discard the old ledger
and do not build a dual-write or permanent migration layer. If Guidance does not
resolve to a Question document, cutover stops with explicit migration/regeneration
instructions; it does not silently discard accepted Question context. Unaccepted
Questions are recreated through Refresh/Enrichment; accepted Hub content is the
only baseline.

## Baseline impact

This broad authority change made a clean cut from the private ledger/sidecar.
The Git/Hub lifecycle is reused; do not add a service/database, compatibility
reader or cache.
