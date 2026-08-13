import { CodebaseMemoryAdapter, indexRepository, type CodebaseMemoryAdapterOptions } from "./adapter.ts";
import type { ManagedPackageOptions } from "./managed-package.ts";
import { resolveManagedPackage } from "./managed-package.ts";
import { invokeProviderTool } from "./process.ts";
import { openScopedSession, type ProviderCleanup, type ScopedSessionOptions } from "./session.ts";
import type { EngineIdentity } from "../../core/observations/index.ts";
import type { TaskContextProvider } from "../../core/code-intelligence/index.ts";

export const CODEBASE_MEMORY_PACKAGE = "codebase-memory-mcp" as const;
export const CODEBASE_MEMORY_VERSION = "0.10.1" as const;
export const CODEBASE_MEMORY_INVOCATION = "one-shot-cli" as const;
export type CodebaseMemoryTransport = "one-shot" | "scoped-session";

export type CodebaseMemoryProviderOptions = Omit<CodebaseMemoryAdapterOptions, "invoke"> & Readonly<{
  cacheRoot: string;
  managedPackage?: ManagedPackageOptions;
  timeoutMs?: number;
}>;

export type ManagedCodebaseMemoryProvider = Readonly<{
  provider: TaskContextProvider;
  identity: EngineIdentity;
  transport: CodebaseMemoryTransport;
  indexRepository(): Promise<unknown>;
  close(): Promise<ProviderCleanup>;
}>;

export async function createCodebaseMemoryProvider(options: CodebaseMemoryProviderOptions): Promise<ManagedCodebaseMemoryProvider> {
  const managed = await resolveManagedPackage(options.managedPackage ?? { projectRoot: process.cwd() });
  const invoke = (tool: Parameters<typeof invokeProviderTool>[0]["tool"], argumentsValue: Readonly<Record<string, unknown>>) => invokeProviderTool({
    binary: managed.executable,
    tool,
    arguments: argumentsValue,
    cwd: options.repositoryRoot,
    environment: {
      CBM_CACHE_DIR: options.cacheRoot,
      CBM_ALLOWED_ROOT: options.repositoryRoot,
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
    },
    timeoutMs: options.timeoutMs ?? 30_000,
    maximumStdoutBytes: 2_000_000,
    maximumStderrBytes: 256_000,
  });
  const provider = new CodebaseMemoryAdapter({
    repositoryId: options.repositoryId,
    repositoryRoot: options.repositoryRoot,
    project: options.project,
    invoke,
  });
  return {
    provider,
    identity: managed.identity,
    transport: "one-shot",
    indexRepository: () => indexRepository(options.project, options.repositoryRoot, invoke),
    close: async () => ({ status: "clean", pid: null, graceful: true, forced: false, stderrBytes: 0 }),
  };
}

export type ScopedCodebaseMemoryProviderOptions = CodebaseMemoryProviderOptions & Readonly<{
  session?: Partial<Omit<ScopedSessionOptions, "binary" | "cwd" | "environment">>;
}>;

export async function createScopedCodebaseMemoryProvider(options: ScopedCodebaseMemoryProviderOptions): Promise<ManagedCodebaseMemoryProvider> {
  const managed = await resolveManagedPackage(options.managedPackage ?? { projectRoot: process.cwd() });
  const session = await openScopedSession({
    binary: managed.executable,
    cwd: options.repositoryRoot,
    environment: {
      CBM_CACHE_DIR: options.cacheRoot,
      CBM_ALLOWED_ROOT: options.repositoryRoot,
      CBM_LOG_LEVEL: "error",
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
    },
    connectTimeoutMs: 30_000,
    requestTimeoutMs: options.timeoutMs ?? 30_000,
    totalTimeoutMs: 180_000,
    maximumMessageBytes: 2_000_000,
    maximumStderrBytes: 256_000,
    gracefulShutdownMs: 5_000,
    forceShutdownMs: 5_000,
    ...options.session,
  });
  const provider = new CodebaseMemoryAdapter({
    repositoryId: options.repositoryId,
    repositoryRoot: options.repositoryRoot,
    project: options.project,
    invoke: session.invoke,
  });
  return {
    provider,
    identity: { ...managed.identity, invocationMode: "scoped-session" },
    transport: "scoped-session",
    indexRepository: () => indexRepository(options.project, options.repositoryRoot, session.invoke),
    close: session.close,
  };
}

export { CodebaseMemoryAdapter, indexRepository, type CodebaseMemoryAdapterOptions, type ProviderInvoker } from "./adapter.ts";
export { CodebaseMemoryError, type CodebaseMemoryErrorCode } from "./errors.ts";
export { resolveManagedPackage, type ManagedPackage, type ManagedPackageOptions } from "./managed-package.ts";
export {
  openScopedSession,
  type ProviderCleanup,
  type ProviderToolDescriptor,
  type ScopedSession,
  type ScopedSessionOptions,
} from "./session.ts";
