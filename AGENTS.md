# AgentBase-MCP repository guide

This is the canonical AgentBase-MCP application repository. Its checkout name
must never become an implicit Hub identity or generated OKF subject.

## Session startup

Read only these files before interpreting a task:

1. `docs/README.md`
2. `specs/CURRENT.md`

Then inspect Git status. Use the routing table in `docs/README.md` to load only
the affected product decision, architecture map or design/requirements route.
Do not preload every document or completed capability.

The latest user request and live repository state outrank stale planning prose.
Communicate with the user in the language they use. Keep every AgentBase-owned
repository artifact in English, including documentation, specs, source text,
comments, test descriptions and commit messages. Do not translate third-party
vendor snapshots, generated output or immutable external evidence.

## Development workflow

- Use specification-driven development for product or architecture changes.
- Start with the smallest user-visible outcome and record owner decisions before
  implementation details.
- Keep at most one active capability in `specs/CURRENT.md`; between slices use
  `None` plus the most recently completed capability.
- Product direction lives under `docs/product/`; architecture ownership lives in
  `docs/architecture/`; capability design and current `AB-*` requirements live
  under `docs/capabilities/`. Numbered
  `specs/<number>-<name>/` directories are historical after completion.
- Update current truth once in the narrowest design/requirements route. Do not create handoff,
  roadmap, ADR or evidence files that repeat it.
- Never port a large legacy implementation. Extract one verified behavior at a
  time behind current requirements.
- Prevent dead specs while implementing. If code exposes a broad product,
  architecture, authority, migration or workflow gap, stop implementation and
  return to the affected AgentBase high-level and low-level design for owner
  review before continuing. Small related implementation corrections may be
  batched, but the affected design levels and current requirements must be
  backfilled before the slice is considered complete. Never close a capability
  while code, high-level design, low-level design and current requirements disagree.

## Mandatory change lifecycle

The following lifecycle is mandatory for every product, architecture, runtime,
schema, provider or workflow change. `AGENTS.md` is the canonical operating rule;
other documents may explain a capability but must not redefine this sequence.

Before starting, classify the change with the
[documentation contract and change impact gate](docs/README.md#documentation-contract).
Review only the affected levels, but always check upward when a lower-level
decision could change behavior, scope, ownership, boundary, schema, security,
migration, recovery or lifecycle. Do not treat passing tests as permission to
silently redefine an upstream contract.

### Before implementation

1. **Product Contract** — review the affected `docs/product/` decision and update
   it when the user-visible outcome, scope, non-goals, failure/recovery,
   compatibility, migration or product trade-off changes.
2. **Architecture Contract** — review `docs/architecture/` and update it when
   system ownership, boundaries, dependency direction, data/state flow or
   runtime shape changes.
3. **Capability Contract** — update the affected `docs/capabilities/` boundary
   when behavior changes. Record reusable baseline, data/tool contracts, bounds,
   failure/recovery, security impact, verification evidence and stable `AB-*`
   requirements. Query behavior belongs in numbered Query design (10), not in
   an ad-hoc new query system.
4. **Implementation Contract** — create or update one numbered `specs/<id>/`
   artifact and `specs/CURRENT.md`. Keep accepted change requirements in
   `spec.md`; use `plan.md` for concrete modules, interfaces, data/state choices,
   dependencies, migration/recovery and requirement-to-verification mapping.
   Historical capabilities are never silently rewritten.
5. **Consistency gate** — compare all affected upstream contracts, the active
   implementation contract and the code baseline. Do not write runtime code
   until they describe the same intended behavior and the owner has approved
   any material scope, authority, security, migration or architecture decision.

### During implementation

- Implement the smallest independently verifiable slice behind accepted
  requirements, with focused requirement-linked tests.
- If implementation reveals a gap, stop at the current boundary and classify it:
  - **Small gap:** same responsibility and no observable product/scope change.
    Backfill the affected low-level requirement, and high-level text when the
    product explanation changes, before the next slice, benchmark or PR.
  - **Broad gap:** changes observable workflow, authority/credentials, security,
    schema/data model, migration/recovery, ownership, lifecycle/concurrency or
    scope/latency trade-offs. Stop implementation, return to high-level owner
    review, then update low-level design before coding again.
- Never use passing tests or existing code as permission to silently redefine a
  high-level decision. A deferred behavior must be marked deferred at both
  levels.

### Completion gate

A slice is complete only when the affected Product, Architecture, Capability and
Implementation Contracts, code, tests and verification describe the same
behavior. Before PR/capability close, run focused checks and the repository gate,
then record any remaining gap as an explicit deferred boundary rather than
leaving it implicit.

## Architecture rules

- Keep a modular monolith until measured evidence justifies distribution.
- Organize source by capability ownership, expose a small public entrypoint and
  import other capabilities only through it.
- Keep tests beside their behavior owner.
- Review cohesive changes from their responsibility and diff, not line, byte or
  import budgets. Split only distinct responsibilities; never add forwarding
  wrappers or fragments merely to satisfy a metric.
- Prefer deterministic local Code Intelligence. Keep detailed graphs private,
  disposable and non-canonical. Only bounded provenance-bearing observations
  may enter OKF workflows.

`docs/architecture/README.md` is the ownership index. Before changing runtime behavior,
confirm the active plan, affected requirements, owning capability, public entrypoint
and focused requirement-linked tests. Run `npm run depcruise` after source
dependency changes; do not weaken a rule without explicit owner approval.

## Safety and legacy boundaries

- Never read or expose secrets, credentials, tokens, keys or `.env` files.
- Sibling legacy repositories are historical references, not current authority
  or dependencies. Do not edit, clean, reset or copy legacy worktrees wholesale.
- Never share raw local graph databases through Git or OKF storage.
- Missing evidence in a later ingest never implicitly deletes accepted
  knowledge.

## Development Hub convention

AgentBase product semantics do not define primary, secondary, production or
test Hub roles. Hub profiles are peers, exactly one is active, and the user may
connect or switch them. Switching never copies or merges knowledge.

This workspace has a development-only convention:

- `khoaha1904/AgentBase-Hub` contains real owner data and must not receive MCP
  fixtures, mock enrichment or qualification output.
- `khoaha1904/hub-3` is the current disposable development Hub for Crawler
  ingest, enrichment, query, visualization and benchmark qualification.
- Before any development action that can read or mutate Hub data, run `abs
  status`. When the task is testing MCP behavior, connect to `hub-3` through
  `abs hub connect` and reuse the existing shared token; do not manually clone
  an anonymous remote or invent a second credential path.
- Do not reset, reseed or copy `AgentBase-Hub` into `hub-3` without an explicit
  owner request. Inspect the existing Published revision, repository coverage,
  OKF validation and embedded CI first so useful fixture data is not destroyed.
- `domain-hub` and GitHub Pages are generated presentation output. Page
  visibility does not imply that either Hub repository is public.

These names are workspace fixtures only. Never expose this convention as a
general AgentBase product hierarchy or assume another user's Hub has the same
role.
