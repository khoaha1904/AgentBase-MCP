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
2. Read copied existing concepts as continuity context. Never cite previous
   generated prose as independent evidence.
3. Preserve every existing file byte-for-byte unless it is an explicit
   unverified `agentbase/` draft. When new evidence conflicts with protected
   knowledge, keep the protected bytes and report the unresolved conflict.
4. Create the smallest independently useful linked concept set. A separate
   concept needs a stable identity plus an independent contract, ownership,
   lifecycle, failure/operational boundary, audience or important graph role.
   Do not turn every route, handler, function or infrastructure block into a
   concept merely because it is concrete.
5. Update the root `index.md` with `okf_version: "0.2"` and ordinary Markdown
   links for progressive disclosure. Consume an existing valid `log.md`; do not
   generate one for this MVP.
6. Run AgentBase validation and diff. Repair only proposal files. Present
   warnings, limitations, and the complete diff to the maintainer.
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
- encode source code as
  `repository://<repository-id>/<encoded-relative-path>#L<start>-L<end>`;
- never expose checkout roots, provider cache paths, secrets, credentials, or
  raw graph storage;
- relate concepts with normal bundle-relative Markdown links.
- use one canonical path per entity under the role-oriented roots `domains/`,
  `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`,
  `infrastructure/`, `deployments/` or `repositories/`;
- treat directory placement as classification, not ownership or containment;
  express containment and implementation through prose and links;
- never duplicate a component, interface, flow or resource beneath both a
  system and repository tree.

## Boundary rules

- Create a Domain only from explicit business-boundary evidence or owner
  guidance; never infer one from a repository or product name.
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
- Distinguish desired-state Infrastructure Definition, genuinely reusable
  Terraform Module and externally evidenced Deployment. Source declarations do
  not prove an account, region, ARN or deployed instance.

Unknown OKF types and extension fields are valid. Broken links are warnings,
not permission to invent the missing concept.

## Uncertainty and guidance

Record source-visible uncertainty in the affected concept's Limitations. Do not
create new `Open Question` concepts: the type remains readable only for legacy
compatibility while governed question persistence is future scope. Surface
material unanswered items separately to the maintainer after validation.

Respect a matching maintainer defer directive until it is removed or explicitly
reopened.

Treat `Maintainer Guidance`, human-authored or human-verified concepts,
third-party concepts, ambiguous ownership, stable concepts, reference files,
and existing logs as protected. Do not rewrite them for style or normalization.

## Validation boundary

Use the repository's `okf validate` and `okf diff` stages. A successful
validation locks the generated tree digest; any later edit requires validation
again. Do not bypass stale-base, protected-content, source-path, producer-policy,
or conformance failures.
