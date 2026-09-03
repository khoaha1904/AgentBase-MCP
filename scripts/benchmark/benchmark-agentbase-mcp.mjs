#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { serveStdio, StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { createAgentBaseMcpServer } from "../../src/app/codebase-memory-mcp/server.ts";
import { DiscoverySession } from "../../src/app/codebase-memory-mcp/discovery-session.ts";
import { createHubRuntimeActions, defaultHubRuntimeStateRoot } from "../../src/app/hub-okf/index.ts";
import { discoverRepositorySourceState } from "../../src/app/repository-okf/index.ts";

export async function resolveBenchmarkSourceSnapshot(input) {
  const requestedRoot = fs.realpathSync(input.requestedRoot);
  const source = discoverRepositorySourceState(requestedRoot, input.createdAt);
  const repository = `agentbase-benchmark/${path.basename(requestedRoot)}`;
  return {
    repositoryId: input.repositoryId,
    remote: { host: input.hub.host, repository,
      canonicalHttpsUrl: `https://${input.hub.host}/${repository}.git` },
    defaultBranch: "main",
    commit: source.commit,
    requestedRoot,
    analysisRoot: requestedRoot,
    kind: "current-checkout",
    createdAt: input.createdAt ?? new Date().toISOString(),
    privateRoot: input.stateRoot,
  };
}

export function createBenchmarkAgentBaseServer(projectRoot) {
  const hubStateRoot = defaultHubRuntimeStateRoot();
  const discovery = new DiscoverySession(hubStateRoot);
  const hubActions = createHubRuntimeActions(process.env, hubStateRoot, {
    sourceSnapshotResolver: resolveBenchmarkSourceSnapshot,
    onSourceSnapshot: (snapshot, mode, authority) => discovery.arm(snapshot, mode, authority),
    discoveryReceiptResolver: (id) => discovery.resolveReceipt(id),
    discoveryReceiptRebaser: (id, publishedBase) => discovery.rebaseReceipt(id, publishedBase),
  });
  return createAgentBaseMcpServer({ projectRoot, discoverySession: discovery, hubStateRoot, hubActions });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const projectRoot = path.resolve(import.meta.dirname, "../..");
  serveStdio(() => createBenchmarkAgentBaseServer(projectRoot).server, {
    legacy: "serve",
    transport: new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 4_000_000 }),
  });
}
