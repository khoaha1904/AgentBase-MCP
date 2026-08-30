# AgentBase-MCP documentation

## Repository language

English is the canonical language for every AgentBase-owned repository
artifact: documentation, specifications, source text, comments, tests and
commit messages. Agents communicate with users in the language used by the
user, but user conversation does not change the repository language.

Third-party vendor snapshots, generated output and immutable external evidence
retain their original bytes and are excluded from translation. A translation
must preserve requirements, identifiers, links, code examples and observable
runtime behavior.

All current product documentation lives in this repository at three contract levels:

```text
docs/product/       product outcomes, scope and authority
docs/architecture/   system ownership, flows and boundary direction
docs/capabilities/  behavior, low-level design and current AB-* requirements
```

Numbered `specs/` record feature changes. They are historical after completion
and do not form a third current-documentation layer.

## Session route

At session start read only `AGENTS.md`, this file, `specs/CURRENT.md` and Git
status. Then load the smallest relevant route:

| Need | Read next |
|---|---|
| Product outcome, terminology, scope or authority | `docs/product/README.md` and the affected numbered presentation |
| Source ownership or dependency boundary | `docs/architecture/README.md` |
| Low-level behavior or requirement IDs | the affected numbered directory under `docs/capabilities/` |
| Current feature implementation | the active artifact selected by `specs/CURRENT.md` |

Current requirement routes:

- Foundation: `docs/capabilities/12-version-scope/01-foundation-requirements.md`
- Code Graph: `docs/capabilities/01-repository-reading/05-runtime-requirements.md`
- Hub/Domain/Repository model: `docs/capabilities/02-hub-domain-repository-model/06-capability-requirements.md`
- Concept discovery: `docs/capabilities/03-concept-discovery/06-capability-requirements.md`
- Schema selection: `docs/capabilities/04-schema-selection/07-capability-requirements.md`
- OKF: `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
- Domain Enrichment: `docs/capabilities/06-cross-repository-relations/07-runtime-requirements.md`
- Conflicts and Questions: `docs/capabilities/07-conflicts-and-questions/07-capability-requirements.md`
- Observed snapshots: `docs/capabilities/08-live-references/07-capability-requirements.md`
- Batch Initial Ingest: `docs/capabilities/09-ingest-and-refresh/09-runtime-requirements.md`
- Local Hub and publication: `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`
- Installation: `docs/capabilities/12-version-scope/02-installation-requirements.md`
- CLI: `docs/capabilities/12-version-scope/08-cli-runtime-requirements.md`
- MCP protocol: `docs/capabilities/12-version-scope/09-mcp-protocol-requirements.md`
- Benchmark: `docs/capabilities/12-version-scope/03-benchmark-requirements.md`
- Published visualization: `docs/capabilities/13-visualization/04-runtime-requirements.md`
- AI SDLC context: `docs/capabilities/14-ai-sdlc-context/02-runtime-requirements.md`
- Query: `docs/capabilities/10-query-routing/07-runtime-requirements.md`
- Product scope: `docs/product/00-product-scope-and-authority.md`
- Architecture ownership: `docs/architecture/README.md`

## Authority order

1. Latest owner decision.
2. Affected Product Contract.
3. Affected Architecture and Capability Contracts, in that order when both apply.
4. Approved active capability for not-yet-accepted change scope.
5. Code and focused verification as evidence of implemented behavior.
6. Completed capabilities and Git history as historical explanation.

The mandatory high-level → low-level → implementation lifecycle and its
anti-dead-spec gap loop are defined in the repository
[`AGENTS.md`](../AGENTS.md). `docs/capabilities/README.md` provides the low-level design
organization and baseline/impact vocabulary; it does not create a second
lifecycle. Every implementation session must follow the repository rule.

## Documentation contract

AgentBase uses four decision levels plus validation evidence:

```text
Product Contract       WHAT
        ↓
Architecture Contract  SYSTEM HOW
        ↓
Capability Contract    BEHAVIOR / BOUNDARY
        ↓
Feature-scoped Implementation Contract CODE HOW
        ↓
Validation Evidence    TEST / VERIFY
```

“Feature-scoped” describes where the existing Implementation Contract lives; it
does not add a fifth decision level or a separate “Feature Contract.” Spec Kit
artifacts connect the levels in this direction:

```text
specs/CURRENT.md → spec.md
plan.md → spec.md + affected Product/Architecture/Capability Contracts
tasks.md → plan.md
verification.md → requirements + tests
```

`spec.md` records the accepted change requirements and delta. `$speckit-plan`
reads it and creates `plan.md`; that plan links back to the spec and upstream
contracts and is the feature-scoped Implementation Contract.

The current paths map to those levels as follows:

| Level | Current location | Responsibility |
|---|---|---|
| Product Contract | `docs/product/` | Product outcome, scope, authority, workflows and non-goals |
| Architecture Contract | `docs/architecture/` | System boundaries, ownership, cross-capability flows, state/trust boundaries and runtime shape |
| Capability Contract | `docs/capabilities/<area>/` | Capability behavior, contracts, bounds, failure/recovery and `AB-*` requirements |
| Feature-scoped Implementation Contract | Active `specs/<feature>/plan.md` | Concrete modules, libraries, interfaces and coding/migration decisions for one accepted change |
| Validation Evidence | Tests, verification reports and `npm run verify` output | Evidence that implementation matches accepted contracts |

The numbered areas map physically to the contract levels as follows:

| Current area | Product-level overview | Capability/low-level contract |
|---|---|---|
| Scope and authority | `docs/product/00-product-scope-and-authority.md` | `docs/capabilities/12-version-scope/` cross-cutting requirements |
| Repository reading | `docs/product/01-how-mcp-reads-a-repository.md` | `docs/capabilities/01-repository-reading/` |
| Hub/Domain/Repository model | `docs/product/02-hub-domains-and-repositories.md` | `docs/capabilities/02-hub-domain-repository-model/` |
| Concept discovery | `docs/product/03-how-concepts-are-identified.md` | `docs/capabilities/03-concept-discovery/` |
| Schema selection | `docs/product/04-how-concept-schemas-are-selected.md` | `docs/capabilities/04-schema-selection/` |
| Knowledge entry | `docs/product/05-how-repository-knowledge-enters-the-hub.md` | `docs/capabilities/05-knowledge-entry/` |
| Cross-repository relations | `docs/product/06-cross-repository-and-cross-domain-relationships.md` | `docs/capabilities/06-cross-repository-relations/` |
| Questions and guidance | `docs/product/07-conflicts-questions-and-maintainer-guidance.md` | `docs/capabilities/07-conflicts-and-questions/` |
| Observed values | `docs/product/08-live-references-for-change-prone-values.md` | `docs/capabilities/08-live-references/` |
| Ingest and Refresh | `docs/product/09-ingest-and-refresh.md` | `docs/capabilities/09-ingest-and-refresh/` |
| Query routing | `docs/product/10-querying-code-graph-and-hub.md` | `docs/capabilities/10-query-routing/` |
| Review and Publish | `docs/product/11-review-accept-and-publish.md` | `docs/capabilities/11-review-and-publish/` |
| Version scope and limits | `docs/product/12-current-limits-and-open-decisions.md` | `docs/capabilities/12-version-scope/` |
| Visualization | `docs/product/13-visualizing-published-knowledge.md` | `docs/capabilities/13-visualization/` |
| AI SDLC context | `docs/product/14-context-for-ai-sdlc-workflows.md` | `docs/capabilities/14-ai-sdlc-context/` |

The `docs/product/` numbered pages are capability overviews, not all-purpose
product policy. Product-wide scope and authority remain in `00` and shared
limits; numbered capability pages explain the user-facing purpose of each
area. `docs/architecture/` owns cross-capability system shape, while the
numbered `docs/capabilities/` areas own behavior and bounded low-level contracts.

`docs/architecture/` may mention implementation baseline as
evidence, but architectural decisions remain separate from file-, class- and
package-level implementation choices. A separate global implementation tree is
not required unless repeated cross-capability decisions justify it. New active
features use `plan.md` as their feature-scoped Implementation Contract; completed
plans remain historical and are not migrated to the current template.

## Change impact gate

Every change is classified before implementation. Read only the levels that can
be affected, then check upward before accepting a lower-level decision:

| Change shape | Required review |
|---|---|
| Internal implementation with unchanged behavior | Affected capability and implementation contract |
| Tool, workflow or user outcome change | Product, architecture and affected capability |
| Boundary, ownership, state or data-flow change | Architecture and affected capability |
| Schema, provider, security, credential, migration or recovery change | Product, architecture and affected capability |
| Package, module pattern or file-structure change only | Implementation contract |
| Tests or documentation with no contract change | Affected artifact only |

If a lower-level change reveals an upstream gap, stop and route the decision to
the owner of that upstream contract. Passing tests do not authorize silently
changing product scope or architecture.

## Current versus historical references

`docs/` is mutable current truth. `specs/<id>/` is an immutable Spec Kit/SDD
change package containing the delta, plan, tasks and verification for one
capability change; it does not replace or duplicate all current docs.

New specs should keep both kinds of reference:

```yaml
current_refs:
  - docs/product/00-product-scope-and-authority.md
baseline:
  - path: docs/product/00-product-scope-and-authority.md
    commit: <git-sha-before-implementation>
```

`current_refs` is for navigation and may change when current docs evolve.
`baseline` preserves the exact historical input and must use a Git commit SHA.
Completed specs are not rewritten when current docs change. A later behavior
change creates a new spec with `supersedes` or `amends`; its `verification.md`
may record the landed/source-snapshot commit after completion.

The former `present` and `design` roots retain compatibility mapping READMEs.
Current links use the new paths; completed specs and historical bug records keep
their original path text and resolve it through Git baselines plus those maps.
Do not bulk-edit historical spec content.

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
  automatic conflict inference, ordinary-query freshness marks and visual
  review are post-MVP capabilities. Ordinary Hub query is deliberately
  Published-only; Local Draft is reviewed through proposal workflows.
- Codebase Memory now comes from AgentBase's attributed `v0.10.8` source snapshot
  and 12-language profile rather than an npm postinstall binary. Ordinary setup
  verifies and activates a reviewed repository-contained platform bundle; it
  never compiles the provider. Linux x64 is bundled and qualified; the reviewed
  macOS arm64 bundle remains an explicit company-environment release gate.
  The Codebase Memory Graph UI frontend is excluded. Capability 045 now owns an
  implemented Published projection, focused diagram and static Domain-site
  workflow. Its prior eight-repository qualification Domain, source-backed Flows
  and evidence-bound System-to-Interface consumption are historical evidence;
  the generated snapshot was reset before capability 052's resource-node
  qualification.

Update current truth once in the narrowest high- or low-level document. Do not
add handoff, roadmap, ADR or evidence-diary files that repeat it.
