import { defineSchema, type OkfConceptSchema } from "../definition.ts";

const componentRelations = [
  { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "domain or system composition evidence" },
  { kind: "provides", targetTypes: ["Interface"], evidence: "interface declaration" },
  { kind: "consumes", targetTypes: ["Interface"], evidence: "runtime call or subscription" },
  { kind: "depends-on", targetTypes: ["Component", "Function", "Interface", "Resource"], evidence: "runtime dependency evidence" },
  { kind: "publishes-to", targetTypes: ["Interface", "Resource"], evidence: "runtime publish evidence" },
  { kind: "reads-from", targetTypes: ["Interface", "Resource"], evidence: "runtime read evidence" },
  { kind: "writes-to", targetTypes: ["Interface", "Resource"], evidence: "runtime write evidence" },
  { kind: "implemented-in", targetTypes: ["Repository"], evidence: "source ownership evidence" },
] as const;

export const SOFTWARE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Component", "An independently useful workload, build or ownership unit", "components/<slug>.md", 30,
    ["software component", "workload component", "build artifact", "runtime component", "application service", "worker process"],
    ["independent workload, build, runtime, deployment or ownership boundary"],
    ["# Responsibility", "# Runtime", "# Interfaces", "# Dependencies", "# Operations", "# Limitations"],
    ["System", "Repository", "Component", "Function", "Interface", "Flow", "Resource"],
    { relationshipGuidance: componentRelations },
  ),
  defineSchema(
    "Function", "A function with an independent trigger, deployment or operational lifecycle", "components/<slug>.md", 50,
    ["runtime function", "deployment function", "function boundary"],
    ["independent trigger, deployment, scaling, permission, failure or operational boundary"],
    ["# Responsibility", "# Runtime", "# Triggers", "# Embedded Resources", "# Failure Behavior", "# Limitations"],
    ["System", "Repository", "Component", "Interface", "Flow", "Resource"],
    { fallbackType: "Component", relationshipGuidance: [
      { kind: "triggered-by", targetTypes: ["Interface", "Resource"], evidence: "trigger declaration or binding evidence" },
    ] },
  ),
  defineSchema(
    "Interface", "A stable API, event or message contract with independent consumer value", "interfaces/<slug>.md", 40,
    ["interface contract", "api contract", "message contract", "event contract", "shared message contract"],
    ["contract identity and producer, consumer or handler evidence"],
    ["# Purpose", "# Contract", "# Producers", "# Consumers", "# Failure Behavior", "# Limitations"],
    ["System", "Repository", "Component", "Function", "Entity", "Metric", "Flow", "Resource"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system boundary evidence" },
      { kind: "implemented-in", targetTypes: ["Repository"], evidence: "contract source evidence" },
    ] },
  ),
];
