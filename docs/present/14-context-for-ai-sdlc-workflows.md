# 14 — Cung cấp context cho AI workflows trong SDLC

> Trạng thái: high-level direction và low-level qualification đã được owner
> chấp nhận; paired model run đầu tiên đã đạt deterministic gate và đang chờ
> owner review trước khi productize runtime.

## Câu trả lời ngắn

AgentBase là lớp system context dùng chung cho các AI workflow. BA, PO hoặc DM
dùng Feature Discovery có thể hỏi Published Hub hệ thống hiện có gì, thành phần
nào liên quan và bằng chứng nằm ở đâu mà không cần source checkout. Developer
dùng Task Planning có thể bổ sung local Code Graph/source để tìm implementation
chính xác.

AgentBase không thay thế workflow đó. Nó chỉ trả context có giới hạn, có nguồn và
nêu rõ phần chưa biết.

## Vấn đề cần giải quyết

Một AI workflow thường nhận Feature, ticket hoặc tài liệu nghiệp vụ từ tracker
nội bộ. BA, PO hoặc DM không nên phải clone repository hoặc chờ AI đọc source để
hiểu system overview. Developer đã có source local nhưng nếu chỉ đưa User Story
cho AI thì task breakdown thường chung chung và không bám implementation hiện
tại.

AgentBase chuyển phần khám phá lặp lại đó thành knowledge được chuẩn bị trước:

```text
Repositories ──ingest/review/refresh──> Published Hub
                                             │
BA/PO/DM: Feature Discovery ─────────────────┘──> overview context

Developer: User Story/Bug ──> Hub scope ──> local Code Graph/source
                                             └──> task-planning context
```

Hub trả overview đã review và quan hệ nhiều repository cho cả hai phase. Phase
Feature Discovery dừng ở Hub; thiếu source không phải failure và không được yêu
cầu BA/PO/DM clone repository. Phase Task Planning mới dùng Code Graph/source vì
developer đã có local checkout và cần implementation hiện tại. Đây là cùng
snapshot-default query boundary hiện có, không phải một query system thứ hai.

## Cách sử dụng

Discovery vẫn là workflow chính và chỉ gọi AgentBase khi chính nó gặp một gap về
hệ thống hoặc repository. Phase 1 dùng trực tiếp hai khả năng hiện có là
Published Hub search và exact concept read; không prefetch, không tạo sẵn context
và không lưu một artifact trung gian. Nếu qualification chứng minh host-agent
orchestration chưa đủ ổn định, một integration skill nhỏ như
`agentbase-add-context` mới được xem xét sau.

```text
Feature Discovery (BA/PO/DM)       Task Planning (Developer)
            ↓                                 ↓
     Published Hub                    Hub xác định scope
            ↓                                 ↓
  overview + evidence               local Code Graph/source
            └──────── context + gaps ─────────┘
                              ↓
              workflow chính tiếp tục lifecycle riêng
```

Feature Discovery dùng Hub theo một thời điểm duy nhất: **on demand**, sau khi
workflow gặp một gap cụ thể về capability, repository, dependency, flow hoặc
constraint. AgentBase không tự đoán Feature cần gì và không đẩy overview vào
workflow trước khi được hỏi.

Task Planning dùng Hub để tìm scope trước, rồi mới dùng local Code Graph/source
cho symbol, caller/callee, execution path, impact, test và config. Task generation
vẫn thuộc workflow của developer, không thuộc AgentBase.

Không cần AgentBase gọi trực tiếp hoặc sửa một discovery skill cụ thể. Host agent
điều phối các skill và dùng MCP như những tool thông thường.

## Context được trả về

Một context result ưu tiên đúng phần giúp workflow tiếp tục:

- capability, System, Interface hoặc Resource có liên quan;
- repository và Domain đang sở hữu chúng;
- relation, dependency và Flow đã có bằng chứng;
- constraint hoặc knowledge quan trọng đã Published;
- source/document reference để điều tra sâu hơn;
- conflict, Question, freshness limitation và phần chưa tìm thấy.

Kết quả phải gọn và theo scope của Feature. AgentBase không đổ toàn bộ Hub, raw
Code Graph hoặc toàn bộ Markdown vào context window. Caller có thể query/read
tiếp từ những result phù hợp.

Kết quả search/read chỉ tồn tại trong context của phiên AI theo policy của host.
Nó không được ghi vào Hub, Local Draft hoặc một context store mới. Qualification
có thể giữ lại tool trace trong Benchmark `results/` như evidence của phép thử;
đó không phải knowledge authority.

AgentBase cung cấp facts và evidence, không tự chuyển chúng thành Issue,
Requirement, User Story, Acceptance Criteria hoặc Task. Cách tạo và duyệt các
artifact đó vẫn thuộc workflow gọi AgentBase.

## Authority, failure và recovery

- Ordinary context chỉ đọc synchronized Published Hub; Local Draft không được
  trộn vào câu trả lời.
- Mỗi fact phải giữ source/provenance và limitation liên quan. Relation chưa
  Published không được trình bày như fact.
- Trong Feature Discovery, nếu Hub không đủ, AgentBase nói rõ gap và dừng; không
  chuyển trách nhiệm source setup cho BA/PO/DM.
- Trong Task Planning, Source/Code Graph chỉ được đọc khi developer có local
  source được phép và câu hỏi cần độ chính xác đó.
- Nếu AgentBase unavailable, workflow chính vẫn có thể tiếp tục bằng nguồn hiện
  có của nó; không được nhận một context result mang vẻ đầy đủ nhưng thực tế bị
  thiếu âm thầm.
- Một Hub snapshot cũ không được mô tả như trạng thái source hiện tại. Workflow
  có thể yêu cầu Refresh hoặc selective source verification riêng.
- Quyền truy cập Hub và source giữ nguyên trust boundary hiện tại; skill context
  không mở rộng credential hoặc quyền đọc.

## Giá trị và trade-off

Giá trị mong đợi:

- giảm thời gian AI phải khám phá lại repository trong mỗi workflow;
- giảm lượng source không liên quan được đưa vào context window;
- tái sử dụng cùng một system understanding giữa nhiều AI skill;
- bổ sung quan hệ cross-repository mà một repository link riêng lẻ không thể
  hiện đầy đủ;
- giúp người dùng kiểm chứng output nhờ evidence và provenance.

Đổi lại, team phải Ingest, review, Publish và Refresh knowledge trước khi có thể
tái sử dụng. AgentBase không thể trả lời phần Hub chưa bao phủ và không bảo đảm
source hiện tại nếu chỉ có snapshot cũ. Việc đọc source vẫn cần thiết cho các câu
hỏi implementation chính xác; mục tiêu là thu hẹp đúng chỗ cần đọc, không loại bỏ
source investigation hoàn toàn.

## Phạm vi qualification đầu tiên

Feature Discovery là use case đầu tiên vì đã có failure thực tế: AI được cung
cấp repository link nhưng dành thời gian dài đọc source mà chưa lấy được context
hữu ích. Phase này phải chứng minh Hub-only context có giá trị trước khi thêm
runtime behavior hoặc mở rộng Hub schema.

Qualification đầu tiên dùng một Feature giả lập nhưng bám đúng Domain knowledge
đã Published. Hai arm chạy cùng discovery workflow, model, Feature input, tracker
context và giới hạn. Arm discovery-only không có AgentBase; arm assisted được
phép tự gọi đúng hai tool Published Hub search/read khi nó thấy cần thêm system
context. Vì fixed scenario yêu cầu existing system surface nhưng tracker không
có dữ liệu đó, shared prompt buộc ít nhất một targeted Hub search nếu tool hiện
diện; workflow vẫn tự chọn query và exact documents cần đọc. Không arm nào dùng
AgentBase Code Graph/application source trong phép
thử Phase 1, và không có context nào được chuẩn bị sẵn.

Qualification dùng hai fixture AWS/Terraform ở môi trường development. Crawler
là fixture nhỏ để kiểm tra truy vấn cross-repository Lambda/SQS. Fixture thực tế
là `aws-samples/amazon-ecs-fullstack-app-terraform`, một ứng dụng ECS có
frontend/backend, DynamoDB, S3, SNS và CodePipeline; nó đã có source-backed OKF
result trong benchmark lịch sử. Hai fixture chỉ là dữ liệu kiểm thử, không tạo
khái niệm Hub chính/phụ trong sản phẩm và không được suy ra từ khả năng truy cập
của trang Domain Hub đã generate.

Kết quả paired run ECS ngày `2026-08-29T03-56-31Z` đạt `needs_review`: assisted
giữ được critical backend interface, thêm hai important outcome (frontend
consumer và blue/green delivery), không có unsupported claim. Chi phí tăng chỉ
là số liệu chẩn đoán; owner review vẫn phải xác nhận chất lượng diễn giải trước khi
coi đây là bằng chứng sản phẩm.

Đã chạy thêm Crawler cross-repository và một biến thể ECS compatibility. Crawler
tiếp tục đạt `needs_review`, với assisted bổ sung critical publisher → SQS →
worker và hai important về publisher/storage. Biến thể ECS compatibility bị
`incomplete` vì model có một lần gọi command ngoài allowlist và một evidence ID
không được khai báo; đây là lỗi tuân thủ workflow, không phải thiếu dữ liệu Hub.
Sau khi runner chặn shell trực tiếp và scenario được cấp budget ba searches
theo trần chung, lần chạy lại `2026-08-29T04-21-39Z` đạt `needs_review`: assisted
giữ critical backend interface và thêm important blue/green delivery, không có
unsupported claim.

Vì private Discovery skill không phải đầu vào của dự án này, phép thử dùng một
prompt Feature Discovery chung, bất biến và cùng output schema cho hai arm. Kết
quả chỉ chứng minh giá trị của AgentBase context trong một workflow được kiểm
soát; nó không được quảng bá là đã tích hợp hay chứng minh chính private skill.

High-level success cần chứng minh:

- workflow nhận được system context hữu ích mà BA/PO/DM không cần source local;
- workflow tự nhận ra gap và query Hub thay vì nhận context prefetch;
- context tìm đúng capability/repository/relation quan trọng và kèm evidence;
- khi Hub search lộ một direct flow liên quan, workflow giữ đủ các endpoint và
  immediate effects quan trọng thay vì chỉ mô tả một phần topology;
- gap và limitation hiển thị rõ, không sinh fact đoán;
- discovery output không mất critical information, không tăng claim sai và
  không phình bởi context không liên quan;
- assisted arm cải thiện ít nhất một outcome quan trọng như câu hỏi discovery,
  impact coverage hoặc traceability. Thời gian và token/context cost chỉ là số
  liệu tham khảo, không thể tự tạo ra kết quả pass.

Kết quả chỉ được coi là có giá trị khi qua no-worse gate: không giảm critical
quality so với discovery-only và có ít nhất một cải thiện có ý nghĩa. Nếu
AgentBase làm output tệ hơn hoặc không tạo khác biệt, dự án phải sửa query
guidance/Hub coverage rồi chạy lại; không tiếp tục build dựa trên kỳ vọng.

Sau đó đã có Phase 2 task-planning A/B trên cùng một US và Phase 3 end-to-end
`Feature → US → Tasks`. Pair end-to-end ECS `2026-08-29T05-45-00Z` giữ nguyên
hai critical outcomes ở cả hai arm và full AgentBase thêm hai important outcomes:
source-specific task boundary và compatibility `/status`; comparison đang ở
`needs_review`. Đây là evidence định hướng tốt, chưa phải kết luận rằng mọi
workflow AIT đều cải thiện tương tự.

Planning, implementation, review và testing tái sử dụng cùng boundary; task
generation vẫn thuộc workflow của developer, AgentBase chỉ cung cấp context có
evidence và limitation, không trở thành SDLC orchestrator.

## Compatibility và adoption

Đây là capability bổ sung trên Hub query, Code Graph và skill installation hiện
có. Nó không yêu cầu migrate Hub, đổi OKF schema, sửa knowledge đã Published
hoặc thay behavior của các workflow AgentBase hiện tại. Một AI client không cài
skill context vẫn dùng AgentBase như trước.

Qualification Phase 1 dùng harness isolated và một Published Hub revision được
pin; không yêu cầu cài skill context. Nếu productization được approve sau
evidence, adoption tối thiểu chỉ cần client đã đăng ký AgentBase MCP và có quyền
đọc Published Hub. Source checkout và Code Graph không phải prerequisite cho
BA/PO/DM. Task Planning sau này yêu cầu developer có local source tương ứng. Một
integration skill hoặc thay đổi discovery skill bên ngoài chỉ được xem xét nếu
qualification chứng minh tool availability và prompt chung chưa đủ.

## Non-goals

- Thay Rally, tracker, discovery skill hoặc MCP nội bộ hiện có.
- Chuẩn hóa lifecycle Feature → Issue → User Story của công ty khác.
- Lưu mọi event, prompt hoặc artifact của SDLC vào Hub.
- Tự ingest Feature/ticket tạm thời thành shared knowledge.
- Tự scan toàn bộ repository trong mỗi context request.
- Thêm vector database, combined graph, daemon hoặc background indexing cho use
  case này.
- Cam kết support mọi SDLC workflow trước khi discovery qualification hoàn tất.
