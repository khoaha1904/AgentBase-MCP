# Concept schemas

This directory owns the released AgentBase catalog and its separately versioned
technology profiles.

Catalog 7.0 keeps Initial Ingest deliberately small:

- `Repository`, `Domain`, `System`, `Component`, `Function`, `Interface`,
  `Flow` and `Resource` are Initial Ingest roles;
- `Entity` and `Metric` are enrichment-only;
- governance documents remain workflow-owned.

The guidance path applies three decisions in order: detect technology, decide
standalone/embedded disposition, then select a schema for promoted concepts.
AWS/Terraform evidence therefore records technology without creating a file for
every queue, table, bucket or host. Embedded resources retain a parent, kind,
technology and exact evidence IDs but have no concept schema.

```text
schemas/
├── catalog.ts                 catalog scopes, selection and validation
├── guidance.ts                detection → promotion → schema guidance
├── definition.ts              shared schema shape
├── definitions/               generic concept and governance roles
└── profiles/                  provider/source-tool technology mappings
```

External capabilities import schema APIs through `../index.ts`, not through
these private files.
