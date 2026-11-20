# 多平台视频自动录制与发布（video-publisher）— OpenCode 内置说明

## OpenCode 本地适配说明（2026-10-13）

本 Skill 已整合为 OpenCode 默认自带内置技能（位于 `defaults/skills/video-publisher`，首次启动自动同步至全局 `skills/video-publisher` 目录）。
完整可执行脚本（`vpub.py`、`vpub.cmd`、`polo_record_runner.gd`、`config.json`、`platforms/*.py`）均已内嵌于本 Skill 的 `scripts/` 子目录中，同时兼容 `E:\video-publisher` 独立运行目录。

- 本 Skill 只是按需读取的指南与资源，不是新增 MCP 工具。系统、用户和项目规则优先。
- 默认资产不含任何个人账号 Cookie 或登录态；运行期浏览器持久化 Profile 与录制产物存放在运行目录（`E:\video-publisher` 或 `data/video-publisher`）。
