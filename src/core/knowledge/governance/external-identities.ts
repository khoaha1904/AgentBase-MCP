import { isDeepStrictEqual } from "node:util";

import type { ConceptDocument, OkfValue } from "../documents/okf-document.ts";

export type ExternalIdentity = Readonly<{
  provider: string;
  identityType: string;
  value: string;
  service: string;
  resourceType: string;
  scope: Readonly<Record<string, string>>;
  evidence: readonly string[];
  observedAt?: string;
}>;

const WORD = /^[a-z][a-z0-9.-]{0,63}$/;
const SCOPE_KEY = /^[a-z][a-z0-9_]{0,63}$/;
const SOURCE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SECRET = /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bAKIA[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9_]{20,}\b|[?&](?:X-Amz-Signature|token|secret)=)/i;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function exactKeys(value: Readonly<Record<string, OkfValue>>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function parseEntry(value: OkfValue, prefix: string): Readonly<{ identity?: ExternalIdentity; failures: readonly string[] }> {
  const entry = mapping(value), failures: string[] = [];
  if (!entry || !exactKeys(entry, ["provider", "identity_type", "value", "service", "resource_type", "scope", "evidence", "observed_at"])) {
    return { failures: [`${prefix} contains unknown fields or is not a mapping`] };
  }
  const scope = mapping(entry.scope);
  if (typeof entry.provider !== "string" || !WORD.test(entry.provider)) failures.push(`${prefix} provider is invalid`);
  if (typeof entry.identity_type !== "string" || !WORD.test(entry.identity_type)) failures.push(`${prefix} identity_type is invalid`);
  if (typeof entry.service !== "string" || !WORD.test(entry.service)) failures.push(`${prefix} service is invalid`);
  if (typeof entry.resource_type !== "string" || !WORD.test(entry.resource_type)) failures.push(`${prefix} resource_type is invalid`);
  if (typeof entry.value !== "string" || !entry.value || entry.value.includes("\n")
    || Buffer.byteLength(entry.value) > 2048 || SECRET.test(entry.value)) failures.push(`${prefix} value is invalid or secret-like`);
  if (!scope || !Object.keys(scope).length || Object.entries(scope).some(([key, item]) =>
    !SCOPE_KEY.test(key) || typeof item !== "string" || !item || item.includes("\n") || Buffer.byteLength(item) > 256)) {
    failures.push(`${prefix} scope is invalid`);
  }
  if (!Array.isArray(entry.evidence) || !entry.evidence.length || entry.evidence.length > 64
    || entry.evidence.some((item) => typeof item !== "string" || !SOURCE_ID.test(item))
    || new Set(entry.evidence).size !== entry.evidence.length) failures.push(`${prefix} evidence is invalid`);
  if (entry.observed_at !== undefined && (typeof entry.observed_at !== "string"
    || !Number.isFinite(Date.parse(entry.observed_at)))) failures.push(`${prefix} observed_at is invalid`);
  if (failures.length) return { failures };
  return { identity: {
    provider: entry.provider as string,
    identityType: entry.identity_type as string,
    value: entry.value as string,
    service: entry.service as string,
    resourceType: entry.resource_type as string,
    scope: Object.fromEntries(Object.entries(scope!).sort(([left], [right]) => left.localeCompare(right))) as Record<string, string>,
    evidence: [...entry.evidence as string[]],
    ...(typeof entry.observed_at === "string" ? { observedAt: entry.observed_at } : {}),
  }, failures: [] };
}

export function externalIdentityKey(identity: ExternalIdentity): string {
  return JSON.stringify([identity.provider, identity.identityType, identity.value]);
}

export function readExternalIdentities(concept: ConceptDocument): readonly ExternalIdentity[] {
  const raw = mapping(concept.frontmatter.agentbase)?.external_identities;
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > 64) throw new Error(`${concept.path}: agentbase.external_identities must be a list of at most 64 entries`);
  const identities: ExternalIdentity[] = [], failures: string[] = [];
  for (const [index, value] of raw.entries()) {
    const parsed = parseEntry(value, `${concept.path}: external identity ${index + 1}`);
    failures.push(...parsed.failures);
    if (parsed.identity) identities.push(parsed.identity);
  }
  if (new Set(identities.map(externalIdentityKey)).size !== identities.length) failures.push(`${concept.path}: external identity keys contain duplicates`);
  if (failures.length) throw new Error(failures.join("; "));
  return identities;
}

function serialized(identity: ExternalIdentity): OkfValue {
  return {
    provider: identity.provider,
    identity_type: identity.identityType,
    value: identity.value,
    service: identity.service,
    resource_type: identity.resourceType,
    scope: identity.scope,
    evidence: identity.evidence,
    ...(identity.observedAt ? { observed_at: identity.observedAt } : {}),
  };
}

export function withExternalIdentity(concept: ConceptDocument, identity: ExternalIdentity): ConceptDocument {
  const parsed = parseEntry(serialized(identity), `${concept.path}: external identity`);
  if (!parsed.identity || parsed.failures.length) throw new Error(parsed.failures.join("; "));
  const existing = readExternalIdentities(concept), key = externalIdentityKey(parsed.identity);
  const prior = existing.find((item) => externalIdentityKey(item) === key);
  if (prior && !isDeepStrictEqual(prior.scope, parsed.identity.scope)) throw new Error(`${concept.path}: external identity scope conflicts with existing identity`);
  const identities = [...existing.filter((item) => externalIdentityKey(item) !== key), parsed.identity]
    .sort((left, right) => externalIdentityKey(left).localeCompare(externalIdentityKey(right)));
  const agentbase = { ...(mapping(concept.frontmatter.agentbase) ?? {}), external_identities: identities.map(serialized) };
  return { ...concept, frontmatter: { ...concept.frontmatter, agentbase } };
}

export function validateBundleExternalIdentities(concepts: Iterable<ConceptDocument>): readonly string[] {
  const owners = new Map<string, string>(), failures: string[] = [];
  for (const concept of concepts) {
    try {
      for (const identity of readExternalIdentities(concept)) {
        const key = externalIdentityKey(identity), owner = owners.get(key);
        if (owner && owner !== concept.conceptId) failures.push(`strong external identity ${key} is owned by both ${owner} and ${concept.conceptId}`);
        else owners.set(key, concept.conceptId);
      }
    } catch (error) {
      failures.push(error instanceof Error ? error.message : `${concept.path}: external identity validation failed`);
    }
  }
  return failures.sort();
}
