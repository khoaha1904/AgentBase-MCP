# AgentBase-MCP documentation

All product documentation lives in this repository and has two levels:

```text
docs/present/  high-level product direction and presentation
docs/design/   low-level design, architecture and current AB-* requirements
```

Numbered `specs/` record feature changes. They are historical after completion
and do not form a third current-documentation layer.

## Session route

At session start read only `AGENTS.md`, this file, `specs/CURRENT.md` and Git
status. Then load the smallest relevant route:

| Need | Read next |
|---|---|
| Product outcome, terminology, scope or authority | `docs/present/README.md` and the affected numbered presentation |
| Source ownership or dependency boundary | `docs/design/00-architecture.md` |
| Low-level behavior or requirement IDs | the affected numbered directory under `docs/design/` |
| Current feature implementation | the active artifact selected by `specs/CURRENT.md` |

Current requirement routes:

- Foundation: `docs/design/12-version-scope/01-foundation-requirements.md`
- Code Graph: `docs/design/01-repository-reading/05-runtime-requirements.md`
- OKF: `docs/design/05-knowledge-entry/06-runtime-requirements.md`
- Domain Enrichment: `docs/design/06-cross-repository-relations/07-runtime-requirements.md`
- Batch Initial Ingest: `docs/design/09-ingest-and-refresh/09-runtime-requirements.md`
- Local Hub and publication: `docs/design/11-review-and-publish/01-runtime-requirements.md`
- Installation: `docs/design/12-version-scope/02-installation-requirements.md`
- Benchmark: `docs/design/12-version-scope/03-benchmark-requirements.md`
- Product scope: `docs/present/00-product-scope-and-authority.md`
- Architecture ownership: `docs/design/00-architecture.md`

## Authority order

1. Latest owner decision.
2. Affected high-level presentation.
3. Affected low-level design and `AB-*` requirements.
4. Approved active capability for not-yet-accepted change scope.
5. Code and focused verification as evidence of implemented behavior.
6. Completed capabilities and Git history as historical explanation.

When implementation exposes a gap, follow the anti-dead-spec loop in
`docs/design/README.md`: broad gaps return to high/low-level review before code;
small gaps must be backfilled before benchmark, PR or capability completion.

## Current checkpoint

- Catalog 7 Initial Ingest, single-repository Refresh, Batch Initial Ingest and
  bounded AWS/SQS Domain Enrichment are implemented.
- Sol Initial Ingest plus two sequential Terra Refresh runs qualify the pinned
  ECS full-stack Terraform fixture without Accept, Publish or provider CLI.
- Independent Repository Init PRs, exact same-Repository Init/Refresh stacks and
  existing-PR reconciliation are implemented. First bootstrap retains one batch
  PR. Batch Refresh and additional provider profiles remain deferred.
- Repository observed values are snapshot-first: Finalize owns stable identity,
  exact source state and readable tables; query performs no repository probe.
  AWS/SQS provider observations are implemented through explicit Domain
  Enrichment. A local warning-only Repository freshness report and read-only
  scheduled Hub CI are implemented. Existing-Hub Initialization adds only a
  missing standard README and/or non-current CI through one support-only PR.
- Questions are shared Hub Markdown with exact state/revision and no private
  ledger authority. Exact-revision answers propose Guidance plus Question update
  atomically; Accept remains the state-change boundary. Broad Guidance,
  automatic conflict inference, query overlay,
  ordinary-query freshness marks, visual review and profile migration are post-MVP capabilities.

Update current truth once in the narrowest high- or low-level document. Do not
add handoff, roadmap, ADR or evidence-diary files that repeat it.
