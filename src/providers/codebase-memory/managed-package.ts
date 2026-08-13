import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import type { EngineIdentity } from "../../core/observations/index.ts";
import { CodebaseMemoryError } from "./errors.ts";
import { runBoundedProcess } from "./process.ts";

const PACKAGE_NAME = "codebase-memory-mcp";
const PACKAGE_VERSION = "0.10.1";
const PACKAGE_INTEGRITY = "sha512-/O013R5oM9dBLRzLbzOnhj8hAcFITbaTRUPrfqeFsj2DJADaogPnuTk3yNVorazpOmTmOk9pi+nFtkKsmX+Aog==";
const LINUX_X64_EXECUTABLE_SHA256 = "3380cf3b868d749c63f564e7c6b81381a140942ec42253f785e158ab5144064f";

export type ManagedPackage = Readonly<{
  packageRoot: string;
  executable: string;
  identity: EngineIdentity;
}>;

export type ManagedPackageOptions = Readonly<{
  projectRoot: string;
  packageJsonPath?: string;
  platform?: NodeJS.Platform;
  architecture?: string;
  expectedExecutableSha256?: string;
  allowRecovery?: boolean;
}>;

function readJson(file: string, operation: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
  } catch (cause) {
    throw new CodebaseMemoryError("MANAGED_PACKAGE_INVALID", operation, `cannot read ${path.basename(file)}`, { cause });
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function resolvePackageJson(projectRoot: string): string {
  try {
    return createRequire(path.join(projectRoot, "package.json")).resolve(`${PACKAGE_NAME}/package.json`);
  } catch (cause) {
    throw new CodebaseMemoryError("MANAGED_PACKAGE_MISSING", "resolve-managed-package", "managed Codebase Memory dependency is not installed", { cause });
  }
}

function lockfileIntegrity(projectRoot: string): string {
  const lock = objectValue(readJson(path.join(projectRoot, "package-lock.json"), "resolve-managed-package"));
  const packages = objectValue(lock.packages);
  const entry = objectValue(packages[`node_modules/${PACKAGE_NAME}`]);
  if (entry.version !== PACKAGE_VERSION || entry.integrity !== PACKAGE_INTEGRITY) {
    throw new CodebaseMemoryError("PACKAGE_INTEGRITY_FAILED", "resolve-managed-package", "lockfile does not bind the accepted package version and integrity");
  }
  return PACKAGE_INTEGRITY;
}

async function recoverBinary(packageRoot: string, projectRoot: string): Promise<void> {
  try {
    await runBoundedProcess({
      executable: process.execPath,
      args: [path.join(packageRoot, "install.js")],
      cwd: projectRoot,
      env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", npm_config_cache: process.env.npm_config_cache ?? "" },
      operation: "managed-package-recovery",
      timeoutMs: 120_000,
      maximumStdoutBytes: 256_000,
      maximumStderrBytes: 256_000,
    });
  } catch (cause) {
    throw new CodebaseMemoryError("BOOTSTRAP_OFFLINE", "managed-package-recovery", "package-owned binary recovery failed", { cause });
  }
}

export async function resolveManagedPackage(options: ManagedPackageOptions): Promise<ManagedPackage> {
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? process.arch;
  if (platform !== "linux" || architecture !== "x64") {
    throw new CodebaseMemoryError("UNSUPPORTED_PLATFORM", "resolve-managed-package", `unsupported walking-skeleton platform: ${platform}-${architecture}`);
  }
  const packageJsonPath = options.packageJsonPath ?? resolvePackageJson(options.projectRoot);
  const packageRoot = path.dirname(packageJsonPath);
  const packageJson = objectValue(readJson(packageJsonPath, "resolve-managed-package"));
  if (packageJson.name !== PACKAGE_NAME || packageJson.version !== PACKAGE_VERSION) {
    throw new CodebaseMemoryError("MANAGED_PACKAGE_INVALID", "resolve-managed-package", "managed package identity does not match the accepted dependency");
  }
  const packageIntegrity = lockfileIntegrity(options.projectRoot);
  const executable = path.join(packageRoot, "bin", "codebase-memory-mcp");
  if (!fs.existsSync(executable) && options.allowRecovery) await recoverBinary(packageRoot, options.projectRoot);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(executable);
    fs.accessSync(executable, fs.constants.X_OK);
  } catch (cause) {
    throw new CodebaseMemoryError("MANAGED_PACKAGE_MISSING", "resolve-managed-package", "package-private executable is missing or not executable", { cause });
  }
  if (!stat.isFile()) throw new CodebaseMemoryError("MANAGED_PACKAGE_INVALID", "resolve-managed-package", "package-private executable is not a regular file");
  const executableSha256 = createHash("sha256").update(fs.readFileSync(executable)).digest("hex");
  const expectedDigest = options.expectedExecutableSha256 ?? LINUX_X64_EXECUTABLE_SHA256;
  if (executableSha256 !== expectedDigest) {
    throw new CodebaseMemoryError("EXECUTABLE_INTEGRITY_FAILED", "resolve-managed-package", "package-private executable digest is not accepted");
  }
  const probe = await runBoundedProcess({
    executable,
    args: ["--version"],
    cwd: options.projectRoot,
    env: {},
    operation: "provider-version",
    timeoutMs: 15_000,
    maximumStdoutBytes: 4_096,
    maximumStderrBytes: 16_384,
  });
  if (probe.stdout.trim() !== `${PACKAGE_NAME} ${PACKAGE_VERSION}`) {
    throw new CodebaseMemoryError("EXECUTABLE_IDENTITY_FAILED", "provider-version", "package-private executable reported an incompatible identity");
  }
  return {
    packageRoot,
    executable,
    identity: {
      provider: PACKAGE_NAME,
      packageName: PACKAGE_NAME,
      providerVersion: PACKAGE_VERSION,
      packageIntegrity,
      executableSha256,
      adapterVersion: 1,
      invocationMode: "one-shot-cli",
    },
  };
}
