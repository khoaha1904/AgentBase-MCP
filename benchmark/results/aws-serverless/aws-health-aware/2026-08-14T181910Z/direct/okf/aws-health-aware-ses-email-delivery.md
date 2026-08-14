---
title: AWS Health Aware Amazon SES email delivery
type: email-notification-channel
status: draft
benchmark_key: aws-health-aware-ses-email-delivery
repository_id: repository-aws-health-aware-779eb7e1bc7a
provider: Amazon SES
message_format: HTML
sources:
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L160-L169
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L328-L350
  - repository://repository-aws-health-aware-779eb7e1bc7a/handler.py#L353-L377
relationships: []
---

# AWS Health Aware Amazon SES email delivery

When a non-default sender and recipient are configured, alerts are sent through Amazon SES as HTML email; comma-separated recipients are split into SES destination addresses.
