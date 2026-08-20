import type { ResourceObservation } from "../guidance.ts";
import type { DetectedResource } from "./definition.ts";

export const TERRAFORM_DETECTOR_PROFILE = { id: "terraform", version: "1.0.0" } as const;

export function detectTerraformResource(observation: ResourceObservation): DetectedResource {
  const resourceType = observation.resourceType.trim().toLowerCase();
  const address = observation.address.trim();
  if (!resourceType || !address || /\$\{|\bvar\./.test(resourceType) || /\$\{|\bvar\./.test(address)) {
    return {
      status: "ambiguous",
      resourceType,
      sourceTool: "terraform",
      limitations: ["Terraform resource type or address is unresolved"],
    };
  }
  if (resourceType === "module") {
    return { status: "exact", resourceType, sourceTool: "terraform", limitations: [] };
  }
  const provider = resourceType.match(/^([a-z0-9]+)_/)?.[1];
  if (!provider) return {
    status: "unsupported", resourceType, sourceTool: "terraform",
    limitations: ["Terraform resource type has no supported provider prefix"],
  };
  return { status: "exact", provider, resourceType, sourceTool: "terraform", limitations: [] };
}
