# Data Model: Domain and Metric Concepts

## Concept Schema

- `type`: stable released OKF type name
- `purpose`: independently useful knowledge boundary
- `directoryHint`: role-oriented canonical location
- `selectWhen`: evidence phrases used for advisory selection
- `evidenceRequirements`: facts still required before authoring
- `recommendedSections`: useful Markdown structure
- `allowedLinks`: concept types this instance may navigate to
- `metadataGuidance`: optional semantic fields and their evidence
- `relationshipGuidance`: canonical predicates, target types and evidence
- `limitationGuidance`: how missing or contradictory evidence is stated

## Concept Instance

- Has one canonical path/identity and one scalar schema `type`.
- Carries its own source provenance and relationships.
- Many instances may use one schema.
- An unknown type remains portable but receives no AgentBase semantic validation.

## Domain Entity

- Represents one stable business object or value identity.
- Requires evidence that it matters beyond an implementation class.
- May link to Domain, System, API, Event, Business Flow, Data Store and Repository concepts.
- Uses `entities/<slug>.md`.

## Metric

- Represents one stable named measure and its meaning or calculation.
- Requires definition plus producer/calculation evidence.
- May link to Domain, System, Component, Service, Event, Domain Entity,
  Database Table, Business Flow and Repository concepts.
- Uses `metrics/<slug>.md`.
- A current volatile numeric observation is a live reference, not the Metric identity.

## Compatibility

- Catalog 5.0 concepts need no migration.
- Catalog 5.1 adds definitions without changing existing schema semantics.
- Foreign types remain valid and protected.
