# Contract: Foundation Code Intelligence

## Public capability

The `core/code-intelligence` entrypoint exposes provider-neutral operations:

```text
repositoryMap(repositoryId) -> repository map result
relevantNeighborhood(query) -> neighborhood result
```

The contract is asynchronous so a future provider may use a child process, but
Capability 001's fake resolves deterministically in memory.

## Required conformance scenarios

Every provider must run the same scenarios:

1. return one normalized complete repository map;
2. return the accepted subject neighborhood with all expected nodes and edges;
3. return identical normalized ordering when provider insertion order changes;
4. distinguish missing snapshot from unknown subject;
5. return a successful empty neighborhood for a known isolated subject;
6. reject duplicate identifiers and dangling edge endpoints;
7. expose limitations through provider-neutral diagnostics only.

The future real provider may add conformance scenarios but cannot weaken these
without amending the living requirement.

## Foundation demonstration

One application flow requests the map, prints a deterministic summary, requests
the accepted subject neighborhood and prints the normalized result. The flow:

- uses the fake only through the public contract;
- starts no daemon or external engine;
- performs no network or credential access;
- exits non-zero for typed failure results;
- never prints a partial result as complete.

## Compatibility boundary

Provider-private cache paths, graph records, version commands and engine error
payloads stay behind adapters. Adding Codebase Memory later must translate its
surface into this contract and pass the same suite.
