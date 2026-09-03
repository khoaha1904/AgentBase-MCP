# AgentBase-MCP documentation

## Repository language

English is the canonical language for every AgentBase-owned repository
artifact: documentation, source text, comments, tests and
commit messages. Agents communicate with users in the language used by the
user, but user conversation does not change the repository language.

Third-party vendor snapshots and generated output retain their original bytes
and are excluded from translation. The Vietnamese
presentation source under `presentation/vi/` is an explicit localized-content
exception; it is not Product, Architecture or Capability Contract authority. A
translation must preserve requirements, identifiers, links, code examples and
observable runtime behavior.

All current product documentation lives in this repository at three contract levels:

```text
docs/product/       product outcomes, scope and authority
docs/architecture/   system ownership, flows and boundary direction
docs/capabilities/  behavior, low-level design and current AB-* requirements
```

## Session route

At session start read only `AGENTS.md`, this file and Git status. Then load the
smallest relevant route:

| Need | Read next |
|---|---|
| Product outcome, terminology, scope or authority | `docs/product/README.md` and the affected Product Contract |
| Source ownership or dependency boundary | `docs/architecture/README.md` |
| Low-level behavior or requirement IDs | the affected numbered directory under `docs/capabilities/` |
| Concrete implementation | owning source module, adjacent tests and affected Capability Contract |

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
- Product scope: `docs/product/00-scope-and-authority.md`
- Architecture ownership: `docs/architecture/README.md`

## Authority order

1. Latest owner decision.
2. Affected Product Contract.
3. Affected Architecture and Capability Contracts, in that order when both apply.
4. Code and focused verification as evidence of implemented behavior.
5. Git history as historical explanation.

The mandatory high-level → low-level → implementation lifecycle and its
anti-dead-spec gap loop are defined in the repository
[`AGENTS.md`](../AGENTS.md). `docs/capabilities/README.md` provides the low-level design
organization and baseline/impact vocabulary; it does not create a second
lifecycle. Every implementation session must follow the repository rule.

## Documentation contract

AgentBase uses three durable decision levels plus validation evidence:

```text
Product Contract       WHAT
        ↓
Architecture Contract  SYSTEM HOW
        ↓
Capability Contract    BEHAVIOR / BOUNDARY / CODE OWNERSHIP
        ↓
Validation Evidence    TEST / VERIFY
```

Implementation plans are temporary working state. Durable decisions are written
once in the narrowest affected living contract; source ownership and adjacent
tests supply concrete implementation and validation evidence.

The current paths map to those levels as follows:

| Level | Current location | Responsibility |
|---|---|---|
| Product Contract | `docs/product/` | Product outcome, scope, authority, workflows and non-goals |
| Architecture Contract | `docs/architecture/` | System boundaries, ownership, cross-capability flows, state/trust boundaries and runtime shape |
| Capability Contract | `docs/capabilities/<area>/` | Capability behavior, contracts, bounds, failure/recovery and `AB-*` requirements |
| Validation Evidence | Tests, verification reports and `npm run verify` output | Evidence that implementation matches accepted contracts |

The Product-to-Capability mapping is many-to-one:

| Product Contract | Capability Contracts |
|---|---|
| `docs/product/00-scope-and-authority.md` | `12-version-scope` |
| `docs/product/01-repository-understanding.md` | `01-repository-reading`, `03-concept-discovery`, `04-schema-selection` |
| `docs/product/02-knowledge-model-and-relations.md` | `02-hub-domain-repository-model`, `06-cross-repository-relations` |
| `docs/product/03-knowledge-lifecycle.md` | `05-knowledge-entry`, `09-ingest-and-refresh`, `11-review-and-publish` |
| `docs/product/04-trust-conflicts-and-freshness.md` | `07-conflicts-and-questions`, `08-live-references` |
| `docs/product/05-query-and-context.md` | `10-query-routing` |
| `docs/product/06-visualization.md` | `13-visualization` |
| `docs/product/07-ai-sdlc-context.md` | `14-ai-sdlc-context` |

Product Contracts own stable outcomes rather than mirroring capability
granularity. `docs/architecture/` owns cross-capability system shape, while the
14 `docs/capabilities/` areas retain independent behavior and requirement
ownership.

`docs/architecture/` may mention implementation baseline as
evidence, but architectural decisions remain separate from file-, class- and
package-level implementation choices. A separate global implementation tree is
not required; module ownership and adjacent tests keep CODE HOW close to source.

## Change impact gate

Every change is classified before implementation. Read only the levels that can
be affected, then check upward before accepting a lower-level decision:

| Change shape | Required review |
|---|---|
| Internal implementation with unchanged behavior | Affected capability, source owner and tests |
| Tool, workflow or user outcome change | Product, architecture and affected capability |
| Boundary, ownership, state or data-flow change | Architecture and affected capability |
| Schema, provider, security, credential, migration or recovery change | Product, architecture and affected capability |
| Package, module pattern or file-structure change only | Architecture ownership when boundaries change; otherwise source owner and tests |
| Tests or documentation with no contract change | Affected artifact only |

If a lower-level change reveals an upstream gap, stop and route the decision to
the owner of that upstream contract. Passing tests do not authorize silently
changing product scope or architecture.

## Current versus historical references

`docs/` is mutable current truth. Git history explains prior decisions but does
not override the current Product, Architecture or Capability Contracts. The
former per-change specification archive was intentionally removed before the
clean source publication because its accepted outcomes already live here.

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
