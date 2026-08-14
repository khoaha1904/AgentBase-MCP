#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

import { globalHubCredentialPath, loadGlobalHubToken, writeGlobalHubToken } from "../src/app/hub-okf/credential-file.ts";
import { registerClients } from "./client-registration.mjs";

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

  async key() {
    const character = await this.next();
    if (character === undefined) return "eof";
    if (character === "\u0003") return "cancel";
    if (character !== "\u001b") return character;
    const bracket = await this.next();
    if (bracket !== "[") return "unknown";
    const direction = await this.next();
    if (direction === "A") return "up";
    if (direction === "B") return "down";
    return "unknown";
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

function terminalCapabilities(output, environment) {
  const ansi = environment.TERM !== "dumb";
  const color = ansi && !("NO_COLOR" in environment);
  const unicode = /utf-?8/i.test(environment.LC_ALL || environment.LC_CTYPE || environment.LANG || "UTF-8");
  const width = Number.isInteger(output.columns) ? output.columns : 80;
  return { ansi, color, unicode, narrow: width < 48, width };
}

function ui(capabilities) {
  const accent = (value) => capabilities.color ? `\u001b[1;36m${value}\u001b[0m` : value;
  const bold = (value) => capabilities.color ? `\u001b[1m${value}\u001b[0m` : value;
  return {
    accent, bold,
    brand: capabilities.unicode ? "◆" : "*",
    success: capabilities.unicode ? "✓" : "OK",
    pending: capabilities.unicode ? "◇" : "-",
    pointer: capabilities.unicode ? "›" : ">",
    arrow: capabilities.unicode ? "→" : ">",
  };
}

function renderHeader(output, capabilities) {
  const glyph = ui(capabilities), divider = "─".repeat(Math.max(12, Math.min(56, capabilities.width - 1)));
  output.write(`${glyph.accent(`${glyph.brand} AgentBase-MCP`)}\n`);
  output.write(`${capabilities.narrow ? "Local code intelligence + shared knowledge" : "  Local code intelligence and shared knowledge"}\n`);
  if (!capabilities.narrow) output.write(`${glyph.accent(divider)}\n`);
  output.write(`Setup: Clients ${glyph.arrow} GitHub access ${glyph.arrow} Registration\n\n`);
}

function step(output, capabilities, number, title, description) {
  const glyph = ui(capabilities);
  output.write(`${glyph.accent(`${number}/3`)}  ${glyph.bold(title)}\n`);
  if (description) output.write(`${capabilities.narrow ? "" : "     "}${description}\n`);
}

function pickerLines(capabilities, selected, focused, message) {
  const glyph = ui(capabilities), items = [{ id: "codex", label: "Codex" }, { id: "claude-code", label: "Claude Code" }];
  const indent = capabilities.narrow ? "" : "     ";
  return [
    `${indent}↑/↓ Move   Space Select   Enter Continue`,
    "",
    ...items.map((item, index) => {
      const pointer = index === focused ? glyph.pointer : " ";
      const line = `${indent}${pointer}  [${selected.has(item.id) ? "x" : " "}] ${item.label}`;
      return index === focused ? glyph.accent(line) : line;
    }),
    ...(message ? ["", `${indent}! ${message}`] : []),
  ];
}

function writePicker(output, capabilities, lines, previousCount = 0) {
  if (capabilities.ansi && previousCount) output.write(`\u001b[${previousCount}A`);
  for (const line of lines) output.write(`${capabilities.ansi ? "\u001b[2K" : ""}${line}\n`);
}

async function readClientSelection(reader, output, capabilities) {
  const items = ["codex", "claude-code"], selected = new Set();
  let focused = 0, message = "", rendered = 0;
  step(output, capabilities, 1, "Choose clients", "Select where AgentBase-MCP should be available.");
  if (capabilities.ansi) output.write("\u001b[?25l");
  try {
    let lines = pickerLines(capabilities, selected, focused, message);
    writePicker(output, capabilities, lines); rendered = lines.length;
    while (true) {
      const key = await reader.key();
      if (key === "eof" || key === "cancel") throw new InstallerCancelled();
      if (key === "up" || key === "down") focused = (focused + (key === "up" ? -1 : 1) + items.length) % items.length;
      else if (key === " " || key === "1" || key === "2") {
        if (key === "1" || key === "2") focused = Number(key) - 1;
        const id = items[focused]; selected.has(id) ? selected.delete(id) : selected.add(id); message = "";
      } else if (key === "\n" || key === "\r") {
        reader.endedLine(key);
        if (selected.size) return items.filter((id) => selected.has(id));
        message = "Select at least one client.";
      } else continue;
      lines = pickerLines(capabilities, selected, focused, message);
      writePicker(output, capabilities, lines, rendered); rendered = lines.length;
    }
  } finally {
    if (capabilities.ansi) output.write("\u001b[?25h");
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
    const child = spawn("npm", ["ci", "--no-fund"], { cwd: repositoryRoot, stdio: ["ignore", "ignore", "ignore"], shell: false });
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
  const runClientRegistration = options.runClientRegistration ?? registerClients;
  const parsed = parseArgs(args);
  const interactive = Boolean(input.isTTY && output.isTTY && typeof input.setRawMode === "function");
  if (!interactive) {
    await runDependencyInstall();
    output.write("AgentBase-MCP: code prepared; interactive client registration skipped.\n");
    return { clients: [], credential: "skipped", registration: "skipped" };
  }

  const capabilities = terminalCapabilities(output, environment), glyph = ui(capabilities);
  renderHeader(output, capabilities);
  output.write(`${glyph.pending} Preparing dependencies...\n`);
  await runDependencyInstall();
  output.write(`${glyph.accent(glyph.success)} Dependencies ready\n\n`);
  const reader = new CharacterReader(input);
  input.setRawMode(true);
  input.resume();
  try {
    const clients = await readClientSelection(reader, output, capabilities);
    output.write(`${glyph.accent(glyph.success)} Clients selected: ${clients.map((client) => client === "codex" ? "Codex" : "Claude Code").join(", ")}\n\n`);
    const credentialPath = globalHubCredentialPath(environment);
    const credentialExists = pathPresent(credentialPath);
    if (credentialExists) {
      const fileOnlyEnvironment = { ...environment };
      delete fileOnlyEnvironment.AGENTBASE_HUB_GITHUB_TOKEN;
      loadGlobalHubToken(fileOnlyEnvironment);
    }
    let credential = "preserved";
    if (!credentialExists || parsed.replaceToken) {
      step(output, capabilities, 2, "GitHub access", "Used later to read or publish an AgentBase-Hub.");
      const token = await readMaskedToken(reader, output);
      credential = token
        ? writeGlobalHubToken(token, environment, { replace: parsed.replaceToken })
        : credentialExists ? "preserved" : "skipped";
    } else {
      step(output, capabilities, 2, "GitHub access", "Used later to read or publish an AgentBase-Hub.");
      output.write(`${glyph.accent(glyph.success)} Existing GitHub token preserved\n`);
    }
    output.write("\n");
    step(output, capabilities, 3, "Connect clients", "Register AgentBase-MCP in the selected coding clients.");
    output.write(`${glyph.pending} Registering AgentBase-MCP...\n`);
    const registration = await runClientRegistration({
      clients,
      repositoryRoot,
      nodeExecutable: process.execPath,
      environment,
    });
    output.write(`\n${glyph.accent(glyph.success)} ${glyph.bold("AgentBase-MCP is ready")}\n\n`);
    for (const client of clients) {
      const label = client === "codex" ? "Codex" : "Claude Code";
      const result = registration.clients[client] === "already-registered" ? "Already connected" : "Connected";
      output.write(`  ${label.padEnd(13)} ${result}\n`);
    }
    const tokenResult = credential === "created" ? "Saved securely" : credential === "preserved" ? "Preserved" : "Skipped";
    output.write(`  ${"GitHub token".padEnd(13)} ${tokenResult}\n\n`);
    output.write(`${glyph.bold("Next")}\n  Open a new ${clients.map((client) => client === "codex" ? "Codex" : "Claude Code").join(" or ")} session to load AgentBase-MCP.\n`);
    return { clients, credential, registration };
  } finally {
    input.setRawMode(false);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await runInstaller();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    if (error instanceof InstallerCancelled) process.stderr.write("\nSetup cancelled. No new client registration was kept.\n");
    else process.stderr.write(`\n✗ Setup could not finish\n  Reason  ${message}\n  Run ./install.sh again after correcting the issue.\n`);
    process.exitCode = 1;
  }
}
