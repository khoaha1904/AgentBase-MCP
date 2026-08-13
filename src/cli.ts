#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";

import { executeFoundationCli } from "./app/foundation-demo/index.ts";
import { serveCodebaseMemoryMcp } from "./app/codebase-memory-mcp/index.ts";
import { executeHubCli, tryCreateHubRuntimeActions, type HubToolActions } from "./app/hub-okf/index.ts";
import { executeGraphBenchmarkCli, executeObservationCli, executeOkfCli, executeRealEvidenceCli } from "./app/repository-okf/index.ts";

export async function executeCli(args = process.argv.slice(2), hubActions?: HubToolActions): Promise<number> {
  const [command, ...rest] = args;
  if (command === "mcp") {
    await serveCodebaseMemoryMcp(path.resolve(import.meta.dirname, ".."));
    return 0;
  }
  if (command === "codebase-memory:integration") return executeRealEvidenceCli(rest);
  if (command === "codebase-memory:benchmark") return executeGraphBenchmarkCli(rest);
  if (command === "observe") return executeObservationCli(rest);
  if (command === "okf" && rest[0] === "hub") return executeHubCli(rest.slice(1), hubActions ?? tryCreateHubRuntimeActions());
  if (command === "okf") return executeOkfCli(rest);
  if (command === undefined || command === "foundation-demo") return executeFoundationCli();
  process.stderr.write(`Unknown command: ${command}\n`);
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await executeCli();
}
