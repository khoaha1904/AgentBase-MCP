import fs from "node:fs";
import path from "node:path";

import { parseReservedFrontmatter, type ConceptDocument, type OkfValue } from "./okf-document.ts";
import type { OkfBundle } from "./okf-bundle.ts";

export const AGENTBASE_OKF_PROFILE_PATH = "shared/agentbase-profile.md" as const;
export const AGENTBASE_OKF_PROFILE_CONCEPT_ID = "shared/agentbase-profile" as const;
export const AGENTBASE_OKF_PROFILE_TYPE = "AgentBase OKF Profile" as const;
export const AGENTBASE_OKF_PROFILE_RESOURCE = "agentbase://okf-profile/1.0" as const;
export const AGENTBASE_OKF_PROFILE_EXTENSIONS = [
  "canonical-relationships-v1",
  "external-identities-v1",
  "flow-steps-v1",
  "maintainer-guidance-v1",
  "observed-revisions-v1",
  "observed-values-v1",
  "questions-v1",
  "repository-identity-v1",
  "technology-metadata-v1",
] as const;

export const AGENTBASE_OKF_PROFILE = Object.freeze({
  id: "agentbase-okf" as const,
  version: "1.0" as const,
  okfBase: "0.2" as const,
  layout: "compact-domain-capsules-v1" as const,
  extensions: AGENTBASE_OKF_PROFILE_EXTENSIONS,
});

export function renderAgentBaseOkfProfileDocument(): string {
  return `---
type: ${AGENTBASE_OKF_PROFILE_TYPE}
title: AgentBase OKF Profile 1.0
description: AgentBase compact Domain Capsule profile.
resource: ${AGENTBASE_OKF_PROFILE_RESOURCE}
agentbase:
  profile:
    id: ${AGENTBASE_OKF_PROFILE.id}
    version: "${AGENTBASE_OKF_PROFILE.version}"
    okf_base: "${AGENTBASE_OKF_PROFILE.okfBase}"
    layout: ${AGENTBASE_OKF_PROFILE.layout}
    extensions:
${AGENTBASE_OKF_PROFILE_EXTENSIONS.map((value) => `      - ${value}`).join("\n")}
---

# AgentBase OKF Profile 1.0

This Hub uses the AgentBase compact Domain Capsule profile.
`;
}

const DOMAIN_SELECTOR = /^domains\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN_CONCEPT = /^domains\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const DOMAIN_HOME = /^domains\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(.+)$/;
const KNOWN_CATEGORY = new Map<string, string>([
  ["Repository", "repositories"],
  ["Question", "questions"],
]);
const MAXIMUM_FAILURES = 128;
const CONCEPT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type AgentBaseOkfProfile = typeof AGENTBASE_OKF_PROFILE;
export type AgentBaseConceptHome =
  | Readonly<{ kind: "domain"; selector: string }>
  | Readonly<{ kind: "shared" }>;
export type AgentBaseProfileConceptHome = Readonly<{
  identity: string;
  path: string;
  home: AgentBaseConceptHome;
}>;
export type AgentBaseHubProfileAdmission =
  | Readonly<{ kind: "legacy-unprofiled" }>
  | Readonly<{
    kind: "profile-1.0";
    profile: AgentBaseOkfProfile;
    homes: readonly AgentBaseProfileConceptHome[];
  }>
  | Readonly<{
    kind: "unsupported";
    failures: readonly string[];
    omittedFailureCount: number;
  }>;
export type AgentBaseHubProfileSnapshot = Readonly<{
  concepts: ReadonlyMap<string, ConceptDocument>;
  files: readonly string[];
  readMarkdown(relativePath: string): string | undefined;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function exactArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function profileFailures(concept: ConceptDocument, profileConcepts: readonly ConceptDocument[]): readonly string[] {
  const failures: string[] = [];
  if (concept.type !== AGENTBASE_OKF_PROFILE_TYPE) {
    failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: type must be ${AGENTBASE_OKF_PROFILE_TYPE}`);
  }
  if (concept.frontmatter.resource !== AGENTBASE_OKF_PROFILE_RESOURCE) {
    failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: resource must be ${AGENTBASE_OKF_PROFILE_RESOURCE}`);
  }
  const agentbase = mapping(concept.frontmatter.agentbase), profile = mapping(agentbase?.profile);
  const keys = profile ? Object.keys(profile).sort() : [];
  if (!profile || !exactArray(keys, ["extensions", "id", "layout", "okf_base", "version"])) {
    failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: agentbase.profile must use the exact Profile 1.0 fields`);
  } else {
    if (profile.id !== AGENTBASE_OKF_PROFILE.id) failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: profile id is unsupported`);
    if (profile.version !== AGENTBASE_OKF_PROFILE.version) failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: profile version is unsupported`);
    if (profile.okf_base !== AGENTBASE_OKF_PROFILE.okfBase) failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: profile OKF base is unsupported`);
    if (profile.layout !== AGENTBASE_OKF_PROFILE.layout) failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: profile layout is unsupported`);
    const extensions = Array.isArray(profile.extensions)
      ? profile.extensions.filter((value): value is string => typeof value === "string") : [];
    if (!Array.isArray(profile.extensions) || extensions.length !== profile.extensions.length
      || !exactArray(extensions, AGENTBASE_OKF_PROFILE.extensions)) {
      failures.push(`${AGENTBASE_OKF_PROFILE_PATH}: profile extensions must match the exact sorted Profile 1.0 set`);
    }
  }
  for (const duplicate of profileConcepts.filter((item) => item.path !== AGENTBASE_OKF_PROFILE_PATH)) {
    failures.push(`${duplicate.path}: Profile concept must use ${AGENTBASE_OKF_PROFILE_PATH}`);
  }
  return failures;
}

function knownTypeFailure(concept: ConceptDocument, relativeWithinHome: string): string | undefined {
  if (concept.type === "Domain") {
    return relativeWithinHome === "index.md" && DOMAIN_CONCEPT.test(concept.conceptId)
      ? undefined : `${concept.path}: Domain must be the capsule concept domains/<slug>/index.md`;
  }
  if (concept.type === AGENTBASE_OKF_PROFILE_TYPE) {
    return concept.path === AGENTBASE_OKF_PROFILE_PATH
      ? undefined : `${concept.path}: Profile concept must use ${AGENTBASE_OKF_PROFILE_PATH}`;
  }
  const category = KNOWN_CATEGORY.get(concept.type) ?? "knowledge";
  const parts = relativeWithinHome.split("/");
  return parts.length === 2 && parts[0] === category && parts[1]?.endsWith(".md")
    ? undefined : `${concept.path}: ${concept.type} must use the home-relative ${category}/ category`;
}

function conceptHome(concept: ConceptDocument, failures: string[]): AgentBaseConceptHome | undefined {
  if (concept.path === AGENTBASE_OKF_PROFILE_PATH) return { kind: "shared" };
  if (concept.path.startsWith("shared/")) {
    const relative = concept.path.slice("shared/".length);
    if (!relative.includes("/")) {
      failures.push(`${concept.path}: only ${AGENTBASE_OKF_PROFILE_PATH} may be a direct shared concept`);
      return undefined;
    }
    const knownFailure = knownTypeFailure(concept, relative);
    if (knownFailure) failures.push(knownFailure);
    return { kind: "shared" };
  }
  const match = DOMAIN_HOME.exec(concept.path);
  if (!match?.[1] || !match[2]) {
    failures.push(`${concept.path}: Profile 1.0 concept must have one domains/<slug>/ or shared/ home`);
    return undefined;
  }
  if (match[2] !== "index.md" && !match[2].includes("/")) {
    failures.push(`${concept.path}: only index.md may be a direct Domain Capsule concept`);
    return undefined;
  }
  const knownFailure = knownTypeFailure(concept, match[2]);
  if (knownFailure) failures.push(knownFailure);
  return { kind: "domain", selector: `domains/${match[1]}` };
}

function resolveIndexTarget(indexPath: string, raw: string): string | undefined {
  const clean = raw.split("#")[0]?.split("?")[0];
  if (!clean || clean.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(clean)) return undefined;
  const target = clean.startsWith("/") ? path.posix.normalize(clean.slice(1))
    : path.posix.normalize(path.posix.join(path.posix.dirname(indexPath), clean));
  if (target === ".." || target.startsWith("../")) return `!unsafe:${raw}`;
  return target.endsWith("/") ? `${target}index.md` : target;
}

function indexTargets(snapshot: AgentBaseHubProfileSnapshot, indexPath: string, failures: string[]): ReadonlySet<string> {
  if (!snapshot.files.includes(indexPath)) {
    failures.push(`${indexPath}: Profile 1.0 navigation index is missing`);
    return new Set();
  }
  const source = snapshot.readMarkdown(indexPath);
  if (source === undefined) {
    failures.push(`${indexPath}: Profile 1.0 navigation index is unavailable`);
    return new Set();
  }
  const body = parseReservedFrontmatter(indexPath, source).body;
  const targets = new Set<string>();
  for (const match of body.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const raw = match[1];
    if (!raw) continue;
    const resolved = resolveIndexTarget(indexPath, raw);
    if (resolved?.startsWith("!unsafe:")) failures.push(`${indexPath}: unsafe navigation target ${raw}`);
    else if (resolved) targets.add(resolved);
  }
  return targets;
}

function requireTarget(indexPath: string, targets: ReadonlySet<string>, target: string, failures: string[]): void {
  if (!targets.has(target)) failures.push(`${indexPath}: Profile 1.0 navigation must resolve ${target}`);
}

function boundedFailures(values: readonly string[]): Readonly<{ failures: readonly string[]; omittedFailureCount: number }> {
  const failures = [...new Set(values)].sort();
  return { failures: failures.slice(0, MAXIMUM_FAILURES), omittedFailureCount: Math.max(0, failures.length - MAXIMUM_FAILURES) };
}

export function agentBaseDomainConceptIdentity(selector: string): string {
  if (!DOMAIN_SELECTOR.test(selector)) throw new Error("AgentBase Domain selector must be domains/<slug>");
  return selector;
}

export function agentBaseDomainConceptPath(selector: string): string {
  return `${agentBaseDomainConceptIdentity(selector)}/index.md`;
}

export function agentBaseDomainSelector(conceptIdentity: string): string {
  const match = DOMAIN_CONCEPT.exec(conceptIdentity);
  if (!match?.[1]) throw new Error("AgentBase Domain concept identity must be domains/<slug>");
  return `domains/${match[1]}`;
}

export function agentBaseProfileConceptPath(
  home: AgentBaseConceptHome,
  type: string,
  conceptSlug: string,
): string {
  if (!CONCEPT_SLUG.test(conceptSlug)) throw new Error("AgentBase Profile concept slug is invalid");
  if (type === "Domain") {
    if (home.kind !== "domain" || path.posix.basename(home.selector) !== conceptSlug) {
      throw new Error("AgentBase Domain path must match its Domain home");
    }
    return agentBaseDomainConceptPath(home.selector);
  }
  if (type === AGENTBASE_OKF_PROFILE_TYPE) {
    if (home.kind !== "shared") throw new Error("AgentBase Profile declaration must use the shared home");
    return AGENTBASE_OKF_PROFILE_PATH;
  }
  const category = KNOWN_CATEGORY.get(type) ?? "knowledge";
  if (home.kind === "domain") agentBaseDomainConceptIdentity(home.selector);
  const prefix = home.kind === "shared" ? "shared" : home.selector;
  return `${prefix}/${category}/${conceptSlug}.md`;
}

export function classifyAgentBaseHubProfileSnapshot(
  snapshot: AgentBaseHubProfileSnapshot,
): AgentBaseHubProfileAdmission {
  const exact = snapshot.concepts.get(AGENTBASE_OKF_PROFILE_CONCEPT_ID);
  const profileConcepts = [...snapshot.concepts.values()].filter((concept) => concept.type === AGENTBASE_OKF_PROFILE_TYPE);
  if (!exact && !profileConcepts.length) return { kind: "legacy-unprofiled" };

  const failures: string[] = [];
  if (!exact) {
    for (const concept of profileConcepts) failures.push(`${concept.path}: Profile concept must use ${AGENTBASE_OKF_PROFILE_PATH}`);
    const bounded = boundedFailures(failures);
    return { kind: "unsupported", ...bounded };
  }
  failures.push(...profileFailures(exact, profileConcepts));

  const homes: AgentBaseProfileConceptHome[] = [];
  for (const concept of snapshot.concepts.values()) {
    const home = conceptHome(concept, failures);
    if (home) homes.push({ identity: concept.conceptId, path: concept.path, home });
  }

  const domainSelectors = new Set<string>();
  for (const relative of snapshot.files) {
    const match = /^domains\/([a-z0-9]+(?:-[a-z0-9]+)*)\//.exec(relative);
    if (match?.[1]) domainSelectors.add(`domains/${match[1]}`);
  }
  for (const selector of [...domainSelectors].sort()) {
    const identity = agentBaseDomainConceptIdentity(selector), concept = snapshot.concepts.get(identity);
    if (!concept || concept.type !== "Domain") failures.push(`${selector}/index.md: Domain Capsule requires one matching Domain concept`);
  }

  for (const relative of snapshot.files) {
    if (path.posix.basename(relative) === "log.md") {
      failures.push(`${relative}: compact Profile does not admit reserved activity log.md`);
      continue;
    }
    if (relative === "index.md" || relative === "README.md" || relative.startsWith(".agentbase/")
      || relative.startsWith(".github/")) continue;
    if (relative === "shared/index.md" || relative === AGENTBASE_OKF_PROFILE_PATH) continue;
    const withinShared = relative.startsWith("shared/") ? relative.slice("shared/".length) : undefined;
    const domain = DOMAIN_HOME.exec(relative);
    const withinHome = withinShared ?? domain?.[2];
    if (!withinHome) continue;
    if (domain && withinHome === "index.md") continue;
    const parts = withinHome.split("/");
    if (parts.length !== 2 || !["repositories", "knowledge", "questions"].includes(parts[0]!)
      || !parts[1]?.endsWith(".md") || ["index.md", "log.md"].includes(parts[1])) {
      failures.push(`${relative}: compact Profile home admits only repositories/, knowledge/ and questions/ concept files`);
    }
  }

  const rootTargets = indexTargets(snapshot, "index.md", failures);
  requireTarget("index.md", rootTargets, AGENTBASE_OKF_PROFILE_PATH, failures);
  requireTarget("index.md", rootTargets, "shared/index.md", failures);
  const sharedTargets = indexTargets(snapshot, "shared/index.md", failures);
  requireTarget("shared/index.md", sharedTargets, AGENTBASE_OKF_PROFILE_PATH, failures);
  for (const selector of [...domainSelectors].sort()) {
    const indexPath = `${selector}/index.md`;
    const targets = indexTargets(snapshot, indexPath, failures);
    for (const home of homes.filter((item) => item.home.kind === "domain"
      && item.home.selector === selector && item.path !== indexPath)) {
      requireTarget(indexPath, targets, home.path, failures);
    }
    requireTarget("index.md", rootTargets, indexPath, failures);
  }
  for (const home of homes.filter((item) => item.home.kind === "shared" && item.path !== AGENTBASE_OKF_PROFILE_PATH)) {
    requireTarget("shared/index.md", sharedTargets, home.path, failures);
  }

  const bounded = boundedFailures(failures);
  if (bounded.failures.length || bounded.omittedFailureCount) return { kind: "unsupported", ...bounded };
  return {
    kind: "profile-1.0",
    profile: AGENTBASE_OKF_PROFILE,
    homes: homes.sort((left, right) => left.identity.localeCompare(right.identity)),
  };
}

export function classifyAgentBaseHubProfile(bundle: OkfBundle): AgentBaseHubProfileAdmission {
  return classifyAgentBaseHubProfileSnapshot({
    concepts: bundle.concepts,
    files: bundle.files,
    readMarkdown(relativePath) {
      const target = path.join(bundle.root, ...relativePath.split("/"));
      return fs.existsSync(target) ? fs.readFileSync(target, "utf8") : undefined;
    },
  });
}
