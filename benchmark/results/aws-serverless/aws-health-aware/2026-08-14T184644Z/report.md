# aws-health-aware — AgentBase context A/B

- Status: complete
- Interpretation: quality and efficiency are independent; this report declares no overall winner.
- Limitation: deterministic source-path checks cannot prove semantic support; human review is required. Reference expectations are non-exhaustive.

## Quality

- mcp: assessment invalid; validation passed; reference concepts 80%; recognized schemas 100%; metadata 75%; provenance 71%; reference relationships 83%; unjudged concepts/relationships 1/2
- direct: assessment invalid; validation failed; reference concepts 40%; recognized schemas 0%; metadata 0%; provenance 0%; reference relationships 0%; unjudged concepts/relationships 7/8

## Efficiency

- mcp: 964879 input (892672 cached, 72207 uncached); 9540 output; 2511 reasoning; 241227 ms
- direct: 524356 input (474880 cached, 49476 uncached); 7728 output; 2456 reasoning; 166371 ms
- Delta convention: MCP minus direct. {"elapsedMs":74856,"inputTokens":440523,"cachedInputTokens":417792,"cacheWriteInputTokens":0,"uncachedInputTokens":22731,"outputTokens":1812,"reasoningOutputTokens":55}

## Investigation activity

- Counts are directly observed events, not proof of complete source-read volume.
