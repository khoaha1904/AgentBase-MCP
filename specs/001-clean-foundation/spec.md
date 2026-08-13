# Capability 001: Clean Foundation

- **Status:** Complete
- **Created:** 2026-08-11
- **Last clarified:** 2026-08-11

## Outcome

A developer can start a new AgentBase session in a clean repository, understand
the product boundary without reading legacy code, run one useful local Code
Intelligence demonstration, and add a focused capability under automatically
enforced agent-friendly architecture rules.

## Owner decisions

- The first visible Part 1 flow shows both a repository map and a relevant
  neighborhood query.
- The first quality benchmark requires all task-critical expected nodes and
  edges while exposing no more than 25% of the fixture's authored files.
- Five repeated queries over unchanged input must return the same normalized
  result and ordering.
- The first representative fixture is a small 12-file TypeScript modular
  monolith with public/private capability boundaries and a cross-capability call
  chain.

## User stories

### User Story 1 — Start with trustworthy context (P1)

As the product owner, I can start a new agent session and have it discover the
current vision, decisions, boundaries and next task from repository-local
files.

Acceptance:

- the root guide provides one ordered start path;
- current living requirements and historical change artifacts are
  distinguishable;
- legacy repositories are clearly read-only references;
- unresolved decisions are explicit rather than hidden assumptions.

### User Story 2 — See the first Code Intelligence value (P1)

As a coding agent developer, I can run one offline demonstration that first
shows the fixture repository map and then returns the small neighborhood needed
for a named coding task.

Acceptance:

- one flow returns both outputs from a provider-neutral contract;
- a deterministic fake supplies the data without parsing source or starting an
  external engine;
- the neighborhood contains every expected task-critical node and edge while
  referencing at most three of the 12 fixture files;
- five runs over unchanged input return the same normalized result and order;
- an unknown subject returns an explicit non-success result without fabricated
  nodes or a partial result presented as complete.

### User Story 3 — Keep code navigable and replaceable (P2)

As a coding agent, I can identify which capability owns a file, begin at its
small public entrypoint and change one capability without loading unrelated
private implementation.

Acceptance:

- every authored runtime source and colocated test file has exactly one declared
  owner;
- invalid private imports, reverse dependencies and dependency cycles fail
  verification with exact paths;
- file-growth checks compare source and test files against an accepted clean
  baseline;
- focused tests can be run by capability;
- core contracts contain no fake-provider or future engine-private record.

## Functional requirements

### Repository context

- **AB-FND-001**: The root session guide MUST define one ordered route to the
  current product, architecture, living requirements and active change record.
- **AB-FND-002**: The repository MUST distinguish current living requirements
  from numbered historical change artifacts.
- **AB-FND-003**: Sibling legacy repositories MUST remain read-only evidence and
  MUST NOT become runtime or build dependencies.

### Foundation demonstration

- **AB-FND-004**: One local demonstration MUST return a repository map followed
  by a relevant-neighborhood result for a named subject in the representative
  fixture.
- **AB-FND-005**: The demonstration MUST use only a deterministic fake through
  the provider-neutral Code Intelligence contract.
- **AB-FND-006**: The representative fixture MUST contain 12 authored TypeScript
  files arranged as a modular monolith with public/private boundaries and at
  least one cross-capability call chain.
- **AB-FND-007**: The accepted neighborhood scenario MUST include every declared
  task-critical expected node and edge while referencing no more than three
  fixture files.
- **AB-FND-008**: Five executions over unchanged fake input MUST produce
  identical normalized values and ordering.
- **AB-FND-009**: A missing repository snapshot or unknown query subject MUST
  return an explicit typed failure and MUST NOT fabricate evidence or label a
  partial result as complete.

### Agent-friendly architecture

- **AB-FND-010**: Every authored runtime source and colocated test file MUST
  match exactly one capability in a machine-readable ownership registry, except
  explicitly allowlisted root composition files.
- **AB-FND-011**: Cross-capability imports MUST target only the owning
  capability's registered public entrypoint.
- **AB-FND-012**: Core capabilities MUST NOT import provider or application
  capabilities, providers MUST NOT import application capabilities, and local
  dependency cycles MUST fail verification with their exact paths.
- **AB-FND-013**: Source and test reviewability MUST use separate measured
  budgets; exceptions MUST be exact, owner-approved, non-growing and rejected
  when stale.
- **AB-FND-014**: Tests MUST live with the capability they protect, and reusable
  deterministic fixtures MUST remain owned by the narrowest responsible
  capability or the explicit repository fixture area.
- **AB-FND-015**: The repository MUST expose one offline verification command
  that composes specification, type, architecture, test and diff checks.

### Product boundary

- **AB-FND-016**: Core MUST define provider-neutral repository-map and
  relevant-neighborhood contracts before any real external engine is added.
- **AB-FND-017**: The fake provider MUST pass the reusable contract scenarios
  that a future real provider will also be required to pass.
- **AB-FND-018**: No public core type MUST expose a fake-provider record or a
  future engine's private graph record.
- **AB-FND-019**: The mandatory Part 1 foundation path MUST require no network,
  credentials, AI inference, daemon or external binary.

## Success criteria

- **SC-FND-001**: A new session reaches the active capability and living
  foundation requirements through the ordered root route without reading a
  legacy repository.
- **SC-FND-002**: The demonstration returns the complete 12-file repository map
  and the accepted neighborhood references at most three files while containing
  100% of its declared expected nodes and edges.
- **SC-FND-003**: Five unchanged-input runs are byte-equivalent after normalized
  serialization.
- **SC-FND-004**: Automated negative fixtures fail for unknown ownership,
  overlapping ownership, private imports, reverse dependencies, cycles,
  baseline growth and stale baseline entries.
- **SC-FND-005**: The complete verification command passes offline and starts no
  external process other than its own local test/check subprocesses.

## Edge cases

- An empty but valid repository map is distinct from an unknown repository.
- A known subject with no neighbors returns a complete empty neighborhood, not
  the same failure as an unknown subject.
- Duplicate node or edge identifiers in fake input fail deterministic
  normalization rather than being silently overwritten.
- Registry entries with no files and baseline entries for resolved or missing
  files fail as stale configuration.
- A query result that omits any declared expected node or edge fails the quality
  benchmark even if it meets the 25% file budget.

## Constraints

- Use a modular monolith.
- Do not port legacy runtime code in this capability.
- Do not install, download or start Codebase Memory in this capability.
- Select runtime and dependencies through recorded evidence, with a small
  standard-library-first toolchain.
- Keep all tests deterministic and offline.
- Do not introduce secret or `.env` handling.

## Out of scope

- Production observation or OKF schema and storage.
- AI investigation and human review UI.
- Terraform/Terragrunt enrichment.
- A real Codebase Memory adapter or engine benchmark.
- Engine installation, packaging, deployment or remote services.
- A complete commit/push/deploy workflow gate; the first slice establishes the
  canonical local verification and architecture controls only.

## Assumptions

- The 25% threshold applies to the accepted relevant-neighborhood scenario, not
  to the full repository map.
- The deterministic fake validates AgentBase's contract and product flow; it
  does not claim real indexing performance.
- Latency, memory and incremental-refresh thresholds are set in Phase 1 after a
  real engine baseline exists.
