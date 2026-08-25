# 09.09 — Batch Initial Ingest runtime requirements

> Trạng thái: Baseline Batch Initial Ingest và Capability 046 per-member
> SourceSnapshot/Seed/Receipt additions đã implement offline.

- **AB-BATCH-001** — Một batch bind exact Hub base, một confirmed Domain và
  2..32 explicit unique local repository roots; không scan workspace để tìm repo.
  Roots establish selection/identity, while analysis binds the exact accessible
  remote default-branch commit selected during member Preflight.
- **AB-BATCH-002** — Preflight trả matrix per-repository gồm canonical identity,
  bounded README/docs paths, proposed Domain và warnings. Mọi row phải được
  confirm rõ trước authoring.
- **AB-BATCH-003** — Chỉ canonical Repository mới được Init. Existing Repository
  phải chuyển sang Refresh; duplicate/nested/ambiguous roots fail closed. Current
  checkout chỉ được analyze khi clean và exact-match remote default commit; mọi
  trạng thái khác dùng detached worktree/cache, không mutate user workspace.
- **AB-BATCH-004** — Members chạy tuần tự theo manifest order và giữ source,
  graph/evidence, Questions, limitations và staging riêng.
- **AB-BATCH-005** — Truthful sparse member là success. Completeness,
  cross-repository inference và provider verification không phải batch gate.
- **AB-BATCH-006** — Finalize compose exact completed member diffs lên một base.
  Chỉ shared append-only indexes và navigation của confirmed Domain được dựng
  deterministic; mọi authored overlap khác bị reject. Kết quả là một atomic
  `batch-new` proposal.
- **AB-BATCH-007** — Member failure giữ batch Incomplete. Explicit retry reuse
  sibling chỉ khi source/base/input/staging vẫn exact; không hidden retry hoặc
  duplicate append.
- **AB-BATCH-008** — Membership revision tạo immutable manifest revision mới,
  reuse exact checkpoints và để full-bundle validation chặn dangling knowledge.
- **AB-BATCH-009** — Inspect, Accept, pending reconstruction và publication giữ
  toàn batch như một unit với mọi Repository ID; PR độc lập target `main`, không
  split hoặc merge bởi MCP.
- **AB-BATCH-010** — Single-repository Ingest/Refresh và Domain Enrichment không
  đổi. MCP không thêm database, daemon, parallel runner, dependency hoặc model.
- **AB-BATCH-011** — `agentbase-scan` không build graph. Mỗi member tạo/reuse
  graph sau source selection và có isolated Discovery Seed, Inventory Receipt,
  staging và coverage result; evidence của member này không cover member khác.
- **AB-BATCH-012** — Không resolve/access được exact remote default source làm
  member Incomplete; workflow không fallback sang feature/dirty checkout.
- **AB-BATCH-013** — Recoverable member-local semantic/materialization/provider
  failure tiếp tục sequential siblings sau confirmed-clean cleanup. Uncertain
  cleanup/process/shared Hub/source authority failure dừng Batch. Finalize chỉ
  mở khi mọi confirmed member complete hoặc membership được explicit revise.
