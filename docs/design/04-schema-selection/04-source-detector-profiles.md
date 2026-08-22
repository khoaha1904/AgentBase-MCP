# 04.04 — Source Detector Profiles

> Trạng thái: Terraform-family Detector v1 implemented.

Detector chấp nhận bounded structured observations và kiểm tra source path:

- Terraform: `.tf` hoặc `.tf.json`;
- Terragrunt: `terragrunt.hcl` và module orchestration;
- exact provider resource phải trỏ tới Terraform declaration tương ứng.

Indirection chưa resolve trả ambiguous; detector không invent name, ARN,
account hoặc region. SAM/CloudFormation/YAML hiện unsupported và không được gắn
nhãn giả thành Terraform/Terragrunt.
