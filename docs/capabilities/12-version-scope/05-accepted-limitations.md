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

## Platform and Node compatibility

Removing the native graph provider does not expand the release target contract.
Artifact assembly, bundle admission, lifecycle pointers and integration state
still admit only `linux-x64` and `darwin-arm64`. Linux x64 is the qualified CI
boundary; macOS Intel and Windows remain unqualified.

The supported runtime remains Node `>=24.12 <25`. A Node 22 LTS compatibility
probe reaches explicit version guards in the checkout installer and release CI;
passing other tests does not authorize changing `engines` or those guards.

The checkout installer has a direct `node scripts/installation/install.mjs`
entrypoint, so its Bash wrapper is optional. Released installers and stable
launchers still use Bash, and the lifecycle uses filesystem links and POSIX
permissions. Checkout npm/client JavaScript shims now execute with Node on
Windows, and HOME may fall back to USERPROFILE. Windows/macOS source CI runs
the full tests and real stdio smoke; native Windows private-permission handling
and released lifecycle remain unqualified. Direct invocation alone is not
evidence of qualification, and POSIX permission guards are not bypassed.

Before adding macOS Intel or Windows, qualify the target through all four
release owners together, provide an appropriate released installer/launcher,
and verify dependency execution, path/link handling, lifecycle recovery and
client registration on that operating system. Evaluate a wider Node range
separately with installation and release CI evidence. These are proposed future
qualification steps; current release identifiers and runtime bounds are unchanged.
