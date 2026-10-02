#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { serveAgentBaseMcp } from "./app/agentbase-mcp/index.ts";
import {
  executeHubCiCli, executeHubCli, tryCreateHubRuntimeActions,
  loadExactHubProfileToken, loadGlobalHubToken, readPersistedHubConfiguration,
  removeGlobalHubToken, writeGlobalHubToken, type HubToolActions,
  hubPublicationPolicy, publishConfiguredHubProposal,
} from "./app/hub-okf/index.ts";

type Writer = (value: string) => void;
type CliDependencies = Readonly<{
  environment?: NodeJS.ProcessEnv;
  writeOutput?: Writer;
  writeError?: Writer;
  promptToken?: (existing: string | undefined) => Promise<string>;
  publishHub?: typeof publishConfiguredHubProposal;
}>;

const HELP = `AgentBase CLI\n\nUsage:\n  abs status\n  abs hub connect --url <repository-url> --branch <branch>\n  abs hub sync\n  abs hub policy [--mode direct|pr]\n  abs hub publish --proposal <id> --digest <reviewed-digest> --mode direct|pr\n\nPublish confirms sharing the exact reviewed change.\n`;

function sharedToken(environment: NodeJS.ProcessEnv): string | undefined {
  const current = loadGlobalHubToken(environment);
  if (current) return current;
  const active = readPersistedHubConfiguration(environment);
  return active ? loadExactHubProfileToken(active.localHubId, environment) : undefined;
}

function publicFlags(args: readonly string[]): Readonly<Record<string, string>> {
  if (args.length % 2 !== 0) throw new Error("Hub connect arguments must be --url value and --branch value");
  const values: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index], value = args[index + 1];
    if ((key !== "--url" && key !== "--branch") || !value || value.startsWith("--") || values[key]) {
      throw new Error("Hub connect accepts only --url and --branch");
    }
    values[key] = value;
  }
  return values;
}

async function defaultTokenPrompt(existing: string | undefined): Promise<string> {
  if (!process.stdin.isTTY || !process.stderr.isTTY || typeof process.stdin.setRawMode !== "function") {
    if (existing) return "";
    throw new Error("Hub connect requires an interactive terminal to enter the owner-private token");
  }
  process.stderr.write("Hub token (leave blank to reuse existing): ");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let token = "";
  try {
    for await (const chunk of process.stdin) {
      for (const byte of chunk as Buffer) {
        if (byte === 3) throw new Error("Hub connect cancelled");
        if (byte === 13 || byte === 10) return token;
        if (byte === 127 || byte === 8) token = token.slice(0, -1);
        else if (byte >= 32 && byte <= 126) token += String.fromCharCode(byte);
      }
    }
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stderr.write("\n");
  }
  return token;
}

async function executePublicHubConnect(
  args: readonly string[],
  actions: HubToolActions,
  dependencies: Readonly<{
    environment: NodeJS.ProcessEnv;
    writeOutput: Writer;
    writeError: Writer;
    promptToken?: (existing: string | undefined) => Promise<string>;
  }>,
): Promise<number> {
  const values = publicFlags(args);
  const repositoryUrl = values["--url"], targetBranch = values["--branch"];
  if (!repositoryUrl || !targetBranch) throw new Error("Hub connect requires --url and --branch");
  const previous = sharedToken(dependencies.environment);
  const entered = await (dependencies.promptToken ?? defaultTokenPrompt)(previous);
  const token = entered.trim() || previous;
  if (!token) throw new Error("Hub connect requires a token; enter one in the masked prompt");
  const changed = token !== previous || !loadGlobalHubToken(dependencies.environment);
  if (changed) writeGlobalHubToken(token, dependencies.environment, { replace: true });
  try {
    const output = await actions.configure({ repositoryUrl, targetBranch });
    dependencies.writeOutput(`${JSON.stringify(output, null, 2)}\n`);
    return 0;
  } catch (error) {
    if (changed) {
      if (previous) writeGlobalHubToken(previous, dependencies.environment, { replace: true });
      else removeGlobalHubToken(dependencies.environment);
    }
    throw error;
  }
}

export async function executeCli(
  args = process.argv.slice(2),
  hubActions?: HubToolActions,
  cliDependencies: CliDependencies = {},
): Promise<number> {
  const environment = cliDependencies.environment ?? process.env;
  const writeOutput = cliDependencies.writeOutput ?? ((value: string) => process.stdout.write(value));
  const writeError = cliDependencies.writeError ?? ((value: string) => process.stderr.write(value));
  const [command, ...rest] = args;
  if (command === "--help" || command === "-h") { writeOutput(HELP); return 0; }
  if (command === "status") {
    try {
      const actions = hubActions ?? tryCreateHubRuntimeActions(environment);
      if (!actions) throw new Error("AgentBase Hub runtime is not configured");
      writeOutput(`${JSON.stringify(await actions.status(), null, 2)}\n`);
      return 0;
    } catch (error) {
      writeError(`AgentBase status failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
      return 1;
    }
  }
  if (command === "hub" && rest[0] === "connect") {
    try {
      const actions = hubActions ?? tryCreateHubRuntimeActions(environment);
      if (!actions) throw new Error("AgentBase Hub runtime is not configured");
      return await executePublicHubConnect(rest.slice(1), actions, {
        environment, writeOutput, writeError,
        ...(cliDependencies.promptToken ? { promptToken: cliDependencies.promptToken } : {}),
      });
    } catch (error) {
      writeError(`AgentBase Hub connect failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
      return 1;
    }
  }
  if (command === "hub" && rest[0] === "policy") {
    try {
      const mode = rest[2];
      if (rest.length !== 1 && (rest.length !== 3 || rest[1] !== "--mode" || (mode !== "direct" && mode !== "pr"))) {
        throw new Error("Hub policy accepts only --mode direct|pr, or no arguments to inspect");
      }
      writeOutput(`${JSON.stringify(hubPublicationPolicy(environment, rest.length === 1 ? undefined : mode as "direct" | "pr"), null, 2)}\n`);
      return 0;
    } catch (error) {
      writeError(`AgentBase Hub policy failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
      return 1;
    }
  }
  if (command === "hub" && rest[0] === "publish") {
    try {
      const values: Record<string, string> = {};
      if (rest.length !== 7) throw new Error("Publish requires --proposal, --digest and --mode direct|pr");
      for (let i = 1; i < rest.length; i += 2) {
        const key = rest[i]!, value = rest[i + 1]!;
        if (!["--proposal", "--digest", "--mode"].includes(key) || values[key]) throw new Error("invalid Publish arguments");
        values[key] = value;
      }
      if (!/^[a-f0-9]{24}$/.test(values["--proposal"] ?? "")
        || !/^sha256:[a-f0-9]{64}$/.test(values["--digest"] ?? "") || !["direct", "pr"].includes(values["--mode"] ?? "")) {
        throw new Error("Publish requires an exact proposal ID, reviewed SHA-256 digest and --mode direct|pr");
      }
      const result = await (cliDependencies.publishHub ?? publishConfiguredHubProposal)({
        proposalId: values["--proposal"]!, diffDigest: values["--digest"]!, mode: values["--mode"] as "direct" | "pr",
      }, environment);
      writeOutput(`${JSON.stringify(result, null, 2)}\n`);
      return result.remote === "in-review" || (result.remote === "published" && result.local === "recognized") ? 0 : 1;
    } catch (error) {
      writeError(`AgentBase Hub Publish failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
      return 1;
    }
  }
  if (command === "hub" && rest[0] === "sync") {
    try {
      const actions = hubActions ?? tryCreateHubRuntimeActions(environment);
      if (!actions) throw new Error("AgentBase Hub runtime is not configured");
      if (rest.length !== 1) throw new Error("Hub sync accepts no arguments");
      writeOutput(`${JSON.stringify(await actions.synchronize(), null, 2)}\n`);
      return 0;
    } catch (error) {
      writeError(`AgentBase Hub sync failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
      return 1;
    }
  }
  if (command === "mcp") {
    await serveAgentBaseMcp();
    return 0;
  }
  if (command === "okf" && rest[0] === "hub") return executeHubCli(rest.slice(1), hubActions ?? tryCreateHubRuntimeActions(environment));
  if (command === "okf" && rest[0] === "hub-ci") return executeHubCiCli(rest.slice(1));
  if (command === undefined) { writeOutput(HELP); return 0; }
  process.stderr.write(`Unknown command: ${command}\n`);
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  process.exitCode = await executeCli();
}
