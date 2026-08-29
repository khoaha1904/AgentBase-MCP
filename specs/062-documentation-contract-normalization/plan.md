# Plan: documentation contract normalization

## Baseline

AgentBase already treats `docs/` as current truth and numbered `specs/` as
historical, but the names `present` and `design` are broad and the distinction
between architecture and implementation detail is not consistently explicit.
Existing completed specs and links are valuable history and must not be rewritten.

## Phase 1 — current-path governance (this slice)

- Define the four decision levels plus validation evidence in `docs/README.md`.
- Add a risk-based change impact gate and upward-review rule.
- Define `current_refs`, immutable `baseline` path/SHA references and later
  `supersedes`/`amends` behavior.
- Point `AGENTS.md` to the single documentation gate instead of duplicating it.
- Keep all current paths and completed spec content unchanged.

## Phase 2 — capability mapping (next slice)

- Inventory each `docs/present/` and `docs/design/` area against the level map.
- Mark architecture decisions versus implementation baseline in the ownership
  index, without moving files.
- Add baseline/landed references only to new or actively changed specs.
- Fix the current-authority wording in `docs/design/README.md`.

## Phase 3 — optional directory migration

Only if Phase 2 still leaves recurring confusion:

- Map `present` product pages to `product/` and numbered capability pages to
  `capabilities/` before moving anything.
- Update current links in one atomic change.
- Keep compatibility README redirects/mapping at old paths.
- Verify zero broken links and historical spec readability before removing any
  compatibility path.

## Phase 4 — provider-neutral expansion

Use the normalized contracts for the next broad scope change outside AWS/
Terraform. Provider-neutral requirements must be accepted before adding a new
provider profile; the provider-specific work remains an implementation profile.

## Recovery and migration rules

- Never edit completed spec content to follow newer docs.
- If a current doc changes behavior, create a new spec and link it with
  `supersedes` or `amends`.
- If a rename is partially prepared, leave old paths intact and restore current
  links before continuing; no destructive cleanup is allowed in the same slice.
- A failed docs migration must leave the pre-migration paths and Git history
  readable.
