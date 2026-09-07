import type { ResourceObservation } from "../guidance.ts";
import type { DetectedResource } from "./definition.ts";

export const CLOUDFORMATION_DETECTOR_PROFILE = { id: "cloudformation-family", version: "1.0.0" } as const;

export function detectCloudFormationResource(observation: ResourceObservation): DetectedResource {
  if (!/\.(ya?ml|json|template)$/i.test(observation.source.path)) {
    throw new Error("SAM/CloudFormation observations must cite a YAML, JSON or .template source");
  }
  const resourceType = observation.resourceType.trim();
  const address = observation.address.trim();
  if (observation.sourceTool === "sam" && !resourceType.startsWith("AWS::Serverless::")
    || observation.sourceTool === "cloudformation" && resourceType.startsWith("AWS::Serverless::")) {
    throw new Error("SAM/native CloudFormation source tool must match the declared resource Type");
  }
  const base = { resourceType, sourceTool: observation.sourceTool };
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(address) || !/^AWS::[A-Za-z0-9]+::[A-Za-z0-9]+$/.test(resourceType)) {
    return { ...base, status: "ambiguous", limitations: ["template resource Type or logical ID is unresolved"] };
  }
  return { ...base, status: "exact", provider: "aws", limitations: [] };
}
