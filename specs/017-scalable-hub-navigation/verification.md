# Verification: Scalable Hub Navigation

## Result

Capability 017 is complete. AgentBase-Hub remains the sole durable knowledge
store while MCP can retrieve and validate bounded, Domain-aware slices of a
larger Markdown graph. The implementation adds no embeddings, vector database,
daemon, durable derived graph or governed question ledger.

## Requirement evidence

| Requirement | Evidence |
|---|---|
| AB-SCHEMA-019–020 | Catalog 5.0.0, canonical-predicate validation, per-edge source evidence and ordered Business Flow step tests |
| AB-SCHEMA-021, AB-LOCAL-HUB-014 | Changed concepts plus unchanged target summaries and exact-base bounded continuity tests |
| AB-SCHEMA-022–023 | Useful-boundary guidance, parent/specialization selection and durable path-derived identity tests |
| AB-QUERY-002–005 | Deterministic Domain-scoped search, ambiguity response, accepted-commit summaries, bounded bidirectional traversal and progressive-index tests |
| AB-BENCH-039 | Generated ten-Domain, one-thousand-concept search, traversal and changed-set qualification |
| AB-BENCH-040 | Sequential multi-repository lifecycle and immutable V8/V9 real Shopping Cart evidence |

Convergence checked all eleven requirements, eight success criteria, four user
scenarios, the implementation plan and five constitution principles. It found
no unbuilt requirement. The later schema-selector correction preserves both a
parent and specialization when separate evidence signals select them, while
retaining specialization shadowing for the same evidence.

## Verification command

`npm run verify`

Final result: specification checks, TypeScript, architecture checks and all 330
offline tests passed. Architecture reported eight retained review warnings and
no errors.

## Real qualification and publication

- V9 run `2026-08-15T163041Z` produced a valid, reviewable 16-concept bundle
  with all seven reference concepts, all six canonical relationship probes,
  100% schema agreement, all required semantic metadata and 73% reference
  provenance.
- Proposal `1825cee818828dd7e60cfb3f` was prepared as a new subject from the
  exact remote Hub `main`, accepted locally at commit
  `faaf8569452699a9405c062ca90042a499546b71` and published without merge as
  [`AgentBase-Hub` PR #7](https://github.com/khoaha1904/AgentBase-Hub/pull/7).
- PR #7 is open, has a clean merge state and contains one proposal commit. It
  remains owner-review input rather than accepted organizational truth.

## Explicit limitations

- The V9 table concept mentions the documented one/seven-day and migration
  30-day TTL disagreement, but omits the supporting migration source from that
  concept and does not place the conflict in Limitations. Owner review therefore
  remains `needs_revision` rather than treating the fact as settled.
- Authentication infrastructure, a separate DLQ identity and explicit
  operation-to-handler maps are useful later enrichment, not facts to infer
  without stronger evidence.
- Reference coverage remains non-exhaustive and cannot prove full semantic
  truth. Human review may correct or add knowledge after initial ingestion.
- Governed question persistence, `/abs-questions`, AWS CLI authority and cloud
  resource enrichment remain future capabilities.
- New-versus-refresh repository lifecycle wording is intentionally unchanged in
  this capability and will be reconciled separately with repository ingestion
  history.
