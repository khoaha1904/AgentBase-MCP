import { defineSchema, type OkfConceptSchema } from "./schema-definition-builder.ts";

export const INFRASTRUCTURE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "AWS Lambda", "A concrete AWS Lambda function and its triggers/dependencies",
    "repositories/<repository>/infrastructure/aws/lambda/<slug>.md", 80,
    ["aws lambda", "lambda function", "aws_lambda_function"], ["Lambda resource or runtime identity"],
    ["# Function", "# Triggers", "# Permissions", "# Limitations"],
    ["Service", "API Endpoint", "Event", "AWS SQS Queue", "Terraform Module", "Cross-Repository Relationship"],
    {
      investigationQuestions: [
        "What business purpose does the function serve?", "Which infrastructure resource declares it?",
        "What runtime and handler are configured, and does that handler resolve to source?",
        "Which API, event, schedule or queue triggers it?", "Which tables, queues, services and environment bindings does it use?",
        "Which permissions materially enable those interactions?",
      ],
      metadataGuidance: [
        { field: "business_purpose", evidence: "handler behavior and supporting documentation", requiredWhenSupported: true },
        { field: "resource_name", evidence: "Terraform, SAM or CloudFormation resource", requiredWhenSupported: true },
        { field: "runtime", evidence: "infrastructure function configuration", requiredWhenSupported: true },
        { field: "handler", evidence: "configuration plus resolved source symbol", requiredWhenSupported: true },
      ],
      relationshipGuidance: [
        { kind: "triggered-by", targetTypes: ["API Endpoint", "Event", "AWS SQS Queue"], evidence: "infrastructure trigger or target binding" },
        { kind: "accesses", targetTypes: ["Database Table", "AWS SQS Queue", "Service"], evidence: "configuration binding plus runtime operation" },
        { kind: "declared-by", targetTypes: ["Terraform Module"], evidence: "infrastructure resource declaration" },
      ],
      optionalEnrichment: ["timeout and memory", "IAM role and material actions", "failure destination or retry behavior"],
    },
  ),
  defineSchema(
    "AWS SQS Queue", "A concrete Amazon SQS queue and message relationships",
    "repositories/<repository>/infrastructure/aws/sqs/<slug>.md", 80,
    ["aws sqs", "sqs queue", "aws_sqs_queue"], ["SQS resource identity", "producer or consumer evidence"],
    ["# Queue", "# Messages", "# Producers", "# Consumers", "# Limitations"],
    ["AWS Lambda", "Service", "Event", "Terraform Module", "Cross-Repository Relationship"],
    {
      fallbackType: "Queue",
      investigationQuestions: [
        "Which infrastructure resource declares the queue?", "Who produces messages?",
        "Who consumes messages?", "Is a dead-letter policy configured?",
      ],
      metadataGuidance: [{ field: "resource_name", evidence: "SQS infrastructure declaration", requiredWhenSupported: true }],
      relationshipGuidance: [
        { kind: "produced-by", targetTypes: ["AWS Lambda", "Service"], evidence: "runtime send operation plus queue binding" },
        { kind: "consumed-by", targetTypes: ["AWS Lambda", "Service"], evidence: "event source mapping or runtime receive operation" },
      ],
      optionalEnrichment: ["visibility timeout", "redrive and dead-letter policy"],
    },
  ),
  defineSchema(
    "Terraform Module", "A reusable Terraform module and its infrastructure contract",
    "repositories/<repository>/infrastructure/terraform/<slug>.md", 60,
    ["terraform module", "module block", "terraform"], ["module source or module root evidence"],
    ["# Purpose", "# Inputs", "# Outputs", "# Resources"],
    ["AWS Lambda", "AWS SQS Queue", "Server", "Cross-Repository Relationship"],
    {
      investigationQuestions: [
        "What directory is the module root?", "Which resources does it declare?",
        "How do resource references connect triggers, runtimes and dependencies?",
        "Which inputs and outputs form its external contract?",
      ],
      metadataGuidance: [
        { field: "module_root", evidence: "Terraform configuration root", requiredWhenSupported: true },
        { field: "managed_resources", evidence: "resource and module blocks", requiredWhenSupported: true },
      ],
      relationshipGuidance: [{
        kind: "declares", targetTypes: ["AWS Lambda", "AWS SQS Queue", "Database Table", "Event", "Server"],
        evidence: "resource block in the module root",
      }],
      optionalEnrichment: ["provider aliases", "module inputs and outputs", "deployment regions"],
    },
  ),
  defineSchema(
    "Business Flow", "A business/system behavior spanning technical concepts", "flows/<slug>.md", 50,
    ["business flow", "business behavior", "business behaviors", "user journey", "workflow", "end-to-end flow"],
    ["trigger", "observable outcome", "supporting system evidence"],
    ["# Trigger", "# Outcome", "# Flow", "# Failure and Recovery"],
    ["Repository", "Service", "API Endpoint", "Event", "Queue", "AWS Lambda", "AWS SQS Queue"],
    {
      investigationQuestions: [
        "What user or system trigger starts the flow?", "What observable business outcome completes it?",
        "Which ordered concepts participate?", "Where can it fail and recover?",
      ],
      metadataGuidance: [
        { field: "business_purpose", evidence: "documentation plus supporting runtime behavior", requiredWhenSupported: true },
        { field: "trigger", evidence: "caller, route or event source", requiredWhenSupported: true },
        { field: "outcome", evidence: "observable state change or returned result", requiredWhenSupported: true },
      ],
      relationshipGuidance: [{
        kind: "step", targetTypes: ["API Endpoint", "Event", "AWS Lambda", "AWS SQS Queue", "Database Table", "Service"],
        evidence: "ordered source-backed interaction",
      }],
      optionalEnrichment: ["failure and recovery", "cross-repository steps"],
    },
  ),
];
