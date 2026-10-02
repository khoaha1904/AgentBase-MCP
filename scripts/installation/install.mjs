#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

import { registerClients } from "./client-registration.mjs";
import { installProductSkills, PRODUCT_SKILL_NAMES, rollbackProductSkills } from "./product-skills.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const PINNED_CYTOSCAPE_VERSION = "3.34.2";

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
  if (args.length) throw new Error("installer accepts no arguments");
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
  output.write(`${capabilities.narrow ? "Source discovery + shared knowledge" : "  Source discovery and shared knowledge"}\n`);
  if (!capabilities.narrow) output.write(`${glyph.accent(divider)}\n`);
  output.write(`Setup: Clients ${glyph.arrow} Registration\n\n`);
}

function step(output, capabilities, number, title, description) {
  const glyph = ui(capabilities);
  output.write(`${glyph.accent(`${number}/2`)}  ${glyph.bold(title)}\n`);
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

function assertNodeVersion(version) {
  const [major, minor] = version.split(".").map(Number);
  if (major !== 24 || minor < 12) throw new Error(`Node >=24.12 <25 is required; received ${version}`);
}

function privateRegistry(value) {
  let registry;
  try { registry = new URL(value); }
  catch { throw new Error("npm registry configuration is not a valid URL"); }
  if (registry.protocol !== "https:") throw new Error("npm registry must use HTTPS");
  if (["registry.npmjs.org", "npmjs.org", "registry.yarnpkg.com", "npm.pkg.github.com"].includes(registry.hostname)) {
    throw new Error("AgentBase enterprise installation requires a configured internal npm registry");
  }
  return registry.href;
}

function resolveRegistry(environment) {
  const configured = environment.npm_config_registry || environment.NPM_CONFIG_REGISTRY;
  if (configured) return Promise.resolve(configured);
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["config", "get", "registry"], {
      cwd: repositoryRoot, env: { ...environment }, stdio: ["ignore", "pipe", "pipe"], shell: false,
    });
    const stdout = [], stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.once("error", () => reject(new Error("npm registry configuration could not be read")));
    child.once("exit", (code) => code === 0
      ? resolve(Buffer.concat(stdout).toString("utf8").trim())
      : reject(new Error(`npm registry configuration failed: ${Buffer.concat(stderr).toString("utf8").trim()}`)));
  });
}

function installDependencies(registry, environment = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["ci", "--no-fund", "--no-audit", `--registry=${registry}`, "--replace-registry-host=always"], {
      cwd: repositoryRoot,
      env: { ...environment, npm_config_registry: registry, npm_config_replace_registry_host: "always" },
      stdio: ["ignore", "ignore", "ignore"], shell: false,
    });
    child.once("error", () => reject(new Error("dependency installation could not start")));
    child.once("exit", (code, signal) => code === 0
      ? resolve()
      : reject(new Error(`dependency installation failed (${signal ? "signal" : "exit"})`)));
  });
}

function verifyVisualizationRuntime() {
  const packagePath = path.join(repositoryRoot, "node_modules", "cytoscape", "package.json");
  const modulePath = path.join(repositoryRoot, "node_modules", "cytoscape", "dist", "cytoscape.min.js");
  if (!fs.existsSync(packagePath) || !fs.existsSync(modulePath)) {
    throw new Error("pinned offline Cytoscape.js runtime is unavailable after dependency installation");
  }
  const manifest = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  if (manifest.version !== PINNED_CYTOSCAPE_VERSION) {
    throw new Error(`Cytoscape.js ${PINNED_CYTOSCAPE_VERSION} is required; received ${String(manifest.version)}`);
  }
}

export async function connectSelectedClients(options) {
  const runProductSkillInstallation = options.runProductSkillInstallation ?? installProductSkills;
  const runProductSkillRollback = options.runProductSkillRollback ?? rollbackProductSkills;
  const runClientRegistration = options.runClientRegistration ?? registerClients;
  const skills = await runProductSkillInstallation(options);
  try {
    const registration = await runClientRegistration(options);
    return { registration, skills };
  } catch (error) {
    await runProductSkillRollback(skills);
    throw error;
  }
}

export async function runInstaller(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const environment = options.environment ?? process.env;
  const runRegistryResolution = options.runRegistryResolution ?? resolveRegistry;
  const runDependencyInstall = options.runDependencyInstall ?? installDependencies;
  const runClientRegistration = options.runClientRegistration ?? registerClients;
  const runProductSkillInstallation = options.runProductSkillInstallation ?? installProductSkills;
  const runProductSkillRollback = options.runProductSkillRollback ?? rollbackProductSkills;
  parseArgs(args);
  assertNodeVersion(options.nodeVersion ?? process.versions.node);
  const registry = privateRegistry(await runRegistryResolution(environment));
  await runDependencyInstall(registry, environment);
  verifyVisualizationRuntime();
  const interactive = Boolean(input.isTTY && output.isTTY && typeof input.setRawMode === "function");
  if (!interactive) {
    output.write("AgentBase-MCP: dependencies ready; interactive client registration skipped.\n");
    return { clients: [], registration: "skipped" };
  }

  const capabilities = terminalCapabilities(output, environment), glyph = ui(capabilities);
  renderHeader(output, capabilities);
  output.write(`${glyph.accent(glyph.success)} Dependencies ready\n\n`);
  const reader = new CharacterReader(input);
  input.setRawMode(true);
  input.resume();
  try {
    const clients = await readClientSelection(reader, output, capabilities);
    output.write(`${glyph.accent(glyph.success)} Clients selected: ${clients.map((client) => client === "codex" ? "Codex" : "Claude Code").join(", ")}\n\n`);
    step(output, capabilities, 2, "Connect clients", "Install product skills and register AgentBase-MCP.");
    output.write(`${glyph.pending} Installing AgentBase skills and MCP...\n`);
    const { registration, skills } = await connectSelectedClients({
      clients,
      repositoryRoot,
      nodeExecutable: process.execPath,
      environment,
      runClientRegistration,
      runProductSkillInstallation,
      runProductSkillRollback,
    });
    output.write(`\n${glyph.accent(glyph.success)} ${glyph.bold("AgentBase-MCP is ready")}\n\n`);
    for (const client of clients) {
      const label = client === "codex" ? "Codex" : "Claude Code";
      const result = registration.clients[client] === "already-registered" ? "Already connected" : "Connected";
      output.write(`  ${label.padEnd(13)} ${result}\n`);
      const skillResult = skills.clients[client] === "already-installed" ? "Already installed" : "Installed";
      output.write(`  ${`${label} skills`.padEnd(13)} ${skillResult} (${PRODUCT_SKILL_NAMES.length})\n`);
    }
    output.write("\n");
    output.write(`${glyph.bold("Next")}\n  Open a new ${clients.map((client) => client === "codex" ? "Codex" : "Claude Code").join(" or ")} session to load AgentBase-MCP.\n`);
    return { clients, registration, skills: skills.clients };
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
