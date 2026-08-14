# aws-health-aware — AgentBase context A/B

- Status: complete
- Interpretation: quality and efficiency are independent; this report declares no overall winner.

## Quality

- mcp: validation failed; concept P/R 60%/60%; schema P/R 40%/40%; metadata 25%; provenance 29%; relationships 0%
- direct: validation failed; concept P/R 22%/40%; schema P/R 0%/0%; metadata 0%; provenance 0%; relationships 100%

## Efficiency

- mcp: 674260 input (615424 cached, 58836 uncached); 6023 output; 895 reasoning; 155167 ms
- direct: 675861 input (617728 cached, 58133 uncached); 9359 output; 2153 reasoning; 205359 ms
- Delta convention: MCP minus direct. {"elapsedMs":-50192,"inputTokens":-1601,"cachedInputTokens":-2304,"cacheWriteInputTokens":0,"uncachedInputTokens":703,"outputTokens":-3336,"reasoningOutputTokens":-1258}

## Investigation activity

- Counts are directly observed events, not proof of complete source-read volume.
