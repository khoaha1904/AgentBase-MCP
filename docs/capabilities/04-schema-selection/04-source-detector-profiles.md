# 04.04 — Source Detector Profiles

> Status: Terraform-family Detector v1 is implemented.

The detector accepts bounded structured observations and checks source paths:

- Terraform: `.tf` or `.tf.json`;
- Terragrunt: `terragrunt.hcl` and module orchestration;
- an exact provider resource must point to the corresponding Terraform
  declaration.

Unresolved indirection returns ambiguous; the detector does not invent a name,
ARN, account or region. SAM/CloudFormation/YAML are unsupported and must not be
falsely labeled Terraform/Terragrunt.
