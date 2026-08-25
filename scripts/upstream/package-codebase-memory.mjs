#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  ownedRuntimeTarget, verifyOwnedRuntimeBundle,
} from "../../src/providers/codebase-memory/index.ts";
import { activatePreparedDirectory, prepareCodebaseMemory } from "./prepare-codebase-memory.mjs";

const defaultProjectRoot = path.resolve(import.meta.dirname, "../..");

export async function packagePreparedRuntime(options) {
  const projectRoot = fs.realpathSync(options.projectRoot);
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? process.arch;
  const target = ownedRuntimeTarget(platform, architecture);
  const verify = options.verifyBundle ?? verifyOwnedRuntimeBundle;
  const activate = options.activate ?? activatePreparedDirectory;
  const verification = { projectRoot, platform, architecture };
  const prepared = await verify({ ...verification, runtimeRoot: options.preparedRoot });
  const parent = path.join(projectRoot, "vendor/codebase-memory/artifacts");
  const destination = path.join(parent, target);
  fs.mkdirSync(parent, { recursive: true });
  const staging = path.join(parent, `.${target}-next-${process.pid}-${Date.now()}`);
  try {
    fs.cpSync(options.preparedRoot, staging, { recursive: true, errorOnExist: true, force: false });
    const copied = await verify({ ...verification, runtimeRoot: staging });
    if (copied.identity.executableSha256 !== prepared.identity.executableSha256
      || copied.identity.packageIntegrity !== prepared.identity.packageIntegrity) {
      throw new Error("packaged Codebase Memory identity changed while copying");
    }
    activate(staging, destination);
    return { target, bundleRoot: destination, identity: copied.identity };
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

export async function buildAndPackageCodebaseMemory() {
  const prepared = prepareCodebaseMemory();
  return packagePreparedRuntime({ projectRoot: defaultProjectRoot, preparedRoot: prepared.destination });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await buildAndPackageCodebaseMemory();
    process.stdout.write(`${result.bundleRoot}\n`);
  } catch (error) {
    process.stderr.write(`Codebase Memory packaging failed: ${error instanceof Error ? error.message : "unknown error"}\n`);
    process.exitCode = 1;
  }
}
