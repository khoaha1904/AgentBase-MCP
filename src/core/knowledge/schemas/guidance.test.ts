import assert from "node:assert/strict";
import test from "node:test";

import { getOkfAuthoringGuidance, type ResourceSourceTool, type SemanticObservation } from "./guidance.ts";

const source = { path: "infra/main.tf", startLine: 1, endLine: 8 };

test("[AB-SCHEMA-062] mixed detector families cannot claim one exact profile", () => {
  const input = resource("Worker", "aws_lambda_function");
  input.candidates[0]!.evidenceIds.push("evidence.template");
  input.resourceObservations.push({ ...input.resourceObservations[0]!, id: "evidence.template",
    sourceTool: "sam", resourceType: "AWS::Serverless::Function", address: "Worker",
    source: { ...source, path: "template.yaml" } });
  const result = getOkfAuthoringGuidance(input).recommendations[0]!;
  assert.equal(result.status, "ambiguous");
  assert.equal(result.detectorProfile, undefined);
  assert.match(result.limitations.join(), /multiple source detector families/);
});

test("[AB-SCHEMA-062] template observations retain source types and reject source-format confusion", () => {
  for (const [tool, type] of [["sam", "AWS::Serverless::Function"], ["cloudformation", "AWS::Lambda::Function"]] as const) {
    const input = resource("Worker", type, "concept", tool, "template.yaml");
    input.resourceObservations[0]!.address = "Worker";
    const recommendation = getOkfAuthoringGuidance(input).recommendations[0]!;
    assert.equal(recommendation.status, "exact");
    assert.equal(recommendation.schema?.type, "Function");
    assert.equal(recommendation.technology.resourceType, type);
    assert.equal(recommendation.detectorProfile?.id, "cloudformation-family");
    assert.throws(() => getOkfAuthoringGuidance({ ...input, resourceObservations: [{ ...input.resourceObservations[0]!,
      source: { ...source, path: "main.tf" } }] }), /must cite/);
  }
  const input = resource("Binding", "AWS::Lambda::EventSourceMapping", "concept", "cloudformation", "template.json");
  input.resourceObservations[0]!.address = "Binding";
  assert.equal(getOkfAuthoringGuidance(input).recommendations[0]!.status, "unsupported");
  assert.throws(() => getOkfAuthoringGuidance({ ...input, resourceObservations: [{ ...input.resourceObservations[0]!, sourceTool: "sam" }] }), /must match/);
});

test("[AB-SCHEMA-061] trigger and deployment declarations do not automatically become runtime concepts", () => {
  for (const type of ["aws_lambda_event_source_mapping", "aws_ecs_service", "aws_ecs_task_definition",
    "aws_api_gateway_rest_api", "aws_apigatewayv2_api"]) {
    const result = getOkfAuthoringGuidance(resource("declaration", type)).recommendations[0]!;
    assert.equal(result.status, "unsupported", type);
    assert.equal(result.schema, undefined, type);
    assert.ok(result.technology.kind, type);
  }
  const input = resource("binding", "aws_lambda_event_source_mapping");
  const result = getOkfAuthoringGuidance({ ...input,
    candidates: [{ ...input.candidates[0]!, suggestedType: "Function" }] }).recommendations[0]!;
  assert.equal(result.status, "suggested", "intent never turns a binding into an exact Function mapping");
});

function resource(candidateId: string, resourceType: string, disposition: "concept" | "embedded" = "concept",
  sourceTool: ResourceSourceTool = "terraform", sourcePath = source.path) {
  return {
    candidates: [{ id: candidateId, identityHint: candidateId, identityBasis: "Terraform address",
      queryValue: "Runtime or supporting resource role", evidenceIds: [`evidence.${candidateId}`], disposition,
      ...(disposition === "embedded" ? { parentCandidateId: "parent" } : {}) }],
    semanticObservations: [] as SemanticObservation[],
    resourceObservations: [{ id: `evidence.${candidateId}`, candidateId, sourceTool,
      resourceType, address: `module.app.${resourceType}.${candidateId}`,
      source: { ...source, path: sourcePath } }],
  };
}

test("[AB-SCHEMA-032..036] concept-disposition Lambda maps exactly to Function", () => {
  const input = resource("runtime", "aws_lambda_function");
  const result = getOkfAuthoringGuidance({ ...input, candidates: [{ ...input.candidates[0]!, suggestedType: "Function",
    promotion: { basis: "operational" as const, evidenceIds: ["evidence.runtime"] } }] });
  const recommendation = result.recommendations[0]!;
  assert.equal(result.catalogVersion, "7.0.0");
  assert.equal(recommendation.status, "exact");
  assert.equal(recommendation.disposition, "concept");
  assert.equal(recommendation.schema?.type, "Function");
  assert.deepEqual(recommendation.detectorProfile, { id: "terraform-family", version: "1.0.0" });
  assert.deepEqual(recommendation.providerProfile, { id: "aws", version: "2.1.0" });
  assert.deepEqual(recommendation.technology, {
    kind: "runtime-function", provider: "aws", product: "lambda", sourceTool: "terraform", resourceType: "aws_lambda_function",
  });
});

test("[AB-SCHEMA-032][AB-SCHEMA-037] supporting Terraform resources remain embedded technology evidence", () => {
  for (const [resourceType, product, kind] of [
    ["aws_instance", "ec2", "compute-host"],
    ["aws_sqs_queue", "sqs", "message-queue"],
    ["aws_sns_topic", "sns", "message-topic"],
    ["aws_cloudwatch_event_bus", "eventbridge", "event-bus"],
    ["aws_s3_bucket", "s3", "object-storage"],
    ["aws_db_instance", "rds", "database"],
    ["aws_dynamodb_table", "dynamodb", "database-table"],
    ["aws_ecs_service", "ecs", "runtime-service"],
    ["aws_ecs_task_definition", "ecs", "task-definition"],
    ["aws_api_gateway_rest_api", "apigateway", "api"],
    ["aws_apigatewayv2_api", "apigateway", "api"],
    ["aws_api_gateway_resource", "apigateway", "api-resource"],
    ["aws_api_gateway_method", "apigateway", "api-route"],
    ["aws_apigatewayv2_route", "apigateway", "api-route"],
    ["aws_api_gateway_integration", "apigateway", "api-integration"],
    ["aws_apigatewayv2_integration", "apigateway", "api-integration"],
    ["aws_lambda_event_source_mapping", "lambda", "event-source-mapping"],
  ] as const) {
    const input = resource(resourceType.replaceAll("_", "."), resourceType, "embedded");
    input.candidates.unshift({ id: "parent", identityHint: "runtime", identityBasis: "workload boundary",
      queryValue: "Independent runtime", evidenceIds: ["docs.parent"], disposition: "concept" });
    input.semanticObservations.push({ id: "docs.parent", candidateId: "parent", role: "implementation" as const,
      signal: "runtime function with independent trigger", source });
    const recommendation = getOkfAuthoringGuidance(input).recommendations[1]!;
    assert.equal(recommendation.status, "embedded", resourceType);
    assert.equal(recommendation.disposition, "embedded", resourceType);
    assert.equal(recommendation.parentCandidateId, "parent", resourceType);
    assert.equal(recommendation.schema, undefined, resourceType);
    assert.equal(recommendation.technology.product, product, resourceType);
    assert.equal(recommendation.technology.kind, kind, resourceType);
  }
});

test("[AB-SCHEMA-057][AB-SCHEMA-058] full-stack runtimes stay separate while backend storage stays embedded", () => {
  const result = getOkfAuthoringGuidance({
    candidates: [
      { id: "frontend", identityHint: "web frontend", identityBasis: "independent deployment",
        queryValue: "Browser application deployed independently", evidenceIds: ["docs.frontend"],
        disposition: "concept" as const, suggestedType: "Component" },
      { id: "backend", identityHint: "api backend", identityBasis: "independent deployment",
        queryValue: "HTTP backend deployed independently", evidenceIds: ["docs.backend"],
        disposition: "concept" as const, suggestedType: "Component" },
      { id: "table", identityHint: "product table", identityBasis: "Terraform address",
        queryValue: "Stores backend product state", evidenceIds: ["evidence.table"],
        disposition: "embedded" as const, parentCandidateId: "backend" },
    ],
    semanticObservations: [
      { id: "docs.frontend", candidateId: "frontend", role: "implementation" as const,
        signal: "independent frontend runtime and deployment boundary", source },
      { id: "docs.backend", candidateId: "backend", role: "implementation" as const,
        signal: "independent backend runtime and deployment boundary", source },
    ],
    resourceObservations: [{ id: "evidence.table", candidateId: "table", sourceTool: "terraform" as const,
      resourceType: "aws_dynamodb_table", address: "module.backend.aws_dynamodb_table.products", source }],
  });
  assert.deepEqual(result.recommendations.map((item) => [item.candidateId, item.schema?.type, item.status]), [
    ["frontend", "Component", "suggested"],
    ["backend", "Component", "suggested"],
    ["table", undefined, "embedded"],
  ]);
  assert.equal(result.recommendations[2]?.parentCandidateId, "backend");
});

test("[AB-SCHEMA-031][AB-SCHEMA-036][AB-SCHEMA-048] standalone concepts share attributable evidence while embedded stays self-owned", () => {
  const noParent = resource("queue", "aws_sqs_queue", "embedded");
  assert.throws(() => getOkfAuthoringGuidance(noParent), /embedded candidate parent must name a concept candidate/);
  const input = resource("queue", "aws_sqs_queue", "embedded");
  input.candidates.unshift({ id: "parent", identityHint: "runtime", identityBasis: "workload boundary",
    queryValue: "Independent runtime", evidenceIds: ["docs.parent"], disposition: "concept" });
  input.semanticObservations.push({ id: "docs.parent", candidateId: "parent", role: "implementation" as const,
    signal: "runtime function", source });
  Object.assign(input.candidates[1] as Record<string, unknown>, { suggestedType: "Resource",
    promotion: { basis: "operational", evidenceIds: ["evidence.queue"] } });
  const recommendation = getOkfAuthoringGuidance(input).recommendations[1]!;
  assert.equal(recommendation.status, "embedded");
  assert.equal(recommendation.schema, undefined);
  assert.match(recommendation.limitations.join(" "), /embedded disposition overrides/i);

  Object.assign(input.candidates[0]!, { evidenceIds: ["docs.parent", "evidence.queue"], suggestedType: "Function",
    promotion: { basis: "lifecycle", evidenceIds: ["evidence.queue"] } });
  assert.equal(getOkfAuthoringGuidance(input).recommendations[0]?.schema?.type, "Function");
  input.candidates.push({ id: "other", identityHint: "other", identityBasis: "other boundary",
    queryValue: "Other runtime", evidenceIds: ["evidence.queue"], disposition: "concept" });
  assert.equal(getOkfAuthoringGuidance(input).recommendations[2]?.status, "unsupported");
  Object.assign(input.candidates[1]!, { evidenceIds: ["evidence.queue", "docs.parent"] });
  assert.throws(() => getOkfAuthoringGuidance(input), /candidate queue cites evidence owned by another candidate/);

  const providerNeutral = getOkfAuthoringGuidance({
    candidates: [
      { id: "parent", identityHint: "runtime", identityBasis: "workload boundary", queryValue: "Independent runtime",
        evidenceIds: ["docs.parent"], disposition: "concept" as const, suggestedType: "Component" },
      { id: "external", identityHint: "upstream API", identityBasis: "documented dependency",
        queryValue: "External upstream dependency", evidenceIds: ["docs.external"], disposition: "embedded" as const,
        parentCandidateId: "parent" },
    ],
    semanticObservations: [
      { id: "docs.parent", candidateId: "parent", role: "implementation" as const, signal: "independent runtime", source },
      { id: "docs.external", candidateId: "external", role: "documentation" as const, signal: "calls upstream API", source },
    ],
    resourceObservations: [],
  }).recommendations[1]!;
  assert.equal(providerNeutral.status, "embedded");
  assert.deepEqual(providerNeutral.technology, {});
  assert.match(providerNeutral.limitations.join(" "), /provider-neutral/);
});

test("[AB-SCHEMA-034][AB-SCHEMA-036][AB-SCHEMA-048] standalone System and Flow share attributable evidence", () => {
  const result = getOkfAuthoringGuidance({
    candidates: [{ id: "capability", identityHint: "health-aware", identityBasis: "README capability",
      queryValue: "Coordinates cooperating runtimes", evidenceIds: ["docs.capability"], disposition: "concept" as const,
      suggestedType: "System", promotion: { basis: "operational" as const, evidenceIds: ["docs.capability"] } }],
    semanticObservations: [{ id: "docs.capability", candidateId: "capability", role: "documentation" as const,
      signal: "The repository describes AWS Health Aware as an automated notification tool for operational teams", source }],
    resourceObservations: [],
  });
  assert.equal(result.recommendations[0]?.status, "suggested");
  assert.equal(result.recommendations[0]?.schema?.type, "System");
  assert.match(result.recommendations[0]?.limitations.join(" ") ?? "", /reviewable intent/i);
  assert.match(result.recommendations[0]?.limitations.join(" ") ?? "", /proposal review/i);

  const crossBoundary = {
    candidates: [
      { id: "runtime", identityHint: "poller", identityBasis: "runtime boundary", queryValue: "Find the runtime",
        evidenceIds: ["docs.runtime"], disposition: "concept" as const, suggestedType: "Function" },
      { id: "flow", identityHint: "alerting", identityBasis: "cross-boundary behavior", queryValue: "Trace alerting",
        evidenceIds: ["docs.flow", "docs.runtime"], disposition: "concept" as const, suggestedType: "Flow",
        promotion: { basis: "cross-boundary" as const, evidenceIds: ["docs.flow"] } },
    ],
    semanticObservations: [
      { id: "docs.runtime", candidateId: "runtime", role: "implementation" as const,
        signal: "independently deployed runtime function", source },
      { id: "docs.flow", candidateId: "flow", role: "implementation" as const,
        signal: "end-to-end flow across independently useful concepts", source },
    ],
    resourceObservations: [],
  };
  assert.equal(getOkfAuthoringGuidance(crossBoundary).recommendations[1]?.schema?.type, "Flow");
  assert.equal(getOkfAuthoringGuidance({ ...crossBoundary, candidates: [crossBoundary.candidates[0]!, {
    ...crossBoundary.candidates[1]!, promotion: { basis: "cross-boundary" as const, evidenceIds: ["docs.runtime"] },
  }] }).recommendations[1]?.schema?.type, "Flow");
  assert.equal(getOkfAuthoringGuidance({ ...crossBoundary, candidates: [crossBoundary.candidates[0]!, {
    ...crossBoundary.candidates[1]!, suggestedType: "System" as const,
    promotion: { basis: "operational" as const, evidenceIds: ["docs.runtime"] },
  }] }).recommendations[1]?.schema?.type, "System");
});

test("[AB-SCHEMA-033][AB-SCHEMA-036][AB-SCHEMA-042] detection does not promote non-Lambda resources", () => {
  const unpromoted = getOkfAuthoringGuidance(resource("internal-queue", "aws_sqs_queue")).recommendations[0]!;
  assert.equal(unpromoted.status, "unsupported");
  assert.equal(unpromoted.schema, undefined);
  assert.equal(unpromoted.technology.kind, "message-queue");

  const input = resource("queue", "aws_sqs_queue");
  const result = getOkfAuthoringGuidance({ ...input,
    candidates: [{ ...input.candidates[0]!, suggestedType: "Interface" }],
  });
  assert.equal(result.recommendations[0]?.status, "unsupported");
  assert.equal(result.recommendations[0]?.schema, undefined);
  assert.equal(result.recommendations[0]?.technology.product, "sqs");

  const promoted = getOkfAuthoringGuidance({ ...input,
    candidates: [{ ...input.candidates[0]!, evidenceIds: ["evidence.queue", "docs.contract"],
      suggestedType: "Interface", promotion: { basis: "shared-contract" as const, evidenceIds: ["docs.contract"] } }],
    semanticObservations: [{ id: "docs.contract", candidateId: "queue", role: "documentation" as const,
      signal: "Messages cross the producer and consumer ownership boundary", source }],
  }).recommendations[0]!;
  assert.equal(promoted.status, "suggested");
  assert.equal(promoted.schema?.type, "Interface");

  const promotedResource = getOkfAuthoringGuidance({ ...input,
    candidates: [{ ...input.candidates[0]!, evidenceIds: ["evidence.queue", "docs.operation"],
      suggestedType: "Resource", promotion: { basis: "operational" as const, evidenceIds: ["evidence.queue"] } }],
    semanticObservations: [{ id: "docs.operation", candidateId: "queue", role: "implementation" as const,
      signal: "Runtime writes durable operational state to this boundary", source }],
  }).recommendations[0]!;
  assert.equal(promotedResource.status, "suggested");
  assert.equal(promotedResource.schema?.type, "Resource");

  assert.throws(() => getOkfAuthoringGuidance({ ...input,
    candidates: [{ ...input.candidates[0]!, suggestedType: "Resource",
      promotion: { basis: "operational" as const, evidenceIds: ["evidence.queue"] } }],
  }), /Interface\/Resource promotion requires semantic evidence/);
});

test("[AB-SCHEMA-052][AB-SCHEMA-053][AB-SCHEMA-054] common AWS resources promote only with boundary evidence", () => {
  for (const [resourceType, product, kind] of [
    ["aws_sqs_queue", "sqs", "message-queue"],
    ["aws_sns_topic", "sns", "message-topic"],
    ["aws_cloudwatch_event_bus", "eventbridge", "event-bus"],
    ["aws_s3_bucket", "s3", "object-storage"],
    ["aws_dynamodb_table", "dynamodb", "database-table"],
    ["aws_db_instance", "rds", "database"],
  ] as const) {
    const base = resource(product, resourceType);
    const result = getOkfAuthoringGuidance({
      ...base,
      candidates: [{ ...base.candidates[0]!, evidenceIds: [`evidence.${product}`, `semantic.${product}`], suggestedType: "Resource",
        promotion: { basis: "operational" as const, evidenceIds: [`evidence.${product}`, `semantic.${product}`] } }],
      semanticObservations: [{ id: `semantic.${product}`, candidateId: product, role: "implementation" as const,
        signal: `shared ${product} resource with independent operational lifecycle`, source }],
      resourceObservations: [{ ...base.resourceObservations[0]!, id: `evidence.${product}`, candidateId: product }],
    }).recommendations[0]!;
    assert.equal(result.status, "suggested", resourceType);
    assert.equal(result.schema?.type, "Resource", resourceType);
    assert.equal(result.technology.product, product, resourceType);
    assert.equal(result.technology.kind, kind, resourceType);
  }
});

test("[AB-SCHEMA-052][AB-SCHEMA-053] name-only resource identity remains unsupported", () => {
  const input = resource("orders-queue", "aws_sqs_queue");
  assert.throws(() => getOkfAuthoringGuidance({
    ...input,
    candidates: [{ ...input.candidates[0]!, suggestedType: "Resource",
      promotion: { basis: "operational" as const, evidenceIds: ["evidence.orders-queue"] } }],
  }), /Interface\/Resource promotion requires semantic evidence/);
});

test("[AB-SCHEMA-055] future-provider technology reuses the generic Resource role", () => {
  const input = resource("pubsub", "google_pubsub_topic");
  const result = getOkfAuthoringGuidance({
    ...input,
    candidates: [{ ...input.candidates[0]!, evidenceIds: ["evidence.pubsub", "semantic.pubsub"],
      suggestedType: "Resource", promotion: { basis: "cross-boundary" as const,
        evidenceIds: ["evidence.pubsub", "semantic.pubsub"] } }],
    semanticObservations: [{ id: "semantic.pubsub", candidateId: "pubsub", role: "implementation" as const,
      signal: "shared messaging resource crosses an ownership boundary", source }],
    resourceObservations: [{ ...input.resourceObservations[0]!, id: "evidence.pubsub", candidateId: "pubsub" }],
  }).recommendations[0]!;
  assert.equal(result.status, "suggested");
  assert.equal(result.schema?.type, "Resource");
  assert.equal(result.technology.provider, "google");
  assert.equal(result.providerProfile, undefined);
});

test("[AB-SCHEMA-033][AB-SCHEMA-040] Terraform-family evidence is bounded and source-truthful", () => {
  const result = getOkfAuthoringGuidance(resource("queue", "${var.resource_type}"));
  assert.equal(result.recommendations[0]?.status, "ambiguous");
  assert.match(result.recommendations[0]?.limitations.join(" ") ?? "", /unresolved/);

  const terragrunt = getOkfAuthoringGuidance(resource("stack", "module", "concept", "terragrunt", "live/terragrunt.hcl"));
  assert.equal(terragrunt.recommendations[0]?.technology.sourceTool, "terragrunt");
  assert.deepEqual(terragrunt.recommendations[0]?.detectorProfile, { id: "terraform-family", version: "1.0.0" });

  assert.throws(() => getOkfAuthoringGuidance(
    resource("false-terraform", "aws_lambda_function", "concept", "terraform", "template.yaml"),
  ), /\.tf or \.tf\.json/);
  assert.throws(() => getOkfAuthoringGuidance(
    resource("false-terragrunt", "aws_lambda_function", "concept", "terragrunt", "terragrunt.hcl"),
  ), /referenced Terraform module source/);
});

test("[AB-SCHEMA-031][AB-SCHEMA-035] suggested type accepts only Initial Ingest catalog roles", () => {
  for (const suggestedType of ["Entity", "Metric", "Maintainer Guidance", "AWS Lambda", "Queue"]) {
    assert.throws(() => getOkfAuthoringGuidance({
      candidates: [{ id: "runtime", identityHint: "runtime", identityBasis: "source boundary",
        queryValue: "independent runtime", evidenceIds: ["docs.runtime"], disposition: "concept" as const, suggestedType }],
      semanticObservations: [{ id: "docs.runtime", candidateId: "runtime", role: "documentation" as const, signal: "runtime boundary", source }],
      resourceObservations: [],
    }), /suggested type must name a released Initial Ingest schema/);
  }
});

test("[AB-INGEST-005][AB-SCHEMA-031] source-less evidence is rejected", () => {
  const input = resource("queue", "aws_sqs_queue");
  assert.throws(() => getOkfAuthoringGuidance({ ...input,
    resourceObservations: [{ ...input.resourceObservations[0]!, source: { path: "../secret", startLine: 1, endLine: 1 } }],
  }), /normalized relative path/);
});
