# Dependency direction

Cross-capability imports use the target capability's public `index.ts`.

```text
app -> core public entrypoints
app -> provider public entrypoints
provider -> core public entrypoints
core -X-> provider/app
provider -X-> app
```

Core owns provider-neutral policy and values. Providers translate external or
engine-private behavior into those contracts. Application capabilities compose
core and provider entrypoints into user workflows; they do not redefine either
boundary. `src/cli.ts` is the composition root and may dispatch application
entrypoints without becoming their behavior owner.

Dependency Cruiser enforces cycles, dependency direction and public-entrypoint
use. Stable controls and their acceptance evidence are defined by
[`AB-FND-010..014`](../capabilities/12-version-scope/01-foundation-requirements.md#architecture-and-verification).
