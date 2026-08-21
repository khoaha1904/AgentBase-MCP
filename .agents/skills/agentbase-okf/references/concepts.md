# Concept authoring rules

The catalog exposes reusable **Concept Schema** definitions. Initial Ingest may
create Repository, Domain, System, Component, Function, Interface, Flow and
Resource concepts; Entity and Metric are enrichment-only. Authoring creates
evidence-backed **Concept Instance** documents such as Vehicle Inventory or
Click-through Rate. One schema
may yield many instances, but each instance declares exactly one concrete
`type`; never merge competing schemas onto one document.

For every new or modified AgentBase concept:

- use one non-reserved `.md` file per concept and a descriptive `type`;
- set `status: draft`;
- set `generated.by` to the current `agentbase/<version>` producer and
  `generated.at` to the meaningful content-change time;
- omit `verified`; never impersonate a human or process verifier;
- preserve unknown frontmatter values when modifying an owned draft;
- attach important claims to `sources` entries from current repository evidence;
- use stable source IDs and matching Markdown footnotes for attributed claims;
- represent a change-prone configuration or implementation scalar under
  `agentbase.live_claims` with a stable claim ID, subject/property/role, one
  `sources[].id`, semantic target and the prepare source identity; never include
  a value is optional and only valid as a small `observed.snapshot` with exact
  revision and `observed.at`; always describe it as observed, never current;
- `agentbase.live_claims[].target.kind` is exactly one of `symbol`, `function`,
  `config-field` or `text`; concept types such as Resource or Function are
  never live-reference target kinds;
- encode source code as
  `repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>`;
- never expose checkout roots, provider cache paths, secrets, credentials, or
  raw graph storage;
- relate concepts with normal bundle-relative Markdown links;
- persist only canonical relationship directions: `part-of`, `provides`,
  `consumes`, `depends-on`, `triggered-by`, `publishes-to`, `reads-from`,
  `writes-to`, `implemented-in`, `declared-by`, `deployed-as` and `runs-on`; MCP derives
  inbound navigation, so never add a duplicate inverse edge;
- give every relationship a non-empty `evidence` list resolving to stable
  `sources[].id` values;
- give every Business Flow ordered `flow_steps` with exact source and target
  concept identities, canonical action, sync/async mode and source evidence;
  both endpoints must exist in the changed concept set or supplied target
  summaries; embedded knowledge and free text are never Flow endpoints, and
  must not be promoted merely to complete a Flow;
- use one canonical path per entity under the role-oriented roots `domains/`,
  `entities/`, `systems/`, `components/`, `interfaces/`, `flows/`, `metrics/`,
  `resources/` or `repositories/`;
- treat directory placement as classification, not ownership or containment;
  express containment and implementation through prose and links;
- never duplicate a component, interface, flow or resource beneath both a
  system and repository tree.

Embedded knowledge is not a Concept Instance. Preserve its prepared bounded
Markdown table in the parent with display name, concise role, provider-neutral
kind, technology and exact sources. It receives no identity, file, navigation
or relationship. Do not split SQS/SNS/event buses, tables, buckets, databases
or compute hosts into files merely because their declarations are concrete.
