import { defineSchema, type OkfConceptSchema } from "../definition.ts";

const resourceRelations = [
  { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
  { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Infrastructure Module"], evidence: "infrastructure declaration" },
  { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "deployment binding" },
] as const;

export const DATA_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Metric", "A stable named measure and definition, distinct from a current numeric observation", "metrics/<slug>.md", 40,
    ["business metric", "performance metric", "analytics metric", "defined measure", "metric definition"],
    ["stable metric definition and producer or calculation evidence"],
    ["# Purpose", "# Definition", "# Inputs", "# Producers and Consumers", "# Limitations"],
    ["Domain", "System", "Software Component", "Service", "Domain Entity", "Event", "Database Table", "Business Flow", "Repository"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "measurement boundary" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "calculation source evidence" },
    ] },
  ),
  defineSchema(
    "Database", "A database service or store with an independent identity and lifecycle", "resources/<slug>.md", 40,
    ["database", "database instance", "data store"], ["database identity and ownership or lifecycle evidence"],
    ["# Purpose", "# Data", "# Ownership", "# Access", "# Operations", "# Limitations"],
    ["System", "Service", "Software Component", "Database Table", "Infrastructure Definition", "Infrastructure Module", "Deployment"],
    { relationshipGuidance: resourceRelations },
  ),
  defineSchema(
    "Database Table", "A durable table with an independent contract or operational boundary", "resources/<slug>.md", 60,
    ["database table", "sql table", "key-value table"], ["table identity or schema evidence"],
    ["# Purpose", "# Data", "# Ownership", "# Access", "# Operations"],
    ["System", "Database", "Software Component", "Service", "Domain Entity", "Metric", "Business Flow", "Infrastructure Definition", "Deployment"],
    { relationshipGuidance: resourceRelations },
  ),
  defineSchema(
    "Queue", "A durable asynchronous resource with a producer, consumer or failure boundary", "resources/<slug>.md", 30,
    ["queue", "message queue"], ["queue identity", "producer or consumer evidence"],
    ["# Purpose", "# Messages", "# Producers", "# Consumers", "# Failure Behavior"],
    ["System", "Software Component", "Service", "Function", "Event", "Business Flow", "Infrastructure Definition", "Deployment"],
    { relationshipGuidance: resourceRelations },
  ),
  defineSchema(
    "Object Storage", "An object-storage boundary with an independent identity or data lifecycle", "resources/<slug>.md", 40,
    ["object storage", "storage bucket"], ["storage identity and ownership or data-lifecycle evidence"],
    ["# Purpose", "# Objects", "# Producers", "# Consumers", "# Lifecycle", "# Limitations"],
    ["System", "Software Component", "Service", "Function", "Infrastructure Definition", "Infrastructure Module", "Deployment"],
    { relationshipGuidance: resourceRelations },
  ),
];
