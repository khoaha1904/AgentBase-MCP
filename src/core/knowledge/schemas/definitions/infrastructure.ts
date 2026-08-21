import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const INFRASTRUCTURE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Flow", "A business or system behavior spanning independently useful concepts", "flows/<slug>.md", 50,
    ["business flow", "system flow", "business behavior", "user journey", "workflow", "end-to-end flow"],
    ["trigger", "observable outcome", "at least two independently useful endpoint concepts"],
    ["# Purpose", "# Trigger", "# Outcome", "# Flow", "# Failure and Recovery", "# Limitations"],
    ["Domain", "System", "Component", "Function", "Interface", "Entity", "Metric", "Resource"],
    {
      requiredFrontmatter: ["title", "description", "generated", "sources", "flow_steps"],
      relationshipGuidance: [{ kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business or system boundary evidence" }],
      flowStepGuidance: {
        requiredFields: ["order", "source", "action", "target", "mode", "evidence"],
        endpointRule: "source and target must be identities of concepts supplied in the changed set or target summaries; never use embedded knowledge or free text; a standalone Flow requires at least two independently useful endpoint boundaries, and a System plus its single contained Function does not suffice",
        sourceRule: "sources must prove the trigger, outcome and every described interaction; embedded triggers and resources remain evidence, not endpoint identities",
        actions: ["invokes", "publishes", "delivers", "reads", "writes"],
        modes: ["synchronous", "asynchronous"],
        evidence: "ordered interactions and source evidence",
      },
    },
  ),
];
