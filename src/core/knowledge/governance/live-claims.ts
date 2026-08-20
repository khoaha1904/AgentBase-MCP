import type { ConceptDocument, OkfValue } from "../documents/okf-document.ts";

export type LiveClaimRole = "documentation" | "implementation" | "configuration";
export type LiveClaimTargetKind = "symbol" | "function" | "config-field" | "text";
export type LiveClaim = Readonly<{
  id: string;
  subject: string;
  property: string;
  role: LiveClaimRole;
  sourceId: string;
  source: Readonly<{ resource: string }>;
  target: Readonly<{ kind: LiveClaimTargetKind; name: string }>;
  observed: Readonly<{ commit: string | null; dirty: boolean; dirtyDigest: string | null }>;
}>;

const CLAIM_ID = /^AB-CLAIM-[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SUBJECT_ROOT = "(?:domains|systems|components|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities|guidance)";
const SUBJECT = new RegExp(`^${SUBJECT_ROOT}/[a-z0-9][a-z0-9./-]*$`);
const PROPERTY = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const REPOSITORY_RESOURCE = /^repository:\/\/repository-[a-z0-9-]+-[a-f0-9]{12}\/.+#L\d+-L\d+$/;
const ROLES = new Set<LiveClaimRole>(["documentation", "implementation", "configuration"]);
const TARGET_KINDS = new Set<LiveClaimTargetKind>(["symbol", "function", "config-field", "text"]);

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function exactKeys(value: Readonly<Record<string, OkfValue>>, expected: readonly string[]): boolean {
  const keys = Object.keys(value).sort();
  return keys.length === expected.length && keys.every((key, index) => key === [...expected].sort()[index]);
}

function sourceMap(concept: ConceptDocument): ReadonlyMap<string, string> {
  const result = new Map<string, string>();
  if (!Array.isArray(concept.frontmatter.sources)) return result;
  for (const value of concept.frontmatter.sources) {
    const source = mapping(value);
    if (typeof source?.id === "string" && typeof source.resource === "string") result.set(source.id, source.resource);
  }
  return result;
}

function parseClaims(concept: ConceptDocument): Readonly<{ claims: readonly LiveClaim[]; failures: readonly string[] }> {
  const agentbase = mapping(concept.frontmatter.agentbase);
  const raw = agentbase?.live_claims;
  if (raw === undefined) return { claims: [], failures: [] };
  if (!Array.isArray(raw) || raw.length > 64) {
    return { claims: [], failures: [`${concept.path}: agentbase.live_claims must be a list of at most 64 entries`] };
  }
  const sources = sourceMap(concept);
  const claims: LiveClaim[] = [], failures: string[] = [];
  for (const [index, value] of raw.entries()) {
    const prefix = `${concept.path}: live claim ${index + 1}`;
    const claim = mapping(value);
    if (!claim || !exactKeys(claim, ["id", "observed", "property", "role", "source_id", "subject", "target"])) {
      failures.push(`${prefix} contains unknown or missing fields`); continue;
    }
    const target = mapping(claim.target), observed = mapping(claim.observed);
    if (!target || !exactKeys(target, ["kind", "name"])) failures.push(`${prefix} target contains unknown or missing fields`);
    if (!observed || !exactKeys(observed, ["commit", "dirty", "dirty_digest"])) {
      failures.push(`${prefix} observed contains unknown fields or is incomplete`);
    }
    const id = claim.id, subject = claim.subject, property = claim.property, role = claim.role, sourceId = claim.source_id;
    const resource = typeof sourceId === "string" ? sources.get(sourceId) : undefined;
    if (typeof id !== "string" || !CLAIM_ID.test(id)) failures.push(`${prefix} id is invalid`);
    if (typeof subject !== "string" || subject.length > 512 || !SUBJECT.test(subject) || subject.includes("..")) failures.push(`${prefix} subject is invalid`);
    if (typeof property !== "string" || property.length > 128 || !PROPERTY.test(property)) failures.push(`${prefix} property is invalid`);
    if (typeof role !== "string" || !ROLES.has(role as LiveClaimRole)) failures.push(`${prefix} role is invalid`);
    if (typeof sourceId !== "string" || !resource) failures.push(`${prefix} source_id does not resolve to sources[].id`);
    else if (!REPOSITORY_RESOURCE.test(resource)) failures.push(`${prefix} source must be a normalized repository resource`);
    const kind = target?.kind, name = target?.name;
    if (typeof kind !== "string" || !TARGET_KINDS.has(kind as LiveClaimTargetKind)) failures.push(`${prefix} target kind is invalid`);
    if (typeof name !== "string" || !name.trim() || name.length > 256) failures.push(`${prefix} target name is invalid`);
    const commit = observed?.commit, dirty = observed?.dirty, dirtyDigest = observed?.dirty_digest;
    if (commit !== null && (typeof commit !== "string" || !COMMIT.test(commit))) failures.push(`${prefix} observed commit is invalid`);
    if (typeof dirty !== "boolean") failures.push(`${prefix} observed dirty must be boolean`);
    if (dirty === true && (typeof dirtyDigest !== "string" || !DIGEST.test(dirtyDigest))) failures.push(`${prefix} dirty observation requires dirty_digest`);
    if (dirty === false && dirtyDigest !== null) failures.push(`${prefix} clean observation requires null dirty_digest`);
    if (dirty === false && (typeof commit !== "string" || !COMMIT.test(commit))) failures.push(`${prefix} clean observation requires commit`);
    if (!failures.some((failure) => failure.startsWith(prefix))) claims.push({
      id: id as string, subject: subject as string, property: property as string, role: role as LiveClaimRole,
      sourceId: sourceId as string, source: { resource: resource! },
      target: { kind: kind as LiveClaimTargetKind, name: name as string },
      observed: { commit: commit as string | null, dirty: dirty as boolean, dirtyDigest: dirtyDigest as string | null },
    });
  }
  return { claims, failures };
}

export function readLiveClaims(concept: ConceptDocument): readonly LiveClaim[] {
  const parsed = parseClaims(concept);
  if (parsed.failures.length) throw new Error(parsed.failures.join("; "));
  return parsed.claims;
}

export function validateBundleLiveClaims(concepts: Iterable<ConceptDocument>): readonly string[] {
  const failures: string[] = [], ids = new Map<string, string>();
  for (const concept of concepts) {
    const parsed = parseClaims(concept);
    failures.push(...parsed.failures);
    for (const claim of parsed.claims) {
      const previous = ids.get(claim.id);
      if (previous) failures.push(`${concept.path}: duplicate live claim ID ${claim.id} already used by ${previous}`);
      else ids.set(claim.id, concept.path);
    }
  }
  return failures.sort();
}
