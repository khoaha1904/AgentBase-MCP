import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  serializePublishedVisualizationProjection,
  type PublishedVisualizationProjection,
} from "../../../core/knowledge/index.ts";

const CYTOSCAPE_VERSION = "3.34.2";
const DOMAIN_SITE_GENERATOR_VERSION = 12 as const;
const BUILD_KEY_PLACEHOLDER = "__AGENTBASE_BUILD_KEY__";
const GENERATED_PATHS = [
  "assets/app.css",
  "assets/app.js",
  "assets/cytoscape.min.js",
  "data/domain.json",
  "index.html",
] as const;

export type DomainSiteBuildReceipt = Readonly<{
  schemaVersion: 1;
  generator: "agentbase-domain-site";
  generatorVersion: typeof DOMAIN_SITE_GENERATOR_VERSION;
  profile: PublishedVisualizationProjection["profile"];
  hub: string;
  commit: string;
  domain: string;
  projectionVersion: 3;
  counts: Readonly<{ nodes: number; edges: number; flows: number; questions: number }>;
  files: readonly Readonly<{ path: string; sha256: string }>[];
}>;

export type DomainSiteBuildResult = Readonly<{
  status: "built";
  mode: "domain-site";
  commit: string;
  domain: string;
  output_directory: string;
  receipt: "agentbase-build.json";
  warnings: readonly string[];
}>;

export type DomainSiteBuildOptions = Readonly<{
  outputDirectory: string;
  visibilityAcknowledged: true;
}>;

export type DomainSiteBuildDependencies = Readonly<{
  assetsRoot?: string;
  cytoscapePath?: string;
}>;

function digest(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readBounded(target: string, maximumBytes = 2 * 1024 * 1024): Buffer {
  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.size > maximumBytes) throw new Error(`Domain-site asset is unavailable or oversized: ${path.basename(target)}`);
  return fs.readFileSync(target);
}

function assertOutputTarget(value: string): Readonly<{ output: string; parent: string; existed: boolean }> {
  if (!path.isAbsolute(value)) throw new Error("Domain-site output_directory must be an explicit absolute path");
  const output = path.resolve(value), root = path.parse(output).root;
  if (output === root) throw new Error("Domain-site output_directory cannot be a filesystem root");
  const parent = path.dirname(output);
  if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory() || fs.lstatSync(parent).isSymbolicLink()
    || fs.realpathSync(parent) !== parent) {
    throw new Error("Domain-site output parent must be an existing real directory without symlink indirection");
  }
  if (!fs.existsSync(output)) return { output, parent, existed: false };
  const stat = fs.lstatSync(output);
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.readdirSync(output).length) {
    throw new Error("Domain-site output_directory must be new or empty and cannot be a symlink");
  }
  return { output, parent, existed: true };
}

function defaultCytoscapePath(): string {
  return path.resolve(import.meta.dirname, "../../../..", "node_modules/cytoscape/dist/cytoscape.min.js");
}

function verifyCytoscape(target: string): Buffer {
  const packagePath = path.join(path.dirname(path.dirname(target)), "package.json");
  if (!fs.existsSync(packagePath)) throw new Error("pinned offline Cytoscape.js package metadata is unavailable");
  const manifest = JSON.parse(fs.readFileSync(packagePath, "utf8")) as { version?: unknown };
  if (manifest.version !== CYTOSCAPE_VERSION) {
    throw new Error(`Cytoscape.js ${CYTOSCAPE_VERSION} is required for deterministic Domain-site output`);
  }
  return readBounded(target);
}

function write(target: string, bytes: Buffer | string): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o755 });
  fs.writeFileSync(target, bytes, { mode: 0o644 });
}

function publishStaging(staging: string, target: ReturnType<typeof assertOutputTarget>): void {
  let backup: string | undefined;
  try {
    if (target.existed) {
      backup = `${target.output}.agentbase-empty-${randomUUID()}`;
      fs.renameSync(target.output, backup);
    }
    fs.renameSync(staging, target.output);
    if (backup) fs.rmdirSync(backup);
  } catch (error) {
    if (backup && fs.existsSync(backup) && !fs.existsSync(target.output)) fs.renameSync(backup, target.output);
    throw error;
  }
}

export function buildStaticDomainSite(
  projection: PublishedVisualizationProjection,
  options: DomainSiteBuildOptions,
  dependencies: DomainSiteBuildDependencies = {},
): DomainSiteBuildResult {
  if (options.visibilityAcknowledged !== true) throw new Error("Domain-site generation requires explicit visibility acknowledgment");
  const target = assertOutputTarget(options.outputDirectory);
  const staging = fs.mkdtempSync(path.join(target.parent, ".agentbase-domain-site-"));
  try {
    const assetsRoot = dependencies.assetsRoot ?? path.join(import.meta.dirname, "domain-site-assets");
    const indexTemplate = readBounded(path.join(assetsRoot, "index.html")).toString("utf8");
    if (!indexTemplate.includes(BUILD_KEY_PLACEHOLDER)) {
      throw new Error("Domain-site index is missing its browser build-key placeholder");
    }
    const buildKey = `${DOMAIN_SITE_GENERATOR_VERSION}-${projection.commit}`;
    write(path.join(staging, "index.html"), indexTemplate.replaceAll(BUILD_KEY_PLACEHOLDER, buildKey));
    write(path.join(staging, "assets/app.css"), readBounded(path.join(assetsRoot, "app.css")));
    write(path.join(staging, "assets/app.js"), readBounded(path.join(assetsRoot, "app.js")));
    write(path.join(staging, "assets/cytoscape.min.js"), verifyCytoscape(
      dependencies.cytoscapePath ?? defaultCytoscapePath(),
    ));
    write(path.join(staging, "data/domain.json"), serializePublishedVisualizationProjection(projection));

    const files = GENERATED_PATHS.map((relative) => {
      const bytes = readBounded(path.join(staging, ...relative.split("/")));
      return { path: relative, sha256: digest(bytes) };
    });
    const receipt: DomainSiteBuildReceipt = {
      schemaVersion: 1,
      generator: "agentbase-domain-site",
      generatorVersion: DOMAIN_SITE_GENERATOR_VERSION,
      profile: projection.profile,
      hub: projection.hub,
      commit: projection.commit,
      domain: projection.domain.id,
      projectionVersion: projection.schemaVersion,
      counts: { nodes: projection.nodes.length, edges: projection.edges.length,
        flows: projection.flows.length, questions: projection.questions.length },
      files,
    };
    write(path.join(staging, "agentbase-build.json"), `${JSON.stringify(receipt, null, 2)}\n`);
    for (const file of files) {
      if (digest(readBounded(path.join(staging, ...file.path.split("/")))) !== file.sha256) {
        throw new Error(`Domain-site staged digest changed before publication: ${file.path}`);
      }
    }
    publishStaging(staging, target);
    return {
      status: "built",
      mode: "domain-site",
      commit: projection.commit,
      domain: projection.domain.id,
      output_directory: target.output,
      receipt: "agentbase-build.json",
      warnings: ["Static Published snapshot; regenerate explicitly to update it."],
    };
  } finally {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
  }
}
