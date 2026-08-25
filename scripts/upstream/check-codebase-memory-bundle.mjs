#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  ownedRuntimeTarget, verifyOwnedRuntimeBundle,
} from "../../src/providers/codebase-memory/index.ts";

const defaultProjectRoot = path.resolve(import.meta.dirname, "../..");

export async function checkCurrentCodebaseMemoryBundle(options = {}) {
  const projectRoot = fs.realpathSync(options.projectRoot ?? defaultProjectRoot);
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? process.arch;
  const target = ownedRuntimeTarget(platform, architecture);
  const runtime = await verifyOwnedRuntimeBundle({
    projectRoot,
    platform,
    architecture,
    runtimeRoot: path.join(projectRoot, "vendor/codebase-memory/artifacts", target),
  });
  return { target, runtime };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await checkCurrentCodebaseMemoryBundle();
    process.stdout.write(`Codebase Memory bundle verified: ${result.target}\n`);
  } catch (error) {
    process.stderr.write(`Codebase Memory bundle check failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
