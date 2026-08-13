export type OkfConceptSchema = Readonly<{
  type: string;
  purpose: string;
  directoryHint: string;
  specificity: number;
  fallbackType?: string;
  selectWhen: readonly string[];
  evidenceRequirements: readonly string[];
  requiredFrontmatter: readonly string[];
  recommendedSections: readonly string[];
  allowedLinks: readonly string[];
  limitationGuidance: string;
}>;

type SchemaOptions = Readonly<{
  fallbackType?: string;
  requiredFrontmatter?: readonly string[];
}>;

const generatedEvidence = ["title", "description", "generated", "sources"];
const limitations = "State missing or contradictory evidence explicitly; never invent semantic fields.";

function defineSchema(
  type: string,
  purpose: string,
  directoryHint: string,
  specificity: number,
  selectWhen: readonly string[],
  evidenceRequirements: readonly string[],
  recommendedSections: readonly string[],
  allowedLinks: readonly string[],
  options: SchemaOptions = {},
): OkfConceptSchema {
  return {
    type,
    purpose,
    directoryHint,
    specificity,
    selectWhen,
    evidenceRequirements,
    recommendedSections,
    allowedLinks,
    ...(options.fallbackType ? { fallbackType: options.fallbackType } : {}),
    requiredFrontmatter: options.requiredFrontmatter ?? generatedEvidence,
    limitationGuidance: limitations,
  };
}

export const OKF_CONCEPT_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "Repository",
    "Source repository identity, responsibility and navigation root",
    "repositories/<repository>/repository.md",
    10,
    ["repository", "source root"],
    ["admitted repository identity"],
    ["# Purpose", "# Structure", "# Entry Points"],
    ["Service", "Server", "API Endpoint", "Business Flow"],
  ),
  defineSchema(
    "Service",
    "A deployable or independently owned software service",
    "repositories/<repository>/services/<slug>.md",
    30,
    ["service", "microservice", "application"],
    ["service boundary or deployment identity"],
    ["# Responsibility", "# Interfaces", "# Dependencies"],
    ["Repository", "Server", "API Endpoint", "Event", "Database Table", "Queue", "Business Flow"],
  ),
  defineSchema(
    "Server",
    "A long-running network server or application process",
    "repositories/<repository>/servers/<slug>.md",
    40,
    ["server", "listener", "http server", "grpc server"],
    ["server entry point or listener evidence"],
    ["# Runtime", "# Interfaces", "# Operations"],
    ["Repository", "Service", "API Endpoint", "Database Table", "Queue"],
  ),
  defineSchema(
    "API Endpoint",
    "One externally callable HTTP, RPC or command endpoint",
    "repositories/<repository>/api/<slug>.md",
    50,
    ["api endpoint", "http route", "rpc method", "route"],
    ["method/protocol and handler evidence"],
    ["# Contract", "# Handler", "# Failure Behavior"],
    ["Service", "Server", "Business Flow", "Event"],
  ),
  defineSchema(
    "Event",
    "A named event produced or consumed by a system",
    "repositories/<repository>/events/<slug>.md",
    40,
    ["event", "event type", "message"],
    ["event name and producer or consumer evidence"],
    ["# Meaning", "# Producers", "# Consumers"],
    ["Service", "Queue", "AWS SQS Queue", "Business Flow"],
  ),
  defineSchema(
    "Database Table",
    "A concrete relational or logical database table",
    "repositories/<repository>/data/tables/<slug>.md",
    60,
    ["database table", "sql table", "table"],
    ["table identity or schema evidence"],
    ["# Data", "# Ownership", "# Access"],
    ["Service", "Server", "Business Flow"],
  ),
  defineSchema(
    "Queue",
    "A generic asynchronous queue with known producer or consumer",
    "repositories/<repository>/queues/<slug>.md",
    30,
    ["queue", "message queue"],
    ["queue identity", "producer or consumer evidence"],
    ["# Messages", "# Producers", "# Consumers"],
    ["Service", "Event", "Business Flow"],
  ),
  defineSchema(
    "AWS Lambda",
    "A concrete AWS Lambda function and its triggers/dependencies",
    "repositories/<repository>/infrastructure/aws/lambda/<slug>.md",
    80,
    ["aws lambda", "lambda function", "aws_lambda_function"],
    ["Lambda resource or runtime identity"],
    ["# Function", "# Triggers", "# Permissions", "# Limitations"],
    ["Service", "API Endpoint", "Event", "AWS SQS Queue", "Terraform Module", "Cross-Repository Relationship"],
  ),
  defineSchema(
    "AWS SQS Queue",
    "A concrete Amazon SQS queue and message relationships",
    "repositories/<repository>/infrastructure/aws/sqs/<slug>.md",
    80,
    ["aws sqs", "sqs queue", "aws_sqs_queue"],
    ["SQS resource identity", "producer or consumer evidence"],
    ["# Queue", "# Messages", "# Producers", "# Consumers", "# Limitations"],
    ["AWS Lambda", "Service", "Event", "Terraform Module", "Cross-Repository Relationship"],
    { fallbackType: "Queue" },
  ),
  defineSchema(
    "Terraform Module",
    "A reusable Terraform module and its infrastructure contract",
    "repositories/<repository>/infrastructure/terraform/<slug>.md",
    60,
    ["terraform module", "module block", "terraform"],
    ["module source or module root evidence"],
    ["# Purpose", "# Inputs", "# Outputs", "# Resources"],
    ["AWS Lambda", "AWS SQS Queue", "Server", "Cross-Repository Relationship"],
  ),
  defineSchema(
    "Business Flow",
    "A business/system behavior spanning technical concepts",
    "flows/<slug>.md",
    50,
    ["business flow", "user journey", "workflow", "end-to-end flow"],
    ["trigger", "observable outcome", "supporting system evidence"],
    ["# Trigger", "# Outcome", "# Flow", "# Failure and Recovery"],
    ["Repository", "Service", "API Endpoint", "Event", "Queue", "AWS Lambda", "AWS SQS Queue"],
  ),
  defineSchema(
    "Cross-Repository Relationship",
    "An evidence-bearing relationship between concepts owned by different repositories",
    "relationships/<slug>.md",
    70,
    ["cross-repository", "cross repo", "producer consumer", "repository relationship"],
    ["source endpoint", "target endpoint", "relationship evidence"],
    ["# Source", "# Relationship", "# Target", "# Evidence and Limitations"],
    ["Repository", "Service", "API Endpoint", "Event", "AWS Lambda", "AWS SQS Queue", "Business Flow"],
  ),
  defineSchema(
    "Open Question",
    "A visible uncertainty requiring evidence or owner input",
    "repositories/<repository>/questions/<slug>.md",
    10,
    ["question", "uncertain", "unknown", "conflict"],
    ["specific unresolved question"],
    ["# Question", "# Why It Matters", "# Evidence Needed"],
    ["Repository", "Service", "Business Flow"],
  ),
  defineSchema(
    "Maintainer Guidance",
    "Durable human correction, defer or authoring instruction",
    "repositories/<repository>/guidance/<slug>.md",
    10,
    ["maintainer guidance", "correction", "defer", "reopen"],
    ["explicit maintainer instruction"],
    ["# Guidance", "# Scope"],
    ["Open Question", "Repository", "Service", "Business Flow"],
    { requiredFrontmatter: ["title", "description", "generated"] },
  ),
];
