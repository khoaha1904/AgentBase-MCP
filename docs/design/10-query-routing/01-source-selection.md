# 10.01 — Source selection

> Trạng thái: Technical design đã chốt theo high-level; host skill wiring chưa hoàn chỉnh.

## Outcome

Agent hiểu ý câu hỏi và gọi đúng query primitive. MCP không tự phân loại câu
hỏi, không tạo một combined-answer tool và không chạy Code Graph cho một câu hỏi
chỉ cần Hub knowledge.

## Routing table

| User intent | Start with | Add the other source when |
|---|---|---|
| Domain, system, purpose, ownership, known behavior | Hub search/read | User cần đối chiếu implementation hiện tại. |
| Cross-repository hoặc cross-domain relation | Hub search/read links | Cần code detail của một repository đang local và authorized. |
| Symbol, caller/callee, execution path, impact, exact implementation | Current repository Code Graph | Cần business intent, accepted constraint hoặc relation ngoài repo. |
| “Vì sao” một implementation tồn tại | Hub | Cần kiểm tra code hiện tại có còn khớp knowledge hay không. |
| “Giá trị đã biết là gì?” | Hub concept snapshot | Không tự thêm source read. |
| “Giá trị hiện tại là gì?” | Hub concept snapshot | Sau khi trình bày snapshot + provenance, đọc exact authorized local source bằng normal graph/file tool để xác minh current value. |

Đây là priority khởi đầu, không phải exclusivity. Agent chỉ gọi nguồn thứ hai
khi phần còn thiếu của câu trả lời thực sự cần nó.

## Snapshot-default stopping rule

Snapshot/Hub là câu trả lời mặc định, không chỉ là bước đầu của một pipeline.
Nếu nó đã trả lời đủ user intent thì Agent dừng, dù source đang local,
authorized hoặc dễ đọc.

Source chỉ được thêm khi ít nhất một điều kiện đúng:

1. user yêu cầu rõ giá trị hiện tại, verify source hoặc exact code;
2. task implementation, change, debug hoặc impact analysis cần code chính xác;
3. Hub/snapshot không đủ để hoàn thành yêu cầu an toàn và có một exact
   authorized source route.

Tuổi snapshot, source availability, conflict/Question sẵn có hoặc mong muốn làm
dữ liệu “đầy đủ hơn” không phải trigger. Query không đọc source chỉ để phá hòa
giữa các claim.

## Hub route

1. Dùng `search_hub_okf` để tìm concept theo Domain/type scope.
2. Dùng `read_hub_okf_concept` cho knowledge và provenance đầy đủ.
3. Khi cần relation, đọc Markdown links trong concept và tiếp tục bằng hai tool
   trên. Snapshot và Question cũng nằm trong exact concept Markdown.

Hai action này chỉ đọc exact Published commit đã synchronize về local. Local
Draft được inspect/review riêng; local-only Hub chưa có Published để query.

Search ambiguity chỉ hỏi lại Domain/repository khi lựa chọn đó làm thay đổi
đáng kể kết quả. Không bắt user chọn “Hub mode” hay biết tên tool.

Với câu hỏi về value, routing luôn snapshot-default khi concept có observed
value. Snapshot cho Agent câu trả lời và exact provenance; nếu đã đủ thì không
có source read tiếp theo. Chỉ khi Hub không có snapshot phù hợp mới đi thẳng
normal source tools cho một explicit current-value request; query không tự tạo
snapshot.

## Code Graph route

1. Chọn đúng một explicit local repository root; không scan workspace cha.
2. Reuse `use-codebase-memory`: index/reuse freshness, tìm structure/symbol/path,
   rồi đọc exact snippet.
3. Một MCP connection chỉ bind một repository tại một thời điểm. Muốn đọc local
   repository khác thì gọi controlled `index_repository` với exact root; gateway
   đóng sạch session cũ rồi bind session mới. Không ghép graph của nhiều repo.
4. Không tự clone remote repository. Hub relation/reference không tự cấp quyền
   source và không tự kích hoạt indexing.

Direct text/source search chỉ là fallback cho vùng graph không hỗ trợ hoặc để
verify exact text sau graph discovery.

## Combined route

Combined query là orchestration của Agent, không phải joined storage:

```text
Hub concept + exact Hub commit
        ↓ identifies intent/relation/repository reference
authorized local Code Graph/source
        ↓ verifies current implementation
one answer with the two provenances kept separate
```

Agent không copy raw graph rows vào Hub và không mô tả source result như
Published knowledge. Nếu Hub và source khác nhau, response chuyển sang Part
10.04 conflict presentation; query không tự Refresh hoặc write-back.

## Failure and degradation

- Hub unavailable/unconfigured: code question vẫn có thể dùng current local
  repository; shared-knowledge question nói rõ Hub chưa có.
- Graph unavailable/stale: trả phần Hub biết và nói implementation chưa được
  verify; chỉ re-index khi current-source question thực sự cần nó.
- Referenced repository không local/authorized: trả Hub knowledge/snapshot;
  không clone, dùng ambient credential hoặc đoán code.
- Không nguồn nào đủ: hỏi một clarification ngắn về Domain/repository hoặc nói
  rõ evidence còn thiếu.

Read failure không tạo Question, proposal hay Refresh tự động. Những action đó
luôn là workflow review riêng.

## Requirement mapping

- Reuses AB-QUERY-001 for Hub-versus-Code-Graph priority.
- Reuses AB-QUERY-002..004 and AB-QUERY-012..013 for bounded exact-Published reads.
- Reuses AB-MCP-015 and AB-QUERY-006..009 for snapshot/current-source separation.
- Adds no runtime requirement until a later implementation slice changes the
  existing tool or skill surface.
