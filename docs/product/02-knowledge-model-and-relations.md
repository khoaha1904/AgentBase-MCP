# 02 — Knowledge model and relations

> Status: Hub, Domain and Repository organization plus bounded
> cross-repository relation enrichment are implemented. Published concept merge
> and redirect remain deferred. Group 4 Domain Capsules, AgentBase OKF Profile
> 1.0, Profile-preserving workflows, reviewed migration and final mutation
> admission and G5-C1 compact Profile 1.0 layout are implemented and verified.
> G5-C2 semantic-quality admission and scale qualification remain deferred.

## Outcome

One AgentBase-Hub provides a sparse knowledge network across many Domains and
repositories whose readers share one trust zone. Concepts describe useful
business and system boundaries; sourced relations connect them without copying
the same concept per repository or Domain.

```text
Hub
├── domains/<slug>/     compact Domain Capsule and Repository dossiers
├── shared/             compact knowledge with no honest single-Domain home
└── provenance-bearing relations and Questions
```

The Hub keeps overview, ownership, important relations, decisions and
navigation. Exact implementation detail remains in source.

Concept type comes from frontmatter; it does not select a storage directory or
justify a file. The root and home indexes plus concept-to-concept links provide
knowledge navigation. A Markdown file is an independently useful reading unit,
not a serialized row for every detected schema or technology.

## Accepted Domain Capsule model

Group 4 correctly introduced Domain homes, but its type-relative directories
still encourage fragmented documents and create a misleading
`repositories/<repo>/log.md` directory beside the actual Repository concept.
Group 5 keeps the Domain boundary and replaces only the inside of each home:

```text
domains/
  <domain-slug>/
    index.md                  # Domain concept and navigation
    repositories/
      <repository-slug>.md    # rich Repository dossier
    knowledge/                # independently useful concepts of any role
    questions/
shared/
  index.md
  agentbase-profile.md
  repositories/
  knowledge/
  questions/
```

Only directories needed by actual knowledge must exist. Every concept document
has exactly one physical **home**: one Domain Capsule or `shared/`. Home is the
stewardship, review and default-navigation location, not a claim that the
concept participates in only that Domain. Evidenced relations may cross capsule
boundaries, and a Repository may contribute to several Domains without being
duplicated. `shared/` is a first-class physical home for truly shared platform
knowledge; it is not another Domain.

A standalone, independently useful Cross-Repository Relationship contract may
live in `knowledge/`. Canonical graph relations remain evidenced concept
frontmatter; that document is not a relation table or second relationship
authority.

`domains/<slug>/` is the future extraction unit. A split preview must enumerate
every dependency and link that leaves the capsule. Moving a capsule preserves
its complete subtree and must not silently duplicate shared authority, drop a
relation or leave a broken link. Actual cross-Hub movement/federation remains a
separately reviewed migration; the capsule layout makes that migration bounded
without pretending every capsule is already self-contained.

The stable external Domain selector remains `domains/<slug>`. Under Profile
1.0 the capsule `index.md` is also that exact Domain concept, so selector and
concept identity are the same. Root and shared indexes remain navigation only.
Existing MCP tool names and Domain-selector shapes remain stable.

Repository documents are the default reading unit for repository-local purpose,
runtime/deployment boundaries, capabilities, interfaces/triggers,
dependencies/data, operations, evidence and limitations. System, Component,
Function, Interface, Flow, Resource, Entity, Metric, Relationship and Guidance
roles may still exist, but their standalone documents share `knowledge/` and
must justify independent identity and reading/query/link value. Otherwise their
evidence is embedded in a useful dossier or parent. There is no minimum line
count and no concept quota.

Question documents keep independent lifecycle identity under `questions/`.
Accepted Guidance may live as independently useful knowledge and link to the
Question; its schema type does not create another directory.

Published Hub content has no AgentBase activity `log.md`. Git commits and pull
requests remain complete shared history. Discovery receipts, semantic-quality
reports, repair records and detailed proposal history stay in owner-private
workflow state; a bounded digest-bound summary may appear in proposal inspection
or pull-request text without becoming Hub knowledge.

## Identity, home and participation

- A Repository has one stable lineage identity and exactly one physical home,
  but may have evidenced participation in several Domains.
- Rename, organization move or another checkout preserves identity when lineage
  is strong; an independent fork is a new Repository.
- A Domain may contain knowledge from many repositories.
- A concept has one Hub identity and physical home. Cross-Domain use creates a
  relation, not a duplicate concept.
- A workspace parent directory is neither a Repository nor a Domain.
- A monorepo child is evidence/query scope, not a separate Repository identity
  in the current product.

Before Initial Ingest, AgentBase proposes one grouped home plan from bounded
overview and candidate evidence: a Repository default plus concept exceptions.
It shows matching Domains or `shared/` and waits for one user confirmation; it
does not infer stewardship solely from a directory name or prompt once per
file. The plan separately records any evidenced Domain-participation relations.
Later evidence may add participation without moving the document. Rehoming is
an explicit path/identity migration that updates affected links and returns
through normal review; it is never an incidental Refresh side effect.

## Relations

A relation may connect concepts in one repository, different repositories or
different Domains. A source may contribute the side it can prove without waiting
for every endpoint repository to be ingested. AgentBase never invents an unseen
producer, consumer or endpoint to complete a diagram.

A shared queue, API or other boundary becomes one Resource or Interface only
when it has stable identity and independent value. A declaration or matching
display name alone is insufficient. Transport resources and message/API
contracts remain distinct when both have independent identities.

## Reconciliation and enrichment

Strong external identity can support a proposal that several observations refer
to one resource. Without it, AgentBase keeps candidates separate and records a
Question. After repositories are Published, explicit Domain Enrichment may
compare a bounded selection, gather authorized read-only provider evidence and
propose missing relations or identity updates.

Enrichment never scans an entire provider account by default and never edits
Published knowledge directly. Successful findings still enter the normal Local
Draft and pull-request lifecycle. Two already-Published concepts are not merged,
deleted or redirected automatically.

The same logical resource deployed in several regions remains one concept with
multiple deployment references unless each deployment has an independent role,
lifecycle or query value.

## AgentBase OKF profile

Git and linked Markdown provide file-level portability, while AgentBase adds
Questions, predicates, Flows, lifecycle fields and validation rules beyond a
generic claim of OKF compatibility. Group 4 therefore defines a versioned
**AgentBase OKF profile** that identifies the pinned OKF base, every extension,
required/optional behavior and loss when consumed by a base-only OKF reader.

Interoperability requires fixture-based import/export and round-trip evidence;
human-readable files alone are not semantic compatibility. Profile evolution
must preserve unknown valid OKF content and route any lossy migration through
the normal reviewed lifecycle.

Profile 1.0 includes the compact Domain Capsule/home rules. A well-known valid OKF
concept at `shared/agentbase-profile.md` declares the exact profile identity,
pinned OKF base, layout and AgentBase extension families; root `index.md`
continues to carry only `okf_version`. The root index links the profile and
capsules. The profile is carried by new Hub baselines and compatible AgentBase
releases. A base-only OKF consumer may read it as an unknown producer-defined
concept, but is not assumed to preserve AgentBase Questions, relation semantics,
lifecycle or extraction behavior unless round-trip evidence proves it.

## Deferred scale envelope

Capacity benchmarking is not a Group 4 release gate. Releases keep
`qualified_scale: null` and make no performance claim for the former target of
100 repositories, 25 Domains, 10,000 concept documents and 50,000 relations.
Deterministic correctness, bounds and Profile round-trip fixtures remain
required. A larger valid Hub remains readable and must not be damaged or
rejected merely for size; AgentBase reports `unqualified scale` where
performance or workflow claims lack evidence.

The default remains one Hub trust zone, bounded lexical/structured retrieval and
the released AWS/SQS provider profile. Federation/redaction, semantic/vector
retrieval and additional providers require measured need rather than empty
frameworks in Group 4.

## Profile 1.0 cutover boundary

The current Crawler Hub and benchmark corpus are disposable test fixtures. The
owner authorizes Group 4 delivery to reset and re-ingest that Crawler data under
Profile 1.0 rather than build a general compatibility migration solely for it.
This permission does not apply to any real team Hub. A real Hub requires a
report-first reviewed migration, exact rollback point and no implicit deletion.
An unprofiled legacy Hub remains readable for diagnosis and migration, but
Profile 1.0 authoring is blocked until migration is accepted and synchronized.
Migration moves documents, rewrites exact links/relationship endpoints and
regenerates navigation through the ordinary proposal lifecycle. Application
rollback never performs a Hub rollback.

The compact Group 5 layout is a pre-release correction to Profile 1.0, not a
second Profile version. Existing owner-confirmed qualification Hubs contain only
test data and may be reset and re-ingested. The release must not advertise
Profile 1.0 author compatibility until compact-layout authoring, reading,
validation, query and visualization pass end-to-end verification. No general
migration engine is added solely for the discarded development layout; an
owner-declared durable Hub is never reset by this permission.

## Failure and recovery

- Ambiguous Domain or repository lineage requires user confirmation.
- Ambiguous physical home requires user confirmation; it is not resolved from
  a repository or folder name alone.
- Name-only matches remain candidates, not identity proof.
- Conflicting sources coexist with provenance and a Question.
- Missing provider access leaves the relation unresolved without blocking
  unrelated safe knowledge.
- A partial enrichment run cannot silently publish its successful subset.

## Non-goals

- A separate relation database or relations folder as product authority.
- Automatic global account/region scans.
- Automatic cross-repository inference from matching names.
- Published concept merge/redirect without a separately reviewed migration.
- Duplicating one Repository or concept into every Domain it participates in.
- Treating a physical home as exclusive semantic Domain membership.
- Creating a type directory or standalone Markdown document merely because a
  schema, framework element or provider resource was detected.
- Publishing activity logs, reviewer packets or proposal receipts as knowledge.
- Claiming semantic interoperability with a base OKF consumer without a
  versioned profile and compatibility evidence.

## Downstream Capability Contracts

- [Hub, Domain and Repository model](../capabilities/02-hub-domain-repository-model/README.md)
- [Cross-repository relations](../capabilities/06-cross-repository-relations/README.md)
