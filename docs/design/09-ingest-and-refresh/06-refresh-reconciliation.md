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
- Concept đã được thay bằng identity khác: propose `Superseded` + replacement.
- Concept không còn hợp lệ nhưng history còn query value: propose `Retracted`.
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
Superseded / Retracted
Questions / Limitations
```

Mỗi destructive change hiển thị concept/path, reason, source revision/diff
evidence, affected relations/navigation và replacement nếu có. Reviewer xem
Markdown/Git diff nhưng không phải tự suy ra lý do từ deleted bytes.

## Implementation delta

Omission/elapsed time không còn authorize deletion. Destructive changes dùng
typed lifecycle intent cùng exact evidence; foreign/protected content được giữ.
Inspection đã group Added, Updated, Removed, Superseded/Retracted và
Questions/Limitations. Rich PR body trình bày các group này vẫn thuộc phần 11.
