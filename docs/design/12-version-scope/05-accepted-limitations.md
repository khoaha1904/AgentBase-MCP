# 12.05 — Accepted MVP limitations

- Local Draft has no remote backup before publication.
- One MCP connection binds one explicit local repository; no auto-clone or
  cross-repository Code Graph.
- Initial Ingest has no remote claim/lock; duplicate unpublished work is handled
  by people, and the later duplicate is canceled/restarted as Refresh.
- Relation discovery can miss indirect links without shared identity evidence.
- Refresh reads one repository and never silently deletes missing knowledge.
- Hub has one read trust boundary, no Domain/field ACL.
- Structured IaC is Terraform/Terragrunt only; SAM/CloudFormation is rejected.
- Query overlay, freshness warnings/CI and remote source reading are absent.
- Review is structured text/diff; no generated HTML graph UI.
- Accepted private proposal artifacts are retained; no cleanup scheduler.

Các giới hạn này phải degrade visibly hoặc preserve knowledge. Chúng không cho
phép Agent đoán, tự publish, ẩn conflict hay biến incomplete coverage thành hard
failure.
