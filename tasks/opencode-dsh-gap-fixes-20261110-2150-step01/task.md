# 任务：参照 DeepSeek Harness 补 OpenCode 不足（1–4、8、10）

- 任务 ID：opencode-dsh-gap-fixes-20261110-2150-step01
- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027
- 修改前 HEAD：9162561d797dee5ab0295f59cd7b1e37cce2b7ac；快照 tag pre/opencode-dsh-gap-fixes-20261110-2150-step01
- 规则：通用规则 v19（workspace ws_5e2cf43d… 与 global 均已读并确认）
- 任务卡：d3c28aec-4774-4d55-922b-d012f63d0ae2
- 授权依据：用户 2026-11-10 21:38 “直接做1到4和8，10”（对照分析清单中的第 1–4、8、10 项）
- 参考：E:\Dsh（dsh-desktop 0.2.1-rc.5）只读了各插件包 package.json 描述，未复制其代码（相关性：强相关，作为功能对照，不作为实现来源）
- Skills：未采用（无相关技能）

## 总目标与状态
| # | 分目标 | 对应 DSH | 状态 |
|---|---|---|---|
| 1 | 工具调用超时兜底 + 终端不再因分页/凭据提示卡死 | tool-call-timeout-policy | 完成（源码），未实机验证 |
| 2 | 超长工具输出落盘，只回头尾与路径 | spill / spill-policy | 完成（源码），未实机验证 |
| 3 | 连续相同调用提醒 | repeat-tool-reminder | 完成（源码），未实机验证 |
| 4 | 模型请求重试改进 | llm-retry | 完成（源码），未实机验证 |
| 8 | 可选系统级写入沙箱（Low 完整性） | sandbox-windows-acl | 完成（源码，默认关闭），启动器已在主机冒烟 |
| 10 | 会话检索工具 + 后台命令列表 | session-search / jobs | 完成（源码），未实机验证 |

## 改动文件
- 新增 recovered/shared/tool-guards.mjs：toolTimeoutMs / runWithToolTimeout（TOOL_TIMEOUT）、spillLargeResult（%LOCALAPPDATA%\OpenCode\shared-automation\spill，保留 3 天）、RepeatCallGuard（连续 3 次）、SESSION_SEARCH_TOOL + searchSessions
- 新增 recovered/shared/sandbox-lowil.mjs：低完整性启动器（C# 源码内嵌，首次使用用 .NET Framework csc 编译到 %LOCALAPPDATA%\OpenCode\sandbox）、标签检查、applyLowIlSandbox
- module-0143（bridge-tool-dispatcher）：dispatch 内包裹超时→落盘→重复提醒；guardToolName/guardCategory；bridge_search_sessions 分发
- module-0140（bridge-constants）：登记 bridge_search_sessions
- module-0165（ide-tool-broker）：终端环境 GIT_PAGER/PAGER=cat、GIT_TERMINAL_PROMPT=0、GCM_INTERACTIVE=never、GIT_EDITOR=true（均仅在未设置时）；run_command 默认 timeout_ms 120 s→50 s（OPENCODE_RUN_COMMAND_DEFAULT_TIMEOUT_MS 可改）；终端启动接入沙箱；get_command_output 省略 command_id 或 list=true 时列出本会话命令
- module-0042（ide-tool-definitions）：run_command timeout_ms 默认值与说明；get_command_output 新增 list/status，command_id 改为可选
- module-0171（model-provider）：额度/欠费类 429 不重试；读取 Retry-After / retry-after-ms（上限 20 s）；退避 500 ms×2^n（上限 8 s）加抖动
- scripts/sync-shared.cjs：共享清单加入两个新文件

## 使用方法
- 超时：默认 read 60 s、search 90 s、write 60 s、REA 600 s、其他 120 s；外部 MCP 为 0（已有 120 s 兜底）；run_command/等待类豁免。环境变量 OPENCODE_TOOL_TIMEOUT_MS_<工具名大写> > OPENCODE_TOOL_TIMEOUT_MS_<类别> > OPENCODE_TOOL_TIMEOUT_MS，0 为不限。
- 落盘：OPENCODE_SPILL_THRESHOLD_CHARS（默认 30000，0 关闭）、OPENCODE_SPILL_HEAD_CHARS / _TAIL_CHARS（默认 6000）、OPENCODE_SPILL_DIR。read_files、read_image、get_command_output、规则读取等豁免。
- 重复提醒：OPENCODE_REPEAT_TOOL_THRESHOLD（默认 3，0 关闭）；轮询类工具豁免。
- 沙箱：设置 "opencode.sandbox.mode": "workspace-write" 或环境变量 OPENCODE_SANDBOX_MODE=workspace-write，重启托管终端；每个工作区目录需本地用户执行一次 icacls "<目录>" /setintegritylevel (OI)(CI)low，否则终端拒绝启动并给出该命令。低完整性下 HOME、%TEMP%、npm 缓存等不可写（TMP/TEMP 改到 LocalLow\OpenCode\tmp）。
- 会话检索：bridge_search_sessions {query, limit, include_memory, state}。
- 后台命令：get_command_output {} 或 {list:true, status:"running"}。
- 复现：npm run build；node tasks/<本任务>/smoke.mjs E:/OpenCode-Source-Recovery-20261013

## 失败原因记录
- 两处补丁首次 PATCH_CONTEXT_NOT_FOUND：上下文用了半行，改成整行后成功。
- 本机 run_command 排队明显（命令 60 s 以上才开始），git status（含未跟踪）超过 120 s；已改用 -uno 与 cwd 外部目录。

## 验收结果
（见 progress.md 最新记录）
