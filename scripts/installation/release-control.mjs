#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";

import { extractReleaseArchive, verifyOuterChecksum } from "./release-bundle.mjs";
import { lifecyclePaths, resolveCurrentEntrypoint, runApplicationLifecycle } from "./release-lifecycle.mjs";

function parse(args) {
  const [operation, ...rest] = args;
  if (operation === "resolve" || operation === "rollback" || operation === "uninstall") {
    if (rest.length) throw new Error(`${operation} accepts no arguments`);
    return { operation };
  }
  if (operation === "install" && rest.length >= 2 && rest[0] === "--release-root" && path.isAbsolute(rest[1])) {
    if (rest.length === 2) return { operation, releaseRoot: rest[1] };
    if (rest.length === 4 && rest[2] === "--clients") {
      return { operation, releaseRoot: rest[1], clients: parseClients(rest[3]) };
    }
  }
  if (operation === "upgrade" && rest.length === 2 && rest[0] === "--bundle" && path.isAbsolute(rest[1])) {
    return { operation, bundle: rest[1] };
  }
  throw new Error("expected install --release-root <path> [--clients codex,claude-code], upgrade --bundle <file>, rollback or uninstall");
}

export function parseClients(value) {
  const aliases = { "1": ["codex"], "2": ["claude-code"], "3": ["codex", "claude-code"] };
  const clients = aliases[value] ?? value.split(",").map((client) => client.trim()).filter(Boolean);
  const selected = new Set(clients);
  if (!selected.size || selected.size !== clients.length
    || [...selected].some((client) => client !== "codex" && client !== "claude-code")) {
    throw new Error("clients must be codex, claude-code or codex,claude-code");
  }
  return ["codex", "claude-code"].filter((client) => selected.has(client));
}

async function selectClients(input, output) {
  if (!input.isTTY || !output.isTTY) {
    throw new Error("non-interactive install requires --clients codex,claude-code");
  }
  const prompt = createInterface({ input, output });
  try {
    output.write("AgentBase clients:\n  1) Codex\n  2) Claude Code\n  3) Both\n");
    while (true) {
      const answer = await prompt.question("Select 1, 2 or 3: ");
      try { return parseClients(answer.trim()); }
      catch { output.write("Choose 1, 2 or 3.\n"); }
    }
  } finally {
    prompt.close();
  }
}

export async function main(args = process.argv.slice(2), environment = process.env, io = {}) {
  let extraction;
  try {
    const request = parse(args);
    if (request.operation === "resolve") {
      process.stdout.write(`${resolveCurrentEntrypoint(environment)}\n`);
      return 0;
    }
    let releaseRoot = request.releaseRoot;
    const clients = request.operation === "install"
      ? request.clients ?? await selectClients(io.input ?? process.stdin, io.output ?? process.stdout)
      : undefined;
    if (request.operation === "upgrade") {
      verifyOuterChecksum(request.bundle);
      const paths = lifecyclePaths(environment);
      fs.mkdirSync(paths.tmp, { recursive: true, mode: 0o700 });
      extraction = fs.mkdtempSync(path.join(paths.tmp, "upgrade-"));
      releaseRoot = extractReleaseArchive(request.bundle, extraction);
    }
    const result = await runApplicationLifecycle(request.operation, { environment, releaseRoot, clients });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`AgentBase lifecycle failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  } finally {
    if (extraction) fs.rmSync(extraction, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main();
