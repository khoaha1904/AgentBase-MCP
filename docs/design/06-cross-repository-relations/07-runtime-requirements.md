# 06.07 — Domain Enrichment runtime requirements

> Trạng thái: AWS/SQS slice đầu tiên đã implement và có deterministic offline E2E.

- **AB-ENRICH-001** — Một run bind exact remote Published Hub commit, một
  confirmed Domain, 1–32 Published Repository IDs, exact candidates/Question
  revisions và released profile versions. Local pending commits và open PRs
  không phải input.
- **AB-ENRICH-002** — Provider access chỉ bắt đầu sau khi user xác nhận session
  AWS CLI đã login, expected account và bounded regions. MCP không login, đọc/
  lưu credential, đổi config/profile hoặc dùng default region làm knowledge.
- **AB-ENRICH-003** — AWS provider chỉ expose released typed read-only profiles,
  direct argv không qua shell. Arbitrary executable/command/flag và account,
  service hoặc unspecified-region enumeration bị cấm.
- **AB-ENRICH-004** — Provider success chỉ admit normalized safe observation có
  authority, location, native identity, allowlisted fields, profile version,
  time và digest. Raw output, credential context và secret-like value không vào
  private checkpoint, proposal hoặc Hub.
- **AB-ENRICH-005** — Strong identity dùng released provider key. Same name/
  variable/label không đủ; identity match không tự tạo relation nếu thiếu
  independent interaction evidence.
- **AB-ENRICH-006** — Candidates chạy tuần tự và kết thúc `confirmed`,
  `rejected`, `unresolved` hoặc `failed`. `unresolved` là truthful terminal
  outcome; `failed` cần explicit retry hoặc manifest revision.
- **AB-ENRICH-007** — Question resolution tách automatic factual result,
  recommended maintainer confirmation và direct maintainer input. Chỉ selected
  `human:*` answer tạo Guidance; defer giữ Question Open.
- **AB-ENRICH-008** — Finalize tạo đúng một immutable Domain Enrichment proposal
  cho exact manifest. Nó có thể thêm safe observations, identities, evidenced
  relations và Question/Guidance changes nhưng không auto-merge concepts,
  Accept, Publish hoặc mutate provider resources.
- **AB-ENRICH-009** — Accept/publication reuse existing reviewed lifecycle với
  explicit Domain + Repository set và target Published `main`. Base/revision/
  dependency drift phải stop hoặc revalidate; membership không đổi ngầm.
- **AB-ENRICH-010** — Missing CLI/login/scope, access denied và not found giữ
  existing knowledge cùng limitation. Protocol, timeout, integrity hoặc unsafe
  output không admit partial observation.
- **AB-ENRICH-011** — Fixture-only qualification MAY inject a deterministic
  process runner/adapter that follows the released SQS argv and normalized
  response contract; production MCP tools MUST continue using the real bounded
  provider adapter.
- **AB-ENRICH-012** — Cross-repository hypotheses MUST retain source/evidence
  ownership and confidence. A guessed queue name, ARN or relation MUST remain a
  candidate/Question until an accepted provider observation or maintainer answer
  resolves it.
- **AB-ENRICH-013** — Mock observations MUST run against an ephemeral or
  explicitly test-scoped Published fixture and MUST NOT be admitted as current
  provider truth or published to the canonical Hub.
- **AB-ENRICH-014** — Mock qualification MUST exercise deterministic confirmed,
  rejected, unresolved/failed and retry outcomes without network calls, real
  credentials or account-wide enumeration.

AWS v1 chỉ release `aws.sts.caller-identity@1` và `aws.sqs.queue@1`. Azure/GCP,
account scan, concept redirect/merge, background enrichment và provider lookup
trong ordinary query vẫn deferred.
