import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import type { CodebaseMemoryTool } from "./adapter.ts";
import { CodebaseMemoryError } from "./errors.ts";
import { providerProcessEnvironment } from "./provider-environment.ts";

const REQUIRED_TOOLS: readonly CodebaseMemoryTool[] = [
  "index_repository", "get_architecture", "search_graph", "trace_path", "get_code_snippet",
];

export type ProviderToolDescriptor = Readonly<{
  name: string;
  title?: string;
  description?: string;
  inputSchema: Readonly<Record<string, unknown>>;
  annotations?: Readonly<Record<string, unknown>>;
}>;

type StderrSource = Readonly<{
  on(event: "data", listener: (chunk: Buffer | string) => void): unknown;
}>;

export type SessionConnection = Readonly<{
  pid: number | null;
  stderr: StderrSource | null;
  connect(timeoutMs: number): Promise<void>;
  listTools(timeoutMs: number): Promise<readonly (string | ProviderToolDescriptor)[]>;
  callTool(name: string, argumentsValue: Readonly<Record<string, unknown>>, timeoutMs: number): Promise<unknown>;
  close(): Promise<void>;
  forceClose(): Promise<void>;
  isAlive(): boolean;
}>;

export type SessionConnectionFactory = (options: Readonly<{
  binary: string;
  cwd: string;
  environment: Readonly<Record<string, string>>;
  maximumMessageBytes: number;
}>) => SessionConnection;

export type ProviderCleanup = Readonly<{
  status: "clean" | "failed";
  pid: number | null;
  graceful: boolean;
  forced: boolean;
  stderrBytes: number;
}>;

export type ScopedSession = Readonly<{
  invoke(tool: string, argumentsValue: Readonly<Record<string, unknown>>): Promise<unknown>;
  tools: readonly ProviderToolDescriptor[];
  pid: number | null;
  close(): Promise<ProviderCleanup>;
}>;

export type ScopedSessionOptions = Readonly<{
  binary: string;
  cwd: string;
  environment: Readonly<Record<string, string>>;
  connectTimeoutMs: number;
  requestTimeoutMs: number;
  totalTimeoutMs: number;
  maximumMessageBytes: number;
  maximumStderrBytes: number;
  gracefulShutdownMs: number;
  forceShutdownMs: number;
  signal?: AbortSignal;
  now?: () => number;
  connectionFactory?: SessionConnectionFactory;
  requiredTools?: readonly string[];
  rejectToolErrors?: boolean;
}>;

function timeout<T>(promise: Promise<T>, milliseconds: number, error: CodebaseMemoryError): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(error), milliseconds);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (cause) => { clearTimeout(timer); reject(cause); },
    );
  });
}

function cancellation<T>(promise: Promise<T>, signal: AbortSignal | undefined, operation: string): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new CodebaseMemoryError("SESSION_CANCELLED", operation, "provider session was cancelled"));
  return new Promise((resolve, reject) => {
    const aborted = () => reject(new CodebaseMemoryError("SESSION_CANCELLED", operation, "provider session was cancelled"));
    signal.addEventListener("abort", aborted, { once: true });
    promise.then(
      (value) => { signal.removeEventListener("abort", aborted); resolve(value); },
      (error) => { signal.removeEventListener("abort", aborted); reject(error); },
    );
  });
}

function validPositive(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function validate(options: ScopedSessionOptions): void {
  const limits = [options.connectTimeoutMs, options.requestTimeoutMs, options.totalTimeoutMs,
    options.maximumMessageBytes, options.maximumStderrBytes, options.gracefulShutdownMs, options.forceShutdownMs];
  if (!options.binary.startsWith("/") || !options.cwd.startsWith("/") || limits.some((value) => !validPositive(value))) {
    throw new CodebaseMemoryError(
      "SESSION_PROTOCOL_FAILED", "session-options",
      "session paths must be absolute and limits must be positive safe integers",
    );
  }
}

function officialConnection(options: Parameters<SessionConnectionFactory>[0]): SessionConnection {
  const transport = new StdioClientTransport({
    command: options.binary,
    cwd: options.cwd,
    env: providerProcessEnvironment(options.environment),
    stderr: "pipe",
    maxBufferSize: options.maximumMessageBytes,
  });
  const client = new Client({ name: "agentbase", version: "0.0.0" });
  return {
    get pid() { return transport.pid; },
    stderr: transport.stderr as StderrSource | null,
    connect: (timeoutMs) => client.connect(transport, { timeout: timeoutMs }),
    async listTools(timeoutMs) {
      const result = await client.listTools(undefined, { timeout: timeoutMs, cacheMode: "bypass" });
      return result.tools.map((tool) => ({
        name: tool.name,
        ...(tool.title === undefined ? {} : { title: tool.title }),
        ...(tool.description === undefined ? {} : { description: tool.description }),
        inputSchema: tool.inputSchema,
        ...(tool.annotations === undefined ? {} : { annotations: tool.annotations }),
      }));
    },
    callTool: (name, argumentsValue, timeoutMs) => client.callTool({ name, arguments: { ...argumentsValue } }, { timeout: timeoutMs }),
    close: () => client.close(),
    forceClose: () => transport.close(),
    isAlive: () => transport.pid !== null,
  };
}

function asSessionError(cause: unknown, code: CodebaseMemoryError["code"], operation: string, message: string): CodebaseMemoryError {
  if (cause instanceof CodebaseMemoryError) return cause;
  return new CodebaseMemoryError(code, operation, message, { cause });
}

export async function openScopedSession(options: ScopedSessionOptions): Promise<ScopedSession> {
  validate(options);
  const now = options.now ?? (() => performance.now());
  const connection = (options.connectionFactory ?? officialConnection)({
    binary: options.binary,
    cwd: options.cwd,
    environment: options.environment,
    maximumMessageBytes: options.maximumMessageBytes,
  });
  const started = now();
  let pid = connection.pid;
  let stderrBytes = 0;
  let stderrFailure: CodebaseMemoryError | undefined;
  let tools: ProviderToolDescriptor[] = [];
  connection.stderr?.on("data", (chunk) => {
    stderrBytes += Buffer.byteLength(chunk);
    if (stderrBytes > options.maximumStderrBytes) {
      stderrFailure = new CodebaseMemoryError("SESSION_OUTPUT_LIMIT", "session-stderr", "provider session stderr exceeded its byte limit");
    }
  });
  try {
    await timeout(connection.connect(options.connectTimeoutMs), options.connectTimeoutMs,
      new CodebaseMemoryError("SESSION_CONNECT_FAILED", "session-connect", "provider session connection timed out"));
    pid = connection.pid;
    const listedTools = await timeout(connection.listTools(options.requestTimeoutMs), options.requestTimeoutMs,
      new CodebaseMemoryError("SESSION_REQUEST_TIMEOUT", "session-list-tools", "provider tool discovery timed out"));
    const toolNames = listedTools.map((tool) => typeof tool === "string" ? tool : tool.name);
    tools = listedTools.map((tool) => typeof tool === "string"
      ? { name: tool, inputSchema: { type: "object" } }
      : tool);
    const missing = (options.requiredTools ?? REQUIRED_TOOLS).filter((tool) => !toolNames.includes(tool));
    if (missing.length) throw new CodebaseMemoryError(
      "SESSION_PROTOCOL_FAILED", "session-list-tools",
      `provider session is missing required tools: ${missing.join(", ")}`,
    );
  } catch (cause) {
    try {
      await timeout(connection.forceClose(), options.forceShutdownMs,
        new CodebaseMemoryError("SESSION_CLEANUP_FAILED", "session-connect", "provider session cleanup timed out"));
    } catch (cleanupCause) {
      throw asSessionError(cleanupCause, "SESSION_CLEANUP_FAILED", "session-connect", "failed session could not be cleaned up");
    }
    if (connection.isAlive()) {
      throw new CodebaseMemoryError("SESSION_CLEANUP_FAILED", "session-connect", "failed session process remained alive after cleanup");
    }
    throw asSessionError(cause, "SESSION_CONNECT_FAILED", "session-connect", "provider session could not connect");
  }

  let closePromise: Promise<ProviderCleanup> | undefined;
  const close = (): Promise<ProviderCleanup> => {
    if (closePromise) return closePromise;
    closePromise = (async () => {
      let graceful = true;
      let forced = false;
      try {
        await timeout(connection.close(), options.gracefulShutdownMs,
          new CodebaseMemoryError("SESSION_CLEANUP_FAILED", "session-close", "graceful session close timed out"));
      } catch {
        graceful = false;
      }
      if (!graceful || connection.isAlive()) {
        forced = true;
        await timeout(connection.forceClose(), options.forceShutdownMs,
          new CodebaseMemoryError("SESSION_CLEANUP_FAILED", "session-close", "forced session close timed out")).catch(() => {});
      }
      return { status: connection.isAlive() || stderrFailure ? "failed" : "clean", pid, graceful, forced, stderrBytes };
    })();
    return closePromise;
  };

  const invoke = async (tool: string, argumentsValue: Readonly<Record<string, unknown>>): Promise<unknown> => {
    if (stderrFailure) throw stderrFailure;
    if (options.signal?.aborted) throw new CodebaseMemoryError("SESSION_CANCELLED", tool, "provider session was cancelled");
    if (!connection.isAlive()) throw new CodebaseMemoryError("SESSION_PREMATURE_EXIT", tool, "provider session exited before the request");
    const remaining = options.totalTimeoutMs - (now() - started);
    if (remaining <= 0) throw new CodebaseMemoryError("SESSION_TOTAL_TIMEOUT", tool, "provider session exceeded its total lifetime");
    const requestTimeout = Math.max(1, Math.min(options.requestTimeoutMs, Math.floor(remaining)));
    let result: unknown;
    try {
      result = await cancellation(timeout(connection.callTool(tool, argumentsValue, requestTimeout), requestTimeout,
        new CodebaseMemoryError("SESSION_REQUEST_TIMEOUT", tool, "provider session request timed out")), options.signal, tool);
    } catch (cause) {
      if (!connection.isAlive()) {
        throw new CodebaseMemoryError("SESSION_PREMATURE_EXIT", tool, "provider session exited during the request", { cause });
      }
      throw asSessionError(cause, "SESSION_PROTOCOL_FAILED", tool, "provider session request failed");
    }
    let resultBytes: number;
    try { resultBytes = Buffer.byteLength(JSON.stringify(result)); }
    catch (cause) {
      throw new CodebaseMemoryError("PROVIDER_MALFORMED_OUTPUT", tool, "provider session result was not serializable", { cause });
    }
    if (resultBytes > options.maximumMessageBytes) {
      throw new CodebaseMemoryError("SESSION_OUTPUT_LIMIT", tool, "provider session result exceeded its byte limit");
    }
    if ((options.rejectToolErrors ?? true) && (result as { isError?: unknown } | null)?.isError === true) {
      throw new CodebaseMemoryError("SESSION_TOOL_FAILED", tool, "provider tool reported an error");
    }
    if (!connection.isAlive()) throw new CodebaseMemoryError("SESSION_PREMATURE_EXIT", tool, "provider session exited during the request");
    return result;
  };
  return { invoke, tools, pid, close };
}
