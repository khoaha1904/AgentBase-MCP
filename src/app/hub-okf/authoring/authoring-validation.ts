import fs from "node:fs";
import path from "node:path";

import {
  getOkfConceptSchema, loadOkfBundle, parseRepositorySourceResource, validateOkfRelationships,
  type OkfValue,
} from "../../../core/knowledge/index.ts";

type AuthoringValidationContext = Readonly<{
  mode: "new" | "refresh";
  baseRoot: string;
  bundleRoot: string;
  sourceRepositoryRoot: string;
  sourceRepositoryId: string;
  sourceState: Readonly<{ commit: string | null }>;
  requireObservedRevision?: boolean;
}>;

function mapping(value: OkfValue | undefined): Readonly<Record<string, OkfValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : {};
}

function sourceLineCount(file: string): number {
  const content = fs.readFileSync(file, "utf8");
  if (!content.length) return 0;
  const lines = content.split("\n").length;
  return content.endsWith("\n") ? lines - 1 : lines;
}

function validateCurrentRepositorySources(session: AuthoringValidationContext, bundleRoot: string): void {
  const authored = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const base = loadOkfBundle(session.baseRoot);
  const repositoryRoot = fs.realpathSync(session.sourceRepositoryRoot);
  const repositoryPrefix = `repository://${session.sourceRepositoryId}/`;
  const failures: string[] = [];
  for (const concept of authored.concepts.values()) {
    const previous = base.concepts.get(concept.conceptId);
    if (previous && fs.readFileSync(path.join(session.baseRoot, previous.path)).equals(
      fs.readFileSync(path.join(session.bundleRoot, concept.path)))) continue;
    const previousSources = new Set((Array.isArray(previous?.frontmatter.sources) ? previous.frontmatter.sources : []).flatMap((value) => {
      const source = mapping(value);
      return typeof source.id === "string" && typeof source.resource === "string"
        ? [JSON.stringify([source.id, source.resource, source.observed_revision ?? null])] : [];
    }));
    const previousRevisionsByIdentity = new Map((Array.isArray(previous?.frontmatter.sources)
      ? previous.frontmatter.sources : []).flatMap((value) => {
      const source = mapping(value);
      return typeof source.id === "string" && typeof source.resource === "string"
        ? [[source.id, source.observed_revision] as const] : [];
    }));
    const sourceEntries = (Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : []).flatMap((value) => {
      const source = mapping(value);
      return typeof source.resource === "string" ? [{ source, resource: source.resource }] : [];
    });
    for (const { source: sourceEntry, resource } of sourceEntries) {
      if (!resource.startsWith(repositoryPrefix)) continue;
      if (session.requireObservedRevision) {
        const retained = typeof sourceEntry.id === "string"
          && previousSources.has(JSON.stringify([sourceEntry.id, resource, sourceEntry.observed_revision ?? null]));
        if (!retained && sourceEntry.observed_revision !== session.sourceState.commit) {
          failures.push(`${concept.path}: new repository source must use observed_revision ${session.sourceState.commit}`);
        }
        const previousRevision = typeof sourceEntry.id === "string"
          ? previousRevisionsByIdentity.get(sourceEntry.id) : undefined;
        if (previousRevision !== undefined && previousRevision !== sourceEntry.observed_revision) {
          failures.push(`${concept.path}: re-observed repository source must use a revision-distinct source ID`);
        }
      }
      const parsed = parseRepositorySourceResource(resource);
      if (!parsed || parsed.repositoryId !== session.sourceRepositoryId) {
        failures.push(`${concept.path}: repository source is not normalized`);
        continue;
      }
      let relativePath: string;
      try {
        relativePath = parsed.relativePath.split("/").join(path.sep);
      } catch {
        failures.push(`${concept.path}: repository source path is not decodable`);
        continue;
      }
      const target = path.resolve(repositoryRoot, relativePath);
      try {
        const realTarget = fs.realpathSync(target);
        if (realTarget !== repositoryRoot && !realTarget.startsWith(`${repositoryRoot}${path.sep}`)) {
          failures.push(`${concept.path}: repository source escapes the authorized checkout: ${relativePath}`);
          continue;
        }
        if (!fs.statSync(realTarget).isFile()) {
          failures.push(`${concept.path}: repository source is not a regular file: ${relativePath}`);
          continue;
        }
        const lineCount = sourceLineCount(realTarget);
        if (parsed.endLine !== undefined && parsed.endLine > lineCount) {
          failures.push(`${concept.path}: source span exceeds ${relativePath} (${lineCount} lines)`);
        }
      } catch {
        failures.push(`${concept.path}: repository source does not exist: ${relativePath}`);
      }
    }
  }
  if (failures.length) throw new Error(`authored repository sources failed validation: ${failures.join("; ")}`);
}

const STRUCTURAL_RELATIONSHIPS = new Set(["part-of", "implemented-in", "declared-by"]);

function validateNewConceptStructuralReachability(session: AuthoringValidationContext, bundleRoot: string): void {
  if (session.mode !== "refresh") return;
  const authored = loadOkfBundle(bundleRoot, { requireAgentBaseRootIndex: true });
  const base = loadOkfBundle(session.baseRoot);
  const validation = validateOkfRelationships([...authored.concepts].map(([identity, concept]) => ({ identity, concept })));
  const parents = new Map<string, string[]>();
  for (const relationship of validation.relationships) {
    if (!STRUCTURAL_RELATIONSHIPS.has(relationship.kind)) continue;
    parents.set(relationship.source, [...parents.get(relationship.source) ?? [], relationship.target]);
  }
  const reachesBoundary = (identity: string, trail = new Set<string>()): boolean => {
    if (trail.has(identity)) return false;
    const concept = authored.concepts.get(identity);
    if (!concept) return false;
    if (concept.type === "Repository" || concept.type === "Domain") return true;
    const next = new Set(trail).add(identity);
    return (parents.get(identity) ?? []).some((parent) => reachesBoundary(parent, next));
  };
  const failures = [...authored.concepts.values()].flatMap((concept) => {
    const schema = getOkfConceptSchema(concept.type);
    if (base.concepts.has(concept.conceptId) || !schema || schema.authoringScope === "governance"
      || concept.type === "Repository" || concept.type === "Domain" || reachesBoundary(concept.conceptId)) return [];
    return [`${concept.path}: new standalone concept must have an evidenced structural path to a Repository or Domain`];
  });
  if (failures.length) throw new Error(`authored concept topology failed validation: ${failures.join("; ")}`);
}

export function validateHubAuthoringBundle(session: AuthoringValidationContext, bundleRoot: string): void {
  validateCurrentRepositorySources(session, bundleRoot);
  validateNewConceptStructuralReachability(session, bundleRoot);
}
