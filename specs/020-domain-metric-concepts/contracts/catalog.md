# Catalog Contract

## Selection

- `domain entity`, `business entity`, `business object`, `aggregate root` or an
  evidenced domain model boundary may recommend `Domain Entity`.
- `business metric`, `performance metric`, `analytics metric`, `defined measure`
  or `metric definition` may recommend `Metric`.
- A bare implementation class, transient sample or current number is insufficient.

## Validation

- Both schemas use existing AgentBase draft/provenance validation.
- Each document declares one `type`.
- Known-schema required frontmatter is enforced; unknown types remain valid.
- Canonical known relationships require source-ID evidence and resolving links.

## Authoring guidance

- `Concept Schema` names the reusable catalog definition; `Concept Instance`
  names one repository-specific document.
- `agentbase.live_claims[].target.kind` is exactly one of `symbol`, `function`,
  `config-field` or `text`.
- Only root `index.md` carries OKF frontmatter. Category indexes are plain
  navigation Markdown.
