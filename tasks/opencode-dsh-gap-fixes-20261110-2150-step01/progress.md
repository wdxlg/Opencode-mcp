# 进度：opencode-dsh-gap-fixes-20261110-2150-step01

- 当前步次：step01（收尾）
- 最后完成：源码修改（6 项）、npm run build 退出码 0、主机冒烟 15/15 PASS
- 下一步：本地提交 + post tag（不 push）；用户重启 OpenCode 后实机验收
- 阻塞问题：无
- 需要用户确认：无（用户 21:38 已授权直接做）

## 强制读取清单
| 路径 | 原因 | 状态 |
|---|---|---|
| bridge_get_effective_rules（workspace 与 global） | 宿主规则 | 已完整读取并确认 2026-11-10 21:09 / 21:19 |
| module-0143 bridge-tool-dispatcher | 分发入口 | 已完整读取（sha256:7471fac2…） |
| module-0165 ide-tool-broker | 终端与命令 | 已读相关段落（环境、runLeased、getOutput、startPersistentShell、executeTool） |
| module-0171 model-provider | 模型请求重试 | 已读 280–380 行 |
| module-0042 / 0140 / 0146 / 0144 | 工具定义、结构化解析、任务存储 | 已读相关段落 |
| scripts/sync-shared.cjs | 共享模块同步 | 已完整读取 |

## 验收记录（2026-11-10 22:00–22:10）
- 构建：npm run build 退出码 0；产物 extension.js node --check 通过，含 bridge_search_sessions、TOOL_TIMEOUT、SANDBOX_LABEL_REQUIRED、isQuotaExhausted、GIT_TERMINAL_PROMPT、listCommands。
- 主机冒烟（tasks/本任务/smoke.mjs，只碰临时目录与 %LOCALAPPDATA%\OpenCode\sandbox）：15/15 PASS —— 超时返回 TOOL_TIMEOUT；超长输出落盘且文件内容完整；第 3 次相同调用出提醒；沙箱默认 off 不改终端；启动器编译并运行；子进程为 Low（S-1-16-4096）；未加标签目录写入被拒、LocalLow 与加了 Low 标签的目录可写；未加标签的工作区拒绝启动并给出 icacls 命令。
- Hark 沙箱单元测试：tool-guards 17/17 PASS（含会话检索按关键词、记忆文件、状态过滤）。
- 未执行、未验证：OpenCode 运行实例内的 Bridge 实际调用（超时/落盘/提醒/会话检索/命令列表）、开启沙箱后托管 Bash 终端是否正常启动与工作、模型请求重试在真实 429/5xx 下的行为、仓库既有 test-* 脚本。
- 已知限制：启动器参数按 MSVCRT 规则加引号，适用于 bash.exe/node，不适用于 cmd.exe 的引号语法；低完整性下 HOME、npm/git 全局配置写入会失败。
