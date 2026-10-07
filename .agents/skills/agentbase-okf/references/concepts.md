# Concept authoring rules

Use one non-reserved Markdown file and one concrete released `type` per Concept
Instance. Initial Ingest permits Repository, Domain, System, Component, Function,
Interface, Flow and Resource; Entity/Metric require Enrichment.

## Frontmatter and evidence

- New/changed AgentBase drafts use `status: draft`, current agentbase/<version>
  producer and meaningful content-change time. Omit verified; preserve unknown
  fields and never impersonate a verifier.
- Cite exact current repository evidence in sources, with stable IDs and matching
  body footnotes. Encode repository://<id>/<relative-path>#L<start>-L<end>;
  never expose checkout/cache roots, secrets or raw graph storage.
- Useful safe scalars may use agentbase.observed_values with exact subject,
  property, role, value and source_id. Finalize owns generated IDs, source state
  and rendered tables. Observations are snapshots, not current truth; bulky,
  sensitive or compound values retain ordinary references only.
- Every canonical relationship needs resolving source-ID evidence and a Markdown
  body link to its exact target. Use part-of, provides, consumes, depends-on,
  triggered-by, publishes-to, reads-from, writes-to, implemented-in, declared-by,
  deployed-as or runs-on. Never persist duplicate inverse edges.
- Business Flows need ordered flow_steps with exact admitted endpoints, canonical
  action, sync/async mode and sources. Embedded/free-text items are not endpoints;
  do not promote them merely to complete a Flow.

## Placement and embedded knowledge

Use prepared paths: Domain domains/<slug>/index.md; Repository repositories/;
other standalone concepts knowledge/; Questions questions/. One physical home
is domains/<slug>/ or shared/. Home is stewardship/navigation; evidenced
relationships express membership/implementation. Never duplicate a concept in
System and Repository trees.

Embedded Knowledge stays in its evidence-owning parent with name, concise role,
provider-neutral kind, technology and exact references. It has no identity,
file, navigation or canonical edge. Repository links to promoted children and
keeps only its own sources, without copying their tables.

Optional Embedded Relations connect self, exact admitted concepts or unique
same-parent embedded names. Use provides, consumes, depends-on, triggered-by,
publishes-to, reads-from, writes-to, monitors or redrives-to, citing parent-owned
source IDs. Concrete queues, tables, buckets, hosts, modules or routes alone do
not justify files. Independent deployment/runtime/ownership/security/failure
boundaries do; see [boundaries](navigation-and-boundaries.md).
