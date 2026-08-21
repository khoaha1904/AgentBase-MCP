# MCP Contract: Single-Repository Refresh

The public `agentbase-refresh` skill composes deterministic MCP operations. The
user invokes the skill; the user does not write an authoring prompt.

## Preflight and context

`preflight_hub_ingest` remains the identity boundary. Refresh accepts only an
`existing` canonical Repository result. `new` routes to Initial Ingest and
`ambiguous` requires owner choice.

Refresh preparation accepts one repository, subject and coverage. The runtime
derives the evidence/source-state digest; the caller does not invent it. The
response provides:

```yaml
result: prepared
session_id: hub-session-...
repository: { id: repository-example-... }
baseline: { local_head: ..., published_base: ..., pending_commits: 3 }
source_change: { previous: ..., current: ..., changed_paths: [...] }
known_gaps: { questions: [...], limitations: [...], references: [...] }
continuity: { current_source: [...], neighbors: [...], omitted: {...} }
investigation_order: [changed-source, known-gaps, bounded-discovery]
```

Every list is bounded and reports omitted counts. The baseline is active local
`main`; an unaccepted proposal is never merged implicitly. Full Hub and raw
graph state remain private.

## Authoring and lifecycle intent

The skill edits only the returned `bundle/`. Additions and updates use existing
catalog-7 validation. Finalize accepts Questions plus destructive lifecycle
intents so declarations bind the exact final authored bytes:

```yaml
action: supersede
concept_id: components/old-crawler
replacement_concept_id: components/new-crawler
source_ids: [source-old-runtime]
reason: Runtime moved to the replacement component
evidence:
  revision: <exact-current-state>
  paths: [src/old.ts, src/new.ts]
  diff: rename-or-replacement-summary
affected_relationships: [flows/crawl-flow]
affected_navigation: [components/index.md]
```

Allowed actions are `remove-contribution`, `remove-concept`, `supersede` and
`retract`. Omission of a concept/file never creates intent. Search/graph absence
and age are rejected as sole removal evidence.

Because shared concepts are flat Markdown, Refresh preserves their existing
prose and ordinary metadata. MVP mutation is limited to structured entries with
exact current-Repository evidence ownership; ambiguous changes are preserved
and returned as a Question/limitation.

## Finalization result

Finalize validates the proposed tree, changed current-repository source spans,
protected bytes, foreign contributions and lifecycle intents. It returns:

- `no_change`: successful, no proposal ID or duplicate state;
- `reviewable_draft`: proposal ID/digest and grouped Added, Updated, Removed,
  Superseded/Retracted and Questions/Limitations inspection;
- Incomplete error with exact safe recovery guidance.

The skill may correct one retryable pre-state guidance request and separately
repair content once. It calls Prepare and Finalize once and never calls Accept,
submit, synchronize, provider CLI or remote tools.
