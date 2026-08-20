import assert from "node:assert/strict";
import test from "node:test";

import { getOkfAuthoringGuidance } from "./guidance.ts";

const source = { path: "infra/main.tf", startLine: 1, endLine: 8 };

function resource(candidateId: string, resourceType: string) {
  return {
    candidates: [{ id: candidateId, identityHint: candidateId, identityBasis: "Terraform address",
      queryValue: "Other concepts link to this resource", evidenceIds: [`evidence.${candidateId}`] }],
    semanticObservations: [],
    resourceObservations: [{ id: `evidence.${candidateId}`, candidateId, sourceTool: "terraform" as const,
      resourceType, address: `module.app.${resourceType}.${candidateId}`, source }],
  };
}

for (const [resourceType, schema, product] of [
  ["aws_instance", "Server", "ec2"],
  ["aws_lambda_function", "Function", "lambda"],
  ["aws_sqs_queue", "Queue", "sqs"],
  ["aws_s3_bucket", "Object Storage", "s3"],
  ["aws_db_instance", "Database", "rds"],
  ["aws_dynamodb_table", "Database Table", "dynamodb"],
] as const) {
  test(`[AB-SCHEMA-031..034] Terraform ${resourceType} maps through AWS profile to ${schema}`, () => {
    const result = getOkfAuthoringGuidance(resource(resourceType.replaceAll("_", "."), resourceType));
    const recommendation = result.recommendations[0]!;
    assert.equal(result.catalogVersion, "6.0.0");
    assert.equal(recommendation.status, "exact");
    assert.equal(recommendation.schema?.type, schema);
    assert.deepEqual(recommendation.detectorProfile, { id: "terraform", version: "1.0.0" });
    assert.deepEqual(recommendation.providerProfile, { id: "aws", version: "1.0.0" });
    assert.equal(recommendation.technology.product, product);
  });
}

test("[AB-SCHEMA-033] unresolved Terraform indirection remains ambiguous", () => {
  const input = resource("queue", "${var.resource_type}");
  const result = getOkfAuthoringGuidance(input);
  assert.equal(result.recommendations[0]?.status, "ambiguous");
  assert.match(result.recommendations[0]?.limitations.join(" ") ?? "", /unresolved/);
});

test("[AB-INGEST-005][AB-SCHEMA-031] source-less or cross-candidate evidence is rejected", () => {
  const input = resource("queue", "aws_sqs_queue");
  assert.throws(() => getOkfAuthoringGuidance({ ...input,
    resourceObservations: [{ ...input.resourceObservations[0]!, source: { path: "../secret", startLine: 1, endLine: 1 } }],
  }), /normalized relative path/);
});
