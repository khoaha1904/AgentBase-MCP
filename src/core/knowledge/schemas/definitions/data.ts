import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const DATA_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Metric", "A stable named measure and definition, distinct from any current observed numeric value",
    "metrics/<slug>.md", 40,
    ["business metric", "performance metric", "analytics metric", "defined measure", "metric definition"],
    ["stable metric definition and producer or calculation evidence"],
    ["# Purpose", "# Definition", "# Inputs", "# Producers and Consumers", "# Limitations"],
    ["Domain", "System", "Software Component", "Service", "Domain Entity", "Event", "Database Table", "Business Flow", "Repository"],
    {
      investigationQuestions: [
        "What stable question or outcome does this metric measure?",
        "What definition, formula, unit or aggregation is evidenced?",
        "Which component, event or data source produces its inputs?",
        "Is a cited number only a change-prone observation that must remain a live reference?",
      ],
      metadataGuidance: [
        { field: "unit", evidence: "metric definition or instrumentation contract", requiredWhenSupported: false },
        { field: "formula", evidence: "calculation code or documented definition", requiredWhenSupported: false },
        { field: "aggregation", evidence: "instrumentation or analytics definition", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business or system measurement boundary" },
        { kind: "depends-on", targetTypes: ["Domain Entity", "Event", "Database Table"], evidence: "metric input or calculation evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "instrumentation or calculation source evidence" },
      ],
      optionalEnrichment: ["unit", "formula", "aggregation window and dimensions"],
    },
  ),
  defineSchema(
    "Database Table", "A durable data resource with an independent identity or operational boundary", "resources/<slug>.md", 60,
    ["database table", "sql table", "dynamodb table"], ["table identity or schema evidence"],
    ["# Purpose", "# Data", "# Ownership", "# Access", "# Operations"],
    ["System", "Software Component", "Service", "Server", "Domain Entity", "Metric", "Business Flow", "Infrastructure Definition", "Deployment"],
    {
      investigationQuestions: ["What is the table identity and key/schema?", "Which runtime reads or writes it?", "How is its name passed to the runtime?"],
      metadataGuidance: [
        { field: "resource_name", evidence: "infrastructure or schema declaration", requiredWhenSupported: true },
        { field: "keys", evidence: "table schema declaration", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
        { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure declaration" },
        { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
      ],
    },
  ),
  defineSchema(
    "Queue", "A durable asynchronous resource with a known producer, consumer or failure boundary", "resources/<slug>.md", 30,
    ["queue", "message queue"], ["queue identity", "producer or consumer evidence"],
    ["# Purpose", "# Messages", "# Producers", "# Consumers", "# Failure Behavior"],
    ["System", "Software Component", "Service", "Event", "Business Flow", "Infrastructure Definition", "Deployment"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
      { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure declaration" },
      { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
    ] },
  ),
];
