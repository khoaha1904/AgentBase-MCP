# 02.02 — Domain confirmation preflight

> Status: Single-repository and Batch Initial Ingest confirmation are
> implemented.

## Workflow

```text
explicit repository root
→ read bounded root documentation
→ resolve existing Repository assignment
→ search existing Domain summaries
→ present candidate + evidence + warnings
→ user confirms/corrects
→ only then start full Ingest/Refresh
```

## Bounded documentation

The host skill reads in this order:

1. root `README*`;
2. root `docs/README*` or `docs/index*`;
3. overview/domain/architecture documents directly linked by the root README.

Exact file/byte limits belong to the implementation plan, but the skill does
not recursively scan all docs or need Code Graph merely to confirm a Domain.

## Candidate result

Preflight returns:

- repository identity and any existing primary Domain;
- proposed exact Domain identity/title;
- match kind: existing, new or ambiguous/near-name;
- source paths/excerpts used for the proposal;
- a warning when user input and repository evidence diverge.

The AI does not confirm automatically. User input is not trusted blindly:
mismatches are shown, but the owner makes the final decision.

The parent-folder name may be a presentation hint, not Domain evidence. When a
parent contains multiple Git repositories, bounded documentation is checked
separately for each repository.

## New, Refresh and correction

- Initial Ingest creates/reuses the Domain and Repository assignment after
  confirmation.
- Refresh uses the existing assignment by default and still displays a preflight
  summary.
- A different Domain from the existing assignment stops ordinary Refresh. An
  explicit correction proposal changes the relation while preserving owner
  evidence and Git history; it does not change silently.
- If the Repository concept is protected, the Agent reports the exact mismatch;
  a maintainer must perform a reviewed Hub correction before Refresh continues.
- Exact identity/title is passed into existing `confirmed_domain`; runtime does
  not run a model or classification service automatically.
