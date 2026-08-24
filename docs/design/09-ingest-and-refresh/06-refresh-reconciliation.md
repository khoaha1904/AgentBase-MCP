# 09.06 — Refresh reconciliation and removal

> Trạng thái: Core single-repository reconciliation implemented.

## Change evidence

Refresh so last observed source revision với current source. Removal candidate
có thể dùng:

- exact Git deletion/rename diff;
- source symbol/config/resource declaration đã mất tại current revision;
- replacement identity và continuity evidence;
- explicit maintainer guidance.

Graph/search không tìm thấy hoặc partial coverage không đủ làm removal evidence.
Rename/move có continuity thì update reference/identity hint, không xóa concept.

## Outcomes

- Source removed nhưng concept còn foreign-source evidence: gỡ/update current
  repository contribution; không xóa shared concept.
- Concept/knowledge đã được thay hoặc xác nhận sai: propose ordinary correction
  hoặc removal với exact reason/evidence; Git giữ history.
- AgentBase-owned concept chỉ có current-repo evidence, source bị xóa rõ và không
  còn history/query value: có thể propose file/navigation deletion.
- Evidence chưa đủ: preserve current knowledge + Question/limitation.

Không outcome nào tự apply. Proposal validation bảo vệ foreign sources,
protected bytes và relationship targets.

## Review/PR presentation

Proposal inspection và PR summary phải group tối thiểu:

```text
Added
Updated
Removed
Questions / Limitations
```

Mỗi destructive change hiển thị concept/path, reason, source revision/diff
evidence, affected relations/navigation và replacement nếu có. Reviewer xem
Markdown/Git diff nhưng không phải tự suy ra lý do từ deleted bytes.

## Implementation delta

Omission/elapsed time không authorize deletion. Destructive changes dùng exact
correction/removal intent cùng evidence; foreign/protected content được giữ.
Inspection group Added, Updated, Removed và Questions/Limitations. Rich PR body
trình bày các group này thuộc phần 11.
