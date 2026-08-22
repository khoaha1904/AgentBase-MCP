# 09.07 — Domain Enrichment

> Trạng thái: Designed, chưa implement.

## Entry và authority

User chọn một Domain, explicit Published repositories/candidates và báo provider
CLI đã login. Skill xác nhận batch membership/scope; MCP không login, giữ
credential hoặc scan account để tự tìm việc.

## Input

Domain Enrichment bắt đầu từ knowledge đã merge vào Published Hub `main`:

- Repository concepts và source/provider references tại exact Published commit;
- Questions/limitations cần external verification;
- resource identity và relation candidates;
- provider/account/region hints đã có evidence.

Local Draft và repository còn ở open Init/Refresh PR chưa merge không phải
Enrichment input. Repo không local vẫn dùng Published Hub knowledge/reference;
workflow không clone repo và không dựng Code Graph cho remote-only sources.

## Execution

```text
confirmed Domain + repo/candidate membership
        ↓
bounded candidates read from Hub
        ↓
sequential provider CLI verification
        ↓
identity/relation/question reconciliation
        ↓
one Domain Enrichment Draft → one Accept → one PR
```

Provider calls phải target resource/candidate cụ thể; không list/scan mù mọi
account, region hoặc service. Name/ARN/account/region/non-sensitive observed
value chỉ được bổ sung với provider provenance và observed time.

## Outcomes

- xác nhận hoặc từ chối resource identity match;
- add cross-repository/cross-Domain relation evidence;
- merge/alias proposal cho duplicate concept qua review rules;
- resolve hoặc update governed Questions;
- giữ limitation khi permission/resource evidence chưa đủ.

## Batch/failure

Domain Enrichment dùng atomic membership, sequential execution và per-member/
candidate checkpoints như Batch Ingest. Một batch tạo một proposal/PR, không
split sau Accept. Failure không publish partial membership; user retry hoặc xác
nhận membership mới.

## Non-goals

- Không Refresh repository code.
- Không tự Accept/Publish.
- Không persist provider response dump hoặc secret.
- Không biến external observation thành timeless current truth.
