# 任务：OpenCode 对话面板「权限」按钮（opencode-权限按钮-20261111-1923-step01）

状态：源码修改、构建、部署 完成；GUI/实际对话审批 未验证（需用户重启 OpenCode 后使用）
快照：tag `pre/opencode权限按钮-20261111-1923` → 7a216b25（创建时 HEAD；期间其他会话提交了 7a216b25，与本任务文件不重叠）
备份：`backup/opencode-权限按钮-20261111-1923-step01/`（改前原文件；相关文件改前无未提交 diff，uncommitted-before.diff 为空）
授权依据：用户需求中已明确授权直接实现、构建、部署到 E:/opencode，不需再问；不 commit、不 push。

## 总目标
1. 删除对话面板标题行左侧「对话」文字与刷新按钮。
2. 标题行加「权限」按钮：下拉单选 每次询问/自动允许/只读；一项「MCP 工具权限 ›」二级菜单，按服务器（及工具）选 允许/询问/禁止/跟随。
3. 模式真实接入工具审批，持久化到设置。

## 影响清单（改动点）
| 文件 | 改动 |
|---|---|
| recovered/esm/027-workbench.desktop.main.js/module-2765.mjs（chatViewPane） | 去掉「对话」文字（保留折叠箭头）；新增权限按钮、样式、上下文菜单（含 MCP 二级/三级菜单）；读写设置 |
| recovered/esm/027-workbench.desktop.main.js/module-2531.mjs（agentSessionsActions） | 刷新动作不再挂到 AgentSessionsToolbar（命令保留） |
| recovered/esm/027-workbench.desktop.main.js/module-2812.mjs（languageModelToolsService） | invokeTool：对 Chat 会话中的工具调用合并 OpenCode 权限决策为 preToolUse 结果（deny/ask/allow），复用现有 hook 审批流程 |
| recovered/esm/000-extension.js/module-0177.mjs（native-chat） | 只读模式下把本轮 allowedTools 收窄为只读工具；MCP 按设置禁止的工具不下发；每次询问模式下要求 apply_patch 审批 |
| recovered/esm/000-extension.js/module-0183.mjs（runtime-client） | 处理 agent-host 新请求 `ide/tool/approve`：模态确认框（串行） |
| recovered/esm/002-agent-host.js/module-0014.mjs（agent-host） | 解析 `approveTools`，向扩展请求审批 |
| recovered/esm/002-agent-host.js/module-0029.mjs（openai-agent） | 工作区文件工具执行前若在 approveTools 中则先审批，拒绝则返回 PERMISSION_DENIED |
| assets/resources/app/extensions/opencode/package.json | 注册设置 `opencode.chat.permissionMode`、`opencode.chat.mcpPermissions` |

不改：018-sessions 变体（Agents 窗口按基线禁用）、Bridge 远程调用路径（invokeDirect，不经此审批，由 Bridge 自身门禁负责）。

## 设置
- `opencode.chat.permissionMode`: `ask`(默认，每次询问) | `auto`(自动允许) | `readonly`(只读)，用户设置（settings.json）。
- `opencode.chat.mcpPermissions`: `{ servers: {<服务器名>: allow|ask|deny}, tools: {<工具ID>: allow|ask|deny} }`；工具 > 服务器 > 模式。

## 使用方法
对话面板标题行点「权限」→ 选模式；悬停「MCP 工具权限 ›」→ 服务器 → 允许/询问/禁止/跟随模式；服务器子菜单下还可逐个工具设置。

## 生效范围（如实）
- 生效（代码已接入）：Chat 中经 VS Code 工具服务调用的工具——终端类（run_command / send_command_input / cancel_command）与全部 MCP 工具：只读→拒绝；自动允许→免确认；每次询问→强制确认（只读类 IDE 工具不额外询问）。MCP 按工具 > 服务器 > 模式取值。
- 生效：只读模式下扩展把本轮可用工具收窄为只读工具（文件写入、命令、写记忆、自定义工具、未单独允许的 MCP 工具不下发），并在指令中告知模型。
- 生效：每次询问模式下 apply_patch（agent-host 内执行）执行前弹模态确认，未允许返回 PERMISSION_DENIED，不写文件。
- 未接入：自定义工具（.opencode/tools）仍按其自身 confirm 配置；多模型后台分支的终端命令审批保持原逻辑（自动允许模式下仍会询问非只读命令）；隔离分支工作树中的 apply_patch 不询问；Bridge 远程调用不受此按钮影响；018 Agents 窗口变体未改。

## 验收
- 语法：7 个模块 node --check 通过；package.json JSON 校验通过。
- 构建：npm run build（scripts/update.cjs）成功，errors=[]；2 条警告为既有（module-0023 / module-2585），与本次无关。
- 部署：8 个产物增量同步到 E:/opencode（扩展 dist/extension.js(.map)、package.json、runtime/agent-host.js(.map)、workbench.desktop.main.js(.map)、product.json）+ OPENCODE-RELEASE.json；被替换文件备份于 backup/opencode-权限按钮-20261111-1923-step01/deploy-2026-11-11T11-51-39-427Z/；部署后复检差异为 0，product.json 10 项完整性校验全部匹配。未停止任何进程，Bridge 未断开。
- 需用户重启 OpenCode（或重新加载窗口）后新代码才生效。
- GUI 点击/实际对话审批：未验证。
- 过程备注：第一次后台构建被同终端的轮询命令中断，遗留本任务自己的 .build-lock（owner pid 29656，已确认进程不存在）后删除并改用独立进程重跑。
- 同期其他会话提交了 7a216b25、00b81895，本次构建/部署包含 HEAD 00b81895 及工作区既有未提交改动（sourceDirty=true）。
