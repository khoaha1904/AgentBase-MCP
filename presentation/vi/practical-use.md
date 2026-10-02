# AgentBase trong thực tế: độ bao quát và hội thoại mẫu

Đối chiếu working source sau khi bỏ codebase-memory; tag 0.1.0 cũ không thay đổi.
Đây là tài liệu hình dung cách dùng, không
phải transcript chạy thật hay benchmark chất lượng. Không bổ sung slide hoặc
thay đổi HTML hiện tại.

## Đọc mục nào?

- [Độ bao quát](#độ-bao-quát): backend, serverless, hạ tầng và giới hạn.
- [Discover a feature](#1-discover-a-feature): hiểu nghiệp vụ từ Hub.
- [Kiểm tra implementation](#2-kiểm-tra-implementation): đi từ Hub về code.
- [Lên plan](#3-lên-plan-thay-đổi-feature): bổ sung context cho workflow khác.
- [Add repository](#4-add-repository): đưa repo mới vào Hub.
- [Update knowledge](#5-update-knowledge): cập nhật code đã thay đổi.
- [Bổ sung dữ liệu thiếu](#6-bổ-sung-dữ-liệu-thiếu): không cần ingest lại từ đầu.
- [Nhiều repo và AWS](#7-nhiều-repo-và-aws): phân biệt Batch và Enrichment.
- [Domain site](#8-domain-site): xuất hình dung hệ thống.

## Độ bao quát

Phải phân biệt ba tầng: **census tìm tín hiệu trong source text**, **agent đọc và
tổng hợp kiến thức có bằng chứng**, và **provider kiểm tra tài nguyên thật**.
AgentBase không còn parser profile hoặc graph engine. Census chỉ gợi ý nơi cần
đọc; agent dùng công cụ đọc/tìm kiếm của host để điều tra tiếp.

| Bài toán | Hiện có | Không nên hứa |
|---|---|---|
| Backend JS/TS, Python, Java, Go, C#/.NET, Kotlin | Census chọn một số source files; agent đọc source/docs để tìm runtime, interface, data, operations | Hiểu đầy đủ mọi framework, DI/reflection, call graph động hoặc business rule |
| Backend PHP, Ruby, Rust, C/C++, Groovy | Agent có thể đọc source được cho phép; các đuôi file này chưa được census tự chọn | Discovery tự động ngang các đuôi file đã chọn; ingest chắc chắn thành công |
| Serverless | Tín hiệu handler/trigger từ source và cấu hình; Function/dependency được mô tả khi đủ bằng chứng | Bao quát mọi handler, custom runtime hoặc hỗ trợ end-to-end |
| Terraform `.tf`, `.tf.json`; Terragrunt | Tín hiệu source và observation Terraform-family có exact source; Terragrunt nhận module orchestration | Evaluate mọi module/variable hoặc chứng minh trạng thái deployed |
| Dockerfile, Bash, YAML, JSON | Census đọc tín hiệu build/deploy/config | Hiểu toàn bộ semantics Kubernetes, Helm hoặc CloudFormation |
| CDK/Pulumi | Agent đọc source và tổng hợp có dẫn nguồn | Có adapter cấu trúc tài nguyên tương đương Terraform hoặc đã synth/preview |
| SAM/basic CloudFormation | Mapping Function, API, SQS và event-source; census đọc API/SQS/schedule events, một số Globals scalar và Ref/GetAtt trong cùng template | Evaluate macro, nested stack, cross-stack, mọi intrinsic hoặc trạng thái deployed |
| Serverless Framework, Kubernetes/Helm | YAML/JSON/source hỗ trợ điều tra bằng chứng | Có resource mapping chuyên biệt hoặc cloud verification tổng quát |
| Azure Bicep hoặc IaC khác | Agent đọc source được cho phép; census không tự chọn Bicep | Bao phủ Azure/GCP chỉ vì Terraform nhận ra provider prefix |
| Kiểm chứng AWS thật | Domain Enrichment: xác nhận account bằng STS, đọc exact SQS candidates | Scan account, kiểm tra Lambda/ECS/RDS thật, mọi event bus hoặc tự nối toàn domain |

Census chọn các đuôi source/config phổ biến cùng README, manifest và file
build/deploy. Đây là bộ lọc file và tín hiệu heuristic, không phải danh sách
ngôn ngữ được parse hoặc tỷ lệ bao phủ backend. Giới hạn được trả về trong Seed;
symbol, quan hệ gọi hàm và dispatch của framework không được phân giải.

Mapping AWS bao gồm nhóm EC2, Lambda, queue/topic, storage/database và mở rộng
Terraform ECS/API Gateway/event-source, cùng SAM/basic CloudFormation.
Đây là mapping evidence sang vai trò knowledge, không phải API kiểm tra cloud;
cũng không buộc mỗi resource thành một concept. Danh sách và giới hạn chính xác
nằm ở [provider profile](../../docs/capabilities/04-schema-selection/03-cloud-provider-profiles.md).

Census mặc định đọc tối đa 256 file, mỗi file tối đa 64 KiB, sau khi duyệt tối đa
4.096 entries. Nếu bỏ sót bằng chứng quan trọng, agent có thể đề nghị một lượt
1024 file và chỉ mở rộng sau khi bạn đồng ý, trước khi đóng băng Receipt.
Không tự tăng budget hay ingest lại Hub.

**Backend nhiều service:** một repo có thể chứa nhiều runtime độc lập. AgentBase
có thể giữ chúng thành Component/Function riêng; module nội bộ, queue, table
thường nằm trong dossier của runtime cha. Nhưng tìm đủ các runtime vẫn phụ
thuộc evidence và model, không phải bảo đảm của schema.

**Đánh giá thực dụng:** phù hợp nhất để pilot domain có JS/TS/Python/Java/Go,
docs và Terraform AWS. Chưa nên giới thiệu là công cụ hiểu sâu mọi backend hay
mọi cloud. Chưa có benchmark model chứng minh chất lượng ngang nhau theo ngôn
ngữ. Release hiện chỉ qualified Linux x64; bỏ binary provider chưa xác lập hỗ
trợ Windows hoặc macOS.

## Quy ước hội thoại

Các khung dưới dùng cột trái **Agent**, cột phải **Bạn**, đọc từ trên xuống.
Tin đầu luôn là bạn gọi skill ở bên phải. Markdown không giả lập UI desktop
pixel-perfect, nhưng giữ đúng thứ tự và hai phía hội thoại.

Domain `orders`, tên feature, đường dẫn và kết quả đều là ví dụ giả định.
`<commit>`, `<path>`, `<proposal>` và `<digest>` phải được thay bằng kết quả
thật; không có số liệu hay quan hệ nào dưới đây là bằng chứng sản phẩm.
Giả định đã cài MCP/skills và kết nối Hub; token chỉ nhập trong terminal, không
đưa vào chat. Tên `$skill` là nội dung gọi workflow, không phải shell command;
cách chọn skill cụ thể phụ thuộc host.

## 1. Discover a feature

`fpt-discover` ở đây là tên giả định cho skill explore feature của công ty,
không phải skill do AgentBase cung cấp hoặc đã được cài trong repo này. Chưa
đọc contract của skill công ty nên đây chỉ là minh hoạ cách phối hợp: nó dẫn
dắt discovery; `agentbase-query` bổ sung Published evidence vào cùng deliverable.

| Agent | Bạn |
|:---|---:|
| | `$fpt-discover` Explore feature xử lý đơn hàng. Dùng `$agentbase-query` lấy context domain `orders` từ Hub. Tôi muốn hiểu mục đích, luồng chính, repo liên quan và điều chưa rõ. Chưa đọc code. |
| Tôi dùng workflow discovery để tổ chức kết quả; AgentBase cung cấp evidence, không tạo thêm một báo cáo riêng. Theo Published `<commit>`, feature gồm API nhận đơn và worker xử lý bất đồng bộ. Tài liệu `<path>` mô tả luồng API → queue → worker. Chưa có bằng chứng về retry sau lỗi thanh toán. | |
| Đây là snapshot đã Published, chưa kiểm tra source hiện tại; freshness `unknown`. Tôi chưa đọc hoặc clone repo nào. | |
| | Vậy đổi format message có thể ảnh hưởng ai? |
| Theo các quan hệ đã ghi nhận: API producer và worker consumer. Đây là danh sách đã biết, không phải toàn bộ consumer thực tế. Muốn kết luận impact hiện tại cần kiểm tra source được cho phép. | |

Kết quả: một deliverable discovery của `fpt-discover`, có evidence từ AgentBase
và những điểm chưa chắc; không thay đổi Hub/source. Chỉ gọi `fpt-discover`
không mặc định kích hoạt AgentBase: ví dụ gọi rõ cả hai skill để không giả định
công ty đã có cơ chế handoff tích hợp.

## 2. Kiểm tra implementation

| Agent | Bạn |
|:---|---:|
| | `$agentbase-query` Kiểm tra implementation xử lý đơn trong checkout `/work/orders-api`. Đọc code repo này để đối chiếu Hub; chưa sửa gì. |
| Tôi sẽ dùng công cụ đọc/tìm kiếm của host để kiểm tra exact source trong checkout được chỉ định. Quan hệ Hub không cấp quyền đọc thêm checkout khác. | |
| Source `<file:lines>` ở `<revision>` có thêm nhánh validation chưa được mô tả tại `<Hub path>`. Đây là khác biệt có bằng chứng; chưa đủ để kết luận các repo khác không bị ảnh hưởng. | |
| | Chuẩn bị cập nhật đúng phần validation thiếu đó vào Hub. |
| Tôi chuyển sang Update knowledge cho repo và gap vừa duyệt. Tôi sẽ dừng ở proposal để bạn xem; chưa Publish. | |

Kết quả: câu trả lời có source cụ thể; sửa knowledge chỉ bắt đầu sau đồng ý.

## 3. Lên plan thay đổi feature

| Agent | Bạn |
|:---|---:|
| | Tôi đang lên plan thêm hủy đơn. `$agentbase-query` Bổ sung context domain `orders` vào plan: luồng hiện tại, ràng buộc, repo liên quan và câu hỏi còn mở. Chưa viết code. |
| Tôi sẽ lấy bằng chứng phù hợp từ Hub và đưa vào plan đang làm, không tạo thêm một báo cáo AgentBase trùng lặp. | |
| Plan nên xác nhận quyền hủy, trạng thái có thể hủy và tương tác worker đang xử lý. Hub hỗ trợ `<claims + paths>`; các mục còn lại là câu hỏi thiết kế, không phải yêu cầu đã được xác nhận. | |
| | Tiếp tục thiết kế phương án. |
| Workflow planning tiếp tục. Việc bạn duyệt plan không tự cấp quyền cập nhật hoặc Publish Hub. | |

Kết quả: AgentBase cung cấp evidence/context; host agent sở hữu thiết kế và code.

## 4. Add repository

| Agent | Bạn |
|:---|---:|
| | `$agentbase-ingest` Thêm `/work/orders-api` vào domain `orders`. |
| Preflight nhận ra repo mới và trả về revision/source sẽ phân tích. Tôi đề xuất home `orders` dựa trên README; bạn xác nhận chứ? | |
| | Đúng. |
| Sau điều tra, tôi đề xuất dossier repo và runtime có ranh giới độc lập; các queue/table nội bộ nằm trong runtime cha. Đây là grouped home plan cần xác nhận: `<plan>`. | |
| | Đồng ý plan đó. |
| Proposal `<proposal>`, digest `<digest>` đã validate. Preview: `<material changes>`; còn `<Questions/limitations>`. Policy hiện tại là Direct. Chưa có gì được Publish. | |
| | Publish đúng proposal và digest vừa xem theo Direct. |
| Hub control kiểm tra lại status và exact proposal. Chỉ khi remote published + local recognized thành công, tôi mới báo knowledge đã sẵn sàng cho Query. | |

Nếu identity đã tồn tại, workflow chuyển Update cùng repo, không tạo bản trùng.
Nếu policy là PR, kết quả chỉ là in-review; team merge và Sync sau đó mới có
Published mới. Không có bước Accept riêng.

## 5. Update knowledge

| Agent | Bạn |
|:---|---:|
| | `$agentbase-refresh` Cập nhật knowledge của `/work/orders-api` theo source mới. |
| Tôi chọn Delta: kiểm tra diff từ revision đã quan sát, các gap liên quan và một lượt discovery nhỏ. Không đọc lại toàn bộ repo hoặc tự cập nhật worker repo. | |
| Proposal `<proposal>/<digest>` cập nhật `<changes>`, giữ các phần không có bằng chứng thay thế. Phần bị giới hạn được ghi rõ; nếu không đổi gì, tôi sẽ báo `no_change`. | |
| | Chỉ xem thôi, chưa Publish. |
| Proposal giữ riêng tư. Query vẫn dùng Published cũ. | |

Kết quả: update có phạm vi; không phải đồng bộ toàn domain tự động.

## 6. Bổ sung dữ liệu thiếu

| Agent | Bạn |
|:---|---:|
| | `$agentbase-refresh` Dossier backend còn thiếu retry/recovery dù code không đổi. Rà soát và bổ sung phần thiếu trong `/work/orders-api`. |
| Tôi chọn Coverage: điều tra rộng hơn nhưng có giới hạn, ưu tiên gap vừa nêu và đối chiếu evidence cũ. Không cần Initial Ingest lại. | |
| Tìm được `<new evidence>`; proposal `<proposal>/<digest>` bổ sung `<sections>`. Vẫn còn `<limitations>`. Validate pass không chứng minh đã đủ mọi kiến thức. | |
| | Publish proposal đó. |
| Tôi chuyển Hub control để kiểm tra và Publish exact result. Không tự chạy thêm Coverage. | |

Coverage thường nặng hơn Delta nhỏ, nhưng không có tỷ lệ token cố định.
Không tự chạy ba lượt; giới hạn ba lượt không hội tụ là điểm dừng để owner
review, không phải chứng nhận đầy đủ. Search miss hoặc ít node không tự chứng
minh thiếu dữ liệu; cần gap cụ thể/evidence hoặc yêu cầu rà soát rõ ràng.

## 7. Nhiều repo và AWS

### Thêm một nhóm repo

| Agent | Bạn |
|:---|---:|
| | `$agentbase-batch-ingest` Thêm `/work/orders-api`, `/work/orders-worker`, `/work/orders-infra` vào domain `orders`. |
| Tôi sẽ đưa ma trận identity/domain để bạn duyệt trước, rồi xử lý từng repo lần lượt và gom một proposal. | |
| | Đồng ý đúng ba repo và domain này. |
| Preview gồm evidence và giới hạn theo từng repo. Batch không tự gọi AWS, không chứng minh mọi liên kết liên repo và chưa Publish. | |

### Kiểm tra một gap SQS giữa các repo đã Published

| Agent | Bạn |
|:---|---:|
| | `$agentbase-domain-enrichment` Kiểm tra queue SQS `<exact queue>` liên quan API và worker trong domain `orders`. |
| Cần xác nhận Published Repository IDs, candidate endpoints, AWS account và region cụ thể. Không scan cả account. Bạn xác nhận phạm vi `<manifest>` chứ? | |
| | Đồng ý. Tôi đã đăng nhập AWS CLI trong terminal và xác nhận session đó. |
| MCP xác nhận account rồi đọc queue đã chọn. Queue tồn tại không tự chứng minh API gửi hoặc worker nhận; quan hệ tương tác vẫn cần evidence tương ứng. | |
| Tôi trình bày evidence, quyết định cần bạn chọn và phần chưa xác minh. Sau đó tạo proposal; Publish vẫn là một xác nhận riêng. | |

Kết quả: enrichment hiện là lane STS/SQS có giới hạn, không phải AI tự khám phá
và nối mọi service/resource của domain trên cloud.

## 8. Domain site

| Agent | Bạn |
|:---|---:|
| | `$agentbase-domain-site` Xuất site domain `orders` vào `/work/exports/orders-review`, thư mục mới. |
| Site sao chép Published knowledge và references thành static files. Bạn xác nhận giữ output ở phạm vi truy cập ít nhất chặt như Hub chứ? | |
| | Xác nhận, chỉ dùng nội bộ. |
| Đã xuất snapshot `<commit>` và build receipt. Bản đồ giúp khám phá các quan hệ đã ghi nhận, không phải topology runtime thật. Tôi chưa push hay cấu hình hosting. | |

Kết quả: artifact riêng; sửa Hub không tự cập nhật site, muốn mới phải export lại.

## Nguồn đối chiếu trong repo

- [Source census](../../src/app/agentbase-mcp/discovery-session.ts),
  [discovery requirements](../../docs/capabilities/01-repository-reading/05-runtime-requirements.md).
- [Terraform detector](../../src/core/knowledge/schemas/profiles/terraform.ts),
  [AWS mapping](../../src/core/knowledge/schemas/profiles/aws.ts).
- [Public skill catalog](../../.agents/skills/README.md): Query, Ingest, Refresh,
  Batch, Domain Enrichment, Hub và Domain Site là authority cho hội thoại mẫu.
- [Product: repository understanding](../../docs/product/01-repository-understanding.md).

Hội thoại phải cập nhật khi skill contract đổi. Không lấy ví dụ giả định này
làm nguồn ingest, benchmark hoặc bằng chứng về chất lượng model.
