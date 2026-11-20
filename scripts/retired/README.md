# 已退役的测试

- `test-rea-sessions.mjs`、`test-rea-defaults.cjs`：测的是旧的独立 REA（`defaults/rea-bridge.mjs` + `defaults/rea/node_modules`，stdio MCP 的 list_rea_tools/call_rea_tool）。该架构在 2722df0f 删除，之后改为进程内嵌的 `defaults/rea-backend`（92f7204a），资产校验用 `scripts/verify-rea-assets.cjs`。保留原文件仅供参考，不再运行。
