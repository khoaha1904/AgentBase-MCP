export type HubLifecycleIntent = Readonly<{
  action: "remove-concept" | "remove-contribution" | "supersede" | "retract";
  conceptId: string;
  reason: string;
  evidenceResources: readonly string[];
  replacementConceptId?: string;
}>;

const CONCEPT = /^(?:domains|systems|components|interfaces|flows|resources|infrastructure|deployments|repositories|relationships|capabilities)\/[a-z0-9][a-z0-9./-]*$/;

export function normalizeHubLifecycleIntents(values: readonly HubLifecycleIntent[]): readonly HubLifecycleIntent[] {
  if (values.length > 64) throw new Error("a Refresh may declare at most 64 lifecycle intents");
  const concepts = new Set<string>();
  return values.map((value, index) => {
    const reason = value.reason.trim();
    const evidenceResources = [...new Set(value.evidenceResources.map((resource) => resource.trim()))].sort();
    if (!CONCEPT.test(value.conceptId) || value.conceptId.includes("..")) {
      throw new Error(`lifecycle intent ${index + 1} concept is invalid`);
    }
    if (concepts.has(value.conceptId)) throw new Error(`duplicate lifecycle intent for ${value.conceptId}`);
    concepts.add(value.conceptId);
    if (!reason || reason.length > 512 || !evidenceResources.length || evidenceResources.length > 64
      || evidenceResources.some((resource) => !resource || resource.length > 1024)) {
      throw new Error(`lifecycle intent ${index + 1} reason or evidence is invalid`);
    }
    if (value.action === "supersede") {
      if (!value.replacementConceptId || !CONCEPT.test(value.replacementConceptId)
        || value.replacementConceptId.includes("..") || value.replacementConceptId === value.conceptId) {
        throw new Error(`lifecycle intent ${index + 1} requires a different valid replacement concept`);
      }
    } else if (value.replacementConceptId !== undefined) {
      throw new Error(`lifecycle intent ${index + 1} replacement is only valid for supersede`);
    }
    return { ...value, reason, evidenceResources };
  });
}
