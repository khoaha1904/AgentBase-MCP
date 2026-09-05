#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const CLIENT_IDS = new Set(["codex", "claude-code"]);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");

export class RegistrationError extends Error {
  constructor(code, client, message) { super(message); this.code = code; this.client = client; }
}

function exists(target) {
  try { fs.lstatSync(target); return true; }
  catch (error) { if (error?.code === "ENOENT") return false; throw error; }
}

function recoveryRoot(environment) {
  return path.join(environment.XDG_CONFIG_HOME || path.join(environment.HOME, ".config"), "agentbase-mcp", "registration");
}
const receiptFile = (environment) => path.join(recoveryRoot(environment), "install-registration.json");

function privateDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077)) {
    throw new RegistrationError("RECOVERY_STATE_UNSAFE", undefined, "registration recovery directory is unsafe");
  }
}

function atomicWrite(file, bytes) {
  privateDirectory(path.dirname(file));
  const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporary, bytes, { flag: "wx", mode: 0o600 });
  fs.renameSync(temporary, file);
}

function persist(environment, receipt) {
  atomicWrite(receiptFile(environment), `${JSON.stringify(receipt, null, 2)}\n`);
}

function loadReceipt(environment) {
  const file = receiptFile(environment);
  if (!exists(file)) return undefined;
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077)) {
    throw new RegistrationError("RECOVERY_STATE_UNSAFE", undefined, "registration recovery receipt is unsafe");
  }
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    if (value?.schema !== 1 || !/^[0-9a-f-]{36}$/.test(value.transactionId)
      || !Array.isArray(value.selected) || new Set(value.selected).size !== value.selected.length
      || value.selected.some((id) => !CLIENT_IDS.has(id)) || typeof value.clients !== "object") throw new Error();
    for (const id of value.selected) {
      const state = value.clients[id];
      if (!state || typeof state.executableIdentity !== "string" || typeof state.managementIdentity !== "string") throw new Error();
      if (state.snapshot !== null) {
        const expected = path.join(recoveryRoot(environment), value.transactionId, `${id}.snapshot`);
        if (state.snapshot !== expected) throw new Error();
        const snapshot = fs.lstatSync(expected);
        if (!snapshot.isFile() || snapshot.isSymbolicLink() || (snapshot.mode & 0o077)) throw new Error();
      }
    }
    return value;
  } catch {
    throw new RegistrationError("RECOVERY_STATE_UNSAFE", undefined, "registration recovery receipt is malformed");
  }
}

function executable(name, environment, client) {
  for (const directory of String(environment.PATH ?? "").split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.resolve(directory, name);
    try { fs.accessSync(candidate, fs.constants.X_OK); return fs.realpathSync(candidate); } catch {}
  }
  throw new RegistrationError("CLIENT_UNAVAILABLE", client, `${client} is not available`);
}

function executableIdentity(file) {
  const stat = fs.statSync(file);
  return `${file}:${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}`;
}

export function expectedClientEntry(repositoryRoot, nodeExecutable = process.execPath) {
  let root, command;
  try { root = fs.realpathSync(repositoryRoot); command = fs.realpathSync(nodeExecutable); }
  catch { throw new RegistrationError("CHECKOUT_INVALID", undefined, "AgentBase-MCP checkout is invalid"); }
  const entrypoint = path.join(root, "src", "cli.ts");
  if (!path.isAbsolute(root) || !fs.statSync(entrypoint).isFile()) {
    throw new RegistrationError("CHECKOUT_INVALID", undefined, "AgentBase-MCP checkout entrypoint is invalid");
  }
  return { name: "agentbase", transport: "stdio", command, args: [entrypoint, "mcp"], env: {}, envVars: [] };
}

function equivalent(actual, expected) {
  return actual?.transport === "stdio" && actual.command === expected.command
    && JSON.stringify(actual.args) === JSON.stringify(expected.args)
    && Object.keys(actual.env ?? {}).length === 0
    && (actual.envVars ?? []).length === 0;
}

function sameEntry(actual, expected) {
  return actual === undefined && expected === undefined
    || actual !== undefined && expected !== undefined && equivalent(actual, expected);
}

export function clientEntriesEqual(actual, expected) {
  return sameEntry(actual, expected);
}

export function stableClientEntry(stableLauncher) {
  if (!path.isAbsolute(stableLauncher)) {
    throw new RegistrationError("LAUNCHER_INVALID", undefined, "AgentBase stable launcher path must be absolute");
  }
  return { name: "agentbase", transport: "stdio", command: path.normalize(stableLauncher), args: ["mcp"], env: {}, envVars: [] };
}

export function isRecognizedCheckoutClientEntry(entry) {
  try {
    if (entry?.transport !== "stdio" || !path.isAbsolute(entry.command)
      || !Array.isArray(entry.args) || entry.args.length !== 2 || entry.args[1] !== "mcp"
      || !path.isAbsolute(entry.args[0]) || Object.keys(entry.env ?? {}).length !== 0
      || (entry.envVars ?? []).length !== 0) return false;
    const entrypoint = path.normalize(entry.args[0]);
    if (path.basename(entrypoint) !== "cli.ts" || path.basename(path.dirname(entrypoint)) !== "src") return false;
    const checkout = path.dirname(path.dirname(entrypoint));
    const entryMetadata = fs.lstatSync(entrypoint), commandMetadata = fs.lstatSync(entry.command);
    const packageFile = path.join(checkout, "package.json"), packageMetadata = fs.lstatSync(packageFile);
    if (!entryMetadata.isFile() || entryMetadata.isSymbolicLink()
      || !commandMetadata.isFile() || commandMetadata.isSymbolicLink() || !(commandMetadata.mode & 0o111)
      || !packageMetadata.isFile() || packageMetadata.isSymbolicLink()) return false;
    const manifest = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    return manifest?.name === "agentbase-mcp" && manifest?.type === "module" && manifest?.bin?.abs === "./src/cli.ts";
  } catch {
    return false;
  }
}

function clientConfig(client, environment) {
  return client === "codex"
    ? path.join(environment.CODEX_HOME || path.join(environment.HOME, ".codex"), "config.toml")
    : path.join(environment.HOME, ".claude.json");
}

async function invoke(descriptor, args, environment, missingAllowed = false) {
  try {
    const value = await execFile(descriptor.executable, args, { env: environment, timeout: 15_000, maxBuffer: 262_144, encoding: "utf8" });
    return { ok: true, stdout: value.stdout };
  } catch (error) {
    if (missingAllowed) return { ok: false, stdout: String(error.stdout ?? "") };
    throw new RegistrationError("CLIENT_COMMAND_FAILED", descriptor.id, `${descriptor.id} MCP command failed`);
  }
}

async function inspect(descriptor, environment) {
  if (descriptor.id === "codex") {
    const result = await invoke(descriptor, ["mcp", "list", "--json"], environment, true);
    if (!result.ok) throw new RegistrationError("ENTRY_UNINSPECTABLE", descriptor.id, "Codex MCP entries are uninspectable");
    try {
      const item = JSON.parse(result.stdout).find((value) => value.name === "agentbase");
      if (!item) return undefined;
      const transport = item.transport;
      return { transport: transport.type, command: transport.command, args: transport.args ?? [], env: transport.env ?? {}, envVars: transport.env_vars ?? [] };
    } catch { throw new RegistrationError("ENTRY_UNINSPECTABLE", descriptor.id, "Codex agentbase entry is uninspectable"); }
  }
  const result = await invoke(descriptor, ["mcp", "get", "agentbase"], environment, true);
  if (!result.ok) {
    try {
      const entry = JSON.parse(fs.readFileSync(descriptor.config, "utf8")).mcpServers?.agentbase;
      if (entry) throw new RegistrationError("ENTRY_UNINSPECTABLE", descriptor.id, "Claude Code agentbase entry is uninspectable");
    } catch (error) { if (error instanceof RegistrationError) throw error; }
    return undefined;
  }
  try {
    const entry = JSON.parse(fs.readFileSync(descriptor.config, "utf8")).mcpServers?.agentbase;
    if (!entry) throw new Error();
    return { transport: entry.type ?? "stdio", command: entry.command, args: entry.args ?? [], env: entry.env ?? {}, envVars: [] };
  } catch { throw new RegistrationError("ENTRY_UNINSPECTABLE", descriptor.id, "Claude Code agentbase entry is uninspectable"); }
}

async function admit(selected, environment) {
  const descriptors = [];
  for (const id of selected) {
    if (!CLIENT_IDS.has(id)) throw new RegistrationError("CLIENT_UNSUPPORTED", id, `unsupported MCP client: ${id}`);
    const descriptor = {
      id,
      executable: executable(id === "codex" ? "codex" : "claude", environment, id),
      config: clientConfig(id, environment),
    };
    descriptor.executableIdentity = executableIdentity(descriptor.executable);
    const help = await invoke(descriptor, ["mcp", "add", "--help"], environment);
    if (!/Usage:/i.test(help.stdout) || (id === "claude-code" && !/--scope/.test(help.stdout))) {
      throw new RegistrationError("CLIENT_UNSUPPORTED", id, `${id} MCP management surface is unsupported`);
    }
    const version = await invoke(descriptor, ["--version"], environment);
    if (!version.stdout.trim()) throw new RegistrationError("CLIENT_UNSUPPORTED", id, `${id} version is unavailable`);
    descriptor.managementIdentity = sha(`${descriptor.executableIdentity}\n${version.stdout.trim()}\n${help.stdout.trim()}`);
    descriptors.push(descriptor);
  }
  return descriptors;
}

function takeSnapshot(descriptor, directory) {
  if (!exists(descriptor.config)) return { configExisted: false, beforeDigest: null, snapshot: null };
  const stat = fs.lstatSync(descriptor.config);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new RegistrationError("RECOVERY_STATE_UNSAFE", descriptor.id, `${descriptor.id} configuration is unsafe`);
  const bytes = fs.readFileSync(descriptor.config), snapshot = path.join(directory, `${descriptor.id}.snapshot`);
  atomicWrite(snapshot, bytes);
  return { configExisted: true, beforeDigest: sha(bytes), snapshot };
}

function restoreConfig(file, bytes) {
  const parent = path.dirname(file), parentStat = fs.lstatSync(parent);
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) throw new Error("unsafe client configuration directory");
  const temporary = path.join(parent, `.agentbase-restore-${process.pid}-${crypto.randomUUID()}`);
  fs.writeFileSync(temporary, bytes, { flag: "wx", mode: 0o600 });
  fs.renameSync(temporary, file);
}

const currentDigest = (file) => exists(file) ? sha(fs.readFileSync(file)) : null;

async function add(descriptor, expected, environment) {
  const args = descriptor.id === "codex"
    ? ["mcp", "add", "agentbase", "--", expected.command, ...expected.args]
    : ["mcp", "add", "--transport", "stdio", "--scope", "user", "agentbase", "--", expected.command, ...expected.args];
  await invoke(descriptor, args, environment);
}

function assertExecutableIdentity(descriptor) {
  if (executableIdentity(descriptor.executable) !== descriptor.executableIdentity) {
    throw new RegistrationError("CLIENT_UNSUPPORTED", descriptor.id, `${descriptor.id} changed during registration`);
  }
}

async function remove(descriptor, environment) {
  const args = descriptor.id === "codex"
    ? ["mcp", "remove", "agentbase"]
    : ["mcp", "remove", "--scope", "user", "agentbase"];
  await invoke(descriptor, args, environment);
}

export function createReleaseClientAdapter(environment = process.env) {
  const descriptors = new Map();
  const descriptorFor = async (client) => {
    if (!descriptors.has(client)) descriptors.set(client, (await admit([client], environment))[0]);
    return descriptors.get(client);
  };
  return Object.freeze({
    async inspect(client) {
      return inspect(await descriptorFor(client), environment);
    },
    async transition(client, from, to, options = {}) {
      const descriptor = await descriptorFor(client);
      let actual = await inspect(descriptor, environment);
      if (sameEntry(actual, to)) return;
      const interruptedReplacement = options.allowIntermediateAbsent
        && actual === undefined && from !== undefined && to !== undefined;
      if (!sameEntry(actual, from) && !interruptedReplacement) {
        throw new RegistrationError("CONCURRENT_CONFIG_CHANGE", client, `${client} agentbase entry changed during release integration`);
      }
      assertExecutableIdentity(descriptor);
      if (actual !== undefined) {
        await remove(descriptor, environment);
        actual = await inspect(descriptor, environment);
        if (actual !== undefined) throw new RegistrationError("VERIFY_MISMATCH", client, `${client} agentbase entry removal failed`);
      }
      if (to !== undefined) {
        await add(descriptor, to, environment);
        actual = await inspect(descriptor, environment);
        if (!sameEntry(actual, to)) throw new RegistrationError("VERIFY_MISMATCH", client, `${client} agentbase entry update failed`);
      }
    },
  });
}

async function rollback(receipt, descriptors, expected, environment) {
  receipt.phase = "rolling-back"; persist(environment, receipt);
  for (const id of [...receipt.selected].reverse()) {
    const state = receipt.clients[id], descriptor = descriptors.get(id);
    if (!state || state.preExisting || state.state === "removed") continue;
    try {
      const actual = await inspect(descriptor, environment);
      if (actual && !equivalent(actual, expected) && currentDigest(descriptor.config) !== state.postDigest) {
        throw new RegistrationError("CONCURRENT_CONFIG_CHANGE", id, `${id} agentbase entry changed during registration`);
      }
      if (actual) {
        state.postDigest ??= currentDigest(descriptor.config); persist(environment, receipt);
        await remove(descriptor, environment);
      }
      if (await inspect(descriptor, environment)) throw new Error();
      state.state = "removed"; persist(environment, receipt);
    } catch {
      if (state.snapshot && currentDigest(descriptor.config) === state.postDigest) {
        restoreConfig(descriptor.config, fs.readFileSync(state.snapshot));
        state.state = "removed"; persist(environment, receipt); continue;
      }
      receipt.phase = "recovery-required"; persist(environment, receipt);
      throw new RegistrationError("ROLLBACK_FAILED", id, `${id} registration needs recovery at ${receiptFile(environment)}`);
    }
  }
  fs.rmSync(recoveryRoot(environment), { recursive: true, force: true });
}

export async function registerClients({ clients, repositoryRoot, nodeExecutable, environment = process.env }) {
  const selected = [...new Set(clients)], expected = expectedClientEntry(repositoryRoot, nodeExecutable);
  const unfinished = loadReceipt(environment);
  const requiredClients = [...new Set([...(unfinished?.selected ?? []), ...selected])];
  const admitted = await admit(requiredClients, environment), descriptorMap = new Map(admitted.map((value) => [value.id, value]));
  if (unfinished) {
    if (unfinished.expectedDigest !== sha(JSON.stringify(expected))) {
      throw new RegistrationError("RECOVERY_STATE_UNSAFE", undefined, "registration recovery belongs to another checkout");
    }
    for (const id of unfinished.selected) {
      if (unfinished.clients[id]?.executableIdentity !== descriptorMap.get(id)?.executableIdentity
        || unfinished.clients[id]?.managementIdentity !== descriptorMap.get(id)?.managementIdentity) {
        throw new RegistrationError("RECOVERY_STATE_UNSAFE", id, `${id} changed since the interrupted registration`);
      }
    }
    await rollback(unfinished, descriptorMap, expected, environment);
  }
  const selectedDescriptors = admitted.filter(({ id }) => selected.includes(id));
  const states = {};
  for (const descriptor of selectedDescriptors) {
    const actual = await inspect(descriptor, environment);
    if (actual && !equivalent(actual, expected)) {
      throw new RegistrationError("ENTRY_CONFLICT", descriptor.id, `${descriptor.id} already has a different agentbase entry; remove or rename it deliberately`);
    }
    states[descriptor.id] = { executableIdentity: descriptor.executableIdentity, managementIdentity: descriptor.managementIdentity, preExisting: Boolean(actual), state: actual ? "unchanged" : "absent" };
  }
  if (selectedDescriptors.every(({ id }) => states[id].preExisting)) {
    return { status: "registered", clients: Object.fromEntries(selectedDescriptors.map(({ id }) => [id, "already-registered"])) };
  }
  const transactionDirectory = path.join(recoveryRoot(environment), crypto.randomUUID());
  privateDirectory(transactionDirectory);
  for (const descriptor of selectedDescriptors) Object.assign(states[descriptor.id], takeSnapshot(descriptor, transactionDirectory));
  const receipt = { schema: 1, transactionId: path.basename(transactionDirectory), expectedDigest: sha(JSON.stringify(expected)), selected, phase: "prepared", clients: states };
  persist(environment, receipt);
  try {
    receipt.phase = "adding"; persist(environment, receipt);
    for (const descriptor of selectedDescriptors) {
      const state = states[descriptor.id];
      if (state.preExisting) continue;
      assertExecutableIdentity(descriptor);
      if (currentDigest(descriptor.config) !== state.beforeDigest || await inspect(descriptor, environment)) {
        throw new RegistrationError("CONCURRENT_CONFIG_CHANGE", descriptor.id, `${descriptor.id} configuration changed after preflight`);
      }
      state.state = "add-started"; persist(environment, receipt);
      await add(descriptor, expected, environment);
      state.postDigest = currentDigest(descriptor.config); state.state = "added"; persist(environment, receipt);
      if (!equivalent(await inspect(descriptor, environment), expected)) {
        throw new RegistrationError("VERIFY_MISMATCH", descriptor.id, `${descriptor.id} agentbase entry verification failed`);
      }
      state.state = "verified"; persist(environment, receipt);
    }
    for (const descriptor of selectedDescriptors) {
      assertExecutableIdentity(descriptor);
      if (!equivalent(await inspect(descriptor, environment), expected)) {
        throw new RegistrationError("VERIFY_MISMATCH", descriptor.id, `${descriptor.id} agentbase entry changed before commit`);
      }
    }
    fs.rmSync(recoveryRoot(environment), { recursive: true, force: true });
    return { status: "registered", clients: Object.fromEntries(selectedDescriptors.map(({ id }) => [id, states[id].preExisting ? "already-registered" : "registered"])) };
  } catch (error) {
    await rollback(receipt, descriptorMap, expected, environment);
    throw error;
  }
}
