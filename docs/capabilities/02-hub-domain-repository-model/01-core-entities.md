# 02.01 — Core entities and ownership

> Status: Core Hub/Domain/Repository ownership is implemented.

## Entity model

| Entity | Canonical identity | Meaning |
|---|---|---|
| Hub | admitted local/remote Hub identity | one shared knowledge graph |
| Domain | `domains/<slug>` | owner-confirmed business boundary |
| Repository | `repositories/<slug>` | source repository and development contract |
| System | `systems/<slug>` | capability coordinated by software/infrastructure |
| Component/interface/resource | role-oriented canonical path | independent knowledge unit |

The source `repository-...` ID and Repository concept path are different
identities. A Repository concept represents source with
`repository://<repository-id>/...` evidence; continuity by source ID must resolve
to exactly one Repository concept.

## Primary Domain

The Repository concept keeps exactly one evidenced relation:

```yaml
relationships:
  - kind: part-of
    target: domains/crawler
    evidence: [owner-domain]
```

`owner-domain` points to deterministic
`agentbase://owner-guidance/domains/...`. Do not add a `primaryDomain` registry,
sidecar or duplicate Repository per Domain.

A System has its own `part-of → Domain`. A component/resource gets its Domain
through that chain; `implemented-in → Repository` expresses source ownership but
does not transmit Domain membership.

## Validation delta

- Repository schema permits exactly one `part-of` target of type Domain.
- Confirmed-Domain finalization requires the Repository concept, current-source
  citation and a matching owner-evidenced edge.
- A System created in a proposal still needs a Domain relation when evidence
  supports it.
- An existing mutable AgentBase Repository without an edge is filled by Refresh,
  not bulk migration.
- A human-authored/verified Repository is not rewritten. Missing or mismatched
  assignment blocks the proposal and requires an explicit maintainer-reviewed
  correction; do not create a shadow Repository to bypass protected-content
  rules.
