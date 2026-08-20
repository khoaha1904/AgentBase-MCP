# Navigation and concept boundaries

## Navigation

- Only the root `index.md` may have OKF frontmatter; category indexes MUST NOT have frontmatter and contain navigation Markdown only.
- Keep one canonical concept file; indexes link to it and never copy it.
- Root navigation grows with Domain and fallback entrypoints, not every entity.
- A Domain concept links its Systems and critical Business Flows. A System
  concept links the components, interfaces, flows, resources and infrastructure
  needed to understand that system.
- When Domain evidence is absent, use bounded System and Repository indexes;
  never invent a Domain merely to satisfy the layout.
- Prefer domain-scoped Hub search for broad terms. An exact concept, resource or
  repository identity is already sufficient scope. Ask the maintainer to choose
  a Domain when search reports `scope_required`; use explicit global search only
  when the maintainer wants cross-domain results.
- Use bounded relationship traversal for impact and producer/consumer questions.
  Traverse inbound edges through MCP rather than persisting inverse duplicates.

## Boundaries

- Create a Domain only from explicit business-boundary evidence or owner
  guidance; never infer one from a repository or product name.
- For a prepare-confirmed Domain, add its returned owner-guidance resource to
  `sources`, and make each System `part-of` relationship cite the matching
  source ID. Repository resources still support code/system claims; they do not
  become evidence for the maintainer's business classification.
- Create a System when cooperating entities deliver one recognizable
  capability. A library or reusable module need not belong to a known system.
- Keep repository-specific purpose, source structure, build, test and entry
  points in a Repository concept. Link to canonical entities instead of copying
  their architecture or contracts.
- Group related CRUD/HTTP operations into one API Surface with a Markdown
  operations table. Split an API Endpoint only for an independent consumer,
  owner, version, policy, SLA or lifecycle boundary.
- Keep an implementation-only Lambda or handler inside its component/API/flow.
  Split it only for independent triggers, scaling, permissions, failure or
  operational behavior.
- Treat an architecture node and a Markdown knowledge unit separately. A
  Server remains a component boundary but may link independently useful
  capability or worker concepts instead of accumulating unrelated contracts,
  flows and operations in one large document.
- Distinguish desired-state Infrastructure Definition, genuinely reusable
  Terraform Module and externally evidenced Deployment. Source declarations do
  not prove an account, region, ARN or deployed instance.

Unknown OKF types and extension fields are valid. Preserve their relationship
predicates as unjudged extensions. New known AgentBase concepts use only the
canonical vocabulary. Broken links are warnings, not permission to invent the
missing concept.
