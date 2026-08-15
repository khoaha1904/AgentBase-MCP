import path from "node:path";

import type { ConceptDocument, OkfValue } from "./okf-document.ts";
import { getOkfConceptSchema } from "./schema-catalog.ts";

export type OkfRelationshipConcept = Readonly<{ identity: string; concept: ConceptDocument }>;
export type ValidatedOkfRelationship = Readonly<{ source: string; kind: string; target: string }>;
export type OkfRelationshipValidation = Readonly<{
  relationships: readonly ValidatedOkfRelationship[];
  failures: readonly string[];
}>;

const MAX_CONCEPTS = 128;
const MAX_IDENTITY_BYTES = 256;

function mapping(value: OkfValue): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

function linkedPaths(concept: ConceptDocument): ReadonlySet<string> {
  const links = new Set<string>();
  for (const match of concept.body.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const raw = match[1]?.split("#")[0]?.split("?")[0];
    if (!raw || !raw.endsWith(".md") || raw.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(concept.path), raw));
    if (resolved !== ".." && !resolved.startsWith("../")) links.add(resolved);
  }
  return links;
}

export function validateOkfRelationships(concepts: readonly OkfRelationshipConcept[]): OkfRelationshipValidation {
  const failures: string[] = [];
  const relationships: ValidatedOkfRelationship[] = [];
  if (!concepts.length || concepts.length > MAX_CONCEPTS) {
    return { relationships, failures: [`relationship validation requires 1-${MAX_CONCEPTS} concepts`] };
  }
  const identities = new Map<string, ConceptDocument>();
  const paths = new Set<string>();
  for (const { identity, concept } of concepts) {
    if (!identity || Buffer.byteLength(identity) > MAX_IDENTITY_BYTES) {
      failures.push(`${concept.path}: relationship identity must be 1-${MAX_IDENTITY_BYTES} bytes`);
    } else if (identities.has(identity)) failures.push(`${concept.path}: duplicate relationship identity ${identity}`);
    else identities.set(identity, concept);
    if (paths.has(concept.path)) failures.push(`${concept.path}: duplicate concept path`);
    else paths.add(concept.path);
  }
  for (const { identity, concept } of concepts) {
    const declared = concept.frontmatter.relationships;
    if (declared === undefined || declared === null) continue;
    if (!Array.isArray(declared)) {
      failures.push(`${concept.path}: relationships must be a list`);
      continue;
    }
    const links = linkedPaths(concept);
    for (const value of declared) {
      const relationship = mapping(value);
      if (!relationship || typeof relationship.kind !== "string" || typeof relationship.target !== "string") {
        failures.push(`${concept.path}: relationship declaration is malformed`);
        continue;
      }
      const target = identities.get(relationship.target);
      if (!target) {
        failures.push(`${concept.path}: relationship ${relationship.kind} targets missing concept ${relationship.target}`);
        continue;
      }
      if (!links.has(target.path)) {
        failures.push(`${concept.path}: relationship ${relationship.kind} -> ${relationship.target} has no resolving Markdown link`);
        continue;
      }
      const schema = getOkfConceptSchema(concept.type);
      const supported = schema?.relationshipGuidance.some((guidance) =>
        guidance.kind === relationship.kind && guidance.targetTypes.includes(target.type));
      if (schema && !supported) {
        failures.push(`${concept.path}: relationship ${relationship.kind} -> ${relationship.target} is unsupported by ${concept.type} schema guidance`);
        continue;
      }
      relationships.push({ source: identity, kind: relationship.kind, target: relationship.target });
    }
  }
  return { relationships, failures };
}
