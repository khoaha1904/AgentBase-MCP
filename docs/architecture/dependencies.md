# Dependency direction

> Status: Accepted dependency direction. Group 3 pure-projection reuse and
> Group 4 Profile/Layout, migration and final admission use the public core
> boundary as designed; the dependency direction remains unchanged. Group 4 and
> G5-C1 compact layout are implemented and verified.
> G5-C2 is deferred and adds no current dependency.

Cross-capability imports use the target capability's public `index.ts`.

```text
app -> core public entrypoints
app -> provider public entrypoints
provider -> core public entrypoints
core -X-> provider/app
provider -X-> app
```

Core owns provider-neutral policy and values. Providers translate external
service behavior into those contracts. Application capabilities compose
core and provider entrypoints into user workflows; they do not redefine either
boundary. `src/cli.ts` is the composition root and may dispatch application
entrypoints without becoming their behavior owner.

Dependency Cruiser enforces cycles, dependency direction and public-entrypoint
use. Stable controls and their acceptance evidence are defined by
[`AB-FND-010..014`](../capabilities/12-version-scope/01-foundation-requirements.md#architecture-and-verification).

Group 3 keeps source access and evidence rendering outside the pure knowledge
models. Application workflows pass admitted values into `core/knowledge/query`
and `core/knowledge/proposals`; core never reads a checkout, invokes a provider,
opens Benchmark data or imports an application renderer. Retained deterministic
qualification tests invoke public application/runtime entrypoints using local
fixtures. No application script assumes a sibling Benchmark checkout or generated
site destination. Production modules never import suites, results or runner code.
Review and visualization consume the same public impact
model rather than importing one another.

Group 4 Profile/Layout policy is a pure `core/knowledge` entrypoint. Schema
definitions provide type-relative hints to it; they do not import application
home plans. Hub authoring, query, review, visualization, CI and migration import
that public core boundary. The release builder may import exported profile
identity constants for manifest declarations, but core never imports release,
migration, filesystem checkout or MCP adapters. Legacy-layout classification
and Profile 1.0 validation share the parser; no parallel compatibility parser is
allowed.

Group 5 removes schema-to-directory coupling: authoring asks the public
knowledge boundary whether a document is Domain, Repository, Question, Profile
or type-neutral knowledge, rather than importing catalog path hints. Ordinary
query does not import authoring state or make it Published authority. The
deferred semantic-quality design adds no packet/report API, model SDK or draft
query dependency to the current runtime.
