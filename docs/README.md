# AgentBase-MCP documentation

## Repository language

English is the canonical language for every AgentBase-owned repository
artifact: documentation, source text, comments, tests and
commit messages. Agents communicate with users in the language used by the
user, but user conversation does not change the repository language.

Third-party vendor snapshots and generated output retain their original bytes
and are excluded from translation. The Vietnamese
presentation source under `presentation/vi/` and its generated standalone
snapshot at `presentation/preview.html` are explicit localized-content
exceptions; they are not Product, Architecture or Capability Contract
authority. A translation must preserve requirements, identifiers, links, code
examples and observable runtime behavior.

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
| Business overview, product rules, scope or authority | [Product index](product/README.md) |
| Architecture, source ownership or dependency direction | [Architecture index](architecture/README.md) |
| Detailed behavior, limits or requirement IDs | [Capability index](capabilities/README.md) |
| Concrete implementation | owning source module, adjacent tests and affected Capability Contract |

Do not enumerate or preload child documents. Read the selected layer index,
then the one owning contract. Follow cross-layer links only when the task changes
that layer's decision. Reports and deferred benchmark designs are opt-in evidence,
not startup reading.

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

Every directory index routes a concrete question to its owning file and states
what that file owns. Keep one authoritative definition; link instead of copying.
Delete replaced designs and completed implementation plans; Git retains history.
Split long files by independently queried responsibility, not a line quota.


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

- Groups 1–9 are implemented for a bounded trusted-enterprise Linux x64 pilot.
  Current outcomes and deferred evidence live in
  [Scope and authority](product/00-scope-and-authority.md#accepted-product-design-groups).
- User workflow: Add repository / Update knowledge → private proposal →
  material preview → explicit Direct/PR Publish. Query reads Published only.
  No Accept or stacked-publication public entrypoint remains.
- The installed surface is ten public skills, three internal skills and
  forty-four owned tools. Query owns standalone and host-workflow reads;
  Context delegates to it. Repair approval never grants publication or provider access.
- Deterministic discovery discloses bounds and unsupported lanes; Initial Ingest
  retains limitations as Repository coverage debt. Delta preserves that debt;
  explicit Coverage can repair it without re-ingesting. No completeness guarantee.
- Latest local verification: 248/248 tests. Exact final source/tag still requires
  CI and artifact qualification. See [Release CI](capabilities/12-version-scope/13-release-ci-requirements.md).
- Presentation Markdown and standalone HTML are aligned. Real-model routing,
  semantic usefulness across models, long-term stewardship, scale and macOS
  qualification are not established by these deterministic tests.
- No model benchmark runs automatically. Deferred campaigns/reports are
  task-specific evidence, not startup context or current feature requirements.

Update current truth once in the narrowest high- or low-level document. Do not
add handoff, roadmap, ADR or evidence-diary files that repeat it.

The accepted product-readiness groups are maintained in
[`docs/product/00-scope-and-authority.md`](product/00-scope-and-authority.md#accepted-product-design-groups).
The complete Product horizon is accepted before new delivery work begins. Work
then returns to the earliest open group, revalidates its Architecture and takes
one Capability from contract through code and verification before the next
Capability starts. The group is released/closed before delivery begins for the
next group; no separate roadmap file is authority.
