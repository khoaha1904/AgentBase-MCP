export const CANONICAL_RELATIONSHIP_KINDS = [
  "part-of",
  "provides",
  "consumes",
  "depends-on",
  "triggered-by",
  "publishes-to",
  "reads-from",
  "writes-to",
  "implemented-in",
  "declared-by",
  "deployed-as",
  "runs-on",
] as const;

export type CanonicalRelationshipKind = typeof CANONICAL_RELATIONSHIP_KINDS[number];

export const FLOW_STEP_ACTIONS = ["invokes", "publishes", "delivers", "reads", "writes"] as const;
export const FLOW_STEP_MODES = ["synchronous", "asynchronous"] as const;

export function isCanonicalRelationshipKind(value: string): value is CanonicalRelationshipKind {
  return (CANONICAL_RELATIONSHIP_KINDS as readonly string[]).includes(value);
}
