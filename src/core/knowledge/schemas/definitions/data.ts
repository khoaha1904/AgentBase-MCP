import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const DATA_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Metric", "A stable named measure and definition, distinct from a current numeric observation", "metrics/<slug>.md", 40,
    ["business metric", "performance metric", "analytics metric", "metric definition"],
    ["stable metric definition and producer or calculation evidence"],
    ["# Purpose", "# Definition", "# Inputs", "# Producers and Consumers", "# Limitations"],
    ["Domain", "System", "Component", "Function", "Entity", "Interface", "Flow", "Repository"],
    { authoringScope: "enrichment", relationshipGuidance: [
      { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "measurement boundary" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "calculation source evidence" },
    ] },
  ),
  defineSchema(
    "Resource", "An independently useful operated infrastructure or data resource", "resources/<slug>.md", 40,
    ["operated resource", "shared resource", "infrastructure resource", "data resource"],
    ["independent cross-boundary, ownership, lifecycle, failure, security or operational evidence"],
    ["# Purpose", "# Kind and Technology", "# Users", "# Operations", "# Evidence", "# Limitations"],
    ["System", "Repository", "Component", "Function", "Interface", "Flow", "Resource"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "resource declaration or management source evidence" },
    ] },
  ),
];
