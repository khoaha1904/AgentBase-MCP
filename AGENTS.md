# AgentBase-MCP repository guide

This is the canonical AgentBase-MCP application repository. Its checkout name
must never become an implicit Hub identity or generated OKF subject.

## Session startup

Read only these files before interpreting a task:

1. `docs/README.md`
2. `specs/CURRENT.md`

Then inspect Git status. Use the routing table in `docs/README.md` to load only
the affected product, architecture or domain contract. Do not preload every
contract or completed capability.

The latest user request and live repository state outrank stale planning prose.
Communicate with the user in Vietnamese. Keep repository documentation and
source identifiers in English unless the user asks otherwise.

## Development workflow

- Use specification-driven development for product or architecture changes.
- Start with the smallest user-visible outcome and record owner decisions before
  implementation details.
- Keep at most one active capability in `specs/CURRENT.md`; between slices use
  `None` plus the most recently completed capability.
- Current accepted behavior lives under `docs/contracts/`, with product scope in
  `docs/PRODUCT.md`. Numbered `specs/<number>-<name>/` directories are historical
  after completion.
- Update current truth once in the narrowest contract. Do not create handoff,
  roadmap, ADR or evidence files that repeat it.
- Never port a large legacy implementation. Extract one verified behavior at a
  time behind a current contract.
- Prevent dead specs while implementing. If code exposes a broad product,
  architecture, authority, migration or workflow gap, stop implementation and
  return to the affected AgentBase high-level and low-level design for owner
  review before continuing. Small related implementation corrections may be
  batched, but the affected design levels and living contract must be backfilled
  before the slice is considered complete. Never close a capability while code,
  high-level design, low-level design and current contracts disagree.

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

`docs/ARCHITECTURE.md` is the ownership index. Before changing runtime behavior,
confirm the active plan, domain contract, owning capability, public entrypoint
and focused requirement-linked tests. Run `npm run depcruise` after source
dependency changes; do not weaken a rule without explicit owner approval.

## Safety and legacy boundaries

- Never read or expose secrets, credentials, tokens, keys or `.env` files.
- Sibling legacy repositories and `docs/.archived/` are historical references,
  not current authority or dependencies. Do not edit, clean, reset or copy
  legacy worktrees wholesale.
- Never share raw local graph databases through Git or OKF storage.
- Missing evidence in a later ingest never implicitly deletes accepted
  knowledge.
