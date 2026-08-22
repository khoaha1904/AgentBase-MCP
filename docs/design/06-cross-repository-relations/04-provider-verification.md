# 06.04 — Provider verification

> Trạng thái: Technical design đã chốt boundary; AWS adapter/skill chưa implement.

## Quyết định ngắn

User tự login provider CLI trong terminal. Skill xác nhận scope và gọi bounded
MCP verification operations; MCP không nhận hoặc chạy arbitrary CLI command do
Agent tạo.

```text
user login CLI
  → confirm candidate + account + region
  → MCP released verification profile builds read-only argv
  → filtered observation
  → Domain Enrichment candidate outcome
```

CLI verification chỉ bổ sung evidence khi source/Hub chưa đủ. Nó không phải bước
bắt buộc của mọi relation.

## Authority boundary

- User chịu trách nhiệm login và nói MCP có thể dùng session hiện tại.
- MCP dùng standard CLI credential resolution đã có; tool arguments không nhận
  access key, secret, session token hoặc credential file content.
- MCP không login, refresh credential, đổi profile/config hoặc persist
  credential.
- Nếu login cập nhật state mà MCP process hiện tại không nhìn thấy, workflow yêu
  cầu reconnect/restart rõ ràng; không yêu cầu user đưa secret vào prompt.
- Mỗi run bind một explicit provider profile, expected account/authority và
  region/location khi resource là regional.

AWS adapter có thể dùng `sts get-caller-identity` để xác nhận active account.
Account mismatch dừng verification trước resource call. CLI default region chỉ
là runtime setting; nó không thay thế confirmed/evidenced candidate region.

## Released verification profiles

Mỗi supported operation nằm trong một versioned provider profile do MCP phát
hành. Profile định nghĩa:

- supported CLI family/version range;
- exact service operation và argv fields MCP được phép dựng;
- required native identity and scope inputs;
- operation có thật sự bounded/read-only hay không;
- JSON response fields được phép giữ;
- normalization, identity consistency và secret filtering rules;
- timeout, output-size và pagination behavior.

Agent chọn semantic goal như “verify this known queue”, không truyền command
string, executable path, arbitrary flags, JMESPath query hoặc output path. MCP
spawn CLI trực tiếp bằng argv, tắt pager/auto-prompt và không qua shell.

Các operation dạng `list`/`scan` mặc định bị cấm. Chỉ cho phép một API có tên
`list` khi released profile chứng minh server-side request được bound bằng exact
candidate identity và không enumerate account-wide data.

## Versioned guidance skill

Provider-verification skill:

1. đọc CLI identity/version qua bounded MCP preflight;
2. hướng dẫn user login ngoài MCP nếu session chưa sẵn sàng;
3. trình account/region/candidates để user xác nhận;
4. gọi released operations và giải thích degraded outcomes;
5. chuyển normalized observations vào Domain Enrichment.

Skill dựa trên profile/docs được ship cùng MCP cho supported CLI version, không
dựa vào model memory để sáng tạo command. Nó có thể liên kết official remote
provider documentation để người dùng tham khảo, nhưng runtime correctness không
phụ thuộc việc fetch web docs. CLI version ngoài supported range trả limitation
và yêu cầu update profile/product; Agent không tự thử command gần giống.

## Bounded AWS examples

Các ví dụ minh họa policy, không phải danh sách operation đã release:

- `sts get-caller-identity` — xác nhận account/session authority;
- đọc attributes của một exact Queue ARN/URL đã biết;
- đọc configuration của một exact Lambda/function identity đã biết;
- đọc attributes của một exact Topic ARN đã biết;
- describe một exact compute/resource ID trong confirmed region.

Không dùng “list all queues/functions/topics”, Resource Explorer, tag scan hoặc
thử tuần tự nhiều accounts/regions để tìm match.

## Normalized observation

MCP không đưa raw provider response vào Hub. Successful call trả một bounded
observation gồm:

- provider/profile/operation version;
- confirmed account/authority và region/location;
- exact candidate/native identity;
- allowlisted non-sensitive identity/relation fields;
- observation timestamp;
- verification outcome và limitations.

Domain Enrichment chuyển observation thành source-backed identity/relation/
Question changes. Raw stdout/stderr, local profile path và credential context
không trở thành OKF evidence.

## Failure outcomes

| Failure | Outcome |
|---|---|
| CLI missing/unsupported | Candidate `unresolved`; hướng dẫn setup/version. |
| Not logged in/expired session | `unresolved`; user login rồi retry. |
| Account mismatch | Dừng candidate trước resource call. |
| Region missing/mismatch | `unresolved`; không thử regions khác. |
| Access denied/not found | Giữ provenance và limitation; không suy ra resource không tồn tại toàn cục. |
| Network/throttle/timeout | Attempt failed/retryable; không đổi knowledge. |
| Malformed/oversized output | Hard verification failure; không giữ partial raw data. |

Không có hidden retry loop. User-triggered retry là attempt mới với visible
reason; successful checkpoints của candidates khác vẫn được giữ theo 06.03.

## Safety

- Không chạy mutating API, shell, plugin installer hoặc arbitrary executable.
- Không bật CLI debug vì có thể lộ credential/request detail.
- Secret-like values bị loại trước normalized observation và proposal.
- Provider verification không Accept, Publish hoặc thay đổi cloud resource.
- MCP Hub token chỉ dùng GitHub Hub/repository actions; provider CLI dùng session
  mà user đã login và hai authority không được trộn.

## Baseline impact

Đây là **Broad change** và khi implement phải đi Full Feature route vì thêm
provider adapter, credential/session boundary và external process lifecycle.
MVP nên release một tập AWS operations nhỏ theo fixtures thực tế; không dựng
generic arbitrary-cloud command runner.

