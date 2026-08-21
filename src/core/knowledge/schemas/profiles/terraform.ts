import type { ResourceObservation } from "../guidance.ts";
import type { DetectedResource } from "./definition.ts";

export const TERRAFORM_FAMILY_DETECTOR_PROFILE = { id: "terraform-family", version: "1.0.0" } as const;

export function detectTerraformResource(observation: ResourceObservation): DetectedResource {
  const resourceType = observation.resourceType.trim().toLowerCase();
  const address = observation.address.trim();
  const path = observation.source.path.toLowerCase();
  if (observation.sourceTool === "terraform" && !path.endsWith(".tf") && !path.endsWith(".tf.json")) {
    throw new Error("Terraform resource observation must cite a .tf or .tf.json source");
  }
  if (observation.sourceTool === "terragrunt" && path.split("/").at(-1) !== "terragrunt.hcl") {
    throw new Error("Terragrunt resource observation must cite terragrunt.hcl");
  }
  if (observation.sourceTool === "terragrunt" && resourceType !== "module") {
    throw new Error("Terragrunt provider resources must cite the referenced Terraform module source");
  }
  if (!resourceType || !address || /\$\{|\bvar\./.test(resourceType) || /\$\{|\bvar\./.test(address)) {
    return {
      status: "ambiguous",
      resourceType,
      sourceTool: observation.sourceTool,
      limitations: ["Terraform-family resource type or address is unresolved"],
    };
  }
  if (resourceType === "module") {
    return { status: "exact", resourceType, sourceTool: observation.sourceTool, limitations: [] };
  }
  const provider = resourceType.match(/^([a-z0-9]+)_/)?.[1];
  if (!provider) return {
    status: "unsupported", resourceType, sourceTool: observation.sourceTool,
    limitations: ["Terraform resource type has no supported provider prefix"],
  };
  return { status: "exact", provider, resourceType, sourceTool: observation.sourceTool, limitations: [] };
}
