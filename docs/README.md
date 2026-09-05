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
- Profile 1.0 and Domain Capsule admission: `docs/capabilities/02-hub-domain-repository-model/07-profile-layout-requirements.md`
- Profile 1.0 bootstrap and grouped-home Initial Ingest: `docs/capabilities/02-hub-domain-repository-model/08-profile-bootstrap-home-plan-requirements.md`
- Profile Repository Refresh and Question guidance: `docs/capabilities/02-hub-domain-repository-model/09-profile-refresh-guidance-requirements.md`
- Compact Profile 1.0 and Repository dossiers: `docs/capabilities/02-hub-domain-repository-model/10-compact-profile-layout-requirements.md`
- Profile Domain query/visualization projection: `docs/capabilities/10-query-routing/08-profile-domain-projection-requirements.md`
- Concept discovery: `docs/capabilities/03-concept-discovery/06-capability-requirements.md`
- Schema selection: `docs/capabilities/04-schema-selection/07-capability-requirements.md`
- OKF: `docs/capabilities/05-knowledge-entry/06-runtime-requirements.md`
- Domain Enrichment: `docs/capabilities/06-cross-repository-relations/07-runtime-requirements.md`
- Profile-aware Domain Enrichment: `docs/capabilities/06-cross-repository-relations/09-profile-enrichment-requirements.md`
- Conflicts and Questions: `docs/capabilities/07-conflicts-and-questions/07-capability-requirements.md`
- Observed snapshots: `docs/capabilities/08-live-references/07-capability-requirements.md`
- Uniform context freshness: `docs/capabilities/08-live-references/08-freshness-envelope-requirements.md`
- Batch Initial Ingest: `docs/capabilities/09-ingest-and-refresh/09-runtime-requirements.md`
- Deferred semantic quality design: `docs/capabilities/09-ingest-and-refresh/11-semantic-quality-admission-requirements.md`
- Local Hub and publication: `docs/capabilities/11-review-and-publish/01-runtime-requirements.md`
- Local writer and Git concurrency: `docs/capabilities/11-review-and-publish/10-concurrency-requirements.md`
- Proposal semantic impact: `docs/capabilities/11-review-and-publish/11-proposal-impact-requirements.md`
- Profile migration and final mutation admission: `docs/capabilities/11-review-and-publish/09-profile-migration-changes.md`
- Installation: `docs/capabilities/12-version-scope/02-installation-requirements.md`
- CLI: `docs/capabilities/12-version-scope/08-cli-runtime-requirements.md`
- MCP protocol: `docs/capabilities/12-version-scope/09-mcp-protocol-requirements.md`
- Release artifact: `docs/capabilities/12-version-scope/10-release-artifact-requirements.md`
- Application lifecycle: `docs/capabilities/12-version-scope/11-application-lifecycle-requirements.md`
- Client and skill integration: `docs/capabilities/12-version-scope/12-client-and-skill-integration-requirements.md`
- Release CI and evidence: `docs/capabilities/12-version-scope/13-release-ci-requirements.md`
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
- Release artifact assembly now gives the product identity `0.1.0`, packages
  only the installed production closure and current `linux-x64` native provider,
  and emits a reproducible manifest/SBOM/checksum-qualified archive. Repository
  CI now runs the canonical gate, proves every active release requirement has
  test evidence and retains only exact-tag CI-qualified archives. A public
  release page or registry adapter remains deferred.
- The application lifecycle now installs that archive below owner-private
  `runtime/releases/`, routes through one stable launcher, retains current and
  previous releases, and recovers install/upgrade/rollback/uninstall through a
  durable receipt. Selected Codex/Claude Code entries now use that launcher;
  recognized checkout entries migrate once, and the exact released skill set
  upgrades, rolls back and uninstalls in the same transaction.
- Local accepted/remote Hub writers now use exact profile-scoped locks with
  live-owner exclusion, safe dead-owner and legacy-lock recovery, while
  different Hub profiles remain independent. Team coordination continues
  through deterministic proposal PRs and exact sequential synchronization; the
  unused checkout-mutating publication path was removed.
- Group 3 runtime scope is closed for the current internal enterprise release:
  G3-C1 uniform freshness and G3-C2 proposal semantic impact are implemented
  and verified. G3-C3 real-model usefulness qualification is explicitly
  deferred and is not a release gate. Its accepted campaign design and prior
  evidence remain available for later qualification, but this release makes no
  generalized benchmark-proven usefulness claim.
- Group 4 is closed for the current internal enterprise release. G4-C1 through
  G4-C7 implement and verify Profile 1.0 admission, grouped-home authoring,
  lifecycle/query/visualization projection, semantic impact, Profile-aware
  Enrichment, reviewed legacy migration and final common mutation admission.
  Capacity and real-model qualification remain deferred; the release keeps
  `qualified_scale: null` and makes no benchmark-proven scale claim.
- Group 5's current release scope is G5-C1: compact Domain indexes, Repository
  dossiers, type-neutral `knowledge/` and no Published activity logs. It is
  implemented and verified; Group 5 is closed for the current internal
  enterprise release. G5-C2 product-integrated
  semantic quality admission is deferred, inactive and not a release gate;
  optional AI draft review remains operator practice. Qualification Hub data
  may be reset/re-ingested, while no owner-declared durable Hub receives
  implicit deletion or migration.
- Group 6 is the final release-hardening horizon. G6-C1 is implemented and
  verified; it keeps one Refresh skill/tool surface while adding explicit
  bounded Coverage Refresh and visible Repository coverage debt. Coverage stops
  early on a clean confirming pass and caps a non-converged campaign at three
  reviewed passes. G6-C2 freezes the audited ten public skills, three internal
  skills and forty-six owned tools. Release evidence rejects orphan or
  accidental surface drift without combining safety-critical lifecycle
  transitions. Both phases are implemented and verified; Group 6 is closed for
  the current internal enterprise release.

Update current truth once in the narrowest high- or low-level document. Do not
add handoff, roadmap, ADR or evidence-diary files that repeat it.

The accepted product-readiness groups are maintained in
[`docs/product/00-scope-and-authority.md`](product/00-scope-and-authority.md#accepted-product-design-groups).
The complete Product horizon is accepted before new delivery work begins. Work
then returns to the earliest open group, revalidates its Architecture and takes
one Capability from contract through code and verification before the next
Capability starts. The group is released/closed before delivery begins for the
next group; no separate roadmap file is authority.
