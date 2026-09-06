# 02.10 — Compact Profile 1.0 layout and Repository dossiers

> Status: G5-C1 is implemented and verified, including corrective compatibility,
> deterministic admission and one five-repository compact Batch Initial Ingest.
> This contract supersedes the
> type-relative Profile 1.0 development layout in sections 02.07–02.09.
>
> Impact: Broad change accepted by the owner. It changes Profile paths and
> identities plus every authoring, validation, query and visualization consumer,
> while reusing Domain homes, grouped home plans, provenance, relations,
> proposals and deterministic admission.
>
> Release evidence: Required

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)

Architecture Contracts:
[Ownership](../../architecture/ownership.md),
[Dependencies](../../architecture/dependencies.md),
[Flows](../../architecture/flows.md),
[State and trust](../../architecture/state-and-trust.md), and
[Runtime](../../architecture/runtime.md).

## Current → target

The implemented development layout gives every AgentBase type a category below
one Domain or `shared/`, keeps the Domain concept in `domain.md`, and writes
activity to a directory beside each Repository concept. It correctly separates
physical home from semantic Domain participation, but encourages thin documents
and makes `repositories/<repo>/` look like knowledge while containing only
`log.md`.

The compact pre-release Profile 1.0 revision keeps physical homes and relations,
but makes documents human reading units. Domain `index.md` is the Domain concept
and navigation entry; Repository documents are rich dossiers; all other
standalone semantic types share `knowledge/`; Questions retain their own
lifecycle collection. AgentBase activity logs do not enter the Hub.

## Compact layout

```text
index.md
domains/
  <domain>/
    index.md
    repositories/
      <repository>.md
    knowledge/
      <concept>.md
    questions/
      <question>.md
shared/
  index.md
  agentbase-profile.md
  repositories/
    <repository>.md
  knowledge/
    <concept>.md
  questions/
    <question>.md
.agentbase/ci/
.github/workflows/
```

Only paths needed by actual content exist. Root and `shared/index.md` are
navigation. `domains/<slug>/index.md` is one valid Domain concept whose body
also provides capsule navigation; its canonical identity is
`domains/<slug>`. The well-known Profile declaration remains
`shared/agentbase-profile.md` and declares layout
`compact-domain-capsules-v1` within Profile 1.0.

Repository identity is `<home>/repositories/<slug>`. Question identity is
`<home>/questions/<id>`. Every other AgentBase-owned standalone semantic type,
including System, Component, Function, Interface, Entity, Metric, Resource,
Flow, Cross-Repository Relationship and Maintainer Guidance, uses
`<home>/knowledge/<slug>`. Its role comes only from frontmatter. Valid unknown
base-OKF types are preserved below `knowledge/` without type inference.

Category indexes below `repositories/`, `knowledge/` or `questions/` are not
canonical files. The home index links directly to useful documents. Generated
presentation may group those links by frontmatter type without changing paths
or creating another authority.

## Repository dossier and promotion

A Repository document is the default parent for repository-local knowledge. Its
editable skeleton offers applicable sections for purpose/scope, runtime and
deployment boundaries, capabilities, interfaces/triggers, dependencies/data,
operations/failure recovery, evidence and known gaps. The author omits an
inapplicable section or records an evidenced limitation; it does not fill
headings with guesses or padding.

A separate `knowledge/` document is justified only when the subject has stable
identity plus independent reading/query/link value demonstrated by at least one
of:

- distinct deployment, ownership, lifecycle, compatibility or failure boundary;
- cross-document or cross-repository relations that need a stable endpoint;
- an independently consumed interface, event or data contract;
- an independently useful evidenced Flow; or
- separate freshness, stewardship or maintainer-decision value.

Otherwise the evidence becomes a concise sourced dossier/parent section or
table. File length is not a gate: a short independent contract may be correct,
while a long duplicate is still over-modeling. Detection of a schema,
technology, endpoint, handler or provider resource never creates a document by
itself.

Promoted documents link back to their Repository source and appear in the
Repository dossier's bounded knowledge navigation. The dossier does not copy
the promoted contract. Shared or cross-repository knowledge remains in its one
honest home and is linked rather than duplicated.

## Home, Questions and activity history

The existing grouped home plan remains proposal input. The Repository uses the
confirmed default home; standalone candidate exceptions may choose another
Domain or `shared/`; embedded candidates create no paths. Physical home still
does not imply Domain participation. Only evidenced relations do.

A Question uses the home of its subject when that home is unambiguous and
`shared/questions/` otherwise. Independently useful accepted Guidance uses
`knowledge/` in the Question's home and links to the exact Question/revision.

Profile 1.0 rejects AgentBase-authored `log.md` and the former Repository
activity directories. Git commit/PR history is the shared audit record.
Discovery, authoring and reviewer reports remain private workflow state; their
bounded summaries may be rendered during Inspect without becoming OKF content.

## Compatibility and cutover

The owner classified existing Profile 1.0 qualification Hubs as disposable test
data. G5-C1 resets and re-ingests those exact Hubs after implementation; it does
not build a migration path solely for the discarded development layout. This
permission never applies to a Hub the owner identifies as durable.

Profile absence remains `legacy-unprofiled`; the prior
`domain-capsules-v1` development declaration becomes unsupported for mutation
after compact cutover. Existing MCP tool names, `domains/<slug>` selectors and
the legacy `repositories/<slug>` Initial-Ingest slug input remain accepted.
Returned Domain identity changes from `domains/<slug>/domain` to the selector
itself, and standalone type-relative paths change to `knowledge/`.

Release manifests may claim `agentbase-okf@1.0` author support because
bootstrap, Initial Ingest, Refresh, Question/Guidance, Enrichment, CI, query,
semantic impact and visualization now use and verify the compact layout.
Capacity and real-model benchmarks remain deferred and are not G5-C1 gates.

## Requirements

- **AB-COMPACT-001** — Profile 1.0 declares exact layout
  `compact-domain-capsules-v1`; all Profile-aware consumers use one exported
  compact classifier, and the prior development layout is not admitted for new
  mutation.
- **AB-COMPACT-002** — Root `index.md` and `shared/index.md` are navigation;
  every `domains/<slug>/index.md` is the sole Domain concept for that capsule,
  has canonical identity `domains/<slug>` and also owns capsule navigation.
  Without the Profile declaration, a nested Domain index lacking `type: Domain`
  remains a base-OKF navigation index and MUST NOT be parsed as a concept.
- **AB-COMPACT-003** — A Repository exists only at
  `<home>/repositories/<slug>.md`; a Question exists only at
  `<home>/questions/<id>.md`; the Profile declaration remains only at
  `shared/agentbase-profile.md`.
- **AB-COMPACT-004** — Every other AgentBase-owned standalone semantic type and
  valid unknown base-OKF concept exists below `<home>/knowledge/`. Frontmatter
  type never creates a type-relative directory.
- **AB-COMPACT-005** — Only `repositories/`, `knowledge/` and `questions/` are
  admitted semantic collections inside a home. Their category indexes are not
  authored; each root/home index links directly to exact useful entries.
- **AB-COMPACT-006** — Repository skeletons and authoring guidance make the
  Repository dossier the default parent for repository-local understanding and
  cover only applicable purpose, boundaries, capabilities, interfaces/triggers,
  dependencies/data, operations, evidence and limitations.
- **AB-COMPACT-007** — A standalone knowledge document requires stable identity,
  independent reading/query/link value and at least one independent boundary
  reason from this contract. Otherwise evidence remains embedded or becomes a
  Question/limitation/ignored outcome.
- **AB-COMPACT-008** — No line, byte, file or concept quota can satisfy or fail
  document density. Validation and quality review reject unsupported padding,
  duplication and a standalone document with no independent value.
- **AB-COMPACT-009** — Promoted knowledge links to its exact Repository evidence
  and appears in bounded dossier navigation without copying its authoritative
  content. One concept keeps one physical home even when relations cross homes.
- **AB-COMPACT-010** — Grouped home planning, owner confirmation and explicit
  participation relations remain unchanged in authority. Embedded candidates
  create no physical-home exception or file.
- **AB-COMPACT-011** — Question home follows an unambiguous subject home and is
  `shared` otherwise. Independently useful Guidance lives in `knowledge/` and
  remains revision-bound to its Question.
- **AB-COMPACT-012** — Compact Profile Hubs contain no reserved activity
  `log.md` at any path. Git/PR owns shared history; detailed operational or
  reviewer artifacts remain outside the Hub.
- **AB-COMPACT-013** — Query, impact and visualization determine role from
  frontmatter and home from the compact classifier, never from a former type
  folder. Private draft projections do not enter ordinary Published query.
- **AB-COMPACT-014** — Existing MCP tool names and external Domain selectors
  remain stable. Returned compact paths/identities are authoritative and stale
  development-layout aliases are not persisted as duplicate concepts. Bundle
  and query loading MUST reject duplicate canonical concept identities instead
  of selecting one path by traversal order.
- **AB-COMPACT-015** — G5-C1 resets only owner-confirmed disposable
  qualification Hubs, then proves complete compact Profile read/author/CI/query/
  visualization behavior before release compatibility is declared. Durable Hub
  deletion or an implicit application-upgrade migration is forbidden.

## Implementation and verification ownership

`core/knowledge/documents` owns compact classification and identity;
`core/knowledge/schemas` owns promotion semantics without path hints;
`app/hub-okf` owns bootstrap, authoring, lifecycle and private artifacts; query,
CI and visualization consume the public classifier. Focused requirements tests
cover each owner, including legacy nested navigation, duplicate identity,
Profile-wide no-log and navigation-only impact regressions, followed by the
canonical repository/release gate and one complete isolated disposable-domain
ingest through Repository authoring, Batch, Question/Guidance, query,
Enrichment and visualization. Benchmark execution is not required.
