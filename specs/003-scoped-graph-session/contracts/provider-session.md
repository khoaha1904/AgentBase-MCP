# Contract: Scoped Codebase Memory Session

## Purpose

Serve the existing provider adapter through one bounded process for a complete
evidence round without exposing MCP protocol values to core or application
callers.

## Public provider shape

```ts
type CodebaseMemoryTransport = "one-shot" | "scoped-session";

type ManagedCodebaseMemoryProvider = Readonly<{
  provider: TaskContextProvider;
  identity: EngineIdentity;
  transport: CodebaseMemoryTransport;
  indexRepository(): Promise<unknown>;
  close(): Promise<ProviderCleanup>;
}>;
```

The provider factory receives exact managed-package, repository, workspace and
limit inputs. It does not accept a binary path.

## Session behavior

1. Resolve and admit the package-private executable using the existing managed
   package boundary.
2. Spawn it without CLI subcommands so it uses documented stdio MCP-server
   mode.
3. Supply only the exact repository/cache locale environment already accepted
   by Capability 002, plus explicit UI/watch-disabling values proven by the
   compatibility spike.
4. Connect through the official client and negotiate a supported protocol.
5. Convert each adapter invocation into `tools/call` and return the tool result
   shape expected by existing response parsers.
6. Reject MCP `isError`, missing result content, timeout and limit exhaustion as
   typed provider failures.
7. Close once after the full evidence round; close is idempotent.

## Bounds

- connection timeout;
- individual request timeout;
- total session deadline;
- maximum protocol message size;
- cumulative stderr byte limit;
- graceful close timeout and forced-termination timeout.

Each bound produces a distinct typed error or cleanup result. A timeout never
falls back to one-shot.

## Cleanup result

```ts
type ProviderCleanup = Readonly<{
  status: "clean" | "failed";
  pid: number | null;
  graceful: boolean;
  forced: boolean;
  stderrBytes: number;
}>;
```

Real acceptance additionally checks that no provider process associated with
the isolated benchmark arm remains after close.

## Compatibility

- Existing one-shot callers remain valid.
- Existing `CodebaseMemoryAdapter`, response parsers and normalized evidence do
  not change their provider-neutral output.
- Transport and timing diagnostics are outside `RepositoryEvidenceBundle` and
  its digest.
