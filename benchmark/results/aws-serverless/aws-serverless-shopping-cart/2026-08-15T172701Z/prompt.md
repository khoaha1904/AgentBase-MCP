You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): <SOURCE_ROOT>
Output directory (the only writable task path): <OUTPUT_ROOT>
Repository ID for provenance: repository-aws-serverless-shopping-cart-708d65caf454
Schema catalog version: 5.0.0
Owner-confirmed Domain: Commerce (domains/commerce); evidence agentbase://owner-guidance/domains/commerce

Investigate independently. Do not read benchmark expectations or previous benchmark results.

## Shared authoring contract

1. Model one canonical concept for each evidenced knowledge entity under role-oriented roots: `domains/`, `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`, `infrastructure/`, `deployments/` and `repositories/`. Directory placement classifies an entity; links express composition and implementation.
2. Choose the smallest independently useful unit. Keep related CRUD operations in one API Surface and implementation-only handlers inside their component. Split a Lambda, worker or server capability only for an independent contract, trigger, lifecycle, ownership, permission, failure, operational or important graph boundary. Preserve an evidenced parent Service or Software Component even when runtime children are separate concepts.
3. Treat Repository, System and Domain as different roles. Never infer Domain from repository or product names. When `Commerce (domains/commerce); evidence agentbase://owner-guidance/domains/commerce` is not `None`, create or reuse that exact Domain, add its `agentbase://owner-guidance/...` resource to the Domain and System sources, and make the current System `part-of` relationship cite that owner-guidance source ID. Repository resources support code claims, not the owner's business classification.
4. Distinguish desired-state infrastructure definitions, genuinely reusable Terraform modules and evidenced deployed instances. Configuration does not prove an account, region, ARN or deployed resource.
5. Use only evidence-supported types and metadata. The initial graph may be incomplete: record uncertainty or contradictions in the affected concept's `# Limitations` rather than inventing knowledge, forcing a concept count or creating Open Question concepts. Compare documented numeric policies with relevant configuration and implementation and surface disagreements rather than choosing silently.
6. Write useful Markdown bodies explaining purpose, boundaries, interactions and operationally relevant behavior. Include every schema-recommended section; do not emit frontmatter-heavy stubs or file inventories.
7. Every concept uses AgentBase draft frontmatter. Give important `sources` stable IDs and exact repository resources `repository://repository-aws-serverless-shopping-cart-708d65caf454/<relative-path>#Lx-Ly`; the confirmed Domain resource is the only owner-guidance exception supplied by this prompt.
8. A concept's durable identity is its normalized path relative to the OKF root without `.md`; never include the outer `okf/`. Persist only canonical relationship directions. Every relationship has source-ID evidence and a resolving Markdown link; never persist inverse duplicates.
9. A Business Flow has contiguous ordered `flow_steps` with exact path identities, canonical action, synchronous/asynchronous mode and evidence.
10. Keep navigation progressive. Root `index.md` has `okf_version: "0.2"`, exact heading `# AgentBase-Hub`, and at most three entries to existing `domains/index.md`, `systems/index.md` or `repositories/index.md`. Every root and category index entry starts with literal `* `; never use `- `, numbered markers or bare links in any index. A confirmed Domain navigates Systems and critical flows; a System navigates useful entities. Never replace the shared Hub heading with the repository title.
11. Before finishing, verify identities, types, source spans, links, owner evidence, edge evidence, flow order, every index marker, category navigation, recommended sections and body usefulness. Separately list unresolved items for later maintainer review.

## Arm-specific workflow

1. Use the AgentBase MCP `index_repository` tool exactly once for the source repository.
2. Before requesting schemas, use MCP graph tools and authorized source/docs/history to identify evidenced architecture, consumer, runtime, infrastructure and business-flow boundaries. Generic same-name calls are not proof.
3. Only after investigation, call `get_okf_authoring_schemas` once with one short signal per evidenced role or behavior. Include `business domain` when the prompt supplies a confirmed Domain. Use the complete returned schemas.
4. When graph evidence is missing, inspect authorized source, documentation and Git history. Never modify the source repository.
5. Create the bundle only under `<OUTPUT_ROOT>/okf`.
6. Call `validate_okf_changes` with every created concept, exact path-derived identities and `targets: []`. Repair failures only until valid, then perform the shared final review.

Do not create files outside `<OUTPUT_ROOT>/okf`. Your final response should briefly list canonical identities, limitations and unresolved items.
