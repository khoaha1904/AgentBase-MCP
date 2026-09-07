# 04.04 — Source Detector Profiles

> Status: Terraform-family and CloudFormation-family Detectors v1 are implemented.

The detector accepts bounded structured observations and checks source paths:

- Terraform: `.tf` or `.tf.json`;
- Terragrunt: `terragrunt.hcl` and module orchestration;
- an exact provider resource must point to the corresponding Terraform
  declaration.

Unresolved indirection returns ambiguous; the detector does not invent a name,
ARN, account or region. SAM/CloudFormation must not be labeled Terraform.

## SAM/CloudFormation source scope

The source observation boundary admits `sam` and `cloudformation`, citing
`.yaml`, `.yml`, `.json` or `.template`, with an AWS resource Type and logical
resource ID (not a physical ARN). SAM-owned types require `sam`; native AWS
types require `cloudformation` even inside a SAM template. Unknown types stay
unsupported/provider-neutral rather than being guessed into another type.
The detector validates observation shape; actual declaration/source matching
remains the authoring evidence boundary, not proof supplied by a file suffix.

The bounded template census is implemented separately from observation mapping.
It must recognize SAM Function/Api/HttpApi, native Lambda/API Gateway/SQS and
event source declarations. Initial Globals support is limited to scalar
Function Handler, Runtime, CodeUri, Timeout and MemorySize with local override;
all other Globals properties are explicitly outside this first pass. Event
types Api, HttpApi, SQS, Schedule and ScheduleV2 remain parent-owned evidence.
Direct Ref/GetAtt resolve only to logical IDs in the same template; no physical
values, cross-stack resolution or IAM-derived interaction. Conditions, macros,
unresolved intrinsics and parse failures stay visible limitations. No execution
or remote reads. A candidate mixing detector families is ambiguous; qualify its
observations separately rather than attributing them to one detector profile.
