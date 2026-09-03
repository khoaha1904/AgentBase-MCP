import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";

import { CodebaseMemoryError } from "./errors.ts";

export type ProcessRequest = Readonly<{
  executable: string;
  args: readonly string[];
  cwd: string;
  env: Readonly<Record<string, string>>;
  operation: string;
  timeoutMs: number;
  maximumStdoutBytes: number;
  maximumStderrBytes: number;
}>;

export type ProcessOutput = Readonly<{
  stdout: string;
  stderr: string;
  exitCode: number;
}>;

type SpawnedProcess = ChildProcessByStdio<null, Readable, Readable>;
type SpawnProcess = (request: ProcessRequest) => SpawnedProcess;

function defaultSpawn(request: ProcessRequest): SpawnedProcess {
  return spawn(request.executable, [...request.args], {
    cwd: request.cwd,
    env: { ...request.env },
    shell: false,
    windowsHide: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function terminate(child: SpawnedProcess): void {
  if (child.pid === undefined) return;
  try {
    if (process.platform === "win32") child.kill("SIGTERM");
    else process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

function forceTerminate(child: SpawnedProcess): void {
  if (child.pid === undefined) return;
  try {
    if (process.platform === "win32") child.kill("SIGKILL");
    else process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
}

function validateRequest(request: ProcessRequest): void {
  if (!request.executable.startsWith("/") || request.args.some((argument) => argument.includes("\0"))) {
    throw new CodebaseMemoryError("PROCESS_SPAWN_FAILED", request.operation, "process executable must be absolute and arguments cannot contain NUL");
  }
  for (const [value, label] of [
    [request.timeoutMs, "timeoutMs"],
    [request.maximumStdoutBytes, "maximumStdoutBytes"],
    [request.maximumStderrBytes, "maximumStderrBytes"],
  ] as const) {
    if (!Number.isSafeInteger(value) || value < 1) throw new CodebaseMemoryError("PROCESS_SPAWN_FAILED", request.operation, `${label} must be positive`);
  }
}

export function runBoundedProcess(request: ProcessRequest, spawnProcess: SpawnProcess = defaultSpawn): Promise<ProcessOutput> {
  validateRequest(request);
  return new Promise((resolve, reject) => {
    let child: SpawnedProcess;
    try {
      child = spawnProcess(request);
    } catch (cause) {
      reject(new CodebaseMemoryError("PROCESS_SPAWN_FAILED", request.operation, "provider process could not start", { cause }));
      return;
    }
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let pendingError: CodebaseMemoryError | undefined;
    let settled = false;
    let forceTimer: ReturnType<typeof setTimeout> | undefined;
    const fail = (error: CodebaseMemoryError) => {
      if (pendingError || settled) return;
      pendingError = error;
      terminate(child);
      forceTimer = setTimeout(() => forceTerminate(child), 2_000);
    };
    const timer = setTimeout(() => fail(new CodebaseMemoryError(
      "PROCESS_TIMEOUT",
      request.operation,
      `provider exceeded ${request.timeoutMs}ms`,
    )), request.timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > request.maximumStdoutBytes) fail(new CodebaseMemoryError(
        "PROCESS_OUTPUT_LIMIT",
        request.operation,
        "provider stdout exceeded its byte limit",
      ));
      else stdout.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes > request.maximumStderrBytes) fail(new CodebaseMemoryError(
        "PROCESS_OUTPUT_LIMIT",
        request.operation,
        "provider stderr exceeded its byte limit",
      ));
      else stderr.push(chunk);
    });
    child.on("error", (cause) => fail(new CodebaseMemoryError("PROCESS_SPAWN_FAILED", request.operation, "provider process failed", { cause })));
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (forceTimer) clearTimeout(forceTimer);
      if (pendingError) {
        reject(pendingError);
        return;
      }
      const exitCode = code ?? 1;
      const output = { stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), exitCode };
      if (exitCode !== 0) {
        const conflict = /cache-private|exact.build|coordination|project.lock|already locked|conflict/i.test(output.stderr);
        reject(new CodebaseMemoryError(
          conflict ? "PROVIDER_CONFLICT" : "PROVIDER_EXIT",
          request.operation,
          `provider exited with status ${exitCode}`,
          { exitCode },
        ));
        return;
      }
      resolve(output);
    });
  });
}

export type ProviderToolRequest = Readonly<{
  binary: string;
  tool: "index_repository" | "get_architecture" | "search_graph" | "trace_path" | "get_code_snippet";
  arguments: Readonly<Record<string, unknown>>;
  cwd: string;
  environment: Readonly<Record<string, string>>;
  timeoutMs: number;
  maximumStdoutBytes: number;
  maximumStderrBytes: number;
}>;

export async function invokeProviderTool(request: ProviderToolRequest): Promise<unknown> {
  const result = await runBoundedProcess({
    executable: request.binary,
    args: ["cli", "--json", request.tool, JSON.stringify(request.arguments)],
    cwd: request.cwd,
    env: request.environment,
    operation: request.tool,
    timeoutMs: request.timeoutMs,
    maximumStdoutBytes: request.maximumStdoutBytes,
    maximumStderrBytes: request.maximumStderrBytes,
  });
  try {
    return JSON.parse(result.stdout) as unknown;
  } catch (cause) {
    throw new CodebaseMemoryError("PROVIDER_MALFORMED_OUTPUT", request.tool, "provider stdout was not one JSON value", { cause });
  }
}
