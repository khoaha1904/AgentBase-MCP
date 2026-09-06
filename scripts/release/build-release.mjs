#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";

import { buildReleaseArtifact } from "./release-artifact.mjs";

function parseArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index], value = args[index + 1];
    if (!value || value.startsWith("--") || (flag !== "--target" && flag !== "--output")) {
      throw new Error("Usage: npm run release:build -- [--target <platform>] [--output <directory>]");
    }
    if (flag === "--target") options.target = value;
    else options.outputDirectory = value;
  }
  return options;
}

export async function main(args = process.argv.slice(2), projectRoot = path.resolve(import.meta.dirname, "../..")) {
  try {
    const parsed = parseArguments(args);
    const result = await buildReleaseArtifact({
      projectRoot,
      target: parsed.target,
      outputDirectory: path.resolve(projectRoot, parsed.outputDirectory ?? "dist/releases"),
    });
    process.stdout.write(`${result.archive}\n${result.outerChecksum}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`AgentBase release build failed: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = await main();
