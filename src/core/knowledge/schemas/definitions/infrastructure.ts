import { defineSchema, type OkfConceptSchema } from "../definition.ts";

export const INFRASTRUCTURE_SCHEMAS: readonly OkfConceptSchema[] = [
  defineSchema(
    "AWS Lambda", "An AWS Lambda function with independent operational or integration significance",
    "components/<slug>.md", 80,
    ["aws lambda", "lambda function", "aws_lambda_function"],
    ["Lambda resource or runtime identity", "independent trigger, scaling, permission, failure or operational behavior"],
    ["# Responsibility", "# Runtime", "# Triggers", "# Permissions", "# Failure Behavior", "# Limitations"],
    [
      "System", "Software Component", "Service", "API Surface", "API Endpoint", "Event",
      "AWS SQS Queue", "Infrastructure Definition", "Terraform Module", "Deployment",
    ],
    {
      investigationQuestions: [
        "Does this function have independent operational significance, or is it only a handler inside a component?",
        "What business purpose does the function serve?", "Which infrastructure resource declares it?",
        "What runtime and handler are configured, and does that handler resolve to source?",
        "Which API, event, schedule or queue triggers it?", "Which resources and permissions materially affect operation?",
      ],
      metadataGuidance: [
        { field: "business_purpose", evidence: "handler behavior and supporting documentation", requiredWhenSupported: true },
        { field: "resource_name", evidence: "Terraform, SAM or CloudFormation resource", requiredWhenSupported: true },
        { field: "runtime", evidence: "infrastructure function configuration", requiredWhenSupported: true },
        { field: "handler", evidence: "configuration plus resolved source symbol", requiredWhenSupported: true },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System", "Software Component", "Service"], evidence: "runtime responsibility boundary" },
        { kind: "triggered-by", targetTypes: ["API Surface", "API Endpoint", "Event", "AWS SQS Queue"], evidence: "infrastructure trigger or target binding" },
        { kind: "provides", targetTypes: ["API Surface", "API Endpoint", "Event"], evidence: "routing or event contract" },
        { kind: "consumes", targetTypes: ["API Surface", "API Endpoint", "Event"], evidence: "runtime call or subscription" },
        { kind: "depends-on", targetTypes: ["Software Component", "Service", "Server", "API Surface", "Event"], evidence: "runtime dependency evidence" },
        { kind: "publishes-to", targetTypes: ["Event", "Queue", "AWS SQS Queue"], evidence: "runtime publish/send plus binding" },
        { kind: "reads-from", targetTypes: ["Database Table", "Queue", "AWS SQS Queue"], evidence: "configuration binding plus runtime read" },
        { kind: "writes-to", targetTypes: ["Database Table", "Queue", "AWS SQS Queue"], evidence: "configuration binding plus runtime write/send" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "handler source evidence" },
        { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure resource declaration" },
        { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
      ],
      optionalEnrichment: ["timeout and memory", "IAM role and material actions", "failure destination or retry behavior"],
    },
  ),
  defineSchema(
    "AWS SQS Queue", "An Amazon SQS queue with an independent message, failure or operational boundary",
    "resources/<slug>.md", 80,
    ["aws sqs", "sqs queue", "aws_sqs_queue"], ["SQS resource identity", "producer or consumer evidence"],
    ["# Purpose", "# Messages", "# Producers", "# Consumers", "# Failure Behavior", "# Limitations"],
    ["System", "Software Component", "AWS Lambda", "Service", "Event", "Infrastructure Definition", "Terraform Module", "Deployment"],
    {
      fallbackType: "Queue",
      investigationQuestions: [
        "Which infrastructure resource declares the queue?", "Who produces messages?",
        "Who consumes messages?", "Is a dead-letter policy configured?",
      ],
      metadataGuidance: [{ field: "resource_name", evidence: "SQS infrastructure declaration", requiredWhenSupported: true }],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system ownership evidence" },
        { kind: "declared-by", targetTypes: ["Infrastructure Definition", "Terraform Module"], evidence: "infrastructure declaration" },
        { kind: "deployed-as", targetTypes: ["Deployment"], evidence: "external deployment binding" },
      ],
      optionalEnrichment: ["visibility timeout", "redrive and dead-letter policy"],
    },
  ),
  defineSchema(
    "Infrastructure Definition", "A root desired-state configuration that declares deployable infrastructure",
    "infrastructure/<slug>.md", 50,
    ["infrastructure definition", "terraform configuration", "terraform root configuration", "root module", "aws sam template", "cloudformation stack"],
    ["configuration root and declared resource evidence"],
    ["# Purpose", "# Configuration Root", "# Declared Architecture", "# Inputs and Outputs", "# Limitations"],
    ["System", "Software Component", "AWS Lambda", "AWS SQS Queue", "Database Table", "Event", "Terraform Module", "Deployment", "Repository"],
    {
      investigationQuestions: [
        "What is the desired-state configuration root?", "Which logical resources and connections does it declare?",
        "Which values are definitions only, and which external evidence proves a deployed instance?",
      ],
      metadataGuidance: [
        { field: "configuration_root", evidence: "Terraform, SAM or CloudFormation root", requiredWhenSupported: true },
        { field: "declared_resources", evidence: "resource and module declarations", requiredWhenSupported: true },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "system architecture evidence" },
        { kind: "implemented-in", targetTypes: ["Repository"], evidence: "configuration source evidence" },
      ],
    },
  ),
  defineSchema(
    "Terraform Module", "A reusable Terraform module that raises the abstraction level",
    "infrastructure/<slug>.md", 70,
    ["terraform module", "reusable terraform module", "module block"], ["reusable module root and input/output contract evidence"],
    ["# Purpose", "# Module Root", "# Inputs", "# Outputs", "# Managed Abstractions"],
    ["Infrastructure Definition", "AWS Lambda", "AWS SQS Queue", "Server", "Software Component", "Repository"],
    {
      fallbackType: "Infrastructure Definition",
      investigationQuestions: [
        "Is this configuration actually reusable rather than merely a root deployment configuration?",
        "What directory is the module root?", "Which inputs and outputs form its external contract?",
        "What higher-level abstraction does it provide?",
      ],
      metadataGuidance: [
        { field: "module_root", evidence: "reusable Terraform module root", requiredWhenSupported: true },
        { field: "managed_resources", evidence: "resource and nested module blocks", requiredWhenSupported: true },
      ],
      relationshipGuidance: [{ kind: "implemented-in", targetTypes: ["Repository"], evidence: "module source evidence" }],
      optionalEnrichment: ["provider aliases", "module inputs and outputs"],
    },
  ),
  defineSchema(
    "Deployment", "An evidenced applied instance binding logical architecture to an environment",
    "deployments/<slug>.md", 60,
    ["deployed environment", "applied deployment", "terraform output", "cloud resource identity"],
    ["external evidence of environment, account or region and applied resource identity"],
    ["# Environment", "# Deployed Components", "# Resource Bindings", "# Operations", "# Limitations"],
    ["System", "Software Component", "Infrastructure Definition", "Terraform Module", "AWS Lambda", "AWS SQS Queue", "Database Table"],
    {
      investigationQuestions: [
        "What external evidence proves this configuration was applied?", "Which environment, account and region are evidenced?",
        "Which logical identities bind to deployed names or ARNs?",
      ],
      metadataGuidance: [
        { field: "environment", evidence: "deployment pipeline, output or cloud API", requiredWhenSupported: true },
        { field: "region", evidence: "deployment output or cloud API", requiredWhenSupported: false },
      ],
      relationshipGuidance: [
        { kind: "part-of", targetTypes: ["System"], evidence: "environment ownership evidence" },
      ],
    },
  ),
  defineSchema(
    "Business Flow", "A business or system behavior spanning independently useful concepts", "flows/<slug>.md", 50,
    ["business flow", "business behavior", "business behaviors", "user journey", "workflow", "end-to-end flow"],
    ["trigger", "observable outcome", "supporting system evidence"],
    ["# Purpose", "# Trigger", "# Outcome", "# Flow", "# Failure and Recovery", "# Limitations"],
    ["System", "Software Component", "Service", "API Surface", "API Endpoint", "Domain Entity", "Metric", "Event", "Queue", "AWS Lambda", "AWS SQS Queue"],
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
      requiredFrontmatter: ["title", "description", "generated", "sources", "flow_steps"],
      relationshipGuidance: [{ kind: "part-of", targetTypes: ["Domain", "System"], evidence: "business or system boundary evidence" }],
      flowStepGuidance: {
        actions: ["invokes", "publishes", "delivers", "reads", "writes"],
        modes: ["synchronous", "asynchronous"],
        evidence: "ordered endpoints, interaction mode and source evidence",
      },
      optionalEnrichment: ["failure and recovery", "cross-repository steps"],
    },
  ),
];
