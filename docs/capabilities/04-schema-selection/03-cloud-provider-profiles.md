# 04.03 — Cloud Provider Profiles

> Status: AWS Profile v2.1 implements bounded Terraform and SAM/CloudFormation
> mappings. Other providers are deferred.

The additive mapping set is `aws_ecs_service` (ecs/runtime-service),
`aws_ecs_task_definition` (ecs/task-definition), `aws_api_gateway_rest_api`,
`aws_apigatewayv2_api` (apigateway/api), `aws_api_gateway_resource`
(apigateway/api-resource), `aws_api_gateway_method`, `aws_apigatewayv2_route`
(apigateway/api-route), `aws_api_gateway_integration`,
`aws_apigatewayv2_integration` (apigateway/api-integration), and
`aws_lambda_event_source_mapping` (lambda/event-source-mapping).
SAM Function and native Lambda Function map to lambda/runtime-function;
SAM Api/HttpApi and native RestApi/V2 Api map to apigateway/api. Native
ApiGateway Resource, Method/V2 Route and V2 Integration share api-resource,
api-route and api-integration roles. SQS Queue maps to sqs/message-queue and
Lambda EventSourceMapping to lambda/event-source-mapping. Original AWS Type
and logical ID remain source metadata, not physical resource identity.
Only runtime-function evidence selects Function exactly. A task definition is
not evidence of a running service, an API declaration does not imply an
independent Interface, and event-source mapping metadata does not automatically
create a relationship. Existing promotion and embedding gates still apply.

The AWS Profile normalizes EC2/VM, Lambda, SQS, SNS, EventBridge, S3, RDS and
DynamoDB into technology metadata. A Lambda with independent runtime evidence
may map exactly to Function. Other resources default to embedded and do not
select Server/Queue/Table/Bucket schemas automatically.

A profile is a deterministic, versioned data contract. It does not log into a
cloud, store credentials, call a provider CLI or turn official docs into
repository evidence. Azure/GCP need their own profiles and conformance while
reusing the same catalog roles.
