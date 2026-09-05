# 06.09 — Profile-aware Domain Enrichment requirements

> Status: G4-C6 Profile-aware Enrichment and G5-C1 compact identity plus
> Question/Guidance placement are implemented and verified.

> Release evidence: Required

Product Contract:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md).

Architecture Contracts:
[Group 4 composition](../../architecture/runtime.md#group-4-profile-and-domain-capsule-composition)
and [Group 4 flows](../../architecture/flows.md#group-4-profile-and-domain-capsule-flows).

## Baseline and impact

Domain Enrichment already binds one stable `domains/<slug>` selector, explicit
Repository membership, exact candidates, provider observations, Questions and
one reviewed proposal. Its provider, manifest and proposal state machines do
not depend on physical layout.

The remaining Profile gap is contained: manifest admission treats the selector
as the literal legacy Domain identity, candidate validation excludes
`shared/*`, and Finalize assumes Questions live under root `questions/*`.
Profile-aware Enrichment resolves those identities through the shared Profile
classifier and mutates the concepts at their existing paths. It adds no new MCP
tool, provider behavior, manifest format, home planner or migration mechanism.

## Requirements

- **AB-PROFILE-ENRICH-001** — Enrichment keeps `domains/<slug>` as its stable
  external Domain selector. For compact Profile 1.0 that selector is the exact
  Domain identity backed by `domains/<slug>/index.md`; legacy Hubs retain their
  admitted literal identity behavior.
- **AB-PROFILE-ENRICH-002** — Prepare MUST classify the exact Published bundle.
  A missing Domain concept, unsupported Profile or malformed Profile layout
  fails before manifest state is written; Profile absence remains admitted by
  the existing legacy behavior until the final mutation gate.
- **AB-PROFILE-ENRICH-003** — Selected Repository membership MUST require an
  explicit `part-of` relation to the resolved Domain concept. A Repository's
  physical home, title, path prefix or proposal selector MUST NOT imply Domain
  participation.
- **AB-PROFILE-ENRICH-004** — Candidate source and target identities MAY be
  valid existing concepts under a Domain Capsule or `shared/`. Existing strong
  Repository evidence and selected-membership checks remain required; Profile
  support MUST NOT broaden provider scope or infer an interaction.
- **AB-PROFILE-ENRICH-005** — Finalize MUST update provider evidence and accepted
  relations at each concept's existing exact identity and path. It MUST NOT
  create, copy, move or rehome a candidate concept, and relative Markdown links
  MUST continue to resolve across different homes.
- **AB-PROFILE-ENRICH-006** — Question lookup, overlap protection and automatic
  resolution MUST use the admitted Question concept identity/path. Profile
  Questions use their compact subject/shared home and generated Guidance uses
  that home's `knowledge/`; legacy paths remain compatible. Enrichment MUST
  reuse the shared Question/Guidance lifecycle.
- **AB-PROFILE-ENRICH-007** — Published-versus-Local-Draft overlap checks MUST
  cover exact candidate endpoints and Question concepts before Finalize. A
  missing, moved or byte-changed protected concept fails before proposal or Hub
  mutation.
- **AB-PROFILE-ENRICH-008** — The Enrichment manifest, proposal and publication
  scope retain the external Domain selector for compatibility. The proposal's
  semantic impact MUST expose the actual Profile identities and distinct
  physical-home versus semantic-Domain scope.
- **AB-PROFILE-ENRICH-009** — Provider execution, account/region bounds,
  observation normalization, candidate outcomes, duplicate handling, atomic
  proposal lifecycle, MCP tool names and input schema remain unchanged. No Hub
  content or installed-state migration is introduced.
- **AB-PROFILE-ENRICH-010** — Verification MUST cover a Profile Domain selector,
  Repository homed in one capsule but participating in another, a `shared/*`
  candidate, shared Question resolution/Guidance, cross-home relation links,
  preserved paths/homes, unsupported Profile rejection and legacy regression.
- **AB-PROFILE-ENRICH-011** — Compact Enrichment determines role from
  frontmatter, admits only compact `repositories/`, `knowledge/` and
  `questions/` paths, creates no activity/category index and does not promote an
  embedded dossier item merely to attach a provider observation or relation.

## Compatibility and recovery

Existing Enrichment manifests keep format `1` because `domainId` remains the
same selector and no persisted field changes. Profile identity is derived from
the exact Published bundle at Prepare and revalidated by the existing
base/overlap/proposal checks. A failed Profile validation leaves no partial
manifest or proposal; the user corrects the Hub or regenerates stale work.
