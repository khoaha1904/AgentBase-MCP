import assert from "node:assert/strict";
import test from "node:test";
import { templateDiscovery } from "./template-discovery.ts";

test("[AB-SCHEMA-062] API variants and long-form references are bounded source evidence", () => {
  const result = templateDiscovery(JSON.stringify({ Transform: "AWS::Serverless-2016-10-31", Resources: {
    Api: { Type: "AWS::Serverless::Api" }, Http: { Type: "AWS::Serverless::HttpApi" },
    Native: { Type: "AWS::ApiGatewayV2::Api" }, Queue: { Type: "AWS::SQS::Queue" },
    Worker: { Type: "AWS::Serverless::Function", Properties: { Events: {
      Rest: { Type: "Api", Properties: { RestApiId: { Ref: "Api" }, Path: "/jobs", Method: "post" } },
      Http: { Type: "HttpApi", Properties: { ApiId: { Ref: "Http" } } },
      Jobs: { Type: "SQS", Properties: { Queue: { "Fn::GetAtt": ["Queue", "Arn"] } } },
      Timer: { Type: "ScheduleV2", Properties: { ScheduleExpression: "rate(1 day)" } },
    } } },
  } }));
  assert.deepEqual(result.limitations, []);
  for (const id of ["Api", "Http", "Queue"]) assert.ok(result.hints.some((hint) => hint.text.endsWith(`same-template reference ${id}`)));
  assert.ok(result.hints.some((hint) => hint.text === "Native: AWS::ApiGatewayV2::Api declaration"));
  assert.ok(result.hints.some((hint) => hint.text.includes("ScheduleV2 trigger")));
});

test("[AB-SCHEMA-062] malformed property maps and unsupported Globals remain visible", () => {
  const result = templateDiscovery(`Transform: AWS::Serverless-2016-10-31
Globals:
  Function:
    Environment: {Variables: {MODE: test}}
Resources:
  Worker:
    Type: AWS::Serverless::Function
    Properties: {Events: broken}
  Broken:
    Type: AWS::Lambda::Function
    Properties: broken
`);
  assert.match(result.limitations.join(), /Globals.Function/);
  assert.match(result.limitations.join(), /Events is not a supported mapping/);
  assert.match(result.limitations.join(), /Properties is not a supported mapping/);
});

test("[AB-SCHEMA-062] SAM Globals overrides, triggers and logical references retain source lines", () => {
  const source = `Transform: AWS::Serverless-2016-10-31
Globals:
  Function:
    Runtime: python3.12
    Timeout: 30
Resources:
  Jobs:
    Type: AWS::SQS::Queue
  Worker:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs22.x
      Handler: index.handler
      Events:
        JobsEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt Jobs.Arn
        Daily:
          Type: Schedule
          Properties:
            Schedule: rate(1 day)
`;
  const result = templateDiscovery(source);
  assert.equal(result.limitations.length, 0);
  assert.ok(result.hints.some((hint) => hint.text === "Worker.Runtime=nodejs22.x" && hint.line === 12));
  assert.ok(result.hints.some((hint) => hint.text === "Worker.Timeout=30 (Globals inherited)" && hint.line === 5));
  assert.ok(result.hints.some((hint) => hint.text.includes("same-template reference Jobs") && hint.line === 18));
  assert.ok(result.hints.some((hint) => hint.text.includes("Schedule trigger")));
  assert.equal(result.hints.some((hint) => hint.text.includes("python3.12")), false);
});

test("[AB-SCHEMA-062] unknown templates and dynamic evidence remain limited, never resolved", () => {
  const source = JSON.stringify({ Resources: {
    Worker: { Type: "AWS::Lambda::Function", Condition: "Enabled", Properties: { Runtime: { Ref: "RuntimeParameter" } } },
    Binding: { Type: "AWS::Lambda::EventSourceMapping", Properties: {
      FunctionName: { Ref: "Worker" }, EventSourceArn: { "Fn::ImportValue": "Queue" } } },
    Child: { Type: "AWS::CloudFormation::Stack", Properties: { TemplateURL: "https://example.test/template" } },
  } });
  const result = templateDiscovery(source);
  assert.match(result.limitations.join("\n"), /conditional/);
  assert.match(result.limitations.join("\n"), /expressions are unresolved/);
  assert.match(result.limitations.join("\n"), /unsupported resource/);
  assert.match(result.limitations.join("\n"), /not a resolved/);
  assert.ok(result.hints.some((hint) => hint.text.includes("same-template reference Worker")));
  assert.equal(templateDiscovery("# ordinary YAML").hints.length, 0);
  assert.match(templateDiscovery("Resources:\n  Bucket:\n    Type: AWS::S3::Bucket\n").limitations.join(), /unsupported resource/);
  assert.match(templateDiscovery("Resources: [ AWS::Lambda::Function\n").limitations.join(), /parse failed/);
});
