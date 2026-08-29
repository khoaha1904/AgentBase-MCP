# 04.03 — Cloud Provider Profiles

> Status: AWS Profile v2 is implemented; other providers are deferred.

The AWS Profile normalizes EC2/VM, Lambda, SQS, SNS, EventBridge, S3, RDS and
DynamoDB into technology metadata. A Lambda with independent runtime evidence
may map exactly to Function. Other resources default to embedded and do not
select Server/Queue/Table/Bucket schemas automatically.

A profile is a deterministic, versioned data contract. It does not log into a
cloud, store credentials, call a provider CLI or turn official docs into
repository evidence. Azure/GCP need their own profiles and conformance while
reusing the same catalog roles.
