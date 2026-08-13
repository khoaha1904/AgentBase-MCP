import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { CodebaseMemoryError } from "./errors.ts";
import { resolveManagedPackage } from "./managed-package.ts";
import { invokeProviderTool, runBoundedProcess } from "./process.ts";

const PACKAGE_INTEGRITY = "sha512-/O013R5oM9dBLRzLbzOnhj8hAcFITbaTRUPrfqeFsj2DJADaogPnuTk3yNVorazpOmTmOk9pi+nFtkKsmX+Aog==";

function processRequest(args: readonly string[], overrides: Partial<Parameters<typeof runBoundedProcess>[0]> = {}) {
  return {
    executable: process.execPath,
    args,
    cwd: process.cwd(),
    env: {},
    operation: "test-process",
    timeoutMs: 2_000,
    maximumStdoutBytes: 4_096,
    maximumStderrBytes: 4_096,
    ...overrides,
  };
}

function managedFixture(versionOutput = "codebase-memory-mcp 0.10.1", integrity = PACKAGE_INTEGRITY) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agentbase-managed-package-"));
  const packageRoot = path.join(root, "node_modules", "codebase-memory-mcp");
  const binary = path.join(packageRoot, "bin", "codebase-memory-mcp");
  fs.mkdirSync(path.dirname(binary), { recursive: true });
  fs.writeFileSync(path.join(packageRoot, "package.json"), JSON.stringify({ name: "codebase-memory-mcp", version: "0.10.1" }));
  fs.writeFileSync(path.join(root, "package-lock.json"), JSON.stringify({
    packages: { "node_modules/codebase-memory-mcp": { version: "0.10.1", integrity } },
  }));
  fs.writeFileSync(binary, `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(`${versionOutput}\n`)});\n`);
  fs.chmodSync(binary, 0o700);
  const sha256 = createHash("sha256").update(fs.readFileSync(binary)).digest("hex");
  return {
    root,
    packageJsonPath: path.join(packageRoot, "package.json"),
    binary,
    sha256,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

async function rejectsCode(promise: Promise<unknown>, code: CodebaseMemoryError["code"]): Promise<void> {
  await assert.rejects(promise, (error) => error instanceof CodebaseMemoryError && error.code === code);
}

test("[AB-MVP-001][AB-MVP-003] invokes an absolute executable without shell interpretation", async () => {
  const marker = path.join(os.tmpdir(), `agentbase-shell-marker-${process.pid}`);
  const payload = `value;touch ${marker}`;
  const output = await runBoundedProcess(processRequest(["-e", "process.stdout.write(process.argv[1])", payload]));
  assert.equal(output.stdout, payload);
  assert.equal(fs.existsSync(marker), false);
});

test("[AB-MVP-003] returns typed timeout, output-limit, exit and conflict failures", async () => {
  await rejectsCode(runBoundedProcess(processRequest(["-e", "setInterval(() => {}, 1000)"], { timeoutMs: 30 })), "PROCESS_TIMEOUT");
  await rejectsCode(runBoundedProcess(processRequest(["-e", "process.stdout.write('x'.repeat(2048))"], { maximumStdoutBytes: 128 })), "PROCESS_OUTPUT_LIMIT");
  await rejectsCode(runBoundedProcess(processRequest(["-e", "process.exit(7)"])), "PROVIDER_EXIT");
  await rejectsCode(runBoundedProcess(processRequest(["-e", "process.stderr.write('cache-private conflict'); process.exit(2)"])), "PROVIDER_CONFLICT");
});

test("[AB-MVP-003] timeout remains bounded when a provider ignores graceful termination", async () => {
  const started = Date.now();
  await rejectsCode(runBoundedProcess(processRequest([
    "-e",
    "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)",
  ], { timeoutMs: 30 })), "PROCESS_TIMEOUT");
  assert.ok(Date.now() - started < 5_000);
});

test("[AB-MVP-003][AB-MVP-007] rejects malformed provider JSON", async () => {
  const fixture = managedFixture("not-json");
  try {
    await rejectsCode(invokeProviderTool({
      binary: fixture.binary,
      tool: "get_architecture",
      arguments: { project: "fixture" },
      cwd: fixture.root,
      environment: {},
      timeoutMs: 2_000,
      maximumStdoutBytes: 4_096,
      maximumStderrBytes: 4_096,
    }), "PROVIDER_MALFORMED_OUTPUT");
  } finally {
    fixture.cleanup();
  }
});

test("[AB-MVP-001][AB-MVP-002] resolves only the exact package-private executable and records identity", async () => {
  const fixture = managedFixture();
  try {
    const resolved = await resolveManagedPackage({
      projectRoot: fixture.root,
      packageJsonPath: fixture.packageJsonPath,
      expectedExecutableSha256: fixture.sha256,
    });
    assert.equal(resolved.executable, fixture.binary);
    assert.equal(resolved.identity.providerVersion, "0.10.1");
    assert.equal(resolved.identity.packageIntegrity, PACKAGE_INTEGRITY);
    assert.equal(resolved.identity.executableSha256, fixture.sha256);
  } finally {
    fixture.cleanup();
  }
});

test("[AB-MVP-001][AB-MVP-002] fails closed on lock integrity, executable integrity, identity and platform", async () => {
  const badLock = managedFixture(undefined, "sha512-wrong");
  const badIdentity = managedFixture("codebase-memory-mcp 9.9.9");
  try {
    await rejectsCode(resolveManagedPackage({
      projectRoot: badLock.root,
      packageJsonPath: badLock.packageJsonPath,
      expectedExecutableSha256: badLock.sha256,
    }), "PACKAGE_INTEGRITY_FAILED");
    await rejectsCode(resolveManagedPackage({
      projectRoot: badIdentity.root,
      packageJsonPath: badIdentity.packageJsonPath,
      expectedExecutableSha256: "0".repeat(64),
    }), "EXECUTABLE_INTEGRITY_FAILED");
    await rejectsCode(resolveManagedPackage({
      projectRoot: badIdentity.root,
      packageJsonPath: badIdentity.packageJsonPath,
      expectedExecutableSha256: badIdentity.sha256,
    }), "EXECUTABLE_IDENTITY_FAILED");
    await rejectsCode(resolveManagedPackage({
      projectRoot: badIdentity.root,
      packageJsonPath: badIdentity.packageJsonPath,
      platform: "darwin",
      architecture: "arm64",
    }), "UNSUPPORTED_PLATFORM");
  } finally {
    badLock.cleanup();
    badIdentity.cleanup();
  }
});

test("[AB-MVP-001][AB-MVP-002] missing binary is explicit and one package-owned recovery attempt fails as offline", async () => {
  const fixture = managedFixture();
  try {
    fs.rmSync(fixture.binary);
    await rejectsCode(resolveManagedPackage({
      projectRoot: fixture.root,
      packageJsonPath: fixture.packageJsonPath,
      expectedExecutableSha256: fixture.sha256,
    }), "MANAGED_PACKAGE_MISSING");
    await rejectsCode(resolveManagedPackage({
      projectRoot: fixture.root,
      packageJsonPath: fixture.packageJsonPath,
      expectedExecutableSha256: fixture.sha256,
      allowRecovery: true,
    }), "BOOTSTRAP_OFFLINE");
  } finally {
    fixture.cleanup();
  }
});
