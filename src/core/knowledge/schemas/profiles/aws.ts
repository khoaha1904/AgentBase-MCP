import type { ProviderResourceMapping } from "./definition.ts";

export const AWS_PROVIDER_PROFILE = { id: "aws", version: "2.0.0" } as const;

const mappings: readonly ProviderResourceMapping[] = [
  { resourceType: "aws_instance", product: "ec2", technologyKind: "compute-host" },
  { resourceType: "aws_lambda_function", product: "lambda", technologyKind: "runtime-function" },
  { resourceType: "aws_sqs_queue", product: "sqs", technologyKind: "message-queue" },
  { resourceType: "aws_sns_topic", product: "sns", technologyKind: "message-topic" },
  { resourceType: "aws_cloudwatch_event_bus", product: "eventbridge", technologyKind: "event-bus" },
  { resourceType: "aws_s3_bucket", product: "s3", technologyKind: "object-storage" },
  { resourceType: "aws_db_instance", product: "rds", technologyKind: "database" },
  { resourceType: "aws_dynamodb_table", product: "dynamodb", technologyKind: "database-table" },
];

export function mapAwsResource(resourceType: string): ProviderResourceMapping | undefined {
  return mappings.find((mapping) => mapping.resourceType === resourceType);
}

export function listAwsResourceMappings(): readonly ProviderResourceMapping[] {
  return mappings;
}
