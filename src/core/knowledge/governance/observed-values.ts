import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";

import {
  parseRepositorySourceResource,
  type ConceptDocument,
  type OkfValue,
} from "../documents/okf-document.ts";

export type ObservedValueRole = "documentation" | "implementation" | "configuration";
export type ObservedValueScalar = string | number | boolean;
export type RepositoryObservedValueState = Readonly<{
  commit: string | null;
  dirty: boolean;
  dirtyDigest: string | null;
}>;
export type ObservedValue = Readonly<{
  id: string;
  subject: string;
  property: string;
  role: ObservedValueRole;
  value: ObservedValueScalar;
  sourceId: string;
  source: Readonly<{
    resource: string;
    repositoryId: string;
    relativePath: string;
    startLine?: number;
    endLine?: number;
  }>;
  observed: RepositoryObservedValueState & Readonly<{ at: string }>;
}>;
export type QueryObservedValue = Omit<ObservedValue, "value"> & Readonly<{
  value: ObservedValueScalar;
  sensitivityWarning?: "obvious-sensitive-value-redacted";
}>;
export type ObservedValueIdInput = Readonly<{
  conceptId: string;
  subject: string;
  property: string;
  role: ObservedValueRole;
  sourceResource: string;
}>;
export type NormalizeRepositoryObservedValuesOptions = Readonly<{
  repositoryId: string;
  sourceState: RepositoryObservedValueState;
  observedAt: string;
  previous?: ConceptDocument;
  removeRepositoryContribution?: boolean;
}>;

const VALUE_ID = /^AB-OBS-[a-f0-9]{24}$/;
const SUBJECT_ROOT = "(?:domains|systems|components|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities|guidance)";
const SUBJECT = new RegExp(`^${SUBJECT_ROOT}/[a-z0-9][a-z0-9./-]*$`);
const PROPERTY = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const ROLES = new Set<ObservedValueRole>(["documentation", "implementation", "configuration"]);
const SECRET_FIELD = /(?:^|[._-])(password|passwd|secret|token|credential|private[-_]?key|api[-_]?key|access[-_]?key|signing[-_]?key|connection[-_]?string|signed[-_]?url)(?:$|[._-])/i;
const SECRET_VALUE = /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bAKIA[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9_]{20,}\b|\bxox[baprs]-[A-Za-z0-9-]{10,}\b|\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b|[a-z][a-z0-9+.-]*:\/\/[^\s/:]+:[^\s/@]+@|[?&](?:X-Amz-Signature|signature|sig|token)=[^&\s]+)/i;
const SECTION_START = "<!-- agentbase:observed-values:start -->";
const SECTION_END = "<!-- agentbase:observed-values:end -->";
const OWNED_SECTION = /<!-- agentbase:observed-values:start -->[\s\S]*?<!-- agentbase:observed-values:end -->/g;
const MANUAL_HEADING = /^## Observed values\s*$/m;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function exactKeys(value: Readonly<Record<string, OkfValue>>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length && actual.every((key, index) => key === sortedExpected[index]);
}

function validObservedAt(value: unknown): value is string {
  return typeof value === "string" && RFC3339.test(value) && Number.isFinite(Date.parse(value));
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

export function observedValueSafetyFailure(property: unknown, value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    return "value must be one string, finite number or boolean";
  }
  if (typeof value === "number" && !Number.isFinite(value)) return "value number must be finite";
  const serialized = String(value);
  if (!serialized || serialized.includes("\n") || serialized.includes("\r") || Buffer.byteLength(serialized) > 256) {
    return "value must be one non-empty line of at most 256 UTF-8 bytes";
  }
  if ((typeof property === "string" && SECRET_FIELD.test(property)) || SECRET_VALUE.test(serialized)) {
    return "value is obviously secret-like";
  }
  return undefined;
}

function sourceScope(resource: string): string {
  const parsed = parseRepositorySourceResource(resource);
  if (!parsed) throw new Error("observed value source must be a normalized repository resource");
  return `${parsed.repositoryId}/${parsed.relativePath}`;
}

export function createObservedValueId(input: ObservedValueIdInput): string {
  const tuple = [
    "agentbase-observation-v1",
    input.conceptId,
    input.subject,
    input.property,
    input.role,
    sourceScope(input.sourceResource),
  ];
  return `AB-OBS-${createHash("sha256").update(JSON.stringify(tuple)).digest("hex").slice(0, 24)}`;
}

function stateFailures(observed: Readonly<Record<string, OkfValue>> | undefined, prefix: string): readonly string[] {
  if (!observed || !exactKeys(observed, ["at", "commit", "dirty", "dirty_digest"])) {
    return [`${prefix} observed contains unknown fields or is incomplete`];
  }
  const failures: string[] = [];
  const { commit, dirty, dirty_digest: dirtyDigest, at } = observed;
  if (commit !== null && (typeof commit !== "string" || !COMMIT.test(commit))) failures.push(`${prefix} observed commit is invalid`);
  if (typeof dirty !== "boolean") failures.push(`${prefix} observed dirty must be boolean`);
  if (dirty === true && (typeof dirtyDigest !== "string" || !DIGEST.test(dirtyDigest))) {
    failures.push(`${prefix} dirty observation requires dirty_digest`);
  }
  if (dirty === false && dirtyDigest !== null) failures.push(`${prefix} clean observation requires null dirty_digest`);
  if (dirty === false && (typeof commit !== "string" || !COMMIT.test(commit))) failures.push(`${prefix} clean observation requires commit`);
  if (!validObservedAt(at)) failures.push(`${prefix} observed at must be RFC3339`);
  return failures;
}

function parseValues(
  concept: ConceptDocument,
  options: Readonly<{ allowUnsafeValue?: boolean }> = {},
): Readonly<{ values: readonly ObservedValue[]; failures: readonly string[] }> {
  const agentbase = mapping(concept.frontmatter.agentbase);
  const raw = agentbase?.observed_values;
  if (raw === undefined) {
    const sections = [...concept.body.matchAll(OWNED_SECTION)];
    const bodyWithoutSections = concept.body.replace(OWNED_SECTION, "");
    const failures: string[] = [];
    if (sections.length) failures.push(`${concept.path}: rendered Observed values section exists without structured values`);
    if (MANUAL_HEADING.test(bodyWithoutSections)) failures.push(`${concept.path}: an Observed values heading must be renderer-owned`);
    return { values: [], failures };
  }
  if (!Array.isArray(raw) || raw.length > 64) {
    return { values: [], failures: [`${concept.path}: agentbase.observed_values must be a list of at most 64 entries`] };
  }
  const sources = sourceMap(concept);
  const values: ObservedValue[] = [], failures: string[] = [];
  for (const [index, rawValue] of raw.entries()) {
    const prefix = `${concept.path}: observed value ${index + 1}`;
    const entry = mapping(rawValue);
    if (!entry || !exactKeys(entry, ["id", "observed", "property", "role", "source_id", "subject", "value"])) {
      failures.push(`${prefix} contains unknown or missing fields`);
      continue;
    }
    const { id, subject, property, role, value, source_id: sourceId } = entry;
    const resource = typeof sourceId === "string" ? sources.get(sourceId) : undefined;
    const source = typeof resource === "string" ? parseRepositorySourceResource(resource) : undefined;
    if (typeof id !== "string" || !VALUE_ID.test(id)) failures.push(`${prefix} id is invalid`);
    if (typeof subject !== "string" || subject.length > 512 || !SUBJECT.test(subject) || subject.includes("..")) {
      failures.push(`${prefix} subject is invalid`);
    } else if (subject !== concept.conceptId) failures.push(`${prefix} subject must equal owning concept ${concept.conceptId}`);
    if (typeof property !== "string" || property.length > 128 || !PROPERTY.test(property)) failures.push(`${prefix} property is invalid`);
    if (typeof role !== "string" || !ROLES.has(role as ObservedValueRole)) failures.push(`${prefix} role is invalid`);
    if (typeof sourceId !== "string" || !resource) failures.push(`${prefix} source_id does not resolve to sources[].id`);
    else if (!source) failures.push(`${prefix} source must be a normalized repository resource`);
    const safetyFailure = observedValueSafetyFailure(property, value);
    if (safetyFailure && !options.allowUnsafeValue) failures.push(`${prefix} ${safetyFailure}`);
    const observed = mapping(entry.observed);
    failures.push(...stateFailures(observed, prefix));
    if (!failures.some((failure) => failure.startsWith(prefix)) && source && typeof resource === "string") {
      values.push({
        id: id as string,
        subject: subject as string,
        property: property as string,
        role: role as ObservedValueRole,
        value: value as ObservedValueScalar,
        sourceId: sourceId as string,
        source: { resource, ...source },
        observed: {
          commit: observed!.commit as string | null,
          dirty: observed!.dirty as boolean,
          dirtyDigest: observed!.dirty_digest as string | null,
          at: observed!.at as string,
        },
      });
    }
  }
  const expectedSection = renderObservedValuesSection(values);
  const sections = [...concept.body.matchAll(OWNED_SECTION)].map((match) => match[0]);
  const bodyWithoutSections = concept.body.replace(OWNED_SECTION, "");
  if (MANUAL_HEADING.test(bodyWithoutSections)) failures.push(`${concept.path}: an Observed values heading must be renderer-owned`);
  if ((values.length && (sections.length !== 1 || sections[0] !== expectedSection))
    || (!values.length && sections.length)) failures.push(`${concept.path}: rendered Observed values section is missing or stale`);
  return { values, failures };
}

function markdownCell(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|");
}

function displayedSource(value: ObservedValue): string {
  const span = value.source.startLine === undefined ? "" : `#L${value.source.startLine}-L${value.source.endLine}`;
  return `${value.source.relativePath}${span}`;
}

function displayedObservation(value: ObservedValue): string {
  const revision = value.observed.commit ?? "unborn";
  const dirty = value.observed.dirty ? `, dirty ${value.observed.dirtyDigest}` : "";
  return `${revision}${dirty}, ${value.observed.at}`;
}

export function renderObservedValuesSection(values: readonly ObservedValue[]): string {
  if (!values.length) return "";
  const rows = [...values].sort((left, right) => left.id.localeCompare(right.id)).map((entry) =>
    `| \`${markdownCell(entry.property)}\` | \`${markdownCell(JSON.stringify(entry.value))}\` | ${entry.role} | \`${markdownCell(displayedSource(entry))}\` | ${markdownCell(displayedObservation(entry))} |`);
  return [
    SECTION_START,
    "## Observed values",
    "",
    "| Property | Observed value | Role | Source | Observed at |",
    "|---|---:|---|---|---|",
    ...rows,
    SECTION_END,
  ].join("\n");
}

export function readObservedValues(concept: ConceptDocument): readonly ObservedValue[] {
  const parsed = parseValues(concept);
  if (parsed.failures.length) throw new Error(parsed.failures.join("; "));
  return parsed.values;
}

export function readObservedValuesForQuery(concept: ConceptDocument): readonly QueryObservedValue[] {
  const parsed = parseValues(concept, { allowUnsafeValue: true });
  if (parsed.failures.length) throw new Error(parsed.failures.join("; "));
  return parsed.values.map((value) => observedValueSafetyFailure(value.property, value.value) ? {
    ...value,
    value: "[redacted]",
    sensitivityWarning: "obvious-sensitive-value-redacted",
  } : value);
}

export function validateBundleObservedValues(concepts: Iterable<ConceptDocument>): readonly string[] {
  const failures: string[] = [], ids = new Map<string, string>();
  for (const concept of concepts) {
    const parsed = parseValues(concept);
    failures.push(...parsed.failures);
    for (const value of parsed.values) {
      const previous = ids.get(value.id);
      if (previous) failures.push(`${concept.path}: duplicate observed value ID ${value.id} already used by ${previous}`);
      else ids.set(value.id, concept.path);
    }
  }
  return failures.sort();
}

function rawStreamKey(concept: ConceptDocument, entry: Readonly<Record<string, OkfValue>>, resource: string): string {
  return JSON.stringify([concept.conceptId, entry.subject, entry.property, entry.role, sourceScope(resource)]);
}

function normalizedBody(body: string, section: string): string {
  const matches = [...body.matchAll(OWNED_SECTION)];
  if (matches.length > 1) throw new Error("concept contains more than one renderer-owned Observed values section");
  const match = matches[0];
  let without = body.replace(OWNED_SECTION, "");
  if (match && !section && match.index !== undefined && match.index + match[0].length === body.length
    && without.endsWith("\n\n")) without = without.slice(0, -2);
  if (MANUAL_HEADING.test(without)) throw new Error("an Observed values heading must be renderer-owned");
  if (match?.index !== undefined) {
    return section ? `${body.slice(0, match.index)}${section}${body.slice(match.index + match[0].length)}` : without;
  }
  if (!section) return body;
  const separator = body ? (body.endsWith("\n") ? "\n" : "\n\n") : "";
  return `${body}${separator}${section}`;
}

export function normalizeRepositoryObservedValues(
  concept: ConceptDocument,
  options: NormalizeRepositoryObservedValuesOptions,
): ConceptDocument {
  if (!/^repository-[a-z0-9-]+-[a-f0-9]{12}$/.test(options.repositoryId)) throw new Error("repositoryId is invalid");
  if (options.previous && options.previous.conceptId !== concept.conceptId) throw new Error("previous concept identity does not match");
  const state = {
    commit: options.sourceState.commit,
    dirty: options.sourceState.dirty,
    dirty_digest: options.sourceState.dirtyDigest,
    at: options.observedAt,
  } satisfies Readonly<Record<string, OkfValue>>;
  const stampedState = (): Readonly<Record<string, OkfValue>> => {
    const failures = stateFailures(state, concept.path);
    if (failures.length) throw new Error(failures.join("; "));
    return { ...state };
  };
  const agentbase = mapping(concept.frontmatter.agentbase);
  const raw = agentbase?.observed_values;
  if (raw !== undefined && (!Array.isArray(raw) || raw.length > 64)) {
    throw new Error(`${concept.path}: agentbase.observed_values must be a list of at most 64 entries`);
  }
  const sources = sourceMap(concept);
  const previousValues = options.previous ? readObservedValues(options.previous) : [];
  const previousByStream = new Map(previousValues.map((value) => [JSON.stringify([
    options.previous!.conceptId, value.subject, value.property, value.role, sourceScope(value.source.resource),
  ]), value]));
  const previousById = new Map(previousValues.map((value) => [value.id, value]));
  const serialized = (value: ObservedValue): OkfValue => ({
    id: value.id,
    subject: value.subject,
    property: value.property,
    role: value.role,
    value: value.value,
    source_id: value.sourceId,
    observed: {
      commit: value.observed.commit,
      dirty: value.observed.dirty,
      dirty_digest: value.observed.dirtyDigest,
      at: value.observed.at,
    },
  });
  const normalizedRaw: OkfValue[] = [];
  const retainedIds = new Set<string>();
  for (const [index, rawValue] of (raw ?? []).entries()) {
    const prefix = `${concept.path}: observed value ${index + 1}`;
    const entry = mapping(rawValue);
    if (!entry || Object.keys(entry).some((key) => !["id", "observed", "property", "role", "source_id", "subject", "value"].includes(key))
      || !["property", "role", "source_id", "subject", "value"].every((key) => key in entry)) {
      throw new Error(`${prefix} contains unknown or missing authoring fields`);
    }
    const sourceId = entry.source_id;
    const resource = typeof sourceId === "string" ? sources.get(sourceId) : undefined;
    const source = typeof resource === "string" ? parseRepositorySourceResource(resource) : undefined;
    if (typeof sourceId !== "string" || typeof resource !== "string" || !source) {
      throw new Error(`${prefix} must use a normalized repository source`);
    }
    if (source.repositoryId !== options.repositoryId) {
      const prior = typeof entry.id === "string" ? previousById.get(entry.id) : undefined;
      if (!prior || !isDeepStrictEqual(entry, serialized(prior)) || prior.source.resource !== resource) {
        throw new Error(`${prefix} foreign repository observation must remain unchanged`);
      }
      normalizedRaw.push(serialized(prior));
      retainedIds.add(prior.id);
      continue;
    }
    if (options.removeRepositoryContribution) continue;
    const safetyFailure = observedValueSafetyFailure(entry.property, entry.value);
    if (safetyFailure) throw new Error(`${prefix} ${safetyFailure}`);
    if (entry.subject !== concept.conceptId || typeof entry.property !== "string" || !PROPERTY.test(entry.property)
      || typeof entry.role !== "string" || !ROLES.has(entry.role as ObservedValueRole)
      || (typeof entry.value !== "string" && typeof entry.value !== "number" && typeof entry.value !== "boolean")) {
      throw new Error(`${prefix} has an invalid subject, property or role`);
    }
    const subject = entry.subject;
    const property = entry.property;
    const role = entry.role as ObservedValueRole;
    const scalar = entry.value;
    const key = rawStreamKey(concept, entry, resource);
    const exactPrevious = previousByStream.get(key);
    const suppliedIdPrevious = typeof entry.id === "string" ? previousById.get(entry.id) : undefined;
    const previous = exactPrevious ?? suppliedIdPrevious;
    if (entry.id !== undefined && (!previous || previous.subject !== entry.subject || previous.property !== entry.property
      || previous.role !== entry.role)) throw new Error(`${prefix} author-supplied id does not name an existing stream`);
    const id = previous?.id ?? createObservedValueId({
      conceptId: concept.conceptId,
      subject,
      property,
      role,
      sourceResource: resource,
    });
    const unchanged = previous !== undefined && previous.value === scalar && previous.source.resource === resource;
    const observed = unchanged ? {
      commit: previous.observed.commit,
      dirty: previous.observed.dirty,
      dirty_digest: previous.observed.dirtyDigest,
      at: previous.observed.at,
    } : stampedState();
    normalizedRaw.push({
      id,
      subject,
      property,
      role,
      value: scalar,
      source_id: sourceId,
      observed,
    });
    retainedIds.add(id);
  }
  for (const previous of previousValues) {
    if (retainedIds.has(previous.id)) continue;
    if (previous.source.repositoryId === options.repositoryId && options.removeRepositoryContribution) continue;
    if (!sources.has(previous.sourceId) || sources.get(previous.sourceId) !== previous.source.resource) {
      throw new Error(`${concept.path}: preserved observed value ${previous.id} requires its unchanged source`);
    }
    normalizedRaw.push(serialized(previous));
  }
  if (normalizedRaw.length > 64) throw new Error(`${concept.path}: agentbase.observed_values must contain at most 64 entries`);
  const nextAgentbaseRecord: Record<string, OkfValue> = { ...(agentbase ?? {}) };
  if (normalizedRaw.length) nextAgentbaseRecord.observed_values = normalizedRaw;
  else delete nextAgentbaseRecord.observed_values;
  const nextFrontmatter: Record<string, OkfValue> = { ...concept.frontmatter };
  if (Object.keys(nextAgentbaseRecord).length) nextFrontmatter.agentbase = nextAgentbaseRecord;
  else delete nextFrontmatter.agentbase;
  const staged: ConceptDocument = { ...concept, frontmatter: nextFrontmatter };
  const values = normalizedRaw.map((rawEntry) => {
    const oneAgentbase: OkfValue = { ...(agentbase ?? {}), observed_values: [rawEntry] };
    const one = { ...staged, frontmatter: { ...staged.frontmatter, agentbase: oneAgentbase } };
    const result = parseValues({ ...one, body: "" });
    const nonSectionFailures = result.failures.filter((failure) => !failure.includes("rendered Observed values section"));
    if (nonSectionFailures.length || !result.values[0]) throw new Error(nonSectionFailures.join("; "));
    return result.values[0];
  });
  const body = normalizedBody(concept.body, renderObservedValuesSection(values));
  return { ...staged, body };
}
