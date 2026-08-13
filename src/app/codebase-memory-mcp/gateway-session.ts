import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { isCallToolResult, type CallToolResult } from "@modelcontextprotocol/server";

import {
  openScopedSession,
  resolveManagedPackage,
  type ProviderCleanup,
  type ProviderToolDescriptor,
  type ScopedSession,
} from "../../providers/codebase-memory/index.ts";
import { assertProviderManifest, isSafeToolName, SAFE_TOOL_NAMES, type SafeToolName } from "./tool-manifest.ts";
import { controlledIndex } from "./tool-policy.ts";

export type RawProviderFactory = (options: Readonly<{
  repositoryRoot: string;
  cacheRoot: string;
}>) => Promise<ScopedSession>;

export type GatewaySessionOptions = Readonly<{
  projectRoot: string;
  stateRoot?: string;
  providerFactory?: RawProviderFactory;
}>;

function privateCache(stateRoot: string, repositoryRoot: string): string {
  const root = path.resolve(stateRoot);
  if (root === repositoryRoot || root.startsWith(`${repositoryRoot}${path.sep}`)) throw new Error("MCP cache must remain outside source");
  const cache = path.join(root, "mcp", "codebase-memory", "0.10.1",
    createHash("sha256").update(repositoryRoot).digest("hex").slice(0, 24));
  fs.mkdirSync(cache, { recursive: true, mode: 0o700 });
  fs.chmodSync(cache, 0o700);
  return cache;
}

function defaultStateRoot(): string {
  const owner = typeof process.getuid === "function" ? process.getuid() : "portable";
  return path.join(os.tmpdir(), `agentbase-${owner}`);
}

function defaultProviderFactory(projectRoot: string): RawProviderFactory {
  return async ({ repositoryRoot, cacheRoot }) => {
    const managed = await resolveManagedPackage({ projectRoot });
    return openScopedSession({
      binary: managed.executable,
      cwd: repositoryRoot,
      environment: {
        CBM_CACHE_DIR: cacheRoot,
        CBM_ALLOWED_ROOT: repositoryRoot,
        CBM_LOG_LEVEL: "error",
        LANG: "C.UTF-8",
        LC_ALL: "C.UTF-8",
      },
      connectTimeoutMs: 30_000,
      requestTimeoutMs: 60_000,
      totalTimeoutMs: 3_600_000,
      maximumMessageBytes: 4_000_000,
      maximumStderrBytes: 256_000,
      gracefulShutdownMs: 5_000,
      forceShutdownMs: 5_000,
      requiredTools: SAFE_TOOL_NAMES,
      rejectToolErrors: false,
    });
  };
}

export class GatewaySession {
  readonly #stateRoot: string;
  readonly #providerFactory: RawProviderFactory;
  #repositoryRoot?: string;
  #provider?: ScopedSession;
  #binding: Promise<ScopedSession> | null = null;
  #closePromise?: Promise<ProviderCleanup>;

  constructor(options: GatewaySessionOptions) {
    this.#stateRoot = options.stateRoot ?? defaultStateRoot();
    this.#providerFactory = options.providerFactory ?? defaultProviderFactory(options.projectRoot);
  }

  get repositoryRoot(): string | undefined { return this.#repositoryRoot; }

  async #bind(repositoryRoot: string): Promise<ScopedSession> {
    if (this.#provider) return this.#provider;
    if (this.#binding) return this.#binding;
    this.#binding = (async () => {
      const cacheRoot = privateCache(this.#stateRoot, repositoryRoot);
      const provider = await this.#providerFactory({ repositoryRoot, cacheRoot });
      try { assertProviderManifest(provider.tools); }
      catch (error) { await provider.close(); throw error; }
      this.#repositoryRoot = repositoryRoot;
      this.#provider = provider;
      return provider;
    })();
    try { return await this.#binding; }
    finally { this.#binding = null; }
  }

  async call(tool: string, argumentsValue: Readonly<Record<string, unknown>>): Promise<CallToolResult> {
    if (!isSafeToolName(tool)) throw new Error(`tool is not exposed by AgentBase: ${tool}`);
    let provider = this.#provider;
    let providerArguments = argumentsValue;
    if (tool === "index_repository") {
      const controlled = controlledIndex(argumentsValue, this.#repositoryRoot);
      provider = await this.#bind(controlled.repositoryRoot);
      providerArguments = controlled.arguments;
    } else if (!provider) {
      throw new Error("index_repository must select one repository before graph reads on this MCP connection");
    }
    const result = await provider.invoke(tool as SafeToolName, providerArguments);
    if (!isCallToolResult(result)) throw new Error(`provider returned an invalid MCP result for ${tool}`);
    return result;
  }

  close(): Promise<ProviderCleanup> {
    if (this.#closePromise) return this.#closePromise;
    this.#closePromise = (async () => {
      const binding = this.#binding;
      if (binding) await binding.catch(() => undefined);
      if (!this.#provider) return { status: "clean", pid: null, graceful: true, forced: false, stderrBytes: 0 };
      return this.#provider.close();
    })();
    return this.#closePromise;
  }
}
