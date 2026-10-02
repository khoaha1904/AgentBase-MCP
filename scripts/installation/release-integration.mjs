import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  clientEntriesEqual,
  createReleaseClientAdapter,
  isRecognizedCheckoutClientEntry,
  stableClientEntry,
} from "./client-registration.mjs";
import {
  MANAGED_PRODUCT_SKILL_NAMES,
  isReleasedSkillCatalog,
  productSkillDirectoryDigest,
  productSkillRoot,
} from "./product-skills.mjs";

const CLIENT_ORDER = Object.freeze(["codex", "claude-code"]);
const CLIENT_IDS = new Set(CLIENT_ORDER);
const RELEASE_ID = /^agentbase-mcp-[0-9]+\.[0-9]+\.[0-9]+-(?:linux-x64|darwin-arm64)$/;
const DIGEST = /^[a-f0-9]{64}$/;

function exists(target) {
  try { fs.lstatSync(target); return true; }
  catch (error) { if (error?.code === "ENOENT") return false; throw error; }
}

function privateDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const metadata = fs.lstatSync(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()
    || typeof process.getuid === "function" && metadata.uid !== process.getuid()) {
    throw new Error(`integration directory is unsafe: ${directory}`);
  }
  fs.chmodSync(directory, 0o700);
}

function atomicWrite(file, content) {
  privateDirectory(path.dirname(file));
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${randomUUID()}.tmp`);
  fs.writeFileSync(temporary, content, { flag: "wx", mode: 0o600 });
  fs.renameSync(temporary, file);
  fs.chmodSync(file, 0o600);
}

export function releaseIntegrationPaths(paths) {
  return Object.freeze({
    state: path.join(paths.state, "integration.json"),
    receipt: path.join(paths.state, "integration-transaction.json"),
    transactions: path.join(paths.state, "integration-transactions"),
  });
}

function canonicalClients(clients) {
  const selected = new Set(clients ?? []);
  if (selected.size !== (clients ?? []).length || [...selected].some((client) => !CLIENT_IDS.has(client))) {
    throw new Error("release integration client selection is invalid");
  }
  return CLIENT_ORDER.filter((client) => selected.has(client));
}

function sameClients(left, right) {
  return left.length === right.length && left.every((client, index) => client === right[index]);
}

function validState(value, paths) {
  if (value?.schema !== 1 || !RELEASE_ID.test(value.releaseId)
    || !Array.isArray(value.clients) || value.clients.length === 0 || !sameClients(value.clients, canonicalClients(value.clients))
    || value.entry?.command !== paths.launcher || JSON.stringify(value.entry?.args) !== JSON.stringify(["mcp"])
    || typeof value.skills !== "object") return false;
  return value.clients.every((client) => {
    const skills = value.skills[client];
    return skills && isReleasedSkillCatalog(Object.keys(skills))
      && Object.values(skills).every((digest) => DIGEST.test(digest));
  }) && JSON.stringify(Object.keys(value.skills).sort()) === JSON.stringify([...value.clients].sort());
}

function readPrivateJson(file, label) {
  if (!exists(file)) return null;
  const metadata = fs.lstatSync(file);
  if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o077)) {
    throw new Error(`${label} is unsafe`);
  }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { throw new Error(`${label} is malformed`); }
}

export function readReleaseIntegrationState(paths) {
  const integration = releaseIntegrationPaths(paths);
  const state = readPrivateJson(integration.state, "release integration state");
  if (state && !validState(state, paths)) throw new Error("release integration state is malformed");
  return state;
}

function releaseSkills(releaseRoot, manifest) {
  if (!releaseRoot || !path.isAbsolute(releaseRoot) || !RELEASE_ID.test(manifest?.release_id)) {
    throw new Error("release integration target is invalid");
  }
  const declared = [...(manifest.skills ?? [])];
  if (!isReleasedSkillCatalog(declared)) {
    throw new Error("release skill catalog differs from the AgentBase product catalog");
  }
  return Object.fromEntries(declared.map((name) => {
    const source = path.join(releaseRoot, ".agents", "skills", name);
    if (!exists(path.join(source, "SKILL.md"))) throw new Error(`released product skill is invalid: ${name}`);
    return [name, { source, digest: productSkillDirectoryDigest(source) }];
  }));
}

function skillTarget(client, name, environment) {
  const root = productSkillRoot(client, environment);
  if (exists(root)) {
    const metadata = fs.lstatSync(root);
    if (!metadata.isDirectory() || metadata.isSymbolicLink()) throw new Error(`${client} skill root is unsafe`);
  }
  return path.join(root, name);
}

function currentSkillDigest(target, client) {
  return exists(target) ? productSkillDirectoryDigest(target, client) : null;
}

function serialEntry(entry) {
  if (entry === undefined) return null;
  return {
    transport: entry.transport,
    command: entry.command,
    args: [...(entry.args ?? [])],
    env: { ...(entry.env ?? {}) },
    envVars: [...(entry.envVars ?? [])],
  };
}

function clientEntry(value) {
  return value === null ? undefined : value;
}

function planClients({ operation, selected, state, expected, adapter }) {
  return Promise.all(selected.map(async (client) => {
    const actual = await adapter.inspect(client);
    if (state) {
      if (!clientEntriesEqual(actual, expected)) throw new Error(`${client} stable AgentBase entry drifted from installation state`);
      return operation === "uninstall"
        ? { client, before: serialEntry(expected), after: null, state: "pending" }
        : null;
    }
    if (actual === undefined) return { client, before: null, after: serialEntry(expected), state: "pending" };
    if (clientEntriesEqual(actual, expected)) return null;
    if (isRecognizedCheckoutClientEntry(actual)) {
      return { client, before: serialEntry(actual), after: serialEntry(expected), state: "pending" };
    }
    throw new Error(`${client} already has an unknown agentbase entry`);
  })).then((actions) => actions.filter(Boolean));
}

function planSkills({ operation, selected, state, targetSkills, environment }) {
  const actions = [], nextSkills = {};
  for (const client of selected) {
    nextSkills[client] = {};
    const names = new Set([...Object.keys(state?.skills[client] ?? {}), ...Object.keys(targetSkills ?? {})]);
    for (const name of names) {
      const target = skillTarget(client, name, environment);
      const actual = currentSkillDigest(target, client);
      const before = state?.skills[client]?.[name] ?? null;
      if (state && actual !== before) throw new Error(`${client} skill drifted from installation state: ${name}`);
      const after = operation === "uninstall" ? null : targetSkills[name]?.digest ?? null;
      if (!state && actual !== null && actual !== after) throw new Error(`${client} already has a different skill named ${name}`);
      if (actual !== after) actions.push({ client, name, before: actual, after, state: "pending" });
      if (after) nextSkills[client][name] = after;
    }
  }
  return { actions, nextSkills };
}

export async function planReleaseIntegration(options) {
  const { operation, paths, currentReleaseId, targetReleaseRoot, targetManifest, environment = process.env } = options;
  if (!["install", "upgrade", "rollback", "uninstall"].includes(operation)) throw new Error("release integration operation is invalid");
  const state = readReleaseIntegrationState(paths);
  if (state && state.releaseId !== currentReleaseId) throw new Error("release integration state does not match the active application");
  if (!state && operation !== "install") {
    if (operation === "uninstall") return { operation, beforeState: null, afterState: null, clients: [], skills: [] };
    throw new Error("AgentBase client and skill integration is not configured; rerun the installed release setup first");
  }

  const requested = options.clients === undefined ? undefined : canonicalClients(options.clients);
  const selected = state ? state.clients : requested;
  if (!selected?.length) throw new Error("release installation requires at least one selected client");
  if (state && requested && !sameClients(requested, selected)) {
    throw new Error("installed client selection cannot change; uninstall before selecting different clients");
  }
  const targetSkills = operation === "uninstall" ? null : releaseSkills(targetReleaseRoot, targetManifest);
  const targetReleaseId = operation === "uninstall" ? null : targetManifest.release_id;
  const expected = stableClientEntry(paths.launcher);
  const adapter = options.clientAdapter ?? createReleaseClientAdapter(environment);
  const clients = await planClients({ operation, selected, state, expected, adapter });
  const skillPlan = planSkills({ operation, selected, state, targetSkills, environment });
  const afterState = operation === "uninstall" ? null : {
    schema: 1,
    releaseId: targetReleaseId,
    clients: selected,
    entry: { command: expected.command, args: expected.args },
    skills: skillPlan.nextSkills,
  };
  return {
    operation,
    beforeState: state,
    afterState,
    clients,
    skills: skillPlan.actions,
  };
}

function receiptValid(receipt, paths) {
  if (receipt?.schema !== 1 || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(receipt.transactionId)
    || !["install", "upgrade", "rollback", "uninstall"].includes(receipt.operation)
    || !["prepared", "applying", "applied", "committed", "rolling-back"].includes(receipt.phase)
    || receipt.beforeState !== null && !validState(receipt.beforeState, paths)
    || receipt.afterState !== null && !validState(receipt.afterState, paths)
    || !Array.isArray(receipt.clients) || !Array.isArray(receipt.skills)) return false;
  const validEntry = (entry) => entry === null || entry?.transport === "stdio"
    && path.isAbsolute(entry.command) && Array.isArray(entry.args) && entry.args.every((argument) => typeof argument === "string")
    && typeof entry.env === "object" && Object.keys(entry.env).length === 0
    && Array.isArray(entry.envVars) && entry.envVars.length === 0;
  return receipt.clients.every((action) => CLIENT_IDS.has(action.client)
      && validEntry(action.before) && validEntry(action.after)
      && ["pending", "applying", "complete", "rolled-back"].includes(action.state))
    && receipt.skills.every((action) => CLIENT_IDS.has(action.client) && MANAGED_PRODUCT_SKILL_NAMES.includes(action.name)
      && (action.before === null || DIGEST.test(action.before)) && (action.after === null || DIGEST.test(action.after))
      && ["pending", "applying", "complete", "rolled-back"].includes(action.state));
}

function readReceipt(paths) {
  const receipt = readPrivateJson(releaseIntegrationPaths(paths).receipt, "release integration receipt");
  if (receipt && !receiptValid(receipt, paths)) throw new Error("release integration receipt is malformed");
  return receipt;
}

function persistReceipt(paths, receipt) {
  atomicWrite(releaseIntegrationPaths(paths).receipt, `${JSON.stringify(receipt, null, 2)}\n`);
}

function transactionRoot(paths, receipt) {
  return path.join(releaseIntegrationPaths(paths).transactions, receipt.transactionId);
}

function skillTransactionPaths(paths, receipt, action) {
  const root = path.join(transactionRoot(paths, receipt), action.client, action.name);
  return { root, backup: path.join(root, "before"), staging: path.join(root, "after") };
}

function copySkill(source, destination) {
  if (exists(destination)) throw new Error(`integration staging already exists: ${destination}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
  fs.cpSync(source, destination, { recursive: true, errorOnExist: true, force: false });
}

export function beginReleaseIntegration(paths, plan) {
  const integration = releaseIntegrationPaths(paths);
  if (exists(integration.receipt)) throw new Error("release integration recovery must finish before a new transaction");
  privateDirectory(integration.transactions);
  const receipt = {
    schema: 1,
    transactionId: randomUUID(),
    operation: plan.operation,
    phase: "prepared",
    beforeState: plan.beforeState,
    afterState: plan.afterState,
    clients: plan.clients,
    skills: plan.skills,
  };
  privateDirectory(transactionRoot(paths, receipt));
  persistReceipt(paths, receipt);
  return receipt;
}

function targetSkillSource(releaseRoot, action) {
  return path.join(releaseRoot, ".agents", "skills", action.name);
}

function applySkill(paths, receipt, action, releaseRoot, environment) {
  const target = skillTarget(action.client, action.name, environment);
  const transaction = skillTransactionPaths(paths, receipt, action);
  const actual = currentSkillDigest(target, action.client);
  if (actual !== action.before) throw new Error(`${action.client} skill changed after preflight: ${action.name}`);
  action.state = "applying";
  persistReceipt(paths, receipt);
  if (action.after !== null) {
    const source = targetSkillSource(releaseRoot, action);
    if (productSkillDirectoryDigest(source) !== action.after) throw new Error(`target release skill changed: ${action.name}`);
    copySkill(source, transaction.staging);
  }
  if (action.before !== null) {
    fs.mkdirSync(transaction.root, { recursive: true, mode: 0o700 });
    fs.renameSync(target, transaction.backup);
  }
  if (action.after !== null) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(transaction.staging, target);
  }
  if (currentSkillDigest(target, action.client) !== action.after) throw new Error(`skill activation verification failed: ${action.name}`);
  action.state = "complete";
  persistReceipt(paths, receipt);
}

export async function applyReleaseIntegration(paths, options = {}) {
  const receipt = readReceipt(paths);
  if (!receipt) throw new Error("release integration receipt is missing");
  const environment = options.environment ?? process.env;
  const adapter = options.clientAdapter ?? createReleaseClientAdapter(environment);
  receipt.phase = "applying";
  persistReceipt(paths, receipt);
  for (const action of receipt.skills) {
    if (action.state === "pending") applySkill(paths, receipt, action, options.targetReleaseRoot, environment);
  }
  for (const action of receipt.clients) {
    if (action.state !== "pending") continue;
    action.state = "applying";
    persistReceipt(paths, receipt);
    await adapter.transition(action.client, clientEntry(action.before), clientEntry(action.after));
    action.state = "complete";
    persistReceipt(paths, receipt);
  }
  receipt.phase = "applied";
  persistReceipt(paths, receipt);
  return receipt;
}

function removeTransactionTarget(target, digest, client, label) {
  if (!exists(target)) return;
  if (productSkillDirectoryDigest(target, client) !== digest) throw new Error(`${label} changed during integration recovery`);
  fs.rmSync(target, { recursive: true });
}

function rollbackSkill(paths, receipt, action, environment) {
  if (action.state === "pending" || action.state === "rolled-back") return;
  const target = skillTarget(action.client, action.name, environment);
  const transaction = skillTransactionPaths(paths, receipt, action);
  if (exists(transaction.staging)) fs.rmSync(transaction.staging, { recursive: true });
  if (action.before === null) {
    if (action.after !== null) removeTransactionTarget(target, action.after, action.client, `${action.client} skill`);
  } else if (exists(transaction.backup)) {
    if (productSkillDirectoryDigest(transaction.backup, action.client) !== action.before) {
      throw new Error(`skill backup changed during integration recovery: ${action.name}`);
    }
    if (exists(target)) removeTransactionTarget(target, action.after, action.client, `${action.client} skill`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(transaction.backup, target);
  } else if (currentSkillDigest(target, action.client) !== action.before) {
    throw new Error(`skill recovery cannot identify prior state: ${action.name}`);
  }
  action.state = "rolled-back";
  persistReceipt(paths, receipt);
}

function cleanupTransaction(paths, receipt) {
  const root = transactionRoot(paths, receipt);
  if (exists(root)) fs.rmSync(root, { recursive: true });
  const integration = releaseIntegrationPaths(paths);
  fs.rmSync(integration.receipt, { force: true });
  if (exists(integration.transactions) && fs.readdirSync(integration.transactions).length === 0) fs.rmdirSync(integration.transactions);
}

export async function rollbackReleaseIntegration(paths, options = {}) {
  const receipt = readReceipt(paths);
  if (!receipt) return null;
  const environment = options.environment ?? process.env;
  const adapter = options.clientAdapter ?? createReleaseClientAdapter(environment);
  receipt.phase = "rolling-back";
  persistReceipt(paths, receipt);
  for (const action of [...receipt.clients].reverse()) {
    if (action.state === "pending" || action.state === "rolled-back") continue;
    await adapter.transition(action.client, clientEntry(action.after), clientEntry(action.before), { allowIntermediateAbsent: true });
    action.state = "rolled-back";
    persistReceipt(paths, receipt);
  }
  for (const action of [...receipt.skills].reverse()) rollbackSkill(paths, receipt, action, environment);
  cleanupTransaction(paths, receipt);
  return receipt.operation;
}

function verifyCommittedSkills(paths, receipt, environment) {
  const state = receipt.afterState;
  if (state) {
    for (const client of state.clients) for (const [name, digest] of Object.entries(state.skills[client])) {
      if (currentSkillDigest(skillTarget(client, name, environment), client) !== digest) {
        throw new Error(`committed skill verification failed: ${client}/${name}`);
      }
    }
  } else {
    for (const action of receipt.skills) {
      if (exists(skillTarget(action.client, action.name, environment))) {
        throw new Error(`removed skill reappeared before commit: ${action.client}/${action.name}`);
      }
    }
  }
}

export async function commitReleaseIntegration(paths, options = {}) {
  const receipt = readReceipt(paths);
  if (!receipt) return null;
  const environment = options.environment ?? process.env;
  const adapter = options.clientAdapter ?? createReleaseClientAdapter(environment);
  receipt.phase = "committed";
  persistReceipt(paths, receipt);
  const expected = receipt.afterState ? stableClientEntry(paths.launcher) : undefined;
  const clients = receipt.afterState?.clients ?? receipt.beforeState?.clients ?? [];
  for (const client of clients) {
    if (!clientEntriesEqual(await adapter.inspect(client), expected)) {
      throw new Error(`${client} client entry changed before integration commit`);
    }
  }
  verifyCommittedSkills(paths, receipt, environment);
  const integration = releaseIntegrationPaths(paths);
  if (receipt.afterState) atomicWrite(integration.state, `${JSON.stringify(receipt.afterState, null, 2)}\n`);
  else fs.rmSync(integration.state, { force: true });
  cleanupTransaction(paths, receipt);
  return receipt.operation;
}

export async function recoverReleaseIntegration(paths, options = {}) {
  const receipt = readReceipt(paths);
  if (!receipt) return null;
  return options.committed || receipt.phase === "committed"
    ? commitReleaseIntegration(paths, options)
    : rollbackReleaseIntegration(paths, options);
}
