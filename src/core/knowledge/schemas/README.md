# Concept schemas

This directory is the single code owner for the released AgentBase concept
catalog.

```text
schemas/
├── catalog.ts                 list, select and validate schemas
├── definition.ts              shared schema definition shape
└── definitions/
    ├── concepts.ts            stable aggregate ordering
    ├── foundation.ts          Repository, Domain, Entity and System
    ├── software.ts            components, services and interfaces
    ├── data.ts                metrics, tables and queues
    ├── infrastructure.ts      infrastructure and provider-specific baseline
    └── governance.ts          guidance, legacy Questions and cross-repo contract
```

The current files preserve catalog 5.1 behavior during the structure-only
refactor. Catalog 6.0 implementation will replace provider-specific definitions
inside these same goal-oriented groups. Do not add another schema registry
outside this directory.

External capabilities import schema APIs through `../index.ts`, not through
these private files.
