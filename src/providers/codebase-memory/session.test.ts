import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { CodebaseMemoryError } from "./errors.ts";
import {
  openScopedSession,
  type SessionConnection,
  type SessionConnectionFactory,
} from "./session.ts";

const requiredTools = ["index_repository", "get_architecture", "search_graph", "trace_path", "get_code_snippet"] as const;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function fakeConnection(overrides: Partial<SessionConnection> = {}) {
  const events: string[] = [];
  const stderr = new EventEmitter();
  let alive = true;
  const connection: SessionConnection = {
    pid: 4242,
    stderr,
    async connect() { events.push("connect"); },
    async listTools() { events.push("list-tools"); return [...requiredTools]; },
    async callTool(name, argumentsValue) {
      events.push(`call:${name}`);
      return { structuredContent: { name, argumentsValue }, isError: false };
    },
    async close() { events.push("close"); alive = false; },
    async forceClose() { events.push("force-close"); alive = false; },
    isAlive() { return alive; },
    ...overrides,
  };
  const factory: SessionConnectionFactory = () => connection;
  return { connection, events, stderr, factory };
}

function options(factory: SessionConnectionFactory, overrides: Partial<Parameters<typeof openScopedSession>[0]> = {}) {
  return {
    binary: "/managed/codebase-memory-mcp",
    cwd: "/repository",
    environment: { CBM_ALLOWED_ROOT: "/repository", CBM_CACHE_DIR: "/private/cache" },
    connectTimeoutMs: 100,
    requestTimeoutMs: 100,
    totalTimeoutMs: 1_000,
    maximumMessageBytes: 4_096,
    maximumStderrBytes: 4_096,
    gracefulShutdownMs: 20,
    forceShutdownMs: 50,
    connectionFactory: factory,
    ...overrides,
  };
}

async function rejectsCode(operation: Promise<unknown>, code: CodebaseMemoryError["code"]) {
  await assert.rejects(operation, (error) => error instanceof CodebaseMemoryError && error.code === code);
}

test("[AB-GRAPH-005][AB-GRAPH-006][AB-GRAPH-010] serves all adapter calls through one explicit session", async () => {
  const current = fakeConnection();
  const session = await openScopedSession(options(current.factory));
  const index = await session.invoke("index_repository", { repo_path: "/repository" });
  const architecture = await session.invoke("get_architecture", { aspects: ["all"] });
  const cleanup = await session.close();

  assert.deepEqual(index, { structuredContent: { name: "index_repository", argumentsValue: { repo_path: "/repository" } }, isError: false });
  assert.deepEqual(architecture, { structuredContent: { name: "get_architecture", argumentsValue: { aspects: ["all"] } }, isError: false });
  assert.deepEqual(current.events, ["connect", "list-tools", "call:index_repository", "call:get_architecture", "close"]);
  assert.deepEqual(cleanup, { status: "clean", pid: 4242, graceful: true, forced: false, stderrBytes: 0 });
  assert.equal((await session.close()).status, "clean");
  assert.equal(current.events.filter((event) => event === "close").length, 1);
});

test("[AB-GRAPH-006][AB-GRAPH-012] rejects a missing tool and tool-level error without invoking another transport", async () => {
  const missing = fakeConnection({ async listTools() { return requiredTools.filter((tool) => tool !== "trace_path"); } });
  await rejectsCode(openScopedSession(options(missing.factory)), "SESSION_PROTOCOL_FAILED");

  const toolError = fakeConnection({ async callTool() { return { content: [{ type: "text", text: "failed" }], isError: true }; } });
  const session = await openScopedSession(options(toolError.factory));
  await rejectsCode(session.invoke("search_graph", {}), "SESSION_TOOL_FAILED");
  await session.close();
  assert.equal(toolError.events.includes("force-close"), false);
});

test("[AB-GRAPH-008][AB-GRAPH-012] bounds connection, request and whole-session duration", async () => {
  const blockedConnect = deferred<void>();
  const connecting = fakeConnection({ connect: () => blockedConnect.promise });
  await rejectsCode(openScopedSession(options(connecting.factory, { connectTimeoutMs: 10 })), "SESSION_CONNECT_FAILED");

  const blockedCall = deferred<unknown>();
  const requesting = fakeConnection({ callTool: () => blockedCall.promise });
  const requestSession = await openScopedSession(options(requesting.factory, { requestTimeoutMs: 10 }));
  await rejectsCode(requestSession.invoke("search_graph", {}), "SESSION_REQUEST_TIMEOUT");
  await requestSession.close();

  let clock = 0;
  const expired = fakeConnection();
  const expiredSession = await openScopedSession(options(expired.factory, { now: () => clock, totalTimeoutMs: 10 }));
  clock = 11;
  await rejectsCode(expiredSession.invoke("search_graph", {}), "SESSION_TOTAL_TIMEOUT");
  await expiredSession.close();
});

test("[AB-GRAPH-008][AB-GRAPH-009] stderr overflow and cancellation reject work and trigger cleanup", async () => {
  const overflow = fakeConnection();
  const overflowSession = await openScopedSession(options(overflow.factory, { maximumStderrBytes: 4 }));
  overflow.stderr.emit("data", Buffer.from("12345"));
  await rejectsCode(overflowSession.invoke("search_graph", {}), "SESSION_OUTPUT_LIMIT");
  assert.equal((await overflowSession.close()).status, "failed");

  const controller = new AbortController();
  const blocked = deferred<unknown>();
  const cancelled = fakeConnection({ callTool: () => blocked.promise });
  const cancelledSession = await openScopedSession(options(cancelled.factory, { signal: controller.signal }));
  const operation = cancelledSession.invoke("search_graph", {});
  controller.abort();
  await rejectsCode(operation, "SESSION_CANCELLED");
  await cancelledSession.close();
});

test("[AB-GRAPH-008][AB-GRAPH-012] bounds result bytes and rejects unserializable provider output", async () => {
  const oversized = fakeConnection({ async callTool() { return { value: "x".repeat(500) }; } });
  const oversizedSession = await openScopedSession(options(oversized.factory, { maximumMessageBytes: 100 }));
  await rejectsCode(oversizedSession.invoke("search_graph", {}), "SESSION_OUTPUT_LIMIT");
  await oversizedSession.close();

  const circular: { self?: unknown } = {};
  circular.self = circular;
  const malformed = fakeConnection({ async callTool() { return circular; } });
  const malformedSession = await openScopedSession(options(malformed.factory));
  await rejectsCode(malformedSession.invoke("search_graph", {}), "PROVIDER_MALFORMED_OUTPUT");
  await malformedSession.close();
});

test("[AB-GRAPH-012] distinguishes protocol rejection from premature process exit", async () => {
  const protocol = fakeConnection({ async callTool() { throw new Error("protocol rejected"); } });
  const protocolSession = await openScopedSession(options(protocol.factory));
  await rejectsCode(protocolSession.invoke("search_graph", {}), "SESSION_PROTOCOL_FAILED");
  await protocolSession.close();

  let alive = true;
  const exited = fakeConnection({
    async callTool() { alive = false; throw new Error("connection closed"); },
    isAlive: () => alive,
  });
  const exitedSession = await openScopedSession(options(exited.factory));
  await rejectsCode(exitedSession.invoke("search_graph", {}), "SESSION_PREMATURE_EXIT");
  await exitedSession.close();
});

test("[AB-GRAPH-009][AB-GRAPH-012] forced cleanup is bounded and an alive process fails cleanup", async () => {
  const closeBlocked = deferred<void>();
  let alive = true;
  const forced = fakeConnection({
    close: () => closeBlocked.promise,
    async forceClose() { alive = false; },
    isAlive: () => alive,
  });
  const forcedSession = await openScopedSession(options(forced.factory));
  assert.deepEqual(await forcedSession.close(), { status: "clean", pid: 4242, graceful: false, forced: true, stderrBytes: 0 });

  const unclean = fakeConnection({
    async close() {},
    async forceClose() {},
    isAlive: () => true,
  });
  const uncleanSession = await openScopedSession(options(unclean.factory));
  assert.equal((await uncleanSession.close()).status, "failed");
});

test("[AB-GRAPH-008][AB-GRAPH-012] invalid limits and non-absolute executable fail before connection", async () => {
  const current = fakeConnection();
  await rejectsCode(openScopedSession(options(current.factory, { binary: "relative" })), "SESSION_PROTOCOL_FAILED");
  await rejectsCode(openScopedSession(options(current.factory, { maximumMessageBytes: 0 })), "SESSION_PROTOCOL_FAILED");
  assert.deepEqual(current.events, []);
});
