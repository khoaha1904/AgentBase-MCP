import fs from "node:fs";
import path from "node:path";

import {
  ownedRuntimeTarget, verifyOwnedRuntimeBundle,
} from "../../src/providers/codebase-memory/index.ts";
import { activatePreparedDirectory } from "../upstream/prepare-codebase-memory.mjs";

const defaultProjectRoot = path.resolve(import.meta.dirname, "../..");

export async function activateBundledCodebaseMemory(options = {}) {
  const projectRoot = fs.realpathSync(options.projectRoot ?? defaultProjectRoot);
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? process.arch;
  const target = ownedRuntimeTarget(platform, architecture);
  const bundleRoot = path.join(projectRoot, "vendor/codebase-memory/artifacts", target);
  const activeRoot = path.join(projectRoot, "build/providers/codebase-memory", target);
  const verify = options.verifyBundle ?? verifyOwnedRuntimeBundle;
  const activate = options.activate ?? activatePreparedDirectory;
  const verification = { projectRoot, platform, architecture };
  const bundle = await verify({ ...verification, runtimeRoot: bundleRoot });

  if (fs.existsSync(activeRoot)) {
    try {
      const active = await verify({ ...verification, runtimeRoot: activeRoot });
      if (active.identity.executableSha256 === bundle.identity.executableSha256
        && active.identity.packageIntegrity === bundle.identity.packageIntegrity) {
        return { status: "already-active", target, runtimeRoot: activeRoot };
      }
    } catch {
      // A valid release bundle may replace an invalid private active copy.
    }
  }

  const parent = path.dirname(activeRoot);
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const staging = path.join(parent, `.${target}-next-${process.pid}-${Date.now()}`);
  try {
    fs.cpSync(bundleRoot, staging, { recursive: true, errorOnExist: true, force: false });
    const staged = await verify({ ...verification, runtimeRoot: staging });
    if (staged.identity.executableSha256 !== bundle.identity.executableSha256
      || staged.identity.packageIntegrity !== bundle.identity.packageIntegrity) {
      throw new Error("staged Codebase Memory bundle identity changed during activation");
    }
    activate(staging, activeRoot);
    return { status: "activated", target, runtimeRoot: activeRoot };
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}
