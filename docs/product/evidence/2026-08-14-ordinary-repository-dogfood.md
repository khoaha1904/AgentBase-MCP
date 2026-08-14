# Ordinary-Repository Product Dogfood

- **Date:** 2026-08-14
- **Source:** `telecodex` at commit `e5d23062f82e7d5ffde4e0b5cd210ab47d938778` with an admitted dirty-source digest
- **Mode:** real managed Codebase Memory provider plus isolated local-only AgentBase-Hub
- **Remote effects:** none

## Journey result

The current product completed one full local journey:

1. observed the requested `createTokenVault` task through the exact managed provider;
2. started from an unconfigured Hub and created a local-only Hub without a token or network request;
3. prepared one repository subject and authored the smallest supported Repository draft;
4. finalized and inspected an applicable proposal with two created files, one root-index modification and no prohibited change;
5. accepted proposal `984f2c20bbca24644113ede3` as local commit `270b32ce242ccc852c14082d15e9fa68c8495fdd`;
6. found the accepted concept through local Hub search and listed exactly one pending proposal.

The source worktree was read-only throughout. The isolated Hub and proposal state were disposable and no GitHub credential, push or API action was used.

## Findings

### 1. The requested graph task produced no source-backed facts

Observation digest `sha256:109a40424e0ed4549f5d192b6fd092a12a3d0be783ba8eae115ca7437e125fd1` contained four query groups. Architecture returned ten boundary facts without source references, while search, snippet and trace were partial with zero facts and zero source references. The requested exported function exists in the source, so a formally valid observation can still be insufficient for grounded subject authoring.

### 2. Schema selection can overstate the evidence

The caller supplied `repository,service` signals and prepare selected both Repository and Service. No observed service boundary or deployment identity supported a Service instance, so the author correctly emitted only Repository and recorded the limitation. The prepared session and proposal retain only selected type names; they do not expose the catalog's matched signals or missing-evidence findings to inspection.

### 3. Authoring guidance is ambiguous for nested indexes

The first authoring attempt treated `repositories/telecodex/index.md` like a generated concept and added frontmatter. Finalize correctly rejected it because only the root index may have frontmatter. Removing nested-index frontmatter made the proposal valid. The repository-local authoring skill should state this reserved-index rule directly.

### 4. Source identity disagreement remained visible

The admitted repository identity used checkout name `telecodex`, while package metadata declared `agentdock`. The draft preserved both facts and did not silently choose a canonical product name. Explicit subject naming remains necessary.

## Recommended Capability 012

Use the Full Feature route for **evidence-grounded authoring handoff** before cumulative re-ingest work. The product checkpoint should settle these recommended defaults:

1. A zero-source or partial requested task remains a visible incomplete observation; it may support a Repository-only draft with explicit limitations but cannot support a more specific schema.
2. Hub preparation carries evidence-backed schema-selection diagnostics through prepare, inspect and acceptance. Caller-supplied signals are hints, not proof.
3. The authoring workflow distinguishes reserved indexes from concepts and states that nested indexes have no frontmatter.
4. Source naming disagreement remains explicit; AgentBase does not infer canonical identity from a checkout directory or package manifest alone.

Do not add a watcher, model SDK, provider, dependency or new ontology for this slice. Cumulative support/conflict/stale re-ingest remains the following capability after the observation-to-authoring boundary is trustworthy.
