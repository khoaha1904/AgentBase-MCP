import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const FOUNDATION_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Repository", "A source repository and its source-specific development contract", "repositories/<slug>.md", 10,
    ["repository", "source root"], ["admitted repository identity"],
    ["# Purpose", "# Source Structure", "# Build and Test", "# Canonical Knowledge"],
    ["System", "Software Component", "API Surface", "Business Flow", "Infrastructure Definition"],
    { relationshipGuidance: [] },
  ),
  defineSchema(
    "Domain", "An evidenced business domain or bounded context", "domains/<slug>.md", 10,
    ["business domain", "bounded context", "domain ownership"], ["business boundary or explicit owner guidance"],
    ["# Purpose", "# Vocabulary", "# Boundaries", "# Systems"], ["System", "Domain Entity", "Metric", "Business Flow"],
  ),
  defineSchema(
    "Domain Entity", "A stable business object or value identity shared across useful contracts, flows or systems",
    "entities/<slug>.md", 30,
    ["domain entity", "business entity", "business object", "aggregate root", "domain model boundary"],
    ["stable business identity and meaning or lifecycle evidence"],
    ["# Meaning", "# Identity", "# Lifecycle", "# Used By", "# Limitations"],
    ["Domain", "System", "API Surface", "Event", "Metric", "Database Table", "Business Flow", "Repository"],
    {
      investigationQuestions: [
        "What stable business identity makes this entity useful beyond one implementation class?",
        "Which contracts, flows or systems share its meaning?",
        "What lifecycle or invariants are evidenced, and what remains uncertain?",
      ],
      metadataGuidance: [
        { field: "business_identity", evidence: "domain contract, API, data model or owner guidance", requiredWhenSupported: true },
        { field: "lifecycle", evidence: "business flow or state-transition evidence", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business boundary or system ownership evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "source representation evidence" },
      ],
    },
  ),
  defineSchema(
    "System", "A recognizable capability delivered by cooperating software and infrastructure", "systems/<slug>.md", 20,
    ["software system", "system boundary", "system capability"], ["recognizable capability and cooperating entity evidence"],
    ["# Purpose", "# Architecture", "# Interfaces", "# Critical Flows", "# Limitations"],
    [
      "Domain", "Software Component", "Service", "Server", "API Surface", "Business Flow",
      "Domain Entity", "Metric", "Database Table", "Queue", "Infrastructure Definition", "Deployment", "Repository",
    ],
    {
      investigationQuestions: [
        "What recognizable capability does this system deliver?", "Which entities cooperate to deliver it?",
        "Which source repositories provide evidence?", "Which boundaries are evidenced and which remain uncertain?",
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain"], evidence: "business boundary or owner guidance" },
      ],
    },
  ),
];
