---
name: agentbase-okf
description: Author, refresh, validate, and review AgentBase Open Knowledge Format v0.2 bundle proposals from bounded repository evidence. Use when an AgentBase prepare operation returns a proposal workspace, when repository knowledge must become linked OKF concepts, or when rebuilding drafts while preserving maintainer guidance and other protected concepts.
---

# Author an AgentBase OKF proposal

Work only inside the exact prepared proposal's `bundle/` subtree. Treat the
current `okf/`, proposal metadata, evidence bundle, provider cache, and source
repository as read-only.

## Workflow

1. Read the proposal metadata and bounded repository evidence before authoring.
   When prepare returns `confirmedDomain`, treat its exact identity/title as
   owner guidance: create or reuse that Domain and use the returned
   `evidenceResource` for Domain membership rather than attributing the business
   boundary to repository code.
2. Read prior concept bodies only at the exact `currentSource`, `subject`,
   `neighbors` and `navigationPaths` named by the prepare result's continuity
   manifest. The full copied Hub is lifecycle state, not authoring context.
   Never cite previous generated prose as independent evidence.
3. Preserve every existing file byte-for-byte unless it is an explicit
   unverified `agentbase/` draft. When new evidence conflicts with protected
   knowledge, keep the protected bytes and report the unresolved conflict.
4. Create the smallest independently useful linked concept set. A separate
   concept needs a stable identity plus an independent contract, ownership,
   lifecycle, failure/operational boundary, audience or important graph role.
   Do not turn every route, handler, function or infrastructure block into a
   concept merely because it is concrete.
5. Keep navigation progressive. The root `index.md` carries `okf_version:
   "0.2"` and links only existing Domain, System and Repository entrypoint
   indexes. Preserve every existing nonblank root/category index line exactly
   and in order; repository authoring may append navigation but must never
   rename the Hub heading or restyle earlier entries. Consume an existing valid
   `log.md`; do not generate one.
6. Validate created/modified concepts with `validate_okf_changes`, supplying
   only their full Markdown plus unchanged target summaries from continuity or
   exact search/traversal. For every supplied concept or target, `identity` is
   exactly its normalized path relative to the OKF root with `.md` removed;
   never include an outer `okf/` prefix. Then run AgentBase final validation and diff. Repair
   only proposal files. Present warnings, limitations, and the complete diff.
7. Stop before apply unless the maintainer explicitly authorizes applying that
   exact validated proposal.

## Concept rules

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
  the observed scalar in that live-claim record or present it as timeless prose;
- encode source code as
  `repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>`;
- never expose checkout roots, provider cache paths, secrets, credentials, or
  raw graph storage;
- relate concepts with normal bundle-relative Markdown links.
- persist only canonical relationship directions: `part-of`, `provides`,
  `consumes`, `depends-on`, `triggered-by`, `publishes-to`, `reads-from`,
  `writes-to`, `implemented-in`, `declared-by` and `deployed-as`; MCP derives
  inbound navigation, so never add a duplicate inverse edge;
- give every relationship a non-empty `evidence` list resolving to stable
  `sources[].id` values;
- give every Business Flow ordered `flow_steps` with exact source and target
  identities, canonical action, sync/async mode and source evidence;
- use one canonical path per entity under the role-oriented roots `domains/`,
  `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`,
  `infrastructure/`, `deployments/` or `repositories/`;
- treat directory placement as classification, not ownership or containment;
  express containment and implementation through prose and links;
- never duplicate a component, interface, flow or resource beneath both a
  system and repository tree.

## Navigation rules

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

## Boundary rules

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

## Uncertainty and guidance

Record source-visible uncertainty in the affected concept's Limitations. Do not
create new `Open Question` concepts: the type remains readable only for legacy
compatibility. Submit material conflicts as governed question declarations when
finalizing the proposal; keep every linked claim and source role.

For a volatile-value query, call `read_hub_live_evidence` on the accepted concept.
Resolve only entries marked `ready`: use `search_graph` for the semantic target
and `get_code_snippet` for the exact current source. Treat missing, ambiguous,
computed or mismatched targets as unavailable/stale/indeterminate and never fall
back to a prior literal. Present documentation, implementation/configuration and
accepted Maintainer Guidance separately with current source identity; if they
disagree, say so and do not select a winner. A dirty-source observation is useful
current evidence but never accepted knowledge.

Respect a matching maintainer defer directive until it is removed or explicitly
reopened.

Treat `Maintainer Guidance`, human-authored or human-verified concepts,
third-party concepts, ambiguous ownership, stable concepts, reference files,
and existing logs as protected. Do not rewrite them for style or normalization.

## Validation boundary

Use changed-set MCP validation during authoring, then the repository's final
`okf validate` and `okf diff` stages. Final validation remains local lifecycle
protection over exact disk state; it is not a reason to send the full Hub into
the model context. A successful validation locks the generated tree digest; any
later edit requires validation again. Do not bypass stale-base,
protected-content, source-path, producer-policy, or conformance failures.
