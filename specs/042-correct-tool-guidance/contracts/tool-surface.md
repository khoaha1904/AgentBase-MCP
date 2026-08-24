# Contract: Corrected Tool Surface

- The catalog remains 29 Hub + 4 schema/authoring + 9 Code Graph tools.
- `index_repository` is non-read-only, non-destructive and idempotent.
- The other eight Code Graph actions are read-only, non-destructive and
  idempotent.
- Public descriptors contain no retired AgentBase tool name.
- `agentbase-hub` owns `list_hub_questions` and `answer_hub_question` while
  preserving proposal review and explicit Accept/Publish.
