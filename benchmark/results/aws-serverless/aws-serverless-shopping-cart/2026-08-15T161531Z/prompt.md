You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): <SOURCE_ROOT>
Output directory (the only writable task path): <OUTPUT_ROOT>
Repository ID for provenance: repository-aws-serverless-shopping-cart-708d65caf454
Schema catalog version: 5.0.0

Investigate independently. Do not read benchmark expectations or previous benchmark results.

## Shared authoring contract

1. Model one canonical concept for each evidenced knowledge entity under role-oriented roots: `domains/`, `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`, `infrastructure/`, `deployments/` and `repositories/`. Directory placement classifies an entity; links express composition and implementation.
2. Choose the smallest independently useful unit. Keep related CRUD operations in one API Surface and implementation-only handlers inside their component. Split a Lambda, worker or server capability only for an independent contract, trigger, lifecycle, ownership, permission, failure, operational or important graph boundary.
3. Treat Repository, System and Domain as different roles. A Repository records source-specific structure and links canonical entities. Create a Domain only from explicit business-boundary or owner evidence.
4. Distinguish desired-state infrastructure definitions, genuinely reusable Terraform modules and evidenced deployed instances. Configuration does not prove an account, region, ARN or deployed resource.
5. Use only evidence-supported types and metadata. The initial graph may be incomplete: record uncertainty or contradictions in the affected concept's `# Limitations` rather than inventing knowledge, forcing a concept count or creating Open Question concepts.
6. Write useful Markdown bodies explaining purpose, boundaries, interactions and operationally relevant behavior. Do not emit frontmatter-heavy stubs or file-by-file inventories.
7. Every concept must have AgentBase draft frontmatter. Give important `sources` stable IDs and normalized exact resources `repository://repository-aws-serverless-shopping-cart-708d65caf454/<relative-path>#Lx-Ly`.
8. Persist only canonical relationship directions allowed by the selected schema. Every relationship has `evidence: [<source-id>, ...]` and one resolving Markdown link. Never persist an inverse duplicate; MCP derives inbound navigation. Insufficient or contradictory evidence remains a limitation.
9. A Business Flow represents evidenced ordered behavior across participants. Add contiguous `flow_steps`, each with exact `source`, canonical `action`, exact `target`, synchronous/asynchronous `mode` and source `evidence`.
10. Keep navigation progressive. Root `index.md` has only `okf_version: "0.2"`, one heading and bounded `* [Title](path) - description` entries to existing Domain, System and Repository indexes. Domain concepts navigate Systems and critical flows; System concepts navigate useful entities without copying them. If Domain evidence is absent, use bounded System and Repository entrypoints.
11. Before finishing, verify identities, type choices, source spans, links, edge evidence, flow order, navigation and body usefulness. Separately list unresolved items that a maintainer could answer later.

## Arm-specific workflow

1. Use the AgentBase MCP `index_repository` tool exactly once for the source repository.
2. Use MCP graph tools to understand architecture, infrastructure, interfaces, flows and relationships. Generic same-name calls are not proof.
3. Call `get_okf_authoring_schemas` once with concise evidence signals. Use the returned complete schemas and do not call fine-grained catalog tools.
4. When graph evidence is missing, inspect authorized source, documentation and Git history. Never modify the source repository.
5. Create the bundle only under `<OUTPUT_ROOT>/okf`.
6. Call `validate_okf_changes` with every created concept as `changes` using exact identity, bundle-relative path and full Markdown, and `targets: []` because this isolated benchmark begins without accepted Hub concepts. Repair failures and repeat only until valid, then perform the shared final review.

Do not create claims, metrics, reports, graph dumps, scripts or files outside `<OUTPUT_ROOT>/okf`. Your final response should briefly list canonical concept identities, limitations and unresolved items.
