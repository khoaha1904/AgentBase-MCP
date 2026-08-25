import {
  CANONICAL_RELATIONSHIP_KINDS,
  type CanonicalRelationshipKind,
} from "../documents/relationship-vocabulary.ts";

export type RelationshipDisplayClass = "structural" | "runtime";
export type RelationshipDisplayDirection = "declared" | "reverse" | "undirected";

export type RelationshipDisplayDescriptor = Readonly<{
  kind: CanonicalRelationshipKind;
  displayClass: RelationshipDisplayClass;
  direction: RelationshipDisplayDirection;
}>;

const STRUCTURAL = new Set<CanonicalRelationshipKind>([
  "part-of", "implemented-in", "declared-by", "deployed-as", "runs-on",
]);
const REVERSE = new Set<CanonicalRelationshipKind>(["triggered-by", "reads-from"]);

export const RELATIONSHIP_DISPLAY_DESCRIPTORS: Readonly<Record<CanonicalRelationshipKind, RelationshipDisplayDescriptor>> =
  Object.freeze(Object.fromEntries(CANONICAL_RELATIONSHIP_KINDS.map((kind) => [kind, Object.freeze({
    kind,
    displayClass: STRUCTURAL.has(kind) ? "structural" : "runtime",
    direction: STRUCTURAL.has(kind) ? "undirected" : REVERSE.has(kind) ? "reverse" : "declared",
  })])) as Record<CanonicalRelationshipKind, RelationshipDisplayDescriptor>);

export function relationshipDisplayDescriptor(kind: CanonicalRelationshipKind): RelationshipDisplayDescriptor {
  return RELATIONSHIP_DISPLAY_DESCRIPTORS[kind];
}

export function displayEndpoints(
  kind: CanonicalRelationshipKind,
  source: string,
  target: string,
): Readonly<{ source: string; target: string; directed: boolean }> {
  const descriptor = relationshipDisplayDescriptor(kind);
  if (descriptor.direction === "reverse") return { source: target, target: source, directed: true };
  return { source, target, directed: descriptor.direction !== "undirected" };
}
