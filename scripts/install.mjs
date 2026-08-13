#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

import { globalHubCredentialPath, loadGlobalHubToken, writeGlobalHubToken } from "../src/app/hub-okf/credential-file.ts";

const repositoryRoot = path.resolve(import.meta.dirname, "..");

class InstallerCancelled extends Error {
  constructor() { super("installation cancelled"); }
}

class CharacterReader {
  #iterator;
  #queue = [];
  #skipLf = false;

  constructor(input) {
    input.setEncoding("utf8");
    this.#iterator = input[Symbol.asyncIterator]();
  }

  endedLine(character) { this.#skipLf = character === "\r"; }

  async next() {
    while (true) {
      if (!this.#queue.length) {
        const item = await this.#iterator.next();
        if (item.done) return undefined;
        this.#queue.push(...String(item.value));
      }
      const character = this.#queue.shift();
      if (this.#skipLf) {
        this.#skipLf = false;
        if (character === "\n") continue;
      }
      return character;
    }
  }
}

function parseArgs(args) {
  const accepted = new Set(["--replace-token"]);
  const unknown = args.filter((argument) => !accepted.has(argument));
  if (unknown.length || new Set(args).size !== args.length) throw new Error("installer accepts only one optional --replace-token flag");
  return { replaceToken: args.includes("--replace-token") };
}

function pathPresent(target) {
  try { fs.lstatSync(target); return true; }
  catch (error) { if (error?.code === "ENOENT") return false; throw error; }
}

function selectionLabel(selected) {
  return `Codex [${selected.has("codex") ? "x" : " "}], Claude Code [${selected.has("claude-code") ? "x" : " "}]`;
}

async function readClientSelection(reader, output) {
  const selected = new Set();
  output.write("Select clients: press 1 for Codex, 2 for Claude Code, then Enter.\n");
  output.write(`${selectionLabel(selected)}\n`);
  while (true) {
    const character = await reader.next();
    if (character === undefined || character === "\u0003") throw new InstallerCancelled();
    if (character === "1") selected.has("codex") ? selected.delete("codex") : selected.add("codex");
    else if (character === "2") selected.has("claude-code") ? selected.delete("claude-code") : selected.add("claude-code");
    else if (character === "\n" || character === "\r") {
      reader.endedLine(character);
      if (selected.size) return [...selected];
      output.write("Select at least one client.\n");
      continue;
    } else continue;
    output.write(`${selectionLabel(selected)}\n`);
  }
}

async function readMaskedToken(reader, output) {
  const token = [];
  output.write("GitHub Hub token (Enter to skip): ");
  while (true) {
    const character = await reader.next();
    if (character === undefined || character === "\u0003") throw new InstallerCancelled();
    if (character === "\n" || character === "\r") {
      reader.endedLine(character);
      output.write("\n");
      return token.join("");
    }
    if (character === "\u007f" || character === "\b") {
      if (token.length) { token.pop(); output.write("\b \b"); }
      continue;
    }
    if (character < " " || character === "\u007f") continue;
    token.push(character);
    output.write("*");
  }
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["ci"], { cwd: repositoryRoot, stdio: "inherit", shell: false });
    child.once("error", () => reject(new Error("dependency installation could not start")));
    child.once("exit", (code, signal) => code === 0
      ? resolve()
      : reject(new Error(`dependency installation failed (${signal ? "signal" : "exit"})`)));
  });
}

export async function runInstaller(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const environment = options.environment ?? process.env;
  const runDependencyInstall = options.runDependencyInstall ?? installDependencies;
  const parsed = parseArgs(args);
  await runDependencyInstall();
  const interactive = Boolean(input.isTTY && output.isTTY && typeof input.setRawMode === "function");
  if (!interactive) {
    output.write("Code prepared. Client selection and credential input skipped in non-interactive mode.\n");
    output.write("MCP registration: deferred.\n");
    return { clients: [], credential: "skipped", registration: "deferred" };
  }

  const reader = new CharacterReader(input);
  input.setRawMode(true);
  input.resume();
  try {
    const clients = await readClientSelection(reader, output);
    const credentialPath = globalHubCredentialPath(environment);
    const credentialExists = pathPresent(credentialPath);
    if (credentialExists) {
      const fileOnlyEnvironment = { ...environment };
      delete fileOnlyEnvironment.AGENTBASE_HUB_GITHUB_TOKEN;
      loadGlobalHubToken(fileOnlyEnvironment);
    }
    let credential = "preserved";
    if (!credentialExists || parsed.replaceToken) {
      const token = await readMaskedToken(reader, output);
      credential = token
        ? writeGlobalHubToken(token, environment, { replace: parsed.replaceToken })
        : credentialExists ? "preserved" : "skipped";
    }
    output.write(`Selected clients: ${clients.join(", ")}. MCP registration: deferred.\n`);
    output.write(`Credential: ${credential}.\n`);
    return { clients, credential, registration: "deferred" };
  } finally {
    input.setRawMode(false);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await runInstaller();
  } catch (error) {
    process.stderr.write(`AgentBase-MCP installation failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
