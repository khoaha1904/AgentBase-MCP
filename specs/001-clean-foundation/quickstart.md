# Quickstart: Validate the Clean Foundation

This guide describes the expected validation flow after implementation. It does
not install or start a real Code Intelligence engine.

## Prerequisite

- Node.js `>=24.12 <25`.
- Development dependencies installed from the accepted lockfile.

## Complete local gate

```bash
npm run verify
```

Expected outcome: specification, type, architecture, test and diff checks pass
offline.

## Visible demonstration

```bash
npm run demo
```

Expected outcome:

1. a deterministic summary of all 12 fixture files is shown;
2. the accepted relevant-neighborhood query is shown;
3. the neighborhood references no more than three files and includes all
   expected nodes and edges;
4. no external engine, network request, credential prompt or background process
   is used.

The snapshot limitation explicitly states that the data is fake and no source
parsing was performed. This demonstration validates the AgentBase contract and
flow, not real-engine indexing performance.

## Focused evidence

```bash
npm run test:code-intelligence
npm run test:fake-provider
npm run test:foundation-demo
npm run architecture:check
```

Each command addresses one owner boundary. The complete gate remains the final
acceptance evidence.
