import {
  conceptReferencesRepository,
  embeddedItemNames,
  loadOkfBundle,
  parseRepositorySourceResource,
  readRepositoryIdentityRecord,
  repositorySourceResources,
  validateOkfRelationships,
} from "../../../core/knowledge/index.ts";

export type HubRefreshSuggestions = Readonly<{
  items: readonly Readonly<{
    repositoryId: string;
    repositoryIdentity: string;
    parentIdentity: string;
    resourceIdentity: string;
    embeddedItem: string;
    reason: string;
  }>[];
  omitted: number;
}>;

export function buildHubRefreshSuggestions(
  baseRoot: string,
  proposedRoot: string,
  sourceRepositoryIds: readonly string[],
): HubRefreshSuggestions {
  const base = loadOkfBundle(baseRoot), proposed = loadOkfBundle(proposedRoot);
  const repositories = new Map([...base.concepts].flatMap(([identity, concept]) => {
    const record = readRepositoryIdentityRecord(concept);
    return record ? [[record.id, identity] as const] : [];
  }));
  const resources = [...proposed.concepts.values()].filter((concept) =>
    concept.type === "Resource" && !base.concepts.has(concept.conceptId));
  const relations = validateOkfRelationships([...proposed.concepts].map(([identity, concept]) => ({ identity, concept }))).relationships;
  const normalized = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();
  const items: HubRefreshSuggestions["items"][number][] = [];
  for (const parent of base.concepts.values()) {
    // Provenance identifies a repository to investigate; a matching name proves no ownership.
    const owners = [...new Set(repositorySourceResources(parent).flatMap((resource) => {
      const source = parseRepositorySourceResource(resource);
      return source ? [source.repositoryId] : [];
    }))];
    if (owners.length !== 1) continue;
    const repositoryId = owners[0]!, repositoryIdentity = repositories.get(repositoryId);
    if (!repositoryIdentity || sourceRepositoryIds.includes(repositoryId)) continue;
    for (const resource of resources) {
      const title = resource.frontmatter.title;
      if (typeof title !== "string" || !title.trim()) continue;
      const embeddedItem = embeddedItemNames(parent.body).find((name) => normalized(name) === normalized(title));
      if (!embeddedItem) continue;
      if (relations.some((relation) => relation.target === resource.conceptId
        && ["publishes-to", "writes-to"].includes(relation.kind)
        && conceptReferencesRepository(proposed.concepts.get(relation.source)!, repositoryId))) continue;
      items.push({ repositoryId, repositoryIdentity, parentIdentity: parent.conceptId,
        resourceIdentity: resource.conceptId, embeddedItem,
        reason: "Name-only candidate: Refresh this source repository to verify ownership and, if supported, add publishes-to/writes-to to this Resource." });
    }
  }
  items.sort((left, right) => left.repositoryIdentity.localeCompare(right.repositoryIdentity)
    || left.parentIdentity.localeCompare(right.parentIdentity) || left.resourceIdentity.localeCompare(right.resourceIdentity));
  return { items: items.slice(0, 16), omitted: Math.max(0, items.length - 16) };
}
