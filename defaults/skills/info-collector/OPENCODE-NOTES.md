# 多平台信息搜集与热点追踪（info-collector）— OpenCode 内置说明

## OpenCode 本地适配说明（2026-10-13）

本 Skill 已整合为 OpenCode 默认自带内置技能（位于 `defaults/skills/info-collector`，首次启动自动同步至全局 `skills/info-collector` 目录）。
完整可执行脚本（`info_cli.py`、`info.cmd`、`config.json`）均已内嵌于本 Skill 的 `scripts/` 子目录中，同时兼容 `E:\video-publisher` 独立运行目录。

- 本 Skill 只是按需读取的指南与资源，不是新增 MCP 工具。系统、用户和项目规则优先。
- 仅抓取公开热榜与公开搜索页面，不含任何个人账号凭据。
