import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const FOUNDATION_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Repository", "A source repository and its source-specific development contract", "repositories/<slug>.md", 10,
    ["repository", "source root"], ["admitted repository identity"],
    ["# Purpose", "# Source Structure", "# Build and Test", "# Canonical Knowledge"],
    ["Domain", "System", "Component", "Function", "Interface", "Flow", "Resource"],
    { relationshipGuidance: [{ kind: "part-of", targetTypes: ["Domain"], evidence: "explicit owner-confirmed primary Domain" }] },
  ),
  defineSchema(
    "Domain", "An evidenced business domain or bounded context", "domains/<slug>.md", 10,
    ["business domain", "bounded context", "domain ownership"], ["business boundary or explicit owner guidance"],
    ["# Purpose", "# Vocabulary", "# Boundaries", "# Systems"], ["Repository", "System", "Entity", "Metric", "Flow"],
  ),
  defineSchema(
    "System", "A recognizable capability delivered by cooperating concepts", "systems/<slug>.md", 20,
    ["software system", "system boundary", "system capability"],
    ["recognizable capability and cooperating concept evidence"],
    ["# Purpose", "# Architecture", "# Interfaces", "# Critical Flows", "# Limitations"],
    ["Domain", "Repository", "Component", "Function", "Interface", "Flow", "Resource", "Entity", "Metric"],
    {
      investigationQuestions: [
        "What recognizable capability does this system deliver?",
        "Which independently useful concepts cooperate to deliver it?",
        "Which repository sources prove the boundary?",
      ],
      relationshipGuidance: [{ kind: "part-of", targetTypes: ["Domain"], evidence: "business boundary or owner guidance" }],
    },
  ),
  defineSchema(
    "Entity", "A stable business object or value identity shared across useful contracts, flows or systems",
    "entities/<slug>.md", 30,
    ["domain entity", "business entity", "business object", "aggregate root"],
    ["stable business identity and meaning or lifecycle evidence"],
    ["# Meaning", "# Identity", "# Lifecycle", "# Used By", "# Limitations"],
    ["Domain", "System", "Interface", "Metric", "Flow", "Repository"],
    {
      authoringScope: "enrichment",
      investigationQuestions: [
        "What stable business identity makes this entity useful beyond one implementation class?",
        "Which contracts, flows or systems share its meaning?",
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business boundary or system ownership evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "source representation evidence" },
      ],
    },
  ),
];
