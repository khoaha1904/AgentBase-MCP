import { defineSchema, type OkfConceptSchema } from "../definition.ts";

const componentRelations = [
  { kind: "part-of", targetTypes: ["System"], evidence: "system composition evidence" },
  { kind: "provides", targetTypes: ["API Surface", "API Endpoint", "Event"], evidence: "interface declaration" },
  { kind: "consumes", targetTypes: ["API Surface", "API Endpoint", "Event"], evidence: "runtime call or subscription" },
  { kind: "depends-on", targetTypes: ["Software Component", "Service", "Function", "API Surface", "Event"], evidence: "runtime dependency evidence" },
  { kind: "triggered-by", targetTypes: ["API Surface", "API Endpoint", "Event", "Queue"], evidence: "trigger binding" },
  { kind: "publishes-to", targetTypes: ["Event", "Queue"], evidence: "runtime publish/send plus binding" },
  { kind: "reads-from", targetTypes: ["Database", "Database Table", "Queue", "Object Storage"], evidence: "runtime read plus binding" },
  { kind: "writes-to", targetTypes: ["Database", "Database Table", "Queue", "Object Storage"], evidence: "runtime write plus binding" },
  { kind: "implemented-in", targetTypes: ["Repository"], evidence: "source ownership evidence" },
  { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Infrastructure Module"], evidence: "infrastructure declaration" },
  { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "deployment binding" },
  { kind: "runs-on", targetTypes: ["Server"], evidence: "workload placement evidence" },
] as const;

export const SOFTWARE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Software Component", "An independently useful build, runtime or ownership unit", "components/<slug>.md", 30,
    ["software component", "build artifact", "runtime component"],
    ["independent build, runtime, deployment or ownership boundary"],
    ["# Responsibility", "# Runtime", "# Interfaces", "# Dependencies", "# Operations"],
    ["System", "Repository", "API Surface", "Business Flow", "Database", "Database Table", "Queue", "Object Storage", "Infrastructure Definition", "Deployment"],
    { relationshipGuidance: componentRelations },
  ),
  defineSchema(
    "Service", "A deployable or independently owned software service", "components/<slug>.md", 40,
    ["service", "microservice", "application service"], ["service boundary or deployment identity"],
    ["# Responsibility", "# Interfaces", "# Dependencies", "# Operations"],
    ["System", "Repository", "Server", "API Surface", "Event", "Database", "Database Table", "Queue", "Business Flow", "Deployment"],
    { fallbackType: "Software Component" },
  ),
  defineSchema(
    "Function", "A runtime or deployment function with an independent trigger or operational lifecycle", "components/<slug>.md", 50,
    ["runtime function", "deployment function", "function boundary"],
    ["independent trigger, deployment, scaling, permission, failure or operational boundary"],
    ["# Responsibility", "# Runtime", "# Triggers", "# Failure Behavior", "# Limitations"],
    ["System", "Repository", "API Surface", "API Endpoint", "Event", "Queue", "Infrastructure Definition", "Infrastructure Module", "Deployment"],
    { fallbackType: "Software Component" },
  ),
  defineSchema(
    "Server", "A compute host with an independent identity or operational boundary", "resources/<slug>.md", 50,
    ["compute host", "virtual machine", "physical server"], ["host identity or independent operational boundary"],
    ["# Purpose", "# Compute", "# Workloads", "# Operations", "# Limitations"],
    ["System", "Service", "Software Component", "Infrastructure Definition", "Infrastructure Module", "Deployment"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
      { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Infrastructure Module"], evidence: "infrastructure declaration" },
      { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "deployment binding" },
    ] },
  ),
  defineSchema(
    "API Surface", "A stable consumer-facing API boundary containing related operations", "interfaces/<slug>.md", 50,
    ["api surface", "http routes", "rpc service", "public api", "api contract"],
    ["consumer boundary and related operation evidence"],
    ["# Purpose", "# Consumers", "# Authentication", "# Operations", "# Failure Behavior", "# Limitations"],
    ["System", "Software Component", "Service", "Function", "API Endpoint", "Business Flow"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system boundary evidence" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "interface source evidence" },
    ] },
  ),
  defineSchema(
    "API Endpoint", "One endpoint with an independently important contract or lifecycle", "interfaces/<slug>.md", 80,
    ["independent endpoint", "versioned endpoint", "endpoint policy", "endpoint sla"],
    ["method/protocol and handler evidence", "independent policy, owner, lifecycle or consumer boundary"],
    ["# Contract", "# Consumers", "# Handler", "# Failure Behavior"],
    ["API Surface", "Software Component", "Service", "Function", "Business Flow", "Event"],
    { fallbackType: "API Surface", metadataGuidance: [
      { field: "method", evidence: "route or infrastructure declaration", requiredWhenSupported: true },
      { field: "route", evidence: "route or client call", requiredWhenSupported: true },
      { field: "handler", evidence: "route-to-handler declaration", requiredWhenSupported: true },
    ], relationshipGuidance: [
      { kind: "part-of", targetTypes: ["API Surface"], evidence: "shared consumer contract" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "route or handler source evidence" },
    ] },
  ),
  defineSchema(
    "Event", "A named event with independently useful producer or consumer semantics", "interfaces/<slug>.md", 40,
    ["event", "event type", "message contract"], ["event name and producer or consumer evidence"],
    ["# Meaning", "# Contract", "# Producers", "# Consumers"],
    ["System", "Software Component", "Service", "Function", "Domain Entity", "Metric", "Queue", "Business Flow"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system boundary evidence" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "event contract source evidence" },
    ] },
  ),
];
