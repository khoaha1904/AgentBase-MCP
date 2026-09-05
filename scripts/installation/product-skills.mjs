import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const PUBLIC_PRODUCT_SKILL_NAMES = Object.freeze([
  "agentbase-query",
  "agentbase-context",
  "agentbase-scan",
  "agentbase-ingest",
  "agentbase-refresh",
  "agentbase-batch-ingest",
  "agentbase-domain-enrichment",
  "agentbase-diagram",
  "agentbase-domain-site",
  "agentbase-hub",
]);

export const INTERNAL_PRODUCT_SKILL_NAMES = Object.freeze([
  "use-codebase-memory",
  "agentbase-okf",
  "use-diagram-design",
]);

export const PRODUCT_SKILL_NAMES = Object.freeze([
  ...PUBLIC_PRODUCT_SKILL_NAMES,
  ...INTERNAL_PRODUCT_SKILL_NAMES,
]);

const CLIENT_IDS = new Set(["codex", "claude-code"]);

export class ProductSkillInstallError extends Error {
  constructor(code, client, message) {
    super(message);
    this.code = code;
    this.client = client;
  }
}

function exists(target) {
  try { fs.lstatSync(target); return true; }
  catch (error) { if (error?.code === "ENOENT") return false; throw error; }
}

export function productSkillRoot(client, environment) {
  if (!environment.HOME) throw new ProductSkillInstallError("HOME_UNAVAILABLE", client, "HOME is unavailable");
  return client === "codex"
    ? path.join(environment.CODEX_HOME || path.join(environment.HOME, ".codex"), "skills")
    : path.join(environment.HOME, ".claude", "skills");
}

export function productSkillDirectoryDigest(root, client) {
  const hash = crypto.createHash("sha256");
  const walk = (directory, relative = "") => {
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new ProductSkillInstallError("SKILL_DIRECTORY_UNSAFE", client, `skill directory is unsafe: ${directory}`);
    }
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = path.join(directory, entry.name), childRelative = path.posix.join(relative, entry.name);
      if (entry.isSymbolicLink()) {
        throw new ProductSkillInstallError("SKILL_DIRECTORY_UNSAFE", client, `skill entry is unsafe: ${child}`);
      }
      if (entry.isDirectory()) {
        hash.update(`d\0${childRelative}\0`);
        walk(child, childRelative);
      } else if (entry.isFile()) {
        hash.update(`f\0${childRelative}\0`);
        hash.update(fs.readFileSync(child));
        hash.update("\0");
      } else {
        throw new ProductSkillInstallError("SKILL_DIRECTORY_UNSAFE", client, `skill entry is unsupported: ${child}`);
      }
    }
  };
  walk(root);
  return hash.digest("hex");
}

function rollbackCreated(created) {
  for (const item of [...created].reverse()) {
    if (!exists(item.target)) continue;
    if (productSkillDirectoryDigest(item.target, item.client) !== item.digest) {
      throw new ProductSkillInstallError("SKILL_ROLLBACK_CONFLICT", item.client, `installed skill changed before rollback: ${item.target}`);
    }
    fs.rmSync(item.target, { recursive: true });
  }
}

export function rollbackProductSkills(installation) {
  rollbackCreated(installation.created);
}

export function installProductSkills({ clients, repositoryRoot, environment = process.env }) {
  const selected = [...new Set(clients)];
  for (const client of selected) {
    if (!CLIENT_IDS.has(client)) throw new ProductSkillInstallError("CLIENT_UNSUPPORTED", client, `unsupported skill client: ${client}`);
  }

  const sources = PRODUCT_SKILL_NAMES.map((name) => {
    const source = path.join(repositoryRoot, ".agents", "skills", name);
    if (!exists(path.join(source, "SKILL.md"))) {
      throw new ProductSkillInstallError("PRODUCT_SKILL_INVALID", undefined, `product skill is unavailable: ${name}`);
    }
    return { name, source, digest: productSkillDirectoryDigest(source) };
  });

  const pending = [], clientsResult = {};
  for (const client of selected) {
    const root = productSkillRoot(client, environment);
    let missing = 0;
    for (const source of sources) {
      const target = path.join(root, source.name);
      if (!exists(target)) {
        pending.push({ ...source, target, client });
        missing += 1;
      } else if (productSkillDirectoryDigest(target, client) !== source.digest) {
        throw new ProductSkillInstallError("SKILL_CONFLICT", client, `${client} already has a different skill named ${source.name}`);
      }
    }
    clientsResult[client] = missing ? "installed" : "already-installed";
  }

  const created = [];
  try {
    for (const item of pending) {
      const parent = path.dirname(item.target);
      fs.mkdirSync(parent, { recursive: true });
      const temporary = path.join(parent, `.agentbase-${item.name}-${crypto.randomUUID()}`);
      try {
        fs.cpSync(item.source, temporary, { recursive: true, errorOnExist: true, force: false });
        if (exists(item.target)) throw new ProductSkillInstallError("SKILL_CONCURRENT_CHANGE", item.client, `${item.client} skill changed after preflight: ${item.name}`);
        fs.renameSync(temporary, item.target);
        created.push({ client: item.client, target: item.target, digest: item.digest });
      } finally {
        if (exists(temporary)) fs.rmSync(temporary, { recursive: true });
      }
    }
  } catch (error) {
    rollbackCreated(created);
    throw error;
  }

  return { clients: clientsResult, created };
}
