You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): <SOURCE_ROOT>
Output directory (the only writable task path): <OUTPUT_ROOT>
Repository ID for provenance: repository-aws-serverless-shopping-cart-708d65caf454
Schema catalog version: 4.0.0

Investigate independently. Do not read benchmark expectations or previous benchmark results.

## Shared authoring contract

1. Model one canonical concept for each evidenced knowledge entity. Use entity-role roots such as `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`, `infrastructure/`, `deployments/` and `repositories/`; use links for composition and implementation instead of copying a system tree under a repository.
2. Choose the smallest independently useful unit. Keep related CRUD routes in one API Surface and implementation-only handlers inside their component unless independent ownership, lifecycle, contract, failure or operational significance is evidenced.
3. Treat Repository, System and Domain as different roles. A Repository records source-specific structure and links to canonical entities. Create a Domain only from explicit business-boundary or owner evidence.
4. Distinguish a Terraform root infrastructure definition, a genuinely reusable Terraform module and an evidenced deployment instance. Do not infer deployed state from configuration alone.
5. Use only evidence-supported types and metadata. The initial graph may be incomplete: record uncertainty in a `# Limitations` section instead of inventing knowledge or forcing a concept count.
6. Write useful Markdown bodies that explain purpose, boundaries, interactions and operationally relevant behavior from evidence. Do not emit frontmatter-heavy stubs or file-by-file inventories.
7. Every concept must have normal AgentBase draft frontmatter. Every source must use `repository://repository-aws-serverless-shopping-cart-708d65caf454/<relative-path>#Lx-Ly` with normalized paths and exact line spans.
8. Encode each evidence-supported relationship in frontmatter and as a resolving Markdown link to the canonical target. If evidence is insufficient, keep it as a limitation.
9. Root `index.md` must contain only frontmatter whose sole key is `okf_version: "0.2"`, one heading, and entries using exactly `* [Title](relative/concept.md) - optional description`. Hyphen bullets, root prose, tables and extra frontmatter keys are invalid. Keep the bundle sparse and avoid creating new Open Question concepts.
10. Before finishing, verify identities, type choices, source spans, links and body usefulness. In the final response, separately list any unresolved items that a maintainer could answer later.

## Arm-specific workflow

1. Use the AgentBase MCP `index_repository` tool exactly once for the source repository.
2. Use MCP graph tools to understand architecture, infrastructure resources, interfaces, flows and relationships. Generic same-name calls are not proof.
3. After investigation, call `get_okf_authoring_schemas` once with concise evidence signals. Use the returned complete schema definitions and do not call the fine-grained catalog tools.
4. When graph evidence is missing, inspect authorized source files, documentation and Git history. Never modify the source repository.
5. Create the bundle only under `<OUTPUT_ROOT>/okf`.
6. Call `validate_okf_bundle` with every concept as `{ identity: <exact bundle-relative concept path without .md>, path: <bundle-relative path>, content: <exact full Markdown> }`. Repair reported failures and repeat only until the bundle is valid, then perform the shared final review.

Do not create claims, metrics, reports, graph dumps, scripts or files outside `<OUTPUT_ROOT>/okf`. Your final response should briefly list canonical concept identities, limitations and unresolved items.
