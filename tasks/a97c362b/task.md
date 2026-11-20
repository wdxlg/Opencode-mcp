# a97c362b 实现报告建议 7/11/12（建议 5 暂缓）
用户 2026-11-14 01:23：先做 5 之外的。顺序 11 → 7 → 12。
## 建议 11 范围
- SSE Last-Event-ID：已存在（module-0119 BoundedInMemoryEventStore + module-0120 重放），不改。
- bridge_ask_user → MCP elicitation/create：本次实现，默认关闭（opencode.bridge.elicitation）。
- 任务卡 → MCP Tasks：暂缓，原因见 progress.md。
