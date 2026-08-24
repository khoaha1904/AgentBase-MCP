# 01.01 — Skill orchestration

> Trạng thái: Single-repository orchestration implemented; workspace routing
> contract accepted and pending implementation audit.

## Quyết định

`agentbase-query`, Ingest và Refresh là các public workflow entrypoint. Agent
chạy skill và quyết định bước điều tra tiếp theo; MCP cung cấp bounded tools và
dữ liệu, không tự diễn giải repository hoặc tự chọn concept.

```text
Public workflow skill
        ↓
Agent điều phối từng bước
        ↓
MCP: graph, search, trace, snippet và evidence
        ↓
Agent áp dụng concept/schema rules
```

## Trách nhiệm

### Skill

- dùng Published Hub trước cho câu hỏi overview/Domain;
- chỉ gọi Code Graph khi câu hỏi thật sự cần source local;
- quy định thứ tự và điều kiện chuyển bước;
- yêu cầu domain confirmation trước authoring;
- gọi workflow Code Graph khi cần cấu trúc hoặc implementation evidence;
- chuyển bounded evidence sang concept discovery và OKF authoring;
- dừng trước Accept/Publish nếu chưa có authorization tương ứng.

### Agent

- chọn câu hỏi graph tiếp theo dựa trên kết quả vừa nhận;
- phân biệt signal, candidate và evidence;
- quay lại exact source trước khi tạo knowledge claim;
- giữ limitation hoặc Question khi evidence chưa đủ.

### MCP

- bind một repository root được phép;
- quản lý provider lifecycle và freshness;
- trả graph result, source snippet, validation và Hub operations có giới hạn;
- không tự quyết định Domain, concept, schema hoặc truth.

## Chọn repository trong workspace

Một thư mục cha chứa nhiều Git repository chỉ là routing scope. Skill chọn
repository theo thứ tự đơn giản sau:

1. path hoặc repository được người dùng nêu rõ;
2. Git root chứa working directory hiện tại;
3. repository duy nhất mà Hub xác định và host đã biết có checkout trong
   workspace được người dùng mở;
4. nếu vẫn còn nhiều lựa chọn, hỏi người dùng.

Agent không tự quét các thư mục tùy ý trên máy. Một câu hỏi cần source từ nhiều
repository được xử lý tuần tự, đóng session hiện tại trước khi bind repo tiếp
theo. Không tạo combined graph.

## Tái sử dụng skill hiện tại

Public skill điều phối hai workflow nội bộ hiện có thay vì copy chúng:

- `use-codebase-memory` cho map, search, trace và source retrieval;
- `agentbase-okf` cho authoring, validation và review boundary.

Các rule chi tiết vẫn có một owner. Umbrella skill chỉ định tuyến và truyền kết
quả giữa hai workflow; không import nội dung bằng cách sao chép nguyên skill.

## Non-goals

- Không thêm prompt người dùng phải tự viết.
- Không để MCP chạy một fixed autonomous scan và tự tạo concept.
- Không ingest raw graph vào Hub.
- Không clone repository remote để dựng graph.
- Không gộp Accept hoặc Publish vào quyền Ingest/Refresh mặc định.
