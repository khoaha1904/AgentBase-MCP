# ADR 0002: Separate Local Graphs from Governed Knowledge

- **Status:** Accepted
- **Date:** 2026-08-11

## Context

Detailed code graphs are valuable for coding but are large, engine-specific and
may differ across machines. OKF knowledge should be smaller, durable and able to
accumulate evidence across investigations.

## Decision

Define two product parts with an observation boundary:

```text
local Code Intelligence -> selected observations -> governed OKF knowledge
```

Raw graphs remain local and disposable. Only normalized observations with
provenance may enter OKF workflows. Re-ingest compares with existing knowledge;
absence does not delete a prior claim.

## Consequences

- Machines may build different local graphs without breaking collaboration.
- OKF stability does not depend on one graph engine's internal schema.
- Observation selection becomes a first-class contract and test surface.
- Knowledge conflict and staleness require explicit lifecycle semantics.
