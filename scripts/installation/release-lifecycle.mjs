import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { RELEASE_CONTROL_FILES as CONTROL_FILES, verifyExtractedRelease, walkReleaseFiles } from "./release-bundle.mjs";
import {
  applyReleaseIntegration,
  beginReleaseIntegration,
  commitReleaseIntegration,
  planReleaseIntegration,
  recoverReleaseIntegration,
  rollbackReleaseIntegration,
} from "./release-integration.mjs";

const RELEASE_ID = /^agentbase-mcp-[0-9]+\.[0-9]+\.[0-9]+-(?:linux-x64|darwin-arm64)$/;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exists(target) {
  try { fs.lstatSync(target); return true; }
  catch (error) { if (error?.code === "ENOENT") return false; throw error; }
}

function safeDirectory(directory, create = true) {
  if (!exists(directory)) {
    if (!create) throw new Error(`managed directory is missing: ${directory}`);
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  }
  const metadata = fs.lstatSync(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()
    || typeof process.getuid === "function" && metadata.uid !== process.getuid()) {
    throw new Error(`managed directory is unsafe: ${directory}`);
  }
  fs.chmodSync(directory, 0o700);
}

export function lifecyclePaths(environment = process.env) {
  const home = environment.HOME || os.homedir();
  const root = path.normalize(environment.AGENTBASE_HOME || path.join(home, ".agentbase"));
  if (!path.isAbsolute(root)) throw new Error("AGENTBASE_HOME must be absolute");
  const runtime = path.join(root, "runtime");
  return Object.freeze({
    root,
    bin: path.join(root, "bin"),
    launcher: path.join(root, "bin", "abs"),
    runtime,
    releases: path.join(runtime, "releases"),
    control: path.join(runtime, "control"),
    current: path.join(runtime, "current"),
    previous: path.join(runtime, "previous"),
    lock: path.join(runtime, "install.lock"),
    state: path.join(root, "state", "installation"),
    receipt: path.join(root, "state", "installation", "transaction.json"),
    tmp: path.join(root, "tmp"),
    commandLink: path.join(home, ".local", "bin", "abs"),
  });
}

function initializePaths(paths) {
  safeDirectory(paths.root);
  for (const directory of [paths.bin, paths.runtime, paths.releases, paths.state, paths.tmp]) safeDirectory(directory);
}

function atomicWrite(file, content, mode = 0o600) {
  safeDirectory(path.dirname(file));
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${randomUUID()}.tmp`);
  fs.writeFileSync(temporary, content, { flag: "wx", mode });
  fs.renameSync(temporary, file);
  fs.chmodSync(file, mode);
}

function readPointer(file) {
  if (!exists(file)) return null;
  const metadata = fs.lstatSync(file);
  if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o077)) throw new Error(`release pointer is unsafe: ${file}`);
  const value = fs.readFileSync(file, "utf8");
  if (!RELEASE_ID.test(value.trim()) || value !== `${value.trim()}\n`) throw new Error(`release pointer is invalid: ${file}`);
  return value.trim();
}

function writePointer(file, value) {
  if (value === null) fs.rmSync(file, { force: true });
  else {
    if (!RELEASE_ID.test(value)) throw new Error(`release pointer identity is invalid: ${value}`);
    atomicWrite(file, `${value}\n`);
  }
}

function treeDigest(root) {
  const hash = createHash("sha256");
  for (const relative of walkReleaseFiles(root)) {
    const file = path.join(root, ...relative.split("/"));
    hash.update(relative).update("\0").update(String(fs.statSync(file).mode & 0o777)).update("\0");
    hash.update(fs.readFileSync(file)).update("\0");
  }
  return hash.digest("hex");
}

function copyTree(source, destination) {
  safeDirectory(destination);
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const from = path.join(source, entry.name), to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) {
      fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
      fs.chmodSync(to, fs.statSync(from).mode & 0o777);
    } else throw new Error(`release copy contains a link or special file: ${from}`);
  }
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function renderStableLauncher(paths, nodeExecutable = process.execPath) {
  return `#!/bin/sh
set -eu
agentbase_home=${shellQuote(paths.root)}
agentbase_node=${shellQuote(fs.realpathSync(nodeExecutable))}
case "\${1-}" in
  upgrade|rollback|uninstall)
    exec "$agentbase_node" "$agentbase_home/runtime/control/release-control.mjs" "$@"
    ;;
esac
agentbase_entry="$("$agentbase_node" "$agentbase_home/runtime/control/release-control.mjs" resolve)"
exec "$agentbase_node" "$agentbase_entry" "$@"
`;
}

export function resolveCurrentEntrypoint(environment = process.env) {
  const paths = lifecyclePaths(environment), current = readPointer(paths.current);
  if (!current) throw new Error("AgentBase has no selected release");
  const releaseRoot = path.join(paths.releases, current), entrypoint = path.join(releaseRoot, "src", "cli.ts");
  const rootMetadata = fs.lstatSync(releaseRoot), entryMetadata = fs.lstatSync(entrypoint);
  if (!rootMetadata.isDirectory() || rootMetadata.isSymbolicLink()
    || !entryMetadata.isFile() || entryMetadata.isSymbolicLink()
    || !entrypoint.startsWith(`${paths.releases}${path.sep}`)) {
    throw new Error("AgentBase current release entrypoint is unsafe");
  }
  return entrypoint;
}

function controlDigest(releaseRoot) {
  const hash = createHash("sha256");
  for (const name of CONTROL_FILES) {
    const file = path.join(releaseRoot, "scripts", "installation", name);
    if (!exists(file) || !fs.lstatSync(file).isFile()) throw new Error(`release lifecycle control is missing: ${name}`);
    hash.update(name).update("\0").update(fs.readFileSync(file)).update("\0");
  }
  return hash.digest("hex");
}

function installedControlDigest(paths) {
  const hash = createHash("sha256");
  for (const name of CONTROL_FILES) {
    const file = path.join(paths.control, name);
    if (!exists(file) || !fs.lstatSync(file).isFile()) throw new Error(`installed lifecycle control is missing: ${name}`);
    hash.update(name).update("\0").update(fs.readFileSync(file)).update("\0");
  }
  return hash.digest("hex");
}

function verifyControlIdentity(paths) {
  const file = path.join(paths.control, "identity.json");
  let identity;
  try { identity = JSON.parse(fs.readFileSync(file, "utf8")); } catch { throw new Error("installed lifecycle control identity is invalid"); }
  if (identity?.schema !== 1 || !/^[a-f0-9]{64}$/.test(identity.digest)
    || identity.digest !== installedControlDigest(paths)) {
    throw new Error("installed lifecycle control differs from installer-owned state");
  }
  return identity.digest;
}

function commandLinkTarget(paths) {
  if (!exists(paths.commandLink)) return null;
  const metadata = fs.lstatSync(paths.commandLink);
  if (!metadata.isSymbolicLink()) throw new Error(`command link conflicts with an unmanaged path: ${paths.commandLink}`);
  return fs.readlinkSync(paths.commandLink);
}

function verifyManagedIntegration(paths, launcher) {
  if (!exists(paths.launcher) || !fs.lstatSync(paths.launcher).isFile()
    || sha256(fs.readFileSync(paths.launcher)) !== sha256(launcher)) {
    throw new Error("stable launcher differs from installer-owned state");
  }
  if (commandLinkTarget(paths) !== paths.launcher) throw new Error("abs command link differs from installer-owned state");
}

function assertReleaseClosure(paths, allowed) {
  const expected = new Set(allowed.filter(Boolean));
  for (const name of fs.readdirSync(paths.releases)) {
    const target = path.join(paths.releases, name);
    if (!expected.has(name) || !RELEASE_ID.test(name) || !fs.lstatSync(target).isDirectory()
      || fs.lstatSync(target).isSymbolicLink()) {
      throw new Error(`unexpected release state blocks the lifecycle transaction: ${name}`);
    }
  }
}

function versionParts(releaseId) {
  const match = /^agentbase-mcp-([0-9]+)\.([0-9]+)\.([0-9]+)-/.exec(releaseId);
  if (!match) throw new Error(`release identity is invalid: ${releaseId}`);
  return match.slice(1).map(Number);
}

function newerRelease(candidate, current) {
  const left = versionParts(candidate), right = versionParts(current);
  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) return left[index] > right[index];
  }
  return false;
}

function persistReceipt(paths, receipt) {
  atomicWrite(paths.receipt, `${JSON.stringify(receipt, null, 2)}\n`);
}

function readReceipt(paths) {
  if (!exists(paths.receipt)) return null;
  const metadata = fs.lstatSync(paths.receipt);
  if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o077)) throw new Error("installation recovery receipt is unsafe");
  let value;
  try { value = JSON.parse(fs.readFileSync(paths.receipt, "utf8")); } catch { throw new Error("installation recovery receipt is malformed"); }
  if (value?.schema !== 1 || !["install", "upgrade", "rollback", "uninstall"].includes(value.operation)
    || typeof value.transactionId !== "string" || typeof value.phase !== "string"
    || !value.before || !Object.hasOwn(value.before, "current") || !Object.hasOwn(value.before, "previous")
    || value.target !== null && !RELEASE_ID.test(value.target)
    || value.before.current !== null && !RELEASE_ID.test(value.before.current)
    || value.before.previous !== null && !RELEASE_ID.test(value.before.previous)
    || typeof value.createdRelease !== "boolean"
    || value.createdRelease && !/^[a-f0-9]{64}$/.test(value.releaseDigest)
    || value.operation === "uninstall" && value.phase === "committed"
      && (!/^[a-f0-9]{64}$/.test(value.launcherDigest) || !/^[a-f0-9]{64}$/.test(value.controlDigest))) {
    throw new Error("installation recovery receipt is malformed");
  }
  return value;
}

function lockOwnerAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return true;
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error?.code === "ESRCH") return false; return true; }
}

function acquireLock(paths, operation) {
  safeDirectory(paths.runtime);
  if (exists(paths.lock)) {
    const metadata = fs.lstatSync(paths.lock);
    if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o077)) throw new Error("installation lock is unsafe");
    let owner;
    try { owner = JSON.parse(fs.readFileSync(paths.lock, "utf8")); } catch { throw new Error("installation lock is malformed"); }
    if (owner?.schema !== 1 || typeof owner.token !== "string" || typeof owner.operation !== "string") {
      throw new Error("installation lock is malformed");
    }
    if (lockOwnerAlive(owner.pid)) throw new Error(`installation is already running with PID ${String(owner.pid)}`);
    fs.rmSync(paths.lock);
  }
  const token = randomUUID();
  fs.writeFileSync(paths.lock, `${JSON.stringify({ schema: 1, pid: process.pid, token, operation })}\n`, { flag: "wx", mode: 0o600 });
  return () => {
    try {
      const owner = JSON.parse(fs.readFileSync(paths.lock, "utf8"));
      if (owner.token === token) fs.rmSync(paths.lock);
    } catch (error) { if (error?.code !== "ENOENT") throw error; }
  };
}

function removeExactRelease(paths, releaseId, digest) {
  const target = path.join(paths.releases, releaseId);
  if (!exists(target)) return;
  if (treeDigest(target) !== digest) throw new Error(`created release changed before recovery: ${releaseId}`);
  fs.rmSync(target, { recursive: true });
}

function removeInitialIntegration(paths, receipt) {
  if (exists(paths.commandLink)) {
    if (commandLinkTarget(paths) !== paths.launcher) throw new Error("command link changed before recovery");
    fs.rmSync(paths.commandLink);
  }
  if (exists(paths.launcher)) {
    if (sha256(fs.readFileSync(paths.launcher)) !== receipt.launcherDigest) throw new Error("launcher changed before recovery");
    fs.rmSync(paths.launcher);
  }
  if (exists(paths.control)) {
    if (verifyControlIdentity(paths) !== receipt.controlDigest) throw new Error("lifecycle control changed before recovery");
    fs.rmSync(paths.control, { recursive: true });
  }
}

function pruneReleases(paths, removable = []) {
  const keep = new Set([readPointer(paths.current), readPointer(paths.previous)].filter(Boolean));
  for (const name of fs.readdirSync(paths.releases)) {
    const target = path.join(paths.releases, name);
    if (keep.has(name)) continue;
    if (!removable.includes(name) || !RELEASE_ID.test(name) || !fs.lstatSync(target).isDirectory()) {
      throw new Error(`unexpected release state blocks cleanup: ${name}`);
    }
    fs.rmSync(target, { recursive: true });
  }
}

function finishUninstall(paths, receipt) {
  for (const target of [paths.current, paths.previous]) fs.rmSync(target, { force: true });
  if (exists(paths.releases)) {
    const expected = new Set([receipt.before.current, receipt.before.previous].filter(Boolean));
    for (const name of fs.readdirSync(paths.releases)) {
      if (!expected.has(name) || !RELEASE_ID.test(name)) throw new Error(`unexpected release state blocks uninstall: ${name}`);
      fs.rmSync(path.join(paths.releases, name), { recursive: true });
    }
    fs.rmdirSync(paths.releases);
  }
  if (exists(paths.commandLink)) {
    if (commandLinkTarget(paths) !== paths.launcher) throw new Error("command link changed during uninstall recovery");
    fs.rmSync(paths.commandLink);
  }
  if (exists(paths.launcher)) {
    if (sha256(fs.readFileSync(paths.launcher)) !== receipt.launcherDigest) throw new Error("launcher changed during uninstall recovery");
    fs.rmSync(paths.launcher);
  }
  if (exists(paths.control)) {
    if (verifyControlIdentity(paths) !== receipt.controlDigest) throw new Error("lifecycle control changed during uninstall recovery");
    fs.rmSync(paths.control, { recursive: true });
  }
}

async function recover(paths, options = {}) {
  const receipt = readReceipt(paths);
  await recoverReleaseIntegration(paths, {
    committed: receipt?.phase === "committed",
    environment: options.environment,
    clientAdapter: options.clientAdapter,
  });
  if (!receipt) return null;
  if (receipt.phase === "committed") {
    if (receipt.operation === "uninstall") finishUninstall(paths, receipt);
    else pruneReleases(paths, [receipt.before.previous].filter(Boolean));
  } else {
    writePointer(paths.current, receipt.before.current);
    writePointer(paths.previous, receipt.before.previous);
    if (receipt.createdRelease) removeExactRelease(paths, receipt.target, receipt.releaseDigest);
    if (receipt.operation === "install") removeInitialIntegration(paths, receipt);
  }
  fs.rmSync(paths.receipt);
  return receipt.operation;
}

async function verifyInstalled(paths, releaseId, verifyRelease) {
  if (!releaseId) throw new Error("AgentBase has no selected release");
  const root = path.join(paths.releases, releaseId);
  await verifyRelease(root, { releaseId });
  return root;
}

function prepareReceipt(paths, operation, target) {
  const receipt = {
    schema: 1,
    transactionId: randomUUID(),
    operation,
    phase: "prepared",
    target,
    before: { current: readPointer(paths.current), previous: readPointer(paths.previous) },
    createdRelease: false,
  };
  persistReceipt(paths, receipt);
  return receipt;
}

async function stageRelease(paths, releaseRoot, manifest, receipt, verifyRelease) {
  const target = path.join(paths.releases, manifest.release_id);
  if (exists(target)) {
    await verifyRelease(target, { releaseId: manifest.release_id });
    return target;
  }
  const stagingParent = path.join(paths.tmp, `release-${receipt.transactionId}`);
  const staging = path.join(stagingParent, manifest.release_id);
  try {
    copyTree(releaseRoot, staging);
    await verifyRelease(staging, { releaseId: manifest.release_id });
    receipt.releaseDigest = treeDigest(staging);
    receipt.createdRelease = true;
    receipt.phase = "release-staging";
    persistReceipt(paths, receipt);
    fs.renameSync(staging, target);
    receipt.phase = "release-staged";
    persistReceipt(paths, receipt);
    return target;
  } finally {
    if (exists(stagingParent)) fs.rmSync(stagingParent, { recursive: true });
  }
}

async function callHook(options, phase) {
  if (options.afterPhase) await options.afterPhase(phase);
}

export async function runApplicationLifecycle(operation, options = {}) {
  const environment = options.environment ?? process.env;
  const paths = lifecyclePaths(environment);
  initializePaths(paths);
  const releaseLock = acquireLock(paths, operation);
  const verifyRelease = options.verifyRelease ?? verifyExtractedRelease;
  const manageIntegration = options.integration !== false;
  const integrationOptions = (targetReleaseRoot) => ({
    targetReleaseRoot,
    environment,
    clientAdapter: options.clientAdapter,
  });
  try {
    await recover(paths, { environment, clientAdapter: options.clientAdapter });
    const launcher = renderStableLauncher(paths, options.nodeExecutable);
    const current = readPointer(paths.current), previous = readPointer(paths.previous);

    if (operation === "install" || operation === "upgrade") {
      if (!options.releaseRoot || !path.isAbsolute(options.releaseRoot)) throw new Error(`${operation} requires an absolute extracted release root`);
      const manifest = await verifyRelease(options.releaseRoot);
      if (manifest.runtime?.lifecycle_api !== 1) throw new Error("release lifecycle API is incompatible");
      if (operation === "install" && current) {
        if (current !== manifest.release_id) throw new Error("AgentBase is already installed; use abs upgrade --bundle");
        const installedRoot = await verifyInstalled(paths, current, verifyRelease);
        verifyManagedIntegration(paths, launcher);
        verifyControlIdentity(paths);
        assertReleaseClosure(paths, [current, previous]);
        if (!manageIntegration) return { status: "already-installed", current, previous };
        const plan = await planReleaseIntegration({
          operation,
          paths,
          currentReleaseId: current,
          targetReleaseRoot: installedRoot,
          targetManifest: manifest,
          clients: options.clients,
          environment,
          clientAdapter: options.clientAdapter,
        });
        beginReleaseIntegration(paths, plan);
        try {
          await applyReleaseIntegration(paths, integrationOptions(installedRoot));
          await commitReleaseIntegration(paths, integrationOptions(installedRoot));
          return { status: plan.beforeState ? "already-installed" : "integrated", current, previous };
        } catch (error) {
          await rollbackReleaseIntegration(paths, integrationOptions(installedRoot));
          throw error;
        }
      }
      if (operation === "install" && (exists(paths.launcher) || exists(paths.control) || exists(paths.commandLink)
        || exists(path.join(paths.releases, manifest.release_id)))) {
        throw new Error("initial installation collides with unmanaged or incomplete application state");
      }
      if (operation === "install" && !current) assertReleaseClosure(paths, []);
      if (operation === "upgrade" && !current) throw new Error("AgentBase is not installed");
      if (operation === "upgrade") {
        await verifyInstalled(paths, current, verifyRelease);
        if (previous) await verifyInstalled(paths, previous, verifyRelease);
        verifyManagedIntegration(paths, launcher);
        verifyControlIdentity(paths);
        assertReleaseClosure(paths, [current, previous, manifest.release_id]);
        if (current === manifest.release_id) return { status: "already-current", current, previous };
        if (!newerRelease(manifest.release_id, current)) throw new Error("upgrade bundle must have a newer semantic version");
      }
      const integrationPlan = manageIntegration ? await planReleaseIntegration({
        operation,
        paths,
        currentReleaseId: current,
        targetReleaseRoot: options.releaseRoot,
        targetManifest: manifest,
        clients: options.clients,
        environment,
        clientAdapter: options.clientAdapter,
      }) : null;
      const receipt = prepareReceipt(paths, operation, manifest.release_id);
      try {
        if (operation === "install") {
          receipt.controlDigest = controlDigest(options.releaseRoot);
          receipt.launcherDigest = sha256(launcher);
          persistReceipt(paths, receipt);
        }
        if (integrationPlan) beginReleaseIntegration(paths, integrationPlan);
        const installedRoot = await stageRelease(paths, options.releaseRoot, manifest, receipt, verifyRelease);
        await callHook(options, "release-staged");
        if (operation === "install") {
          const controlSource = path.join(installedRoot, "scripts", "installation");
          const controlStaging = path.join(paths.tmp, `control-${receipt.transactionId}`);
          safeDirectory(controlStaging);
          for (const name of CONTROL_FILES) fs.copyFileSync(path.join(controlSource, name), path.join(controlStaging, name), fs.constants.COPYFILE_EXCL);
          fs.writeFileSync(path.join(controlStaging, "identity.json"), `${JSON.stringify({ schema: 1, digest: receipt.controlDigest })}\n`,
            { flag: "wx", mode: 0o600 });
          fs.renameSync(controlStaging, paths.control);
          atomicWrite(paths.launcher, launcher, 0o700);
          fs.mkdirSync(path.dirname(paths.commandLink), { recursive: true });
          if (exists(paths.commandLink)) throw new Error(`command path already exists: ${paths.commandLink}`);
          fs.symlinkSync(paths.launcher, paths.commandLink);
          receipt.phase = "integration-staged";
          persistReceipt(paths, receipt);
          await callHook(options, "integration-staged");
        }
        if (integrationPlan) {
          await applyReleaseIntegration(paths, integrationOptions(installedRoot));
          await callHook(options, "integration-applied");
        }
        receipt.phase = "cutover";
        persistReceipt(paths, receipt);
        if (operation === "upgrade") writePointer(paths.previous, current);
        writePointer(paths.current, manifest.release_id);
        await callHook(options, "cutover");
        receipt.phase = "committed";
        persistReceipt(paths, receipt);
        if (integrationPlan) await commitReleaseIntegration(paths, integrationOptions(installedRoot));
        pruneReleases(paths, [receipt.before.previous].filter(Boolean));
        fs.rmSync(paths.receipt);
        return { status: operation === "install" ? "installed" : "upgraded", current: manifest.release_id,
          previous: readPointer(paths.previous) };
      } catch (error) {
        const activeReceipt = readReceipt(paths);
        if (activeReceipt?.phase !== "committed") {
          await recover(paths, { environment, clientAdapter: options.clientAdapter });
        }
        throw error;
      }
    }

    if (operation === "rollback") {
      if (!current || !previous) throw new Error("AgentBase rollback requires current and previous releases");
      await verifyInstalled(paths, current, verifyRelease);
      const targetRoot = await verifyInstalled(paths, previous, verifyRelease);
      const targetManifest = await verifyRelease(targetRoot, { releaseId: previous });
      verifyManagedIntegration(paths, launcher);
      verifyControlIdentity(paths);
      assertReleaseClosure(paths, [current, previous]);
      const integrationPlan = manageIntegration ? await planReleaseIntegration({
        operation,
        paths,
        currentReleaseId: current,
        targetReleaseRoot: targetRoot,
        targetManifest,
        environment,
        clientAdapter: options.clientAdapter,
      }) : null;
      const receipt = prepareReceipt(paths, operation, previous);
      try {
        if (integrationPlan) {
          beginReleaseIntegration(paths, integrationPlan);
          await applyReleaseIntegration(paths, integrationOptions(targetRoot));
          await callHook(options, "integration-applied");
        }
        receipt.phase = "cutover";
        persistReceipt(paths, receipt);
        writePointer(paths.current, previous);
        writePointer(paths.previous, current);
        await callHook(options, "cutover");
        receipt.phase = "committed";
        persistReceipt(paths, receipt);
        if (integrationPlan) await commitReleaseIntegration(paths, integrationOptions(targetRoot));
        pruneReleases(paths);
        fs.rmSync(paths.receipt);
        return { status: "rolled-back", current: previous, previous: current };
      } catch (error) {
        const activeReceipt = readReceipt(paths);
        if (activeReceipt?.phase !== "committed") {
          await recover(paths, { environment, clientAdapter: options.clientAdapter });
        }
        throw error;
      }
    }

    if (operation === "uninstall") {
      if (!current) {
        if (manageIntegration) await planReleaseIntegration({ operation, paths, currentReleaseId: null, environment,
          clientAdapter: options.clientAdapter });
        return { status: "already-uninstalled", current: null, previous: null };
      }
      await verifyInstalled(paths, current, verifyRelease);
      if (previous) await verifyInstalled(paths, previous, verifyRelease);
      verifyManagedIntegration(paths, launcher);
      verifyControlIdentity(paths);
      assertReleaseClosure(paths, [current, previous]);
      const integrationPlan = manageIntegration ? await planReleaseIntegration({
        operation,
        paths,
        currentReleaseId: current,
        environment,
        clientAdapter: options.clientAdapter,
      }) : null;
      const receipt = prepareReceipt(paths, operation, null);
      try {
        receipt.launcherDigest = sha256(fs.readFileSync(paths.launcher));
        receipt.controlDigest = installedControlDigest(paths);
        if (integrationPlan) {
          beginReleaseIntegration(paths, integrationPlan);
          await applyReleaseIntegration(paths, integrationOptions());
        }
        receipt.phase = "committed";
        persistReceipt(paths, receipt);
        await callHook(options, "committed");
        if (integrationPlan) await commitReleaseIntegration(paths, integrationOptions());
        finishUninstall(paths, receipt);
        fs.rmSync(paths.receipt);
        return { status: "uninstalled", current: null, previous: null };
      } catch (error) {
        const activeReceipt = readReceipt(paths);
        if (activeReceipt?.phase !== "committed") {
          await recover(paths, { environment, clientAdapter: options.clientAdapter });
        }
        throw error;
      }
    }
    throw new Error(`unsupported application lifecycle operation: ${operation}`);
  } finally {
    releaseLock();
    try { if (exists(paths.runtime) && fs.readdirSync(paths.runtime).length === 0) fs.rmdirSync(paths.runtime); } catch {}
    try { if (exists(paths.bin) && fs.readdirSync(paths.bin).length === 0) fs.rmdirSync(paths.bin); } catch {}
  }
}
