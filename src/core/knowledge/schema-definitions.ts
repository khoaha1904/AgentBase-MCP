import { defineSchema, type OkfConceptSchema } from "./schema-definition-builder.ts";
import { INFRASTRUCTURE_SCHEMAS } from "./schema-infrastructure-definitions.ts";

export type { OkfConceptSchema } from "./schema-definition-builder.ts";

export const OKF_CONCEPT_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Repository", "A source repository and its source-specific development contract", "repositories/<slug>.md", 10,
    ["repository", "source root"], ["admitted repository identity"],
    ["# Purpose", "# Source Structure", "# Build and Test", "# Canonical Knowledge"],
    ["System", "Software Component", "API Surface", "Business Flow", "Infrastructure Definition"],
    { relationshipGuidance: [] },
  ),
  defineSchema(
    "Domain", "An evidenced business domain or bounded context", "domains/<slug>.md", 10,
    ["business domain", "bounded context", "domain ownership"], ["business boundary or explicit owner guidance"],
    ["# Purpose", "# Vocabulary", "# Boundaries", "# Systems"], ["System", "Domain Entity", "Metric", "Business Flow"],
  ),
  defineSchema(
    "Domain Entity", "A stable business object or value identity shared across useful contracts, flows or systems",
    "entities/<slug>.md", 30,
    ["domain entity", "business entity", "business object", "aggregate root", "domain model boundary"],
    ["stable business identity and meaning or lifecycle evidence"],
    ["# Meaning", "# Identity", "# Lifecycle", "# Used By", "# Limitations"],
    ["Domain", "System", "API Surface", "Event", "Metric", "Database Table", "Business Flow", "Repository"],
    {
      investigationQuestions: [
        "What stable business identity makes this entity useful beyond one implementation class?",
        "Which contracts, flows or systems share its meaning?",
        "What lifecycle or invariants are evidenced, and what remains uncertain?",
      ],
      metadataGuidance: [
        { field: "business_identity", evidence: "domain contract, API, data model or owner guidance", requiredWhenSupported: true },
        { field: "lifecycle", evidence: "business flow or state-transition evidence", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business boundary or system ownership evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "source representation evidence" },
      ],
    },
  ),
  defineSchema(
    "System", "A recognizable capability delivered by cooperating software and infrastructure", "systems/<slug>.md", 20,
    ["software system", "system boundary", "system capability"], ["recognizable capability and cooperating entity evidence"],
    ["# Purpose", "# Architecture", "# Interfaces", "# Critical Flows", "# Limitations"],
    [
      "Domain", "Software Component", "Service", "Server", "API Surface", "Business Flow",
      "Domain Entity", "Metric", "Database Table", "Queue", "Infrastructure Definition", "Deployment", "Repository",
    ],
    {
      investigationQuestions: [
        "What recognizable capability does this system deliver?", "Which entities cooperate to deliver it?",
        "Which source repositories provide evidence?", "Which boundaries are evidenced and which remain uncertain?",
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain"], evidence: "business boundary or owner guidance" },
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
  defineSchema(
    "Metric", "A stable named measure and definition, distinct from any current observed numeric value",
    "metrics/<slug>.md", 40,
    ["business metric", "performance metric", "analytics metric", "defined measure", "metric definition"],
    ["stable metric definition and producer or calculation evidence"],
    ["# Purpose", "# Definition", "# Inputs", "# Producers and Consumers", "# Limitations"],
    ["Domain", "System", "Software Component", "Service", "Domain Entity", "Event", "Database Table", "Business Flow", "Repository"],
    {
      investigationQuestions: [
        "What stable question or outcome does this metric measure?",
        "What definition, formula, unit or aggregation is evidenced?",
        "Which component, event or data source produces its inputs?",
        "Is a cited number only a change-prone observation that must remain a live reference?",
      ],
      metadataGuidance: [
        { field: "unit", evidence: "metric definition or instrumentation contract", requiredWhenSupported: false },
        { field: "formula", evidence: "calculation code or documented definition", requiredWhenSupported: false },
        { field: "aggregation", evidence: "instrumentation or analytics definition", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business or system measurement boundary" },
        { kind: "depends-on", targetTypes: ["Domain Entity", "Event", "Database Table"], evidence: "metric input or calculation evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "instrumentation or calculation source evidence" },
      ],
      optionalEnrichment: ["unit", "formula", "aggregation window and dimensions"],
    },
  ),
  defineSchema(
    "Database Table", "A durable data resource with an independent identity or operational boundary", "resources/<slug>.md", 60,
    ["database table", "sql table", "dynamodb table"], ["table identity or schema evidence"],
    ["# Purpose", "# Data", "# Ownership", "# Access", "# Operations"],
    ["System", "Software Component", "Service", "Server", "Domain Entity", "Metric", "Business Flow", "Infrastructure Definition", "Deployment"],
    {
      investigationQuestions: ["What is the table identity and key/schema?", "Which runtime reads or writes it?", "How is its name passed to the runtime?"],
      metadataGuidance: [
        { field: "resource_name", evidence: "infrastructure or schema declaration", requiredWhenSupported: true },
        { field: "keys", evidence: "table schema declaration", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
        { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure declaration" },
        { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
      ],
    },
  ),
  defineSchema(
    "Queue", "A durable asynchronous resource with a known producer, consumer or failure boundary", "resources/<slug>.md", 30,
    ["queue", "message queue"], ["queue identity", "producer or consumer evidence"],
    ["# Purpose", "# Messages", "# Producers", "# Consumers", "# Failure Behavior"],
    ["System", "Software Component", "Service", "Event", "Business Flow", "Infrastructure Definition", "Deployment"],
    { relationshipGuidance: [
      { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
      { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure declaration" },
      { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
    ] },
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
