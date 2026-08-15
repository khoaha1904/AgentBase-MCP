You are producing an AgentBase OKF benchmark artifact for one pinned source repository.

Source repository (read-only): {{SOURCE_ROOT}}
Output directory (the only writable task path): {{OUTPUT_ROOT}}
Repository ID for provenance: {{REPOSITORY_ID}}
Schema catalog version used by the assisted workflow: {{CATALOG_VERSION}}
Owner-confirmed Domain: {{CONFIRMED_DOMAIN}}

Investigate independently. Do not read benchmark expectations or previous benchmark results.

## Shared authoring contract

1. Model one canonical concept for each evidenced knowledge entity under role-oriented roots: `domains/`, `systems/`, `components/`, `interfaces/`, `flows/`, `resources/`, `infrastructure/`, `deployments/` and `repositories/`. Directory placement classifies an entity; links express composition and implementation.
2. Choose the smallest independently useful unit. Keep related CRUD operations in one API Surface and implementation-only handlers inside their component. Split a Lambda, worker or server capability only for an independent contract, trigger, lifecycle, ownership, permission, failure, operational or important graph boundary. Preserve an evidenced parent Service or Software Component even when runtime children are separate concepts.
3. Treat Repository, System and Domain as different roles. Never infer Domain from repository or product names. When `{{CONFIRMED_DOMAIN}}` is not `None`, create or reuse that exact Domain, add its `agentbase://owner-guidance/...` resource to the Domain and System sources, and make the current System `part-of` relationship cite that owner-guidance source ID. Repository resources support code claims, not the owner's business classification.
4. Distinguish desired-state infrastructure definitions, genuinely reusable Terraform modules and evidenced deployed instances. Configuration does not prove an account, region, ARN or deployed resource.
5. Use only evidence-supported types and metadata. The initial graph may be incomplete: record uncertainty or contradictions in the affected concept's `# Limitations` rather than inventing knowledge, forcing a concept count or creating Open Question concepts. Compare documented numeric policies with relevant configuration and implementation and surface disagreements rather than choosing silently.
6. Write useful Markdown bodies explaining purpose, boundaries, interactions and operationally relevant behavior. Include every schema-recommended section; do not emit frontmatter-heavy stubs or file inventories.
7. Every concept uses AgentBase draft frontmatter. Give important `sources` stable IDs and exact repository resources `repository://{{REPOSITORY_ID}}/<relative-path>#Lx-Ly`; the confirmed Domain resource is the only owner-guidance exception supplied by this prompt.
8. A concept's durable identity is its normalized path relative to the OKF root without `.md`; never include the outer `okf/`. Persist only canonical relationship directions. Every relationship has source-ID evidence and a resolving Markdown link; never persist inverse duplicates.
9. A Business Flow has contiguous ordered `flow_steps` with exact path identities, canonical action, synchronous/asynchronous mode and evidence.
10. Keep navigation progressive. Root `index.md` has `okf_version: "0.2"`, exact heading `# AgentBase-Hub`, and at most three entries to existing `domains/index.md`, `systems/index.md` or `repositories/index.md`. Every root and category index entry starts with literal `* `; never use `- `, numbered markers or bare links in any index. A confirmed Domain navigates Systems and critical flows; a System navigates useful entities. Never replace the shared Hub heading with the repository title.
11. Before finishing, verify identities, types, source spans, links, owner evidence, edge evidence, flow order, every index marker, category navigation, recommended sections and body usefulness. Separately list unresolved items for later maintainer review.

## Arm-specific workflow

1. Investigate only the authorized repository source, documentation and Git history with ordinary host-agent capabilities. AgentBase MCP and its schema catalog are unavailable in this baseline.
2. Understand architecture, consumer, runtime, infrastructure and business-flow boundaries from source evidence. Generic same-name calls are not proof.
3. Create the bundle only under `{{OUTPUT_ROOT}}/okf` and perform the shared final review before finishing.

Do not create files outside `{{OUTPUT_ROOT}}/okf`. Never modify the source repository. Your final response should briefly list canonical identities, limitations and unresolved items.
