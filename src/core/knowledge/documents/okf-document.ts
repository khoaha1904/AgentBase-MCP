import path from "node:path";
import { parseDocument, stringify } from "yaml";
export type OkfScalar = string | number | boolean | null;
export type OkfValue = OkfScalar | readonly OkfValue[] | Readonly<{ [key: string]: OkfValue }>;
export type OkfFrontmatter = Readonly<{ [key: string]: OkfValue }>;

export type VerificationEvent = Readonly<{
  by: string;
  at?: string;
}>;
export type ConceptDocument = Readonly<{
  conceptId: string;
  path: string;
  type: string;
  status: string;
  frontmatter: OkfFrontmatter;
  verified: readonly VerificationEvent[];
  body: string;
}>;

export class OkfValidationError extends Error {
  readonly code: string;
  readonly documentPath?: string;

  constructor(code: string, message: string, documentPath?: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "OkfValidationError";
    this.code = code;
    if (documentPath !== undefined) this.documentPath = documentPath;
  }
}

const FRONTMATTER_LIMIT = 64 * 1024;
const MAX_DEPTH = 16;
const MAX_NODES = 4096;
const MAX_SCALAR_BYTES = 32 * 1024;
const DOMAIN_INDEX_PATH = /^domains\/[a-z0-9]+(?:-[a-z0-9]+)*\/index\.md$/;

export function isDomainConceptPath(documentPath: string): boolean {
  return DOMAIN_INDEX_PATH.test(documentPath);
}

export function isDomainConceptDocument(documentPath: string, source: string): boolean {
  return isDomainConceptPath(documentPath)
    && parseReservedFrontmatter(documentPath, source).frontmatter?.type === "Domain";
}

export function conceptIdentityFromPath(documentPath: string): string {
  const normalized = path.posix.normalize(documentPath);
  if (!documentPath.endsWith(".md") || documentPath.startsWith("/") || normalized !== documentPath) {
    throw new OkfValidationError("INVALID_CONCEPT_PATH", "concept path must be a normalized bundle-relative .md path", documentPath);
  }
  return isDomainConceptPath(documentPath) ? path.posix.dirname(documentPath) : documentPath.slice(0, -3);
}

function requireConceptPath(documentPath: string): void {
  const normalized = path.posix.normalize(documentPath);
  if (!documentPath.endsWith(".md") || documentPath.startsWith("/") || normalized !== documentPath
    || documentPath.split("/").some((part) => !part || part === "." || part === "..")
    || (path.posix.basename(documentPath) === "index.md" && !isDomainConceptPath(documentPath))
    || path.posix.basename(documentPath) === "log.md") {
    throw new OkfValidationError("INVALID_CONCEPT_PATH", "concept path must be a normalized non-reserved bundle-relative .md path", documentPath);
  }
}

function extractFrontmatter(documentPath: string, source: string): Readonly<{ yaml: string; body: string }> {
  const normalized = source.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match || match[1] === undefined) {
    throw new OkfValidationError("FRONTMATTER_MISSING", "concept must start with a delimited YAML frontmatter block", documentPath);
  }
  if (Buffer.byteLength(match[1]) > FRONTMATTER_LIMIT) {
    throw new OkfValidationError("FRONTMATTER_LIMIT", `frontmatter exceeds ${FRONTMATTER_LIMIT} bytes`, documentPath);
  }
  return { yaml: match[1], body: normalized.slice(match[0].length).replace(/^\r?\n/, "") };
}

function plainMapping(value: unknown, documentPath: string): OkfFrontmatter {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new OkfValidationError("FRONTMATTER_MAPPING", "frontmatter must be one plain YAML mapping", documentPath);
  }
  return value as OkfFrontmatter;
}

function validateBounds(value: OkfValue, documentPath: string): void {
  let nodes = 0;
  const visit = (current: OkfValue, depth: number) => {
    nodes += 1;
    if (nodes > MAX_NODES) throw new OkfValidationError("YAML_NODE_LIMIT", `frontmatter exceeds ${MAX_NODES} nodes`, documentPath);
    if (depth > MAX_DEPTH) throw new OkfValidationError("YAML_DEPTH_LIMIT", `frontmatter exceeds depth ${MAX_DEPTH}`, documentPath);
    if (typeof current === "string" && Buffer.byteLength(current) > MAX_SCALAR_BYTES) {
      throw new OkfValidationError("YAML_SCALAR_LIMIT", `frontmatter scalar exceeds ${MAX_SCALAR_BYTES} bytes`, documentPath);
    }
    if (Array.isArray(current)) current.forEach((item) => visit(item, depth + 1));
    else if (current !== null && typeof current === "object") {
      for (const [key, item] of Object.entries(current)) {
        if (Buffer.byteLength(key) > MAX_SCALAR_BYTES) {
          throw new OkfValidationError("YAML_SCALAR_LIMIT", `frontmatter key exceeds ${MAX_SCALAR_BYTES} bytes`, documentPath);
        }
        visit(item, depth + 1);
      }
    }
  };
  visit(value, 0);
}

function parseFrontmatter(documentPath: string, yaml: string): OkfFrontmatter {
  const document = parseDocument(yaml, {
    version: "1.2",
    schema: "core",
    strict: true,
    stringKeys: true,
    uniqueKeys: true,
    customTags: [],
    intAsBigInt: false,
  });
  if (document.errors.length) {
    const message = document.errors.map((error) => error.message).join("; ");
    throw new OkfValidationError("YAML_PARSE", `frontmatter YAML error: ${message}`, documentPath);
  }
  let value: unknown;
  try {
    value = document.toJS({ maxAliasCount: 0, mapAsMap: false });
  } catch (cause) {
    throw new OkfValidationError("YAML_ALIAS", "frontmatter aliases are not allowed", documentPath, cause);
  }
  const frontmatter = plainMapping(value, documentPath);
  validateBounds(frontmatter, documentPath);
  return frontmatter;
}

function verificationEvents(value: OkfValue | undefined, documentPath: string): readonly VerificationEvent[] {
  if (value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.map((event) => {
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      throw new OkfValidationError("VERIFIED_INVALID", "verified must be an event mapping or list of event mappings", documentPath);
    }
    const by = event.by;
    const at = event.at;
    if (typeof by !== "string" || !by.trim() || (at !== undefined && typeof at !== "string")) {
      throw new OkfValidationError("VERIFIED_INVALID", "verified events require non-empty by and optional string at", documentPath);
    }
    return at === undefined ? { by } : { by, at };
  });
}

export function parseConceptDocument(documentPath: string, source: string): ConceptDocument {
  requireConceptPath(documentPath);
  const extracted = extractFrontmatter(documentPath, source);
  const frontmatter = parseFrontmatter(documentPath, extracted.yaml);
  const type = frontmatter.type;
  if (typeof type !== "string" || !type.trim()) {
    throw new OkfValidationError("TYPE_REQUIRED", "concept frontmatter requires a non-empty type string", documentPath);
  }
  const statusValue = frontmatter.status;
  const status = statusValue === undefined ? "stable" : statusValue;
  if (typeof status !== "string" || !status.trim()) {
    throw new OkfValidationError("STATUS_INVALID", "status must be a non-empty string when present", documentPath);
  }
  return {
    conceptId: conceptIdentityFromPath(documentPath),
    path: documentPath,
    type,
    status,
    frontmatter,
    verified: verificationEvents(frontmatter.verified, documentPath),
    body: extracted.body,
  };
}

export function renderConceptDocument(concept: ConceptDocument): string {
  requireConceptPath(concept.path);
  const yaml = stringify(concept.frontmatter, { schema: "core", lineWidth: 0 }).trimEnd();
  const body = concept.body ? `\n\n${concept.body.replace(/^\r?\n/, "")}` : "\n";
  return `---\n${yaml}\n---${body}`;
}

function mapping(value: OkfValue | undefined): Readonly<{ [key: string]: OkfValue }> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<{ [key: string]: OkfValue }>
    : undefined;
}

export function repositorySourceResources(concept: ConceptDocument): readonly string[] {
  const sources = concept.frontmatter.sources;
  if (!Array.isArray(sources)) return [];
  return sources.flatMap((source) => {
    const resource = mapping(source)?.resource;
    return typeof resource === "string" && resource.startsWith("repository://") ? [resource] : [];
  });
}

export function conceptReferencesRepository(concept: ConceptDocument, repositoryId: string): boolean {
  const prefix = `repository://${repositoryId}/`;
  return repositorySourceResources(concept).some((resource) => resource.startsWith(prefix));
}

export type RepositorySourceResource = Readonly<{
  repositoryId: string;
  relativePath: string;
  startLine?: number;
  endLine?: number;
}>;

export function parseRepositorySourceResource(value: string): RepositorySourceResource | undefined {
  const match = value.match(/^repository:\/\/(repository-[a-z0-9-]+-[a-f0-9]{12})\/([^#]+?)(?:#L(\d+)-L(\d+))?$/);
  if (!match?.[1] || !match[2] || ((match[3] === undefined) !== (match[4] === undefined))) return undefined;
  try {
    const decoded = match[2].split("/").map((part) => decodeURIComponent(part));
    if (!decoded.every((part) => Boolean(part) && part !== "." && part !== ".." && !part.includes("/") && !part.includes("\\"))) return undefined;
    const relativePath = decoded.join("/");
    const startLine = match[3] === undefined ? undefined : Number(match[3]);
    const endLine = match[4] === undefined ? undefined : Number(match[4]);
    if (startLine !== undefined && (!Number.isSafeInteger(startLine) || !Number.isSafeInteger(endLine)
      || startLine < 1 || endLine! < startLine)) return undefined;
    const canonicalPath = decoded.map((part) => encodeURIComponent(part)).join("/");
    const canonical = `repository://${match[1]}/${canonicalPath}${startLine === undefined ? "" : `#L${startLine}-L${endLine}`}`;
    return canonical === value ? {
      repositoryId: match[1],
      relativePath,
      ...(startLine === undefined ? {} : { startLine, endLine: endLine! }),
    } : undefined;
  } catch {
    return undefined;
  }
}

export function validateAgentBaseDraft(concept: ConceptDocument): readonly string[] {
  const failures: string[] = [];
  if (concept.status !== "draft") failures.push(`${concept.path}: AgentBase concept must use status: draft`);
  const generated = mapping(concept.frontmatter.generated);
  if (typeof generated?.by !== "string" || !generated.by.startsWith("agentbase/")) {
    failures.push(`${concept.path}: generated.by must identify agentbase/<version>`);
  }
  if (typeof generated?.at !== "string" || Number.isNaN(Date.parse(generated.at))) {
    failures.push(`${concept.path}: generated.at must be an ISO 8601 datetime`);
  }
  if (concept.verified.length || concept.frontmatter.verified !== undefined) {
    failures.push(`${concept.path}: a newly generated AgentBase draft must not claim verified events`);
  }
  const sources = concept.frontmatter.sources;
  if (sources !== undefined) {
    if (!Array.isArray(sources)) failures.push(`${concept.path}: sources must be a list`);
    else {
      const ids = new Set<string>();
      for (const source of sources) {
        const entry = mapping(source);
        if (!entry || typeof entry.resource !== "string" || !entry.resource.trim()) failures.push(`${concept.path}: every source requires resource`);
        else if (entry.resource.startsWith("repository://") && !parseRepositorySourceResource(entry.resource)) {
          failures.push(`${concept.path}: repository source resource is not normalized`);
        }
        if (entry?.observed_revision !== undefined
          && (typeof entry.observed_revision !== "string" || !/^[a-f0-9]{40}$/.test(entry.observed_revision))) {
          failures.push(`${concept.path}: source observed_revision must be an exact 40-hex commit`);
        }
        if (entry?.id !== undefined) {
          const validId = typeof entry.id === "string"
            && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(entry.id)
            && !ids.has(entry.id);
          if (!validId) failures.push(`${concept.path}: source ids must be stable and unique`);
          else if (typeof entry.id === "string") ids.add(entry.id);
        }
      }
      const footnotes = [...concept.body.matchAll(/\[\^([^\]]+)\]/g)].map((match) => match[1]).filter((id): id is string => Boolean(id));
      for (const id of new Set(footnotes)) {
        if (!ids.has(id)) failures.push(`${concept.path}: footnote ${id} does not resolve to sources[].id`);
      }
    }
  }
  return failures;
}

export function validatePublishableAgentBaseDraft(concept: ConceptDocument): readonly string[] {
  return [
    ...validateAgentBaseDraft(concept),
    ...(concept.frontmatter.benchmark_key === undefined
      ? [] : [`${concept.path}: benchmark_key is benchmark-only metadata and cannot be published`]),
  ];
}

export function createRepositorySourceResource(repositoryId: string, relativePath: string, startLine?: number, endLine?: number): string {
  if (!/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(repositoryId)) throw new OkfValidationError("REPOSITORY_ID_INVALID", "repositoryId is invalid");
  const normalized = path.posix.normalize(relativePath);
  if (relativePath.startsWith("/") || normalized !== relativePath
    || relativePath.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new OkfValidationError("SOURCE_PATH_INVALID", "source path must be normalized and repository-relative");
  }
  if ((startLine === undefined) !== (endLine === undefined)
    || (startLine !== undefined && (!Number.isSafeInteger(startLine) || !Number.isSafeInteger(endLine)
      || startLine < 1 || endLine! < startLine))) {
    throw new OkfValidationError("SOURCE_SPAN_INVALID", "source line span is invalid");
  }
  const encodedPath = relativePath.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `repository://${repositoryId}/${encodedPath}${startLine === undefined ? "" : `#L${startLine}-L${endLine}`}`;
}

export function parseReservedFrontmatter(documentPath: string, source: string): Readonly<{ frontmatter?: OkfFrontmatter; body: string }> {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) return { body: source };
  const extracted = extractFrontmatter(documentPath, source);
  return { frontmatter: parseFrontmatter(documentPath, extracted.yaml), body: extracted.body };
}
