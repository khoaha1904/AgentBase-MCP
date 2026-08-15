import { defineSchema, type OkfConceptSchema } from "./schema-definition-builder.ts";
import { INFRASTRUCTURE_SCHEMAS } from "./schema-infrastructure-definitions.ts";

export type { OkfConceptSchema } from "./schema-definition-builder.ts";

export const OKF_CONCEPT_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Repository", "A source repository and its source-specific development contract", "repositories/<slug>.md", 10,
    ["repository", "source root"], ["admitted repository identity"],
    ["# Purpose", "# Source Structure", "# Build and Test", "# Canonical Knowledge"],
    ["System", "Software Component", "API Surface", "Business Flow", "Infrastructure Definition"],
  ),
  defineSchema(
    "Domain", "An evidenced business domain or bounded context", "domains/<slug>.md", 10,
    ["business domain", "bounded context", "domain ownership"], ["business boundary or explicit owner guidance"],
    ["# Purpose", "# Vocabulary", "# Boundaries", "# Systems"], ["System"],
  ),
  defineSchema(
    "System", "A recognizable capability delivered by cooperating software and infrastructure", "systems/<slug>.md", 20,
    ["software system", "system boundary", "system capability"], ["recognizable capability and cooperating entity evidence"],
    ["# Purpose", "# Architecture", "# Interfaces", "# Critical Flows", "# Limitations"],
    [
      "Domain", "Software Component", "Service", "Server", "API Surface", "Business Flow",
      "Database Table", "Queue", "Infrastructure Definition", "Deployment", "Repository",
    ],
    {
      investigationQuestions: [
        "What recognizable capability does this system deliver?", "Which entities cooperate to deliver it?",
        "Which source repositories provide evidence?", "Which boundaries are evidenced and which remain uncertain?",
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain"], evidence: "business boundary or owner guidance" },
        { kind: "composed-of", targetTypes: ["Software Component", "Service", "Server"], evidence: "runtime or deployment cooperation" },
        { kind: "exposes", targetTypes: ["API Surface"], evidence: "consumer-visible interface evidence" },
      ],
    },
  ),
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
        { kind: "implemented-by", targetTypes: ["Repository"], evidence: "source ownership evidence" },
        { kind: "exposes", targetTypes: ["API Surface"], evidence: "interface declaration" },
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
        { kind: "provided-by", targetTypes: ["Software Component", "Service", "Server", "AWS Lambda"], evidence: "routing or deployment binding" },
        { kind: "part-of", targetTypes: ["System"], evidence: "system boundary evidence" },
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
        { kind: "handled-by", targetTypes: ["Software Component", "Service", "AWS Lambda", "Server"], evidence: "route declaration resolving the handler" },
      ],
    },
  ),
  defineSchema(
    "Event", "A named event with independently useful producer or consumer semantics", "interfaces/<slug>.md", 40,
    ["event", "event type", "message contract"], ["event name and producer or consumer evidence"],
    ["# Meaning", "# Contract", "# Producers", "# Consumers"],
    ["System", "Software Component", "Service", "Queue", "AWS SQS Queue", "Business Flow"],
    {
      investigationQuestions: ["What produces this event?", "What consumes it?", "What schedule or event pattern triggers it?"],
      metadataGuidance: [{ field: "trigger", evidence: "schedule, event pattern or producer call", requiredWhenSupported: true }],
      relationshipGuidance: [{
        kind: "triggers", targetTypes: ["AWS Lambda", "Software Component", "Service", "Business Flow"],
        evidence: "event target or consumer binding",
      }],
    },
  ),
  defineSchema(
    "Database Table", "A durable data resource with an independent identity or operational boundary", "resources/<slug>.md", 60,
    ["database table", "sql table", "dynamodb table"], ["table identity or schema evidence"],
    ["# Purpose", "# Data", "# Ownership", "# Access", "# Operations"],
    ["System", "Software Component", "Service", "Server", "Business Flow", "Infrastructure Definition", "Deployment"],
    {
      investigationQuestions: ["What is the table identity and key/schema?", "Which runtime reads or writes it?", "How is its name passed to the runtime?"],
      metadataGuidance: [
        { field: "resource_name", evidence: "infrastructure or schema declaration", requiredWhenSupported: true },
        { field: "keys", evidence: "table schema declaration", requiredWhenSupported: false },
      ],
      relationshipGuidance: [{
        kind: "accessed-by", targetTypes: ["AWS Lambda", "Software Component", "Service", "Server"],
        evidence: "runtime database operation plus configuration binding",
      }],
    },
  ),
  defineSchema(
    "Queue", "A durable asynchronous resource with a known producer, consumer or failure boundary", "resources/<slug>.md", 30,
    ["queue", "message queue"], ["queue identity", "producer or consumer evidence"],
    ["# Purpose", "# Messages", "# Producers", "# Consumers", "# Failure Behavior"],
    ["System", "Software Component", "Service", "Event", "Business Flow", "Infrastructure Definition", "Deployment"],
  ),
  ...INFRASTRUCTURE_SCHEMAS,
  defineSchema(
    "Cross-Repository Relationship", "A cross-source integration contract with its own lifecycle or mapping", "relationships/<slug>.md", 70,
    ["cross-repository contract", "cross repo contract", "integration contract"],
    ["source endpoint", "target endpoint", "independent contract or mapping evidence"],
    ["# Source", "# Contract", "# Target", "# Ownership", "# Evidence and Limitations"],
    ["Repository", "System", "Software Component", "Service", "API Surface", "Event", "Business Flow"],
  ),
  defineSchema(
    "Open Question", "Legacy portable uncertainty concept retained for compatibility", "questions/<slug>.md", 0,
    [], ["specific unresolved question"], ["# Question", "# Why It Matters", "# Evidence Needed"],
    ["Repository", "System", "Software Component", "Service", "Business Flow"],
  ),
  defineSchema(
    "Maintainer Guidance", "Durable human correction, defer or authoring instruction", "guidance/<slug>.md", 10,
    ["maintainer guidance", "correction", "defer", "reopen"], ["explicit maintainer instruction"],
    ["# Guidance", "# Scope"], ["Repository", "System", "Software Component", "Service", "Business Flow"],
    { requiredFrontmatter: ["title", "description", "generated"] },
  ),
];
