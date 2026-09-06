# 02.01 — Core entities and ownership

> Status: Core ownership is implemented. Compact Profile 1.0 identities are
> accepted in [02.10](10-compact-profile-layout-requirements.md) but not yet
> implemented.

## Entity model

| Entity | Canonical identity | Meaning |
|---|---|---|
| Hub | admitted local/remote Hub identity | one shared knowledge graph |
| Domain | `domains/<slug>` | owner-confirmed business boundary |
| Repository | `<home>/repositories/<slug>` | source repository and rich development dossier |
| Question | `<home>/questions/<id>` | independently governed unresolved knowledge |
| Other standalone concept | `<home>/knowledge/<slug>` | independently useful typed knowledge unit |

The source `repository-...` ID and Repository concept path are different
identities. A Repository concept represents source with
`repository://<repository-id>/...` evidence; continuity by source ID must resolve
to exactly one Repository concept.

## Home and Domain participation

Every Repository and concept has one physical Domain or `shared` home. A
Repository or other concept may separately keep evidenced Domain participation:

```yaml
relationships:
  - kind: part-of
    target: domains/crawler
    evidence: [owner-domain]
```

`owner-domain` points to deterministic owner guidance. Do not add a
`primaryDomain` registry, sidecar or duplicate Repository per Domain. Physical
home controls stewardship/navigation; only the relation expresses semantic
participation. `implemented-in → Repository` expresses source ownership but
does not transmit Domain membership.

## Validation delta

- Repository schema permits evidenced `part-of` targets of type Domain without
  requiring physical rehoming or duplicate concepts.
- Confirmed home finalization requires the Repository dossier, current-source
  citation and exact compact Profile path; confirmed participation additionally
  requires its owner/source-evidenced edge.
- A System created in a proposal still needs a Domain relation when evidence
  supports it.
- A missing evidenced participation may be proposed by Refresh; physical home
  alone never fills it.
- A human-authored/verified Repository is not rewritten. Missing or mismatched
  home/participation intent blocks the proposal and requires an explicit reviewed
  correction; do not create a shadow Repository to bypass protected-content
  rules.
