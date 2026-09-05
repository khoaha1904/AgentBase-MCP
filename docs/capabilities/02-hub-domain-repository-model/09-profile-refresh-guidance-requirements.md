# 02.09 — Profile Repository Refresh and Question guidance

> Status: G4-C3 continuity/Guidance and G5-C1 compact paths/no-log behavior are
> implemented and verified. Current paths are owned by
> [02.10](10-compact-profile-layout-requirements.md).
>
> Release evidence: Required

Product Contracts:
[Knowledge model and relations](../../product/02-knowledge-model-and-relations.md)
and [Knowledge lifecycle](../../product/03-knowledge-lifecycle.md).

Architecture Contracts:
[Ownership](../../architecture/ownership.md),
[Flows](../../architecture/flows.md),
[State and trust](../../architecture/state-and-trust.md), and
[Runtime](../../architecture/runtime.md).

## Current → target

G4-C2 can create and Initial-Ingest a Profile 1.0 Hub, but Refresh still trusts
the caller's former type-first Repository subject. Question answers still write
legacy `questions/` and `guidance/` paths.

G4-C3 resolves an existing Repository's actual Profile identity before opening
a Refresh session, keeps that physical home fixed, and makes Question/Guidance
materialization use the shared Profile categories. Legacy-unprofiled behavior
remains unchanged until the final Group 4 migration/admission gate.

G5-C1 retains exact Repository continuity and no-automatic-rehome behavior but
switches new concepts to compact `knowledge/`, places Questions by unambiguous
subject home (otherwise `shared`), places Guidance in that home's `knowledge/`
and writes no activity log or category index.

## Benefit → impact

A newly ingested Profile Repository can be refreshed and its Questions can be
answered without creating an invalid mixed-layout proposal. The runtime no
longer depends on a caller remembering the Repository's physical path.

The change is medium-sized and limited to Repository resolution, continuity,
Refresh proposal admission and Question/Guidance rendering. It reuses current
Repository identity, session, proposal, validation and review flows. Refresh
adds no home plan, rehoming operation, migration engine, registry, database or
MCP tool. Enrichment remains a later Profile capability.

## Repository subject and home

Preflight exposes the exact matched Repository concept summary. Profile Refresh
binds its session and proposal to that actual concept identity. The former
`repositories/<slug>` input remains a compatibility hint only when its slug
matches the resolved Repository; an exact home-qualified input must equal the
resolved identity. An ambiguous or mismatched identity fails before session
creation.

Refresh never accepts `home_plan`, chooses a new home or derives placement from
new source evidence. Rehoming is migration work. New concepts created by
Refresh use an already admitted Profile path selected during authoring and the
whole proposed bundle must remain Profile 1.0.

## Requirements

- **AB-PROFILE-LIFECYCLE-001** — Existing-Repository preflight returns the exact
  active or Published Repository concept summary associated with the resolved
  stable Repository record; new and ambiguous resolutions do not invent one.
- **AB-PROFILE-LIFECYCLE-002** — Profile Refresh resolves the actual Repository
  concept identity before continuity/session creation. An exact Profile input
  must match it; legacy `repositories/<slug>` is accepted only as a matching
  slug hint and never selects a home.
- **AB-PROFILE-LIFECYCLE-003** — The actual Profile Repository identity is used
  by continuity, deterministic session identity and proposal subject. Returned
  continuity/proposal metadata expose that same identity; no Repository activity
  path is created.
- **AB-PROFILE-LIFECYCLE-004** — Refresh rejects `home_plan` and performs no
  automatic rehome. It preserves existing Profile paths/navigation and rejects
  a proposed bundle that no longer passes the shared Profile 1.0 classifier.
- **AB-PROFILE-LIFECYCLE-005** — Refresh Questions use
  `<subject-home>/questions/<stable-id>.md` when subject home is unambiguous and
  `shared/questions/<stable-id>.md` otherwise. Their immutable ID, origin,
  references and one-repair boundary are unchanged; no category index is added.
- **AB-PROFILE-LIFECYCLE-006** — A Profile Question answer creates independently
  useful Maintainer Guidance at
  `<question-home>/knowledge/<question-id>-r<revision>.md`, updates the exact
  Question and adds direct home navigation when useful. Only these renderer-
  owned changes are admitted by the guidance proposal.
- **AB-PROFILE-LIFECYCLE-007** — Guidance concept identity and the Question's
  guidance reference use the actual Profile path. Exact-revision checks,
  maintainer attribution, proposal inspection, Accept boundary and stale-answer
  rejection remain unchanged.
- **AB-PROFILE-LIFECYCLE-008** — Legacy-unprofiled Refresh and Question guidance
  retain their current paths and behavior. G4-C3 changes no MCP tool name or
  input schema and adds no second lifecycle implementation.
- **AB-PROFILE-LIFECYCLE-009** — Profile-aware continuity includes existing
  root, shared and Domain Capsule indexes relevant to the returned concepts;
  category indexes are not part of compact Profile 1.0 and are not invented.
- **AB-PROFILE-LIFECYCLE-010** — G4-C3 does not absorb Domain Enrichment,
  rehoming, migration, final admission, query/visualization or release ownership.
  Those remain separate capability boundaries. G5-C1 compact integration has
  passed; manifests retain `qualified_scale: null`.

## Implementation and verification map

- `app/hub-okf/query` owns stable Repository-to-subject resolution and Profile
  continuity inputs.
- `app/hub-okf/authoring` owns Refresh Profile admission and layout-aware
  Question/Guidance rendering.
- Focused legacy/Profile tests own `AB-PROFILE-LIFECYCLE-001..010`; canonical
  full verification remains the release gate.
