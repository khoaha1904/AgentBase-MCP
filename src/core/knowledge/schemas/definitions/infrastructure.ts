import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const INFRASTRUCTURE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Flow", "A business or system behavior spanning independently useful concepts", "flows/<slug>.md", 50,
    ["business flow", "system flow", "business behavior", "user journey", "workflow", "end-to-end flow"],
    ["trigger", "observable outcome", "supporting concept evidence"],
    ["# Purpose", "# Trigger", "# Outcome", "# Flow", "# Failure and Recovery", "# Limitations"],
    ["Domain", "System", "Component", "Function", "Interface", "Entity", "Metric", "Resource"],
    {
      requiredFrontmatter: ["title", "description", "generated", "sources", "flow_steps"],
      relationshipGuidance: [{ kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business or system boundary evidence" }],
      flowStepGuidance: {
        actions: ["invokes", "publishes", "delivers", "reads", "writes"],
        modes: ["synchronous", "asynchronous"],
        evidence: "ordered interactions and source evidence",
      },
    },
  ),
];
