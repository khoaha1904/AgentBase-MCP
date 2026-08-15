You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): {{SOURCE_ROOT}}
Output directory (the only writable task path): {{OUTPUT_ROOT}}
Repository ID for provenance: {{REPOSITORY_ID}}
Schema catalog version used by the assisted workflow: {{CATALOG_VERSION}}

Investigate independently. Do not read benchmark expectations or previous benchmark results.

## Shared authoring contract

1. Model one canonical concept for each evidenced knowledge entity under role-oriented roots: `domains/`, `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`, `infrastructure/`, `deployments/` and `repositories/`. Directory placement classifies an entity; links express composition and implementation.
2. Choose the smallest independently useful unit. Keep related CRUD operations in one API Surface and implementation-only handlers inside their component. Split a Lambda, worker or server capability only for an independent contract, trigger, lifecycle, ownership, permission, failure, operational or important graph boundary. Preserve an evidenced parent Service or Software Component even when its runtime children are independently useful concepts; child inventory never substitutes for the parent boundary.
3. Treat Repository, System and Domain as different roles. A Repository records source-specific structure and links canonical entities. Create a Domain only from explicit business-boundary or owner evidence.
4. Distinguish desired-state infrastructure definitions, genuinely reusable Terraform modules and evidenced deployed instances. Configuration does not prove an account, region, ARN or deployed resource.
5. Use only evidence-supported types and metadata. The initial graph may be incomplete: record uncertainty or contradictions in the affected concept's `# Limitations` rather than inventing knowledge, forcing a concept count or creating Open Question concepts. When documentation states a numeric policy or behavior, compare the relevant configuration and implementation and surface disagreements rather than choosing one silently.
6. Write useful Markdown bodies explaining purpose, boundaries, interactions and operationally relevant behavior. Do not emit frontmatter-heavy stubs or file-by-file inventories. Include every schema-recommended section, using Limitations for bounded missing or conflicting evidence.
7. Every concept must have AgentBase draft frontmatter. Give important `sources` stable IDs and normalized exact resources `repository://{{REPOSITORY_ID}}/<relative-path>#Lx-Ly`.
8. A concept's durable identity is exactly its normalized path relative to the OKF root with `.md` removed: `components/worker.md` has identity `components/worker`. Never use type-prefixed aliases and never include the outer `okf/` directory. Persist only canonical relationship directions allowed by the selected schema. Every relationship has `evidence: [<source-id>, ...]` and one resolving Markdown link. Never persist an inverse duplicate; MCP derives inbound navigation. Insufficient or contradictory evidence remains a limitation.
9. A Business Flow represents evidenced ordered behavior across participants. Add contiguous `flow_steps`, each with exact path-derived `source` and `target` identities, canonical `action`, synchronous/asynchronous `mode` and source `evidence`.
10. Keep navigation progressive. Create any needed category indexes first. Root `index.md` has only `okf_version: "0.2"`, one heading and at most three bounded `* [Title](path) - description` entries to existing `domains/index.md`, `systems/index.md` or `repositories/index.md`. Domain concepts navigate Systems and critical flows; System concepts navigate useful entities without copying them. If Domain evidence is absent, use System and Repository category indexes.
11. Before finishing, verify durable identities, type choices, source spans, links, edge evidence, flow order, category navigation, every recommended section and body usefulness. Separately list unresolved items that a maintainer could answer later.

## Arm-specific workflow

1. Investigate only the authorized repository source, documentation and Git history with ordinary host-agent capabilities. AgentBase MCP and its schema catalog are not available in this baseline.
2. Understand architecture, consumer, runtime, infrastructure and business-flow boundaries from source evidence. Generic same-name calls are not proof.
3. Create the bundle only under `{{OUTPUT_ROOT}}/okf` and perform the shared final review before finishing.

Do not create claims, metrics, reports, graph dumps, scripts or files outside `{{OUTPUT_ROOT}}/okf`. Never modify the source repository. Your final response should briefly list canonical concept identities, limitations and unresolved items.
