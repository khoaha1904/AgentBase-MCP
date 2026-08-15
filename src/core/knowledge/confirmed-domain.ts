import { conceptReferencesRepository, type ConceptDocument, type OkfValue } from "./okf-document.ts";

export type ConfirmedDomainInput = Readonly<{ identity: string; title: string }>;
export type ConfirmedDomain = ConfirmedDomainInput & Readonly<{ evidenceResource: string }>;

function mapping(value: OkfValue): Readonly<Record<string, OkfValue>> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, OkfValue>> : undefined;
}

export function normalizeConfirmedDomain(value: unknown): ConfirmedDomain {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("confirmed Domain must be an object");
  const input = value as Readonly<Record<string, unknown>>;
  if (Object.keys(input).sort().join(",") !== "identity,title"
    || typeof input.identity !== "string" || !/^domains\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.identity)
    || typeof input.title !== "string" || !input.title.trim() || input.title.length > 120) {
    throw new Error("confirmed Domain requires exact domains/<slug> identity and a 1-120 character title");
  }
  return {
    identity: input.identity,
    title: input.title.trim(),
    evidenceResource: `agentbase://owner-guidance/${input.identity}`,
  };
}

function sourceResources(concept: ConceptDocument): ReadonlyMap<string, string> {
  const sources = Array.isArray(concept.frontmatter.sources) ? concept.frontmatter.sources : [];
  return new Map(sources.flatMap((source) => {
    const entry = mapping(source);
    return typeof entry?.id === "string" && typeof entry.resource === "string"
      ? [[entry.id, entry.resource] as const] : [];
  }));
}

export function validateConfirmedDomainAssignment(
  concepts: ReadonlyMap<string, ConceptDocument>,
  domain: ConfirmedDomain,
  sourceRepositoryId: string,
  requireDomainEvidence: boolean,
): readonly string[] {
  const failures: string[] = [];
  const domainConcept = concepts.get(domain.identity);
  if (!domainConcept || domainConcept.type !== "Domain" || domainConcept.frontmatter.title !== domain.title) {
    return [`confirmed Domain ${domain.identity} is missing or does not match type/title Domain/${domain.title}`];
  }
  if (requireDomainEvidence && ![...sourceResources(domainConcept).values()].includes(domain.evidenceResource)) {
    failures.push(`${domainConcept.path}: new confirmed Domain requires owner-guidance evidence ${domain.evidenceResource}`);
  }
  const assigned = [...concepts.values()].some((concept) => {
    if (concept.type !== "System" || !conceptReferencesRepository(concept, sourceRepositoryId)) return false;
    const sources = sourceResources(concept);
    const relationships = Array.isArray(concept.frontmatter.relationships) ? concept.frontmatter.relationships : [];
    return relationships.some((raw) => {
      const relationship = mapping(raw);
      if (relationship?.kind !== "part-of" || relationship.target !== domain.identity
        || !Array.isArray(relationship.evidence)) return false;
      return relationship.evidence.some((id) => typeof id === "string" && sources.get(id) === domain.evidenceResource);
    });
  });
  if (!assigned) failures.push(`confirmed Domain ${domain.identity} requires a current-source System part-of edge with owner-guidance evidence`);
  return failures;
}

export function assertConfirmedDomainAssignment(
  concepts: ReadonlyMap<string, ConceptDocument>,
  baseConcepts: ReadonlyMap<string, ConceptDocument>,
  domain: ConfirmedDomain | undefined,
  sourceRepositoryId: string,
): void {
  if (!domain) return;
  const failures = validateConfirmedDomainAssignment(
    concepts, domain, sourceRepositoryId, !baseConcepts.has(domain.identity),
  );
  if (failures.length) throw new Error(`confirmed Domain validation failed: ${failures.join("; ")}`);
}
