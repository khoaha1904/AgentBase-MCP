import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const INFRASTRUCTURE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Infrastructure Definition", "A root desired-state configuration that declares deployable infrastructure",
    "infrastructure/<slug>.md", 50,
    ["infrastructure definition", "desired state configuration", "configuration root"],
    ["configuration root and declared resource evidence"],
    ["# Purpose", "# Configuration Root", "# Declared Architecture", "# Inputs and Outputs", "# Limitations"],
    ["System", "Software Component", "Service", "Function", "Server", "Database", "Database Table", "Queue", "Object Storage", "Infrastructure Module", "Deployment", "Repository"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system architecture evidence" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "configuration source evidence" },
    ] },
  ),
  defineSchema(
    "Infrastructure Module", "A reusable infrastructure module with an input/output contract",
    "infrastructure/<slug>.md", 70,
    ["infrastructure module", "reusable infrastructure module", "module boundary"],
    ["reusable module root and input/output contract evidence"],
    ["# Purpose", "# Module Root", "# Inputs", "# Outputs", "# Managed Abstractions"],
    ["Infrastructure Definition", "Function", "Queue", "Server", "Database", "Object Storage", "Software Component", "Repository"],
    { fallbackType: "Infrastructure Definition", relationshipGuidance: [
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "module source evidence" },
    ] },
  ),
  defineSchema(
    "Deployment", "An evidenced applied instance binding logical architecture to an environment",
    "deployments/<slug>.md", 60,
    ["deployed environment", "applied deployment", "deployment output", "cloud resource identity"],
    ["external evidence of environment and applied resource identity"],
    ["# Environment", "# Deployed Components", "# Resource Bindings", "# Operations", "# Limitations"],
    ["System", "Software Component", "Service", "Function", "Server", "Database", "Database Table", "Queue", "Object Storage", "Infrastructure Definition", "Infrastructure Module"],
    { relationshipGuidance: [{ kind: "part-of", targetTypes: ["System"], evidence: "environment ownership evidence" }] },
  ),
  defineSchema(
    "Business Flow", "A business or system behavior spanning independently useful concepts", "flows/<slug>.md", 50,
    ["business flow", "business behavior", "user journey", "workflow", "end-to-end flow"],
    ["trigger", "observable outcome", "supporting system evidence"],
    ["# Purpose", "# Trigger", "# Outcome", "# Flow", "# Failure and Recovery", "# Limitations"],
    ["System", "Software Component", "Service", "Function", "API Surface", "API Endpoint", "Domain Entity", "Metric", "Event", "Queue"],
    {
      requiredFrontmatter: ["title", "description", "generated", "sources", "flow_steps"],
      relationshipGuidance: [{ kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business or system boundary evidence" }],
      flowStepGuidance: {
        actions: ["invokes", "publishes", "delivers", "reads", "writes"],
        modes: ["synchronous", "asynchronous"],
        evidence: "ordered endpoints, interaction mode and source evidence",
      },
    },
  ),
];
