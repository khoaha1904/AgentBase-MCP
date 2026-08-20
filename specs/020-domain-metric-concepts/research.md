# Research: Domain and Metric Concepts

## Decision: Reuse the static catalog

**Rationale**: The current catalog already selects, returns and validates
versioned schemas and permits later additive releases. Two new definitions do
not justify a loader or pack lifecycle.

**Alternatives considered**: Installable packs and runtime schema files were
rejected because there is no second independently released domain pack or
authority/versioning contract yet.

## Decision: One concrete schema per instance

**Rationale**: Existing OKF documents have one scalar `type`. Specialization
shadowing already selects AWS SQS over Queue for the same evidence while
retaining both for distinct evidence. This avoids schema-field conflicts.

**Alternatives considered**: Multiple profiles on one document were rejected as
an unneeded new composition model.

## Decision: Generic business schemas

**Rationale**: `Domain Entity` models reusable business identity and `Metric`
models a stable measure definition. Vehicle, Listing and click-through rate are
instances, so the core remains usable outside automotive.

**Alternatives considered**: Built-in automotive types were rejected because
one target project is insufficient evidence for a universal domain ontology.

## Decision: Existing EC2 representation

**Rationale**: Server, Deployment and Infrastructure Definition already separate
long-running behavior, applied environment and Terraform desired state.

**Alternatives considered**: AWS EC2 Workload is deferred until independent EC2
operational metadata is demonstrated to be useful.
