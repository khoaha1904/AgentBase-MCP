#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { AGENTBASE_VERSION } from "../../src/product-version.ts";
import { buildReleaseArtifact, resolveSourceIdentity } from "./release-artifact.mjs";

function command(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    stdio: options.stdio ?? "pipe",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = options.stdio === "inherit" ? "see gate output above" : (result.stderr || result.stdout || "no command output").trim();
    throw new Error(`${commandName} ${args.join(" ")} failed: ${detail}`);
  }
  return result.stdout?.trim() ?? "";
}

function assertSupportedNode(version = process.versions.node) {
  const [major, minor] = version.split(".").map(Number);
  if (major !== 24 || minor < 12) throw new Error(`release CI requires Node 24.12 or newer within major 24; received ${version}`);
}

export function resolveCiReleaseIdentity(projectRoot, environment = process.env) {
  assertSupportedNode();
  const expectedTag = `v${AGENTBASE_VERSION}`;
  if (environment.GITHUB_ACTIONS !== "true" || environment.GITHUB_REF_TYPE !== "tag"
    || environment.GITHUB_REF !== `refs/tags/${expectedTag}` || environment.GITHUB_REF_NAME !== expectedTag) {
    throw new Error(`release qualification requires the exact GitHub Actions tag refs/tags/${expectedTag}`);
  }
  const source = resolveSourceIdentity(projectRoot);
  if (environment.GITHUB_SHA !== source.commit) throw new Error("GitHub source identity differs from checked-out HEAD");
  const tagCommit = command("git", ["rev-parse", `refs/tags/${expectedTag}^{commit}`], { cwd: projectRoot });
  if (tagCommit !== source.commit) throw new Error("release tag target differs from checked-out HEAD");
  return Object.freeze({ tag: expectedTag, source });
}

function runRepositoryVerification(projectRoot, environment) {
  command("npm", ["run", "verify"], { cwd: projectRoot, env: environment, stdio: "inherit" });
}

export async function qualifyRelease(options) {
  const environment = options.environment ?? process.env;
  const verify = options.runVerification ?? runRepositoryVerification;
  const build = options.buildArtifact ?? buildReleaseArtifact;
  const before = resolveCiReleaseIdentity(options.projectRoot, environment);
  await verify(options.projectRoot, environment);
  const after = resolveCiReleaseIdentity(options.projectRoot, environment);
  if (before.source.commit !== after.source.commit || before.source.committedAt !== after.source.committedAt) {
    throw new Error("release source changed during repository verification");
  }
  return build({
    projectRoot: options.projectRoot,
    target: options.target,
    outputDirectory: options.outputDirectory,
    qualified: true,
  });
}

function parseArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index], value = args[index + 1];
    if (!value || value.startsWith("--") || (flag !== "--target" && flag !== "--output")) {
      throw new Error("Usage: npm run release:qualify -- [--target <platform>] [--output <directory>]");
    }
    if (flag === "--target") options.target = value;
    else options.outputDirectory = value;
  }
  return options;
}

export async function main(args = process.argv.slice(2), projectRoot = path.resolve(import.meta.dirname, "../..")) {
  try {
    const parsed = parseArguments(args);
    const outputDirectory = path.resolve(projectRoot, parsed.outputDirectory ?? "dist/releases");
    fs.mkdirSync(outputDirectory, { recursive: true, mode: 0o755 });
    const result = await qualifyRelease({ projectRoot, target: parsed.target, outputDirectory });
    process.stdout.write(`${result.archive}\n${result.outerChecksum}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`AgentBase release qualification failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main();
