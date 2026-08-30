# 02 — Knowledge model and relations

> Status: Hub, Domain and Repository organization plus bounded
> cross-repository relation enrichment are implemented. Published concept merge
> and redirect remain deferred.

## Outcome

One AgentBase-Hub provides a sparse knowledge network across many Domains and
repositories. Concepts describe useful business and system boundaries; sourced
relations connect them without copying the same concept per repository or
Domain.

```text
Hub
├── Domains
├── Repositories
├── Systems, Components and Functions
├── Interfaces, Flows and shared Resources
└── provenance-bearing relations and Questions
```

The Hub keeps overview, ownership, important relations, decisions and
navigation. Exact implementation detail remains in source.

## Identity and membership

- A repository has one stable Hub identity and exactly one primary Domain.
- Rename, organization move or another checkout preserves identity when lineage
  is strong; an independent fork is a new Repository.
- A Domain may contain knowledge from many repositories.
- A concept has one Hub identity. Cross-Domain use creates a relation, not a
  duplicate concept or second repository membership.
- A workspace parent directory is neither a Repository nor a Domain.
- A monorepo child is evidence/query scope, not a separate Repository identity
  in the current product.

Before Initial Ingest, AgentBase proposes a primary Domain from bounded overview
evidence, shows matches or warnings and waits for user confirmation. It does not
infer ownership solely from a directory name or silently change a batch member's
Domain.

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

## Failure and recovery

- Ambiguous Domain or repository lineage requires user confirmation.
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
- Multiple primary Domains for one repository.

## Downstream Capability Contracts

- [Hub, Domain and Repository model](../capabilities/02-hub-domain-repository-model/README.md)
- [Cross-repository relations](../capabilities/06-cross-repository-relations/README.md)
