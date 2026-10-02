# 12.05 — Accepted MVP limitations

- Local Draft has no remote backup before publication.
- Source discovery binds the exact repository selected by Initial Ingest
  Preflight; no auto-clone or Code Graph.
- Initial Ingest has no remote claim/lock; duplicate unpublished work is handled
  by people, and the later duplicate is canceled/restarted as Refresh.
- Relation discovery can miss indirect links without shared identity evidence.
- Refresh reads one repository and never silently deletes missing knowledge.
- Hub has one read trust boundary, no Domain/field ACL.
- Structured IaC supports Terraform/Terragrunt and bounded SAM/CloudFormation;
  unsupported resources and dynamic expressions remain limitations (section 04).
- Query overlay, freshness marks in ordinary search/read, persisted freshness
  reports and remote source reading are absent; snapshot age, local reporting
  and scheduled CI exist. Remote source reading is first post-phase priority.
- Without a configured remote Hub, Hub query/Ingest/Refresh/Draft operations are
  unavailable; schema guidance and bounded workspace Scan remain usable.
- Review is structured text/diff; no generated HTML graph UI.
- Accepted private proposal artifacts are retained; no cleanup scheduler.

These limitations must degrade visibly or preserve knowledge. They do not permit
the Agent to guess, publish automatically, hide conflicts or turn incomplete
coverage into hard failure.
