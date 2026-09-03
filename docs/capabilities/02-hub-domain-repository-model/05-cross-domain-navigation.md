# 02.05 — Cross-Domain navigation

> Status: Owner-approved boundary; enrichment of missing relations is deferred.

## Membership versus relation

Only `part-of` transmits Domain membership in the query graph. Relations such as
`publishes-to`, `consumes`, `depends-on` or `implemented-in` connect knowledge but
do not change a Repository's primary Domain.

```text
Crawler Repository ──part-of──→ Crawler Domain
Crawler Worker ──publishes-to──→ Shared Queue ←──consumes── Recommender
```

Shared Queue has one canonical concept. A Domain-scoped query finds it through
System/component paths and cross-Domain traversal; it does not copy Queue into
each Domain.

## Navigation rules

- The root index links bounded Domain/System/Repository entry points.
- A Domain links Systems and critical flows; it does not contain a copy of the
  repository tree.
- A Repository concept keeps source-specific purpose/build/entry points and
  links to canonical Systems/components through normal relations.
- Inbound navigation is derived at query time; do not persist an inverse copy.
- An Integration Contract becomes a separate concept only when it has
  independent identity, ownership, mapping, lifecycle or query value.

## Reuse

Keep the current canonical relationship vocabulary, `deriveDomains`, inbound
traversal and role-oriented paths. Section 02 only adds the Repository
primary-Domain edge; shared-resource matching belongs to section 06.
