# aws-health-aware — AgentBase context A/B

- Status: complete
- Interpretation: quality and efficiency are independent; this report declares no overall winner.
- Limitation: deterministic source-path checks cannot prove semantic support; human review is required. Reference expectations are non-exhaustive.

## Quality

- mcp: assessment reviewable; validation passed; reference concepts 80%; recognized schemas 100%; metadata 83%; provenance 86%; reference relationships 67%; unjudged concepts/relationships 0/3
- direct: assessment invalid; validation failed; reference concepts 40%; recognized schemas 0%; metadata 0%; provenance 0%; reference relationships 0%; unjudged concepts/relationships 7/8

## Efficiency

- mcp: 732525 input (676352 cached, 56173 uncached); 7320 output; 1540 reasoning; 186628 ms
- direct: 521876 input (468992 cached, 52884 uncached); 8199 output; 2315 reasoning; 175228 ms
- Delta convention: MCP minus direct. {"elapsedMs":11400,"inputTokens":210649,"cachedInputTokens":207360,"cacheWriteInputTokens":0,"uncachedInputTokens":3289,"outputTokens":-879,"reasoningOutputTokens":-775}

## Investigation activity

- Counts are directly observed events, not proof of complete source-read volume.
