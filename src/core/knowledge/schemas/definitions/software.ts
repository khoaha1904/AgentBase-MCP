import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const SOFTWARE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Software Component", "An independently useful build, runtime or ownership unit", "components/<slug>.md", 30,
    ["software component", "build artifact", "runtime component"], ["independent build, runtime, deployment or ownership boundary"],
    ["# Responsibility", "# Runtime", "# Interfaces", "# Dependencies", "# Operations"],
    ["System", "Repository", "API Surface", "Business Flow", "Database Table", "Queue", "Infrastructure Definition", "Deployment"],
    {
      investigationQuestions: [
        "What stable responsibility makes this component independently useful?",
        "Does it have an independent build, runtime, deployment, ownership or operational lifecycle?",
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system composition evidence" },
        { kind: "provides", targetTypes: ["API Surface", "API Endpoint", "Event"], evidence: "interface declaration" },
        { kind: "consumes", targetTypes: ["API Surface", "API Endpoint", "Event"], evidence: "runtime call or subscription" },
        { kind: "depends-on", targetTypes: ["Software Component", "Service", "Server", "API Surface", "Event"], evidence: "runtime dependency evidence" },
        {
          kind: "triggered-by", targetTypes: ["API Surface", "API Endpoint", "Event", "Queue", "AWS SQS Queue", "Database Table"],
          evidence: "trigger or event-source binding",
        },
        { kind: "publishes-to", targetTypes: ["Event", "Queue", "AWS SQS Queue"], evidence: "runtime publish/send plus binding" },
        { kind: "reads-from", targetTypes: ["Database Table", "Queue", "AWS SQS Queue"], evidence: "runtime read plus binding" },
        { kind: "writes-to", targetTypes: ["Database Table", "Queue", "AWS SQS Queue"], evidence: "runtime write/send plus binding" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "source ownership evidence" },
        { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure declaration" },
        { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
      ],
    },
  ),
  defineSchema(
    "Service", "A deployable or independently owned software service", "components/<slug>.md", 40,
    ["service", "microservice", "application service"], ["service boundary or deployment identity"],
    ["# Responsibility", "# Interfaces", "# Dependencies", "# Operations"],
    ["System", "Repository", "Server", "API Surface", "Event", "Database Table", "Queue", "Business Flow", "Deployment"],
    { fallbackType: "Software Component" },
  ),
  defineSchema(
    "Server", "A long-running network process with an independent operational lifecycle", "components/<slug>.md", 50,
    ["server", "listener", "http server", "grpc server"], ["server entry point or listener evidence"],
    ["# Responsibility", "# Runtime", "# Interfaces", "# Operations"],
    ["System", "Repository", "Service", "API Surface", "Database Table", "Queue", "Deployment"],
    { fallbackType: "Software Component" },
  ),
  defineSchema(
    "API Surface", "A stable consumer-facing API boundary containing related operations", "interfaces/<slug>.md", 50,
    ["api surface", "http routes", "rpc service", "public api", "api contract"], ["consumer boundary and related operation evidence"],
    ["# Purpose", "# Consumers", "# Authentication", "# Operations", "# Failure Behavior", "# Limitations"],
    ["System", "Software Component", "Service", "Server", "API Endpoint", "Business Flow"],
    {
      investigationQuestions: [
        "Which consumers share this interface boundary?", "Which operations belong to the same contract?",
        "What authentication, versioning and failure behavior apply to the surface?",
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system boundary evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "interface source evidence" },
      ],
    },
  ),
  defineSchema(
    "API Endpoint", "One endpoint with an independently important contract or lifecycle", "interfaces/<slug>.md", 80,
    ["independent endpoint", "versioned endpoint", "endpoint policy", "endpoint sla"],
    ["method/protocol and handler evidence", "independent policy, owner, lifecycle or consumer boundary"],
    ["# Contract", "# Consumers", "# Handler", "# Failure Behavior"],
    ["API Surface", "Software Component", "Service", "Server", "Business Flow", "Event"],
    {
      fallbackType: "API Surface",
      investigationQuestions: [
        "What makes this endpoint independently useful outside its API surface?",
        "What method and route are exposed?", "Which concrete handler receives the request?",
      ],
      metadataGuidance: [
        { field: "method", evidence: "route or infrastructure declaration", requiredWhenSupported: true },
        { field: "route", evidence: "route or client call", requiredWhenSupported: true },
        { field: "handler", evidence: "route-to-handler declaration", requiredWhenSupported: true },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["API Surface"], evidence: "shared consumer contract" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "route or handler source evidence" },
      ],
    },
  ),
  defineSchema(
    "Event", "A named event with independently useful producer or consumer semantics", "interfaces/<slug>.md", 40,
    ["event", "event type", "message contract"], ["event name and producer or consumer evidence"],
    ["# Meaning", "# Contract", "# Producers", "# Consumers"],
    ["System", "Software Component", "Service", "Domain Entity", "Metric", "Queue", "AWS SQS Queue", "Business Flow"],
    {
      investigationQuestions: ["What produces this event?", "What consumes it?", "What schedule or event pattern triggers it?"],
      metadataGuidance: [{ field: "trigger", evidence: "schedule, event pattern or producer call", requiredWhenSupported: true }],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system boundary evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "event contract source evidence" },
      ],
    },
  ),
];
