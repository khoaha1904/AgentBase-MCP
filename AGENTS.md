# AgentBase-MCP repository guide

This is the canonical AgentBase-MCP application repository. Its checkout name
must never become an implicit Hub identity or generated OKF subject.

## Session startup

Read `docs/README.md`, then inspect Git status. Use its routing table to load only
the affected product decision, architecture map or design/requirements route.
Do not preload every document.

The latest user request and live repository state outrank stale planning prose.
Communicate with the user in the language they use. Keep every AgentBase-owned
repository artifact in English, including documentation, source text,
comments, test descriptions and commit messages. Do not translate third-party
vendor snapshots or generated output. The
explicitly localized Vietnamese presentation source under `presentation/vi/`
and its generated standalone snapshot at `presentation/preview.html` are also
excluded; they are communication material, not product-contract authority.

## Development workflow

- Use contract-driven development for product or architecture changes.
- Start with the smallest user-visible outcome and record owner decisions before
  implementation details.
- Product direction lives under `docs/product/`; architecture ownership lives in
  `docs/architecture/`; capability design and current `AB-*` requirements live
  under `docs/capabilities/`.
- Update current truth once in the narrowest design/requirements route. Do not create handoff,
  roadmap, per-change specification or evidence files that repeat it.
- Never port a large legacy implementation. Extract one verified behavior at a
  time behind current requirements.
- Prevent dead contracts while implementing. If code exposes a broad product,
  architecture, authority, migration or workflow gap, stop implementation and
  return to the affected Product, Architecture and Capability Contracts for owner
  review before continuing. Small related implementation corrections may be
  batched, but the affected design levels and current requirements must be
  backfilled before the slice is considered complete. Never close a capability
  while the contract levels, code and current requirements disagree.

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
   failure/recovery, security impact, validation obligations and stable `AB-*`
   requirements. Tests and retained reports provide the Validation Evidence;
   they do not become Capability Contract authority. Query behavior belongs in numbered Query design (10), not in
   an ad-hoc new query system.
4. **Implementation plan** — identify the concrete modules, interfaces,
   data/state choices, dependencies, migration/recovery and
   requirement-to-verification mapping in the working plan. Durable decisions
   belong in the narrowest living contract, not a per-change archive.
5. **Consistency gate** — compare all affected contracts, the implementation
   plan and the code baseline. Do not write runtime code
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

A slice is complete only when the affected Product, Architecture and Capability
Contracts, code, tests and verification describe the same
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

## Hub safety convention

AgentBase product semantics do not define primary, secondary, production or
test Hub roles. Hub profiles are peers, exactly one is active, and the user may
connect or switch them. Switching never copies or merges knowledge.

- Before any development action that can read or mutate Hub data, run `abs
  status` and inspect the exact active repository, branch, Published revision,
  Local Draft state and recovery state.
- Never connect or switch to another Hub, reset or reseed Hub data, or reuse a
  Hub for fixtures or qualification without an explicit owner request.
- Qualification targets are operator-provided local configuration. This
  repository must not instruct an agent to connect to a personal or globally
  assumed Hub identity.
- Domain sites and hosted pages are generated presentation output. Page
  visibility does not imply that the owning Hub repository is public.
