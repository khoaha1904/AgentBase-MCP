# 09 — Ingest và Refresh

> Trạng thái: Initial Ingest/Refresh đã qualify; Batch Initial Ingest và AWS/SQS
> Domain Enrichment đã implement offline.

## Câu trả lời ngắn

```text
Initial Ingest → tạo knowledge ban đầu thành Local Draft
Refresh        → so sánh source với knowledge đã có
               → tạo Local Draft update
```

`Initial Ingest` là lần Ingest đầu tiên của một canonical repository. Từ đó về
sau repository chỉ dùng Refresh.

## Initial Ingest

- Đọc repository lần đầu để tìm concept, relation và evidence.
- Chỉ hỏi các owner decision tối thiểu như Domain; không yêu cầu provider login
  hoặc dừng để điều tra repository khác.
- Batch Ingest vẫn cô lập discovery theo repository và tạo concept, relation
  nội bộ, limitation và Question tự động.
- Match chưa chắc chắn chỉ tạo candidate/Question, không tự merge hoặc tự tạo
  relation xuyên repository.
- Completeness toàn repository không phải success gate. Một proposal nhỏ, hợp
  lệ và có provenance tốt hơn một run dài cố author mọi thứ; các lần Refresh có
  thể bổ sung knowledge dần.

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
  có thể hỗ trợ một explicit removal/retract/supersede proposal, nhưng PR phải
  trình bày reason/evidence để reviewer quyết định.
- Refresh một repository reconcile với Published Hub và Local Draft liên quan,
  không cần repository khác có trên máy. Batch Refresh mới đối chiếu chéo các
  repository trong batch.
- Mọi kết quả vẫn là Local Draft và đi qua publication lifecycle ở
  [phần 11](11-review-accept-and-publish.md).

Refresh không rebuild Hub, không tự publish và không coi “không tìm thấy” là
bằng chứng chắc chắn rằng knowledge đã sai. Item chỉ chuyển thành `Superseded`
hoặc `Retracted` theo quy tắc ở
[phần 07](07-conflicts-questions-and-maintainer-guidance.md).

## Trạng thái qualification hiện tại

- Initial Ingest dùng bounded five-stage lifecycle, catalog 7 skeleton/template
  và dừng ở inspectable proposal. Benchmark ECS full-stack bằng Sol tạo 7
  concept hữu ích mà không promote mọi AWS resource.
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

## OKF Freshness

Freshness là warning về tuổi của repository/source contribution, không phải
phán quyết knowledge sai và không liên quan tới graph-cache freshness.

- MCP query có thể hiển thị source revision, thời điểm observed và age.
- Khi current local source đã advance, MCP cảnh báo knowledge được quan sát ở
  revision cũ.
- Scheduled CI có thể tạo một derived freshness report tổng hợp từ Hub.
- Warning không tự Refresh, không ẩn/xóa knowledge và không chặn Publish.
- Report không phải source of truth; nếu lưu vào Hub Git thì đi qua PR, không
  push thẳng `main`.

## Khi một lần chạy thất bại

Failure được cô lập theo repository. Trong batch, draft của repository đã hoàn
thành vẫn được giữ và query bình thường. Kết quả làm dở của repository lỗi mang
trạng thái `Incomplete`, không vào query bình thường và không được publish.

Người dùng có thể retry hoặc bỏ lần chạy lỗi. Retry cập nhật đúng draft cũ,
không tạo concept/relation trùng; khi thành công, MCP chạy lại reconciliation
cần thiết.

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
- OKF age warning trong query và scheduled freshness report.
- Full repository-identity recovery cho mọi rename/fork/mirror edge case.
