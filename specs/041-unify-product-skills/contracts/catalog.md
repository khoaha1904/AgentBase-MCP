# Contract: Released Product Skills

| Audience | Canonical skill | User goal |
|---|---|---|
| Public | `agentbase-query` | Ask across Published Hub and authorized local code |
| Public | `agentbase-ingest` | Initial Ingest one repository |
| Public | `agentbase-refresh` | Refresh one existing Repository contribution |
| Public | `agentbase-batch-ingest` | Initial Ingest 2–32 repositories in one Domain |
| Public | `agentbase-domain-enrichment` | Enrich one Published Domain from bounded provider evidence |
| Public | `agentbase-hub` | Configure and operate Hub lifecycle |
| Internal | `use-codebase-memory` | Reusable one-repository Code Graph workflow |
| Internal | `agentbase-okf` | Prepared-workspace OKF authoring and validation |

## Explicit invocation

- Codex: `$<canonical-skill>` or selection through `/skills`.
- Claude Code: `/<canonical-skill>`.
- Natural-language matching remains the default product experience.
- No `abs-*` alias is part of the release contract.

## Query authorization

`agentbase-query` may use only Published Hub search/read and the bounded local
Code Graph workflow. It does not authorize any knowledge, provider or remote
mutation.
