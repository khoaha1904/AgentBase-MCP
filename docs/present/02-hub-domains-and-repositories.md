# 02 — How Hub, Domain and Repository are organized

> Status: Product direction is settled; single-repository and explicit Batch
> Initial Ingest are implemented offline. Automatic subproject scoping inside a
> monorepo remains deferred.

## Short answer

A Hub contains a knowledge network across many Domains. Domain, Repository,
System, workload and useful shared contract/resource are concepts; relations
connect them.

```text
One AgentBase-Hub
├── Domains: Crawler, Recommendation
├── Repositories: crawler-api, recommendation-service
├── Systems and Components
├── Interfaces and shared Resources
└── Integration contracts with independent identity, when applicable
```

Real Domains such as Crawler and Recommendation live in one Hub; a parent
Domain is not needed merely to represent the company's industry.

## Relations do not live in a separate area

```text
Crawler Worker ──publishes-to──→ Vehicle Data Queue
                                      ↑
Recommendation Worker ──consumes─────┘
```

If `Vehicle Data Queue` has enough shared contract or ownership to be promoted
to a Resource or Interface, it exists only once. A simple internal queue may
remain embedded knowledge in its producer/consumer. Relations work the same way
inside one Domain and across multiple Domains.

An API call or ordinary message send is normally a relation. Create a separate
Integration Contract concept only when it has independent identity, ownership,
mapping or query value.

## Confirm the Domain before Ingest

```text
Quickly read the README and key documentation
                    ↓
Propose a Domain and compare it with the current Hub
                    ↓
Show matches or warnings
                    ↓
User confirms or corrects
                    ↓
Only then start Ingest
```

AI does not decide the Domain alone or blindly trust a name supplied by the
user. A new Domain, a near-duplicate name and signs of mismatch must be reported
clearly before Ingest.

For a batch of repositories, the user may assign all of them to one Domain. AI
still checks each repository, warns about anomalies and waits for the user; it
does not silently change a Domain or drop a repository.

A parent directory such as `crawler-repos/` only groups and selects repositories.
It does not become a Repository or Domain in the Hub, and a directory name is
not enough to confirm a Domain. Each child Git repository keeps its own identity
and evidence.

## Settled points

- One Domain may contain knowledge from many repositories.
- Each repository has exactly one primary Domain. A concept or relation linked
  to another Domain does not assign the repository to that second Domain.
- In a monorepo, a subproject is only an evidence/query scope and inherits the
  repository's primary Domain; it has no separate Repository ID or Domain
  assignment in the first version.
- A repository may link to a repository in another Domain through an API, queue,
  event or integration contract.
- An API/shared queue may become an Interface/Resource concept when it has
  independent value; a relation is the connection, not a shared “relations” folder.
- Each concept has one Hub identity and is not copied per Domain.
- Difficult multi-repository relations are presented in
  [section 06](06-cross-repository-and-cross-domain-relationships.md).

## Settled minimum Preflight

The agent reads only the root README, the root docs index and overview documents
directly linked by that README. It compares them with the Domains already in the
Hub, then shows a short proposal, evidence and warnings. For a batch, one shared
confirmation table still keeps a warning for each repository. A Code Graph is
not needed merely to confirm a Domain.
