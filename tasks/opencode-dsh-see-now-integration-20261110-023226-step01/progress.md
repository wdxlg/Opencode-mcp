# 进度：opencode-dsh-see-now-integration-20261110-023226-step01

- 当前步次：step01（收尾）
- 最后完成：see_now 接入、构建（退出码 0）、无屏幕冒烟 13/13 PASS、本地提交与 post tag
- 下一步：无（待用户在装有 ffmpeg 的机器上做真实抓屏/看视频验收）
- 当前操作文件：tasks/opencode-dsh-see-now-integration-20261110-023226-step01/*
- 阻塞问题：无
- 需要用户确认：无（用户已在需求中确认方案与授权）

## 强制读取清单
| 路径 | 原因 | 状态 |
|---|---|---|
| bridge_get_effective_rules(global) | 宿主规则 | 已完整读取 2026-11-10 02:24 |
| recovered/shared/windows-mcp-integration.mjs | 视觉入口 | 已完整读取 sha256:e6885d29… |
| recovered/shared/external-mcp-content.mjs | 图片内容适配 | 已完整读取 sha256:2cfa590f… |
| recovered/esm/000-extension.js/module-0030.mjs | 工具注册表 | 已读 1-30、195-268、485-500、600-765 |
| scripts/build-recovered.cjs、scripts/sync-shared.cjs | 构建与同步 | 已读 |

## 五个入口核对（003-mcp-server、002-agent-host、006-main、011-agentHostMain、018-sessions）
- 003-mcp-server module-0100、002-agent-host module-0015：各自有一份 read_image 文件工具定义（独立进程的工具表副本），本任务不改，read_image 行为不变。
- 006-main module-0069/0146/0156/0157、018-sessions module-1237/1243/1474/1475/2140/3923/4097-4101 等：VS Code 内置浏览器视图/聊天附件/问题报告的截图功能，不是模型工具路由，不改。
- 011-agentHostMain module-0239：ScreenshotPage 枚举，不改。
- 模型侧 Bridge 工具表在 000-extension.js：module-0030 → module-0140（BRIDGE 工具表展开 FILE_TOOL_DEFINITIONS）→ module-0143 分发 invokeFileTool；module-0029 用 FILE_TOOL_NAMES 作原生保留名。see_now 随 FILE_TOOL_DEFINITIONS 进入这些路径（未在运行实例中验证）。
