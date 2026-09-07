import type { ProviderResourceMapping } from "./definition.ts";

export const AWS_PROVIDER_PROFILE = { id: "aws", version: "2.1.0" } as const;

const mappings: readonly ProviderResourceMapping[] = [
  { resourceType: "aws_instance", product: "ec2", technologyKind: "compute-host" },
  { resourceType: "aws_lambda_function", product: "lambda", technologyKind: "runtime-function" },
  { resourceType: "aws_sqs_queue", product: "sqs", technologyKind: "message-queue" },
  { resourceType: "aws_sns_topic", product: "sns", technologyKind: "message-topic" },
  { resourceType: "aws_cloudwatch_event_bus", product: "eventbridge", technologyKind: "event-bus" },
  { resourceType: "aws_s3_bucket", product: "s3", technologyKind: "object-storage" },
  { resourceType: "aws_db_instance", product: "rds", technologyKind: "database" },
  { resourceType: "aws_dynamodb_table", product: "dynamodb", technologyKind: "database-table" },
  { resourceType: "aws_ecs_service", product: "ecs", technologyKind: "runtime-service" },
  { resourceType: "aws_ecs_task_definition", product: "ecs", technologyKind: "task-definition" },
  { resourceType: "aws_api_gateway_rest_api", product: "apigateway", technologyKind: "api" },
  { resourceType: "aws_apigatewayv2_api", product: "apigateway", technologyKind: "api" },
  { resourceType: "aws_api_gateway_resource", product: "apigateway", technologyKind: "api-resource" },
  { resourceType: "aws_api_gateway_method", product: "apigateway", technologyKind: "api-route" },
  { resourceType: "aws_apigatewayv2_route", product: "apigateway", technologyKind: "api-route" },
  { resourceType: "aws_api_gateway_integration", product: "apigateway", technologyKind: "api-integration" },
  { resourceType: "aws_apigatewayv2_integration", product: "apigateway", technologyKind: "api-integration" },
  { resourceType: "aws_lambda_event_source_mapping", product: "lambda", technologyKind: "event-source-mapping" },
  { resourceType: "AWS::Serverless::Function", product: "lambda", technologyKind: "runtime-function" },
  { resourceType: "AWS::Lambda::Function", product: "lambda", technologyKind: "runtime-function" },
  { resourceType: "AWS::Serverless::Api", product: "apigateway", technologyKind: "api" },
  { resourceType: "AWS::Serverless::HttpApi", product: "apigateway", technologyKind: "api" },
  { resourceType: "AWS::ApiGateway::RestApi", product: "apigateway", technologyKind: "api" },
  { resourceType: "AWS::ApiGatewayV2::Api", product: "apigateway", technologyKind: "api" },
  { resourceType: "AWS::ApiGateway::Resource", product: "apigateway", technologyKind: "api-resource" },
  { resourceType: "AWS::ApiGateway::Method", product: "apigateway", technologyKind: "api-route" },
  { resourceType: "AWS::ApiGatewayV2::Route", product: "apigateway", technologyKind: "api-route" },
  { resourceType: "AWS::ApiGatewayV2::Integration", product: "apigateway", technologyKind: "api-integration" },
  { resourceType: "AWS::SQS::Queue", product: "sqs", technologyKind: "message-queue" },
  { resourceType: "AWS::Lambda::EventSourceMapping", product: "lambda", technologyKind: "event-source-mapping" },
];

export function mapAwsResource(resourceType: string): ProviderResourceMapping | undefined {
  return mappings.find((mapping) => mapping.resourceType === resourceType);
}

export function listAwsResourceMappings(): readonly ProviderResourceMapping[] {
  return mappings;
}
