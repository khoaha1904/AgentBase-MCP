# 02.05 — Cross-Domain navigation

> Status: Owner-approved boundary; enrichment of missing relations is deferred.

## Membership versus relation

Only `part-of` transmits Domain membership in the query graph. Relations such as
`publishes-to`, `consumes`, `depends-on` or `implemented-in` connect knowledge but
do not change a Repository's physical home.

```text
Crawler Repository ──part-of──→ Crawler Domain
Crawler Worker ──publishes-to──→ Shared Queue ←──consumes── Recommender
```

Shared Queue has one canonical concept. A Domain-scoped query finds it through
System/component paths and cross-Domain traversal; it does not copy Queue into
each Domain.

## Navigation rules

- The root index links bounded Domain/System/Repository entry points.
- A compact Domain index links rich Repository dossiers, independently useful
  knowledge and Questions; it does not contain a copy of source trees.
- A Repository dossier keeps source-specific purpose, boundaries, capabilities,
  interfaces, dependencies and operations and links independently promoted
  knowledge through normal relations/navigation.
- Inbound navigation is derived at query time; do not persist an inverse copy.
- An Integration Contract becomes a separate concept only when it has
  independent identity, ownership, mapping, lifecycle or query value.

## Reuse

Keep the current canonical relationship vocabulary, `deriveDomains` and inbound
traversal. Home comes from the compact Profile path; explicit Domain
participation remains relation-derived. Shared-resource matching belongs to
section 06.
