export type HubRemovalDeclaration = Readonly<{
  kind: "concept" | "repository-contribution";
  conceptId: string;
  reason: string;
  evidenceResources: readonly string[];
}>;

const CONCEPT = /^(?:domains|systems|components|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities)\/[a-z0-9][a-z0-9./-]*$/;

export function normalizeHubRemovalDeclarations(values: readonly HubRemovalDeclaration[]): readonly HubRemovalDeclaration[] {
  if (values.length > 64) throw new Error("a Refresh may declare at most 64 removals");
  const concepts = new Set<string>();
  return values.map((value, index) => {
    const reason = value.reason.trim();
    const evidenceResources = [...new Set(value.evidenceResources.map((resource) => resource.trim()))].sort();
    if (!CONCEPT.test(value.conceptId) || value.conceptId.includes("..")) {
      throw new Error(`removal ${index + 1} concept is invalid`);
    }
    if (concepts.has(value.conceptId)) throw new Error(`duplicate removal for ${value.conceptId}`);
    concepts.add(value.conceptId);
    if (!reason || reason.length > 512 || !evidenceResources.length || evidenceResources.length > 64
      || evidenceResources.some((resource) => !resource || resource.length > 1024)) {
      throw new Error(`removal ${index + 1} reason or evidence is invalid`);
    }
    return { ...value, reason, evidenceResources };
  });
}
