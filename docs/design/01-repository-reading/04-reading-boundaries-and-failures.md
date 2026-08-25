# 01.04 — Reading boundaries and failures

> Trạng thái: Baseline implemented; Capability 046 remote-default Init isolation
> và bounded discovery census đã approved, implementation pending.

## Reading authority

- Một Git monorepo bind một graph ở Git root; project con là scope/path bên
  trong graph đó.
- Thư mục cha chứa nhiều Git repository độc lập chỉ là routing scope, không phải
  repository root hoặc graph identity.
- Một evidence round bind đúng một admitted source root và exact revision.
- Ordinary query/source work dùng repository local đã được chọn. Hub Init bind
  remote default commit ở Preflight; current checkout chỉ reuse khi clean và
  exact-match, còn lại dùng detached worktree/cache tạm mà không checkout/stash
  workspace người dùng.
- Source read phải ở trong admitted root; không follow path/symlink thoát ra ngoài.
- Không tự clone remote repository hoặc mở rộng từ repo sang cả workspace.
- Không tự recursive scan máy/workspace để tìm repository ngoài phạm vi người
  dùng đã mở hoặc chỉ định.
- Explicit `agentbase-scan` được phép inventory bounded Git roots bên trong đúng
  workspace người dùng chọn. Nó dừng tại mỗi Git root, không đọc sâu source và
  không index Code Graph; đây không phải background/arbitrary scan.
- Multi-repository command truyền danh sách root rõ ràng và xử lý mỗi root như
  một unit riêng; phần 09 sở hữu batch orchestration.

## Bounded discovery census

Capability 046 Discover kiểm kê root README, primary manifests, API specs,
Terraform/Terragrunt, Docker/deploy, CI/runtime config và graph-derived entrypoint,
route/event/trigger, boundary, integration/data/channel groups. `docs/` chỉ được
inspect index/filename/heading trước rồi đọc sâu tài liệu liên quan; generated,
vendor và build output bị loại, lockfile chỉ là hint. Seed giữ compact groups,
counts và bounded source samples thay vì raw graph/source inventory.

## Partial fallback

Graph là discovery accelerator, không phải điều kiện duy nhất để exact source
trở thành evidence:

- graph thiếu coverage một vùng thì Agent dùng bounded source search/read ở vùng
  đó;
- file hoặc language không được provider hỗ trợ có thể dùng docs/config/source
  trực tiếp;
- mọi fallback claim vẫn cần exact source reference;
- proposal ghi rõ coverage limitation và tạo Question khi phần thiếu có thể làm
  thay đổi knowledge quan trọng.

Partial result không được mô tả như full repository coverage. Missing graph row
không chứng minh một concept/relation không tồn tại.

## Failure outcomes

### Tiếp tục với partial Draft

- graph query bị truncate hoặc một vùng unsupported;
- một candidate không resolve được nhưng candidate khác có exact evidence;
- source search fallback cung cấp bounded evidence;
- failure chỉ làm giảm completeness, không phá source integrity.

### Dừng repository run

- repository/source authority không hợp lệ;
- Hub Init không resolve/access được exact remote default branch;
- source thay đổi trong lúc evidence round đang chạy;
- provider cleanup không xác định được;
- không còn exact evidence đáng tin nào để tạo useful Draft;
- evidence/proposal state không thể validate hoặc recovery an toàn.

Batch run không rollback Draft hoàn chỉnh của repository khác. Repository lỗi có
failure report riêng và có thể retry; phần 09 quyết định checkpoint/idempotency.

## Baseline impact

Boundary, mutation detection và cleanup hiện tại được giữ nguyên. Graph round
trả partial cùng limitations khi evidence provider hỗ trợ một phần; integrity,
source mutation và runtime/cleanup failure vẫn dừng run. Không cần provider
rewrite hoặc một recovery framework riêng.
