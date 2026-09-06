import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  OkfValidationError,
  isDomainConceptDocument,
  parseConceptDocument,
  parseReservedFrontmatter,
  type ConceptDocument,
} from "./okf-document.ts";

export type OkfBundle = Readonly<{
  root: string;
  okfVersion?: string;
  concepts: ReadonlyMap<string, ConceptDocument>;
  files: readonly string[];
  warnings: readonly string[];
  treeDigest: string;
}>;

export type LoadOkfBundleOptions = Readonly<{
  requireAgentBaseRootIndex?: boolean;
}>;

function bundleFiles(root: string): readonly string[] {
  if (!fs.existsSync(root)) return [];
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      if (entry.isSymbolicLink()) throw new OkfValidationError("BUNDLE_SYMLINK", `${relative}: bundle symlinks are not allowed`);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) files.push(relative);
    }
  };
  walk(root);
  return files.sort();
}

function utf8(buffer: Buffer, relative: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch (cause) {
    throw new OkfValidationError("UTF8_INVALID", `${relative}: Markdown must be valid UTF-8`, relative, cause);
  }
}

function validateIndex(relative: string, source: string): string | undefined {
  const parsed = parseReservedFrontmatter(relative, source);
  const isRoot = relative === "index.md";
  if (parsed.frontmatter && !isRoot) throw new OkfValidationError("INDEX_FRONTMATTER", `${relative}: only the root index may have frontmatter`);
  if (parsed.frontmatter && Object.keys(parsed.frontmatter).some((key) => key !== "okf_version")) {
    throw new OkfValidationError("INDEX_FRONTMATTER", `${relative}: root index frontmatter may contain only okf_version`);
  }
  const nonblank = parsed.body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let headingSeen = false;
  const targets = new Set<string>();
  for (const line of nonblank) {
    if (/^#{1,6}\s+\S/.test(line)) headingSeen = true;
    else {
      const navigation = line.match(/^\*\s+\[[^\]]+\]\(([^)]+)\)(?:\s+-\s+.+)?$/);
      if (navigation && headingSeen) {
        const target = path.posix.normalize(navigation[1]!);
        if (targets.has(target)) throw new OkfValidationError("INDEX_DUPLICATE", `${relative}: duplicate index target: ${target}`);
        targets.add(target);
        continue;
      }
      throw new OkfValidationError("INDEX_STRUCTURE", `${relative}: invalid index line: ${line}`);
    }
  }
  if (nonblank.length && !headingSeen) throw new OkfValidationError("INDEX_STRUCTURE", `${relative}: index requires a heading`);
  const version = parsed.frontmatter?.okf_version;
  if (version !== undefined && typeof version !== "string") throw new OkfValidationError("INDEX_VERSION", "okf_version must be a string", relative);
  return version;
}

function validateLog(relative: string, source: string): void {
  if (source.startsWith("---\n") || source.startsWith("---\r\n")) {
    throw new OkfValidationError("LOG_FRONTMATTER", `${relative}: log files cannot have frontmatter`);
  }
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length || !/^#\s+\S/.test(lines[0] ?? "")) throw new OkfValidationError("LOG_STRUCTURE", `${relative}: log requires a title`);
  const dates: string[] = [];
  let dateSeen = false;
  for (const line of lines.slice(1)) {
    const date = line.match(/^##\s+(\d{4}-\d{2}-\d{2})$/)?.[1];
    if (date) {
      if (Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new OkfValidationError("LOG_DATE", `${relative}: invalid log date`);
      dates.push(date);
      dateSeen = true;
    } else if (/^\*\s+\S/.test(line) && dateSeen) continue;
    else throw new OkfValidationError("LOG_STRUCTURE", `${relative}: invalid log line: ${line}`);
  }
  if (dates.some((date, index) => index > 0 && date > (dates[index - 1] ?? ""))) {
    throw new OkfValidationError("LOG_ORDER", `${relative}: log dates must be newest first`);
  }
}

function conceptLinks(concept: ConceptDocument): readonly string[] {
  return [...concept.body.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
    .map((match) => match[1])
    .filter((target): target is string => Boolean(target));
}

function resolveConceptLink(from: string, target: string): string | undefined {
  if (target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) return undefined;
  const clean = target.split("#")[0]?.split("?")[0];
  if (!clean || (!clean.endsWith(".md") && !clean.endsWith("/"))) return undefined;
  const resolved = clean.startsWith("/")
    ? path.posix.normalize(clean.slice(1))
    : path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
  if (resolved.startsWith("../") || resolved === "..") return `!unsafe:${target}`;
  return resolved.endsWith("/") ? `${resolved}index.md` : resolved;
}

function digestTree(root: string, files: readonly string[]): string {
  const hash = createHash("sha256");
  for (const relative of files) {
    const bytes = fs.readFileSync(path.join(root, ...relative.split("/")));
    hash.update(`${relative}\0${bytes.length}\0`);
    hash.update(bytes);
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function loadOkfBundle(root: string, options: LoadOkfBundleOptions = {}): OkfBundle {
  const absoluteRoot = path.resolve(root);
  const files = bundleFiles(absoluteRoot);
  const concepts = new Map<string, ConceptDocument>();
  const addConcept = (concept: ConceptDocument) => {
    const existing = concepts.get(concept.conceptId);
    if (existing) {
      throw new OkfValidationError("CONCEPT_DUPLICATE",
        `${concept.path}: duplicate concept identity ${concept.conceptId}; already defined by ${existing.path}`,
        concept.path);
    }
    concepts.set(concept.conceptId, concept);
  };
  let okfVersion: string | undefined;
  for (const relative of files.filter((file) => file.endsWith(".md"))) {
    const source = utf8(fs.readFileSync(path.join(absoluteRoot, ...relative.split("/"))), relative);
    if (relative === "README.md") continue;
    const basename = path.posix.basename(relative);
    if (isDomainConceptDocument(relative, source)) {
      addConcept(parseConceptDocument(relative, source));
    } else if (basename === "index.md") {
      const version = validateIndex(relative, source);
      if (relative === "index.md") okfVersion = version;
    } else if (basename === "log.md") validateLog(relative, source);
    else {
      addConcept(parseConceptDocument(relative, source));
    }
  }
  if (options.requireAgentBaseRootIndex && okfVersion !== "0.2") {
    throw new OkfValidationError("OKF_VERSION_REQUIRED", "AgentBase output requires root index.md with okf_version: \"0.2\"");
  }
  const fileSet = new Set(files);
  const warnings: string[] = [];
  for (const concept of concepts.values()) {
    for (const target of conceptLinks(concept)) {
      const resolved = resolveConceptLink(concept.path, target);
      if (resolved?.startsWith("!unsafe:")) warnings.push(`${concept.path}: unsafe concept link ${target}`);
      else if (resolved && !fileSet.has(resolved)) warnings.push(`${concept.path}: broken concept link ${target}`);
    }
  }
  const result = {
    root: absoluteRoot,
    concepts: new Map([...concepts].sort(([left], [right]) => left.localeCompare(right))),
    files,
    warnings: warnings.sort(),
    treeDigest: digestTree(absoluteRoot, files),
  };
  return okfVersion === undefined ? result : { ...result, okfVersion };
}

export function computeOkfTreeDigest(root: string): string {
  const absoluteRoot = path.resolve(root);
  return digestTree(absoluteRoot, bundleFiles(absoluteRoot));
}
