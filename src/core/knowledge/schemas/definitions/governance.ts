import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const GOVERNANCE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Cross-Repository Relationship", "A cross-source integration contract with its own lifecycle or mapping", "relationships/<slug>.md", 70,
    ["cross-repository contract", "cross repo contract", "integration contract"],
    ["source endpoint", "target endpoint", "independent contract or mapping evidence"],
    ["# Source", "# Contract", "# Target", "# Ownership", "# Evidence and Limitations"],
    ["Repository", "System", "Component", "Function", "Interface", "Flow"],
    { authoringScope: "governance" },
  ),
  defineSchema(
    "Maintainer Guidance", "Durable human correction, defer or authoring instruction", "guidance/<slug>.md", 10,
    ["maintainer guidance", "correction", "defer", "reopen"], ["explicit maintainer instruction"],
    ["# Guidance", "# Scope"], ["Repository", "System", "Component", "Function", "Interface", "Flow", "Resource"],
    { authoringScope: "governance", requiredFrontmatter: ["title", "description", "generated"] },
  ),
];
