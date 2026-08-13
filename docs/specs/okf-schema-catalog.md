# Living Requirements: AgentBase-MCP OKF Concept Schema Catalog

- **Status:** Active
- **Established by:** Capability `006-explicit-observation-command`; corrected by Capability `008-local-hub-product-correction`
- **Last updated:** 2026-08-12

Google OKF v0.2 intentionally has no fixed taxonomy. AgentBase-MCP therefore
owns a versioned authoring catalog for concrete OKF concept types. These are
not MCP input JSON schemas and are not Codebase Memory graph schemas.

### AB-SCHEMA-001 — Versioned authoring contract

MCP exposes one explicit catalog version and the Google OKF version it extends.
Every entry defines authoring purpose, specificity, evidence criteria, path
hint, required AgentBase frontmatter, recommended sections, limitations and
allowed link targets.

### AB-SCHEMA-002 — Evidence-directed advisory selection

Selection matches Code Graph observations and other authorized evidence such
as manifests, infrastructure files and documentation. Recommendations expose
matched and missing evidence. The authoring agent makes the final supported
choice; the catalog never fabricates a fact.

### AB-SCHEMA-003 — Sparse instances, not checklist scaffolds

Only useful observed concepts and required indexes are created. One schema may
produce many files, such as two AWS Lambda concepts. A schema with no supported
instance creates no file or directory. Schema names do not prescribe one file
per repository.

### AB-SCHEMA-004 — Layered validation

Validation applies Google OKF conformance, common AgentBase draft/provenance
rules, then the selected concrete type. Missing semantic evidence is reported
as a limitation or validation failure, never filled with placeholder claims.

### AB-SCHEMA-005 — Open-world preservation

Unknown Google OKF types and extension fields remain readable and valid under
base OKF. Refresh protects content it does not own and does not coerce an
unknown existing type into the current catalog.

### AB-SCHEMA-006 — Catalog boundary

The concept catalog is distinct from the schemas describing MCP tool arguments
and from provider-private Code Graph nodes and edges. Graph data helps select
and substantiate OKF types but is never copied wholesale into AgentBase-Hub.

### AB-SCHEMA-007 — Corrected concrete catalog 2.0

The first corrected catalog contains: Repository, Service, Server, API
Endpoint, Event, Database Table, Queue, AWS Lambda, AWS SQS Queue, Terraform
Module, Business Flow, Cross-Repository Relationship, Open Question and
Maintainer Guidance. Common rules are shared internally; each public entry is a
concrete authoring type with its own evidence and body guidance.

### AB-SCHEMA-008 — Most-specific supported type

Selection ranks admitted types deterministically. When evidence satisfies a
more specific type, such as AWS SQS Queue, it is preferred over Queue; when it
does not, selection falls back to the narrowest type actually supported.
Repeated instances remain independent canonical concepts.

### AB-SCHEMA-009 — Provenance and limitations

Every AgentBase-authored concrete concept preserves evidence provenance and
states important gaps or uncertainty. Required semantic fields cannot be
invented merely to satisfy a schema. Cross-repository relationships require
evidence for both endpoints and the relationship itself.
