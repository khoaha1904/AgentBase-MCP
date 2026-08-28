# 09 — Ingest và Refresh

> Trạng thái: Initial Ingest/Refresh, Batch Initial Ingest, Capability 046
> broad-discovery runtime và Capability 051 reliability hardening đã
> implement; released-skill qualification còn pending.

## Câu trả lời ngắn

```text
Initial Ingest → tạo knowledge ban đầu thành Local Draft
Refresh        → so sánh source với knowledge đã có
               → tạo Local Draft update
```

`Initial Ingest` là lần Ingest đầu tiên của một canonical repository. Từ đó về
sau repository chỉ dùng Refresh. Hai workflow cần một Remote Hub profile active;
chưa config Hub thì AgentBase chỉ dùng Code Graph.

## Scan workspace trước khi chọn workflow

`agentbase-scan` inventory bounded Git repositories trong workspace người dùng
chọn mà không dựng Code Graph. Nó đối chiếu strong repository identity với
Published Hub và hiển thị ngắn:

| State | Suggested action |
|---|---|
| Not in Hub | Initial Ingest |
| Published, source advanced | Refresh |
| Published, source unchanged | No action |
| Init/Refresh Local Draft | Review or submit |
| Init/Refresh open PR | Wait or reconcile |
| Ambiguous fork/mirror/identity | Confirm |

Kết quả kèm last-observed date/revision, rồi chờ người dùng chọn tất cả hoặc một
subset. Scan không tự chạy suggestion. Nhiều repo mới đi vào Batch Initial
Ingest; repo đã Published chạy single Refresh tuần tự. Không có remote Hub thì
Scan chỉ liệt kê local repos và báo Hub classification unavailable.

## Initial Ingest

- Đọc repository lần đầu để tìm concept, relation và evidence.
- Chỉ hỏi các owner decision tối thiểu như Domain; không yêu cầu provider login
  hoặc dừng để điều tra repository khác.
- Batch Ingest vẫn cô lập discovery theo repository và tạo concept, relation
  nội bộ, limitation và Question tự động.
- Match chưa chắc chắn chỉ tạo candidate/Question, không tự merge hoặc tự tạo
  relation xuyên repository.
- Discover kiểm tra năm lane: identity, runtime, interface/event, integration/
  data/channel và deploy/operations. Tín hiệu quan trọng phải được xử lý thành
  `materialized`, Question hoặc ignored có lý do. Concept hay embedded là thuộc
  tính của candidate được chọn, không phải một quyết định lặp lại ở Seed group.
- Completeness toàn repository và số lượng concept không phải success gate.
  Proposal vẫn selective, nhưng không được sparse bằng cách bỏ qua tín hiệu có
  giá trị cao mà không ghi nhận.
- MCP chuẩn bị embedded knowledge trong parent. Agent có thể viết lại nhãn/prose
  cho dễ đọc; Finalize xác nhận nó còn tồn tại bằng exact Receipt evidence, không
  bắt câu chữ phải giống nguyên identity hint. Nếu Agent làm mất cả row,
  Finalize phục hồi row chuẩn từ Receipt thay vì dùng repair budget.

Preflight của Hub Init bind exact remote default-branch commit trước Discover.
Checkout hiện tại chỉ được reuse khi clean và trùng exact commit đó; nếu repo
đang ở feature branch, dirty hoặc khác commit, MCP dùng detached worktree/cache
tạm của AgentBase ngoài source repo và không checkout/stash/sửa workspace. Mọi
Hub-bound Init/Batch/Refresh dùng token Hub trên cùng host qua HTTPS; không dùng
SSH hay ambient Git credential. Scan không build graph. Không có
active Remote Hub thì AgentBase chỉ Scan và dùng source/Code Graph, không tạo
OKF Draft.

Mỗi canonical repository chỉ Initial Ingest một lần. Không có remote lock vì
rủi ro hai máy cùng làm việc này rất thấp. Nếu bị trùng, bản publish trước giữ
vai trò canonical; bản còn lại bị hủy, pull Hub rồi tạo lại thay đổi bằng
Refresh.

## Refresh

- Bắt đầu từ knowledge/evidence đã có để tìm phần mới, thay đổi hoặc không còn
  thấy trong source.
- Chỉ cập nhật contribution của repository đang đọc; không xóa evidence của
  repository khác.
- Không tự xóa knowledge cũ chỉ vì một lần discovery không thấy. Git/source diff
  có thể hỗ trợ một explicit correction/removal proposal, nhưng PR phải
  trình bày reason/evidence để reviewer quyết định.
- Refresh một repository reconcile với Published Hub và exact pending proposal/
  publication chain của chính repository đó khi workflow cho phép; unrelated
  Local Draft không vào ordinary matching. Repository khác không cần có trên máy.
- Mọi kết quả vẫn là Local Draft và đi qua publication lifecycle ở
  [phần 11](11-review-accept-and-publish.md).

Refresh không rebuild Hub, không tự publish và không coi “không tìm thấy” là
bằng chứng chắc chắn rằng knowledge đã sai. Correction/removal theo quy tắc ở
[phần 07](07-conflicts-questions-and-maintainer-guidance.md).

## Trạng thái qualification hiện tại

- Initial Ingest dùng bounded five-stage lifecycle, catalog 7 skeleton/template
  và dừng ở inspectable proposal. Benchmark ECS full-stack bằng Sol tạo 7
  concept hữu ích mà không promote mọi AWS resource.
- Capability 046 giữ nguyên lifecycle/catalog nhưng chuyển từ candidate-only
  validation sang `Discovery Seed → Inventory Receipt → OKF`, đồng thời benchmark
  released skill theo tier tín hiệu thay vì exact concept inventory.
- Khi một Question cần source evidence, AI chỉ chọn candidate và evidence đã
  gửi trong cùng Inventory. MCP tự bind repository URI và exact revision vào
  Receipt; AI không tự ghép provenance string.
- Inventory chỉ giữ quyết định có ý nghĩa: origin group, candidate outputs,
  Question hoặc ignored reason. MCP tự sinh item/QuestionPlan ID, parent mapping
  và internal references; bounded Seed source samples phục vụ review chứ không
  phải allowlist đầy đủ của repository evidence.
- Refresh dùng exact commit diff trước known gaps/discovery, giữ foreign evidence
  và dừng ở proposal. Hai run Terra liên tiếp cập nhật nhất quán health contract
  từ `/status` sang `/health` ở code + Terraform.
- Đây là model policy của benchmark, không phải MCP tự chọn hoặc bắt buộc model
  trong production.

## Domain Enrichment

Sau khi nhiều repository của một Domain đã Published, người dùng có thể chạy
một workflow batch riêng để:

- đọc knowledge và Questions của các repository đã chọn;
- xác minh bounded resource candidates qua provider CLI đã login;
- reconcile identity và bổ sung cross-repository relations;
- trả lời hoặc đưa Questions về trạng thái phù hợp.

Workflow này không phải Ingest hoặc Refresh và không sửa Published Hub trực
tiếp. Nó tạo một Local Draft chung, sau đó đi qua review, PR và merge như mọi
knowledge change khác. Provider calls chỉ nhắm vào candidate liên quan; không
scan mù toàn account hoặc mọi region.

## Qualification Domain Crawler

Trước khi dùng dữ liệu thật để mở rộng Crawler, AgentBase có một qualification
dataset ba repository: pipeline hiện có và hai repository fixture nhỏ mô phỏng
publisher/worker dùng chung một SQS queue. Dataset này chỉ là dữ liệu kiểm thử
tạm thời, không phải canonical Hub và không ghi provider identity giả.

Qualification dùng cùng Published projection, query, Domain site và mock Domain
Enrichment boundaries production; Batch Initial Ingest lifecycle của ba member
được giữ ở E2E deterministic hiện có, còn harness này materialize một Published
fixture source-backed từ đúng các commit đó để đo topology/resource coverage.
Mock provider chỉ trả kết quả CLI xác định để kiểm tra identity matching, retry
và proposal safety; nó không biến giả thuyết thành Published fact. SNS và các
provider khác vẫn ngoài phạm vi slice này.

Success được đo bằng source-backed node/resource/relation coverage, query hit,
HTML build receipt và việc canonical Hub không bị mutate. Nếu thiếu evidence,
report phải ghi rõ limitation thay vì suy diễn topology.

## OKF Freshness

Freshness là warning về tuổi của repository/source contribution, không phải
phán quyết knowledge sai và không liên quan tới graph-cache freshness.

- MCP query có thể hiển thị source revision, thời điểm observed và age.
- Khi current local source đã advance, MCP cảnh báo knowledge được quan sát ở
  revision cũ.
- Local MCP/CLI và scheduled Hub CI dùng cùng derived Repository freshness report.
- Warning không tự Refresh, không ẩn/xóa knowledge và không chặn Publish.
- Report không phải source of truth; nếu lưu vào Hub Git thì đi qua PR, không
  push thẳng `main`.

## Khi một lần chạy thất bại

Failure được cô lập theo repository. Trong batch, checkpoint của repository đã
hoàn thành vẫn được giữ để retry, nhưng toàn batch còn `Incomplete`: chưa có
atomic proposal để query, Accept hoặc Publish.

Lỗi riêng của một member không dừng các member sau nếu cleanup đã được xác nhận
an toàn. Lỗi authority chung, process hoặc cleanup không chắc chắn sẽ dừng cả
batch. Finalize chỉ mở khi mọi member hoàn thành hoặc người dùng sửa membership.

Người dùng có thể retry hoặc bỏ lần chạy lỗi. Retry cập nhật đúng draft cũ,
không tạo concept/relation trùng; khi thành công, MCP chạy lại reconciliation
cần thiết.

Với Init, Hub base đổi trước Finalize thì MCP rematch, cấp Receipt/session mới
nhưng reuse Seed/Inventory cùng source. Normal Refresh không có Receipt; nó chỉ
chạy lại prepare/guidance trên base mới. Không index lại nếu source không đổi;
sau Finalize dùng publication reconciliation. P0 signal chưa
xử lý do source/authority/adapter
failure làm run `Incomplete`; thiếu P1/P2 có thể vẫn `Ready for review` cùng
Question/limitation.

Capability 051 bổ sung một quy tắc vận hành: discovery không được coi một lane
hoặc document là đầy đủ khi provider output bị thiếu, malformed hoặc bị
redact. Ingest vẫn bounded và selective; thông tin bị giới hạn phải xuất hiện
như limitation/Question thay vì biến mất im lặng.

## Canonical repository

Initial Ingest tạo một `Repository ID` ổn định trong Hub. Tên folder và remote
URL không phải identity chính; chúng được giữ làm aliases/evidence.

- Rename, chuyển organization hoặc clone cùng repository ở workspace khác vẫn
  dùng Repository ID cũ và chạy Refresh khi xác minh được lineage/provider ID.
- Fork phát triển độc lập là repository mới và có thể giữ relation `forked-from`.
- Mirror hoặc copy có lineage mơ hồ phải hỏi người dùng trước khi chọn Initial
  Ingest hay Refresh.

## Chưa implement

- Batch Refresh hoặc batch trộn Init/Refresh.
- Provider profiles ngoài bounded AWS/SQS Domain Enrichment hiện tại.
- Persisted freshness report và ordinary-query freshness marks; local report và CI đã có.
- Full repository-identity recovery cho mọi rename/fork/mirror edge case.
