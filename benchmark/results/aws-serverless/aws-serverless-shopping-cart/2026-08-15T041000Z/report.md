# aws-serverless-shopping-cart — AgentBase context A/B

- Status: complete
- Interpretation: quality and efficiency are independent; this report declares no overall winner.
- Limitation: deterministic source-path checks cannot prove semantic support; human review is required. Reference expectations are non-exhaustive.

## Quality

- mcp: assessment reviewable; validation passed; reference concepts 100%; recognized schemas 100%; metadata 100%; provenance 80%; reference relationships 100%; unjudged concepts/relationships 1/10
- direct: assessment invalid; validation failed; reference concepts 60%; recognized schemas 0%; metadata 0%; provenance 0%; reference relationships 0%; unjudged concepts/relationships 13/24

## Efficiency

- mcp: 871843 input (815360 cached, 56483 uncached); 8507 output; 1112 reasoning; 213427 ms
- direct: 405269 input (362752 cached, 42517 uncached); 8107 output; 1474 reasoning; 179766 ms
- Delta convention: MCP minus direct. {"elapsedMs":33661,"inputTokens":466574,"cachedInputTokens":452608,"cacheWriteInputTokens":0,"uncachedInputTokens":13966,"outputTokens":400,"reasoningOutputTokens":-362}

## Investigation activity

- Counts are directly observed events, not proof of complete source-read volume.
