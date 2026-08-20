import type { ProviderResourceMapping } from "./definition.ts";

export const AWS_PROVIDER_PROFILE = { id: "aws", version: "1.0.0" } as const;

const mappings: readonly ProviderResourceMapping[] = [
  { resourceType: "aws_instance", product: "ec2", schemaType: "Server" },
  { resourceType: "aws_lambda_function", product: "lambda", schemaType: "Function" },
  { resourceType: "aws_sqs_queue", product: "sqs", schemaType: "Queue" },
  { resourceType: "aws_s3_bucket", product: "s3", schemaType: "Object Storage" },
  { resourceType: "aws_db_instance", product: "rds", schemaType: "Database" },
  { resourceType: "aws_dynamodb_table", product: "dynamodb", schemaType: "Database Table" },
];

export function mapAwsResource(resourceType: string): ProviderResourceMapping | undefined {
  return mappings.find((mapping) => mapping.resourceType === resourceType);
}

export function listAwsResourceMappings(): readonly ProviderResourceMapping[] {
  return mappings;
}
