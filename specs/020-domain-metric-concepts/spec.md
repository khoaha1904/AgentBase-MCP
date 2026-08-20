# Feature Specification: Domain and Metric Concepts

**Feature Branch**: `main`

**Created**: 2026-08-19

**Status**: Approved

**Input**: Extend the released concept catalog for ordinary business entities
and defined performance metrics, clarify catalog schemas versus repository
instances, and prevent invalid live-reference/index authoring in the real skill.

## Owner Decisions

- AgentBase releases reusable concept schemas; ingest and refresh create only
  evidence-backed concept instances from a repository.
- One repository may contain many instances and many instances of the same
  schema. Each instance has one concrete `type`; schemas are not merged onto one
  document.
- Add generic `Domain Entity` and `Metric` schemas. Automotive names such as
  Vehicle, Listing and Campaign remain instance identities, not built-in types.
- Existing Server, Deployment and Infrastructure Definition schemas cover EC2
  projects for now. No AWS EC2-specific schema is added.
- Unknown Google OKF types remain valid. No plugin loader, installable pack,
  dependency, migration or schema-composition framework is added.
- Change-prone metric/configuration values remain live references. A Metric
  concept describes the stable definition; it does not freeze the latest
  observed number.
- The authoring skill must enumerate the only supported live target kinds and
  state that category indexes have no frontmatter.

## User Scenarios & Testing

### User Story 1 - Recognize business entities and metrics (Priority: P1)

As a maintainer ingesting an automotive or analytics repository, I want the
catalog to recognize stable business entities and defined metrics so that the
Hub captures business meaning rather than only software infrastructure.

**Why this priority**: Vehicle, Listing and performance definitions are shared
knowledge boundaries even when their implementations span APIs, services and
data stores.

**Independent Test**: Submit evidence signals for a business entity and a
defined performance metric, receive both complete schemas, author one instance
of each and validate both successfully.

**Acceptance Scenarios**:

1. **Given** evidence for a stable business object, **When** schema selection
   runs, **Then** it recommends `Domain Entity` and reports missing evidence.
2. **Given** evidence for a named metric with a stable definition, **When**
   schema selection runs, **Then** it recommends `Metric` without requiring a
   current numeric observation.
3. **Given** several Vehicle or Metric instances, **When** they are validated,
   **Then** each uses one schema and all independently useful instances remain.

---

### User Story 2 - Author valid repository knowledge (Priority: P1)

As a host agent following the installed AgentBase skill, I want exact structural
rules for live references and indexes so that a proposal does not become invalid
after otherwise useful repository investigation.

**Why this priority**: V12 used concept-like labels as live target kinds and put
frontmatter on a category index because the workflow guidance left both rules
implicit.

**Independent Test**: Inspect the installed skill and validate fixtures proving
the exact target-kind vocabulary and root/category index distinction are stated
and enforced.

**Acceptance Scenarios**:

1. **Given** a volatile configuration claim, **When** the skill instructs the
   agent to author it, **Then** it lists exactly `symbol`, `function`,
   `config-field` and `text` as target kinds.
2. **Given** Hub navigation is authored, **When** the skill describes indexes,
   **Then** it states that only root `index.md` has frontmatter and category
   indexes do not.
3. **Given** an agent chooses a concept schema, **When** it authors repository
   knowledge, **Then** the guidance distinguishes the reusable schema from each
   concrete repository instance.

---

### User Story 3 - Preserve compatible open-world knowledge (Priority: P2)

As a Hub maintainer, I want catalog growth to preserve older and foreign types
so that adding business schemas does not rewrite or invalidate accepted
knowledge.

**Why this priority**: The catalog is guidance layered on portable Google OKF,
not a closed universal taxonomy.

**Independent Test**: Validate an existing known type and an unknown foreign
type after the catalog update; both remain valid while only known types receive
AgentBase semantic guidance.

**Acceptance Scenarios**:

1. **Given** an existing catalog 5.0 concept, **When** catalog 5.1 validates it,
   **Then** it remains valid without migration.
2. **Given** an unknown valid OKF type, **When** validation runs, **Then** it
   remains portable and is reported as unknown rather than rejected.
3. **Given** one signal matching a specialization and its fallback, **When**
   selection runs, **Then** the more specific type shadows the fallback for that
   entity while distinct evidence may retain both recommendations.

### Edge Cases

- A class or data structure has no stable business identity outside one
  implementation; it stays inside its useful parent instead of becoming a
  Domain Entity.
- A dashboard number changes continuously; the stable Metric definition may be
  retained, but the current number is not durable knowledge without a governed
  source/reference role.
- The same entity is represented in multiple services; one canonical instance
  links the evidence instead of duplicating one page per repository path.
- A signal says only “entity” or “metric” without identity or definition
  evidence; selection remains advisory and exposes missing evidence.

## Requirements

### Functional Requirements

- **AB-SCHEMA-025**: Product language MUST distinguish a reusable catalog
  `Concept Schema` from a repository-specific `Concept Instance`. One schema MAY
  yield many instances; each instance MUST declare one concrete type.
- **AB-SCHEMA-026**: The versioned catalog MUST provide `Domain Entity` guidance
  for a stable business object with evidenced identity, meaning or lifecycle.
  It MUST NOT promote every implementation class or data structure.
- **AB-SCHEMA-027**: The versioned catalog MUST provide `Metric` guidance for a
  stable named measure with evidenced purpose and definition, producer or
  calculation. A current change-prone numeric observation MUST NOT be required
  or persisted as timeless truth.
- **AB-SCHEMA-028**: Catalog selection MUST retain the existing one-type
  specialization behavior: the most concrete schema shadows its fallback for
  the same evidence, while distinct evidence may recommend separate types.
- **AB-CLAIM-004**: Host-agent authoring guidance MUST enumerate `symbol`,
  `function`, `config-field` and `text` as the complete live-reference target
  kind vocabulary and MUST NOT substitute concept type names for those values.
- **AB-MVP-023**: Host-agent authoring guidance MUST state that only the root
  `index.md` has OKF frontmatter; category indexes contain navigation Markdown
  without frontmatter.
- **AB-SCHEMA-029**: Catalog growth MUST preserve known older concepts and
  unknown valid OKF types without migration, implicit rewrite or closed-world
  rejection.

### Key Entities

- **Concept Schema**: A released reusable definition containing selection,
  evidence, metadata, relationship, path and limitation guidance.
- **Concept Instance**: One concrete evidence-backed Hub document from a
  repository, such as Vehicle Inventory Service or Click-through Rate.
- **Domain Entity**: A stable business object or value identity shared across
  relevant contracts, flows or systems.
- **Metric**: A stable named measure and its meaning/calculation, distinct from
  a current observed numeric value.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Selection fixtures recommend both new schemas from representative
  automotive/analytics evidence and expose missing evidence deterministically.
- **SC-002**: One Domain Entity and one Metric instance pass catalog and
  relationship validation with zero special-case automotive code.
- **SC-003**: Existing specialization, unknown-type and catalog fixtures retain
  100% of their prior passing behavior.
- **SC-004**: Automated guidance checks find all four live target kinds and the
  root/category index rule in the installed authoring skill.
- **SC-005**: Canonical offline verification passes with no dependency,
  migration, provider, network or architecture-baseline addition.

## Non-Goals

- Installable concept packs or runtime catalog loading.
- A universal automotive ontology or built-in Vehicle/Listing/Campaign types.
- An AWS EC2-specific schema.
- Multiple competing schemas applied to one concept instance.
- Capturing live metric samples, dashboards or deployed cloud state.
- Running a real model benchmark, rebuilding PR #7 or publishing Hub changes.

## Assumptions

- `entities/` and `metrics/` are role-oriented canonical roots; they do not imply
  repository ownership or duplicate System/Domain containment.
- A System or Domain links only independently useful entity/metric instances;
  source-level implementation detail remains in its parent concept.
- Catalog 5.1 is a backward-compatible additive release over catalog 5.0.
