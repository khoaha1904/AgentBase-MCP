import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const GOVERNANCE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Cross-Repository Relationship", "A cross-source integration contract with its own lifecycle or mapping", "relationships/<slug>.md", 70,
    ["cross-repository contract", "cross repo contract", "integration contract"],
    ["source endpoint", "target endpoint", "independent contract or mapping evidence"],
    ["# Source", "# Contract", "# Target", "# Ownership", "# Evidence and Limitations"],
    ["Repository", "System", "Software Component", "Service", "API Surface", "Event", "Business Flow"],
  ),
  defineSchema(
    "Maintainer Guidance", "Durable human correction, defer or authoring instruction", "guidance/<slug>.md", 10,
    ["maintainer guidance", "correction", "defer", "reopen"], ["explicit maintainer instruction"],
    ["# Guidance", "# Scope"], ["Repository", "System", "Software Component", "Service", "Business Flow"],
    { requiredFrontmatter: ["title", "description", "generated"] },
  ),
];
