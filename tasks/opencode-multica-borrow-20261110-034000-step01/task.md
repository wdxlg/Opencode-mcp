# 任务：借鉴 Multica 设计为 OpenCode 恢复工程实现 12 项运行管理能力

- 任务 ID：opencode-multica-borrow-20261110-034000-step01
- 任务卡：446b1b21-9727-42ca-a0e4-a3ba49143c7e（Bridge set_todos，overview_session_id 072cae47-2318-438b-b379-f97b448fe47c）；该卡已过期（Unknown or expired task_id），2026-11-10 09:25 CST 续接改用新卡 b7e70cf2-9c2b-4761-a805-732897a93840（同一任务、同一 overview_session_id）
- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027
- 修改前快照：tag pre/opencode-multica-borrow-20261110-034000-step01 → 5a93f69（2026-11-10 03:40 CST 创建）
- 用户授权依据：「那你就全做」「你直接做，额度用完了我用任务卡找人接班」；只本地 commit，不 push，不启停实例，不装依赖，不发外部请求，只做离线单测/冒烟。

## 总目标
在 Bridge 层实现 12 项能力（任务卡主记录、运行记录回放、插话、评审闸门、小队路由、重试超时、Inbox、用量、定时任务、Skills 锁、权限范围、渠道接入）。只借鉴 Multica 的产品设计，代码全部自写；新功能默认关闭或只做被动记录，不改变现有行为。

## 参考相关性
| 参考 | 相关性 | 处理 |
|---|---|---|
| multica-ai/multica（Multica License：Apache-2.0 + 托管/商用嵌入/品牌附加条件） | 强相关（设计参考） | 只借鉴概念（agent 当队友、任务看板、autopilot、inbox、skills、runtime 用量）；未复制、未下载其代码；不使用其品牌名作产品名，模块内仅以注释注明“设计借鉴”。本次未从主机访问其仓库（不发外部请求），设计依据为用户列出的 12 项与对 Multica 的公开概念了解。 |

## 懂 / 不懂清单
- 懂：Bridge 的 tools/list 与 tools/call 都在 module-0119 BridgeMcpTransport.registerToolHandlers；内置工具定义在 module-0140（BRIDGE_TOOL_DEFINITIONS，含 set_todos/bridge_ask_user）；run_command 在 module-0042；文件工具与 see_now 在 module-0030；规则中心在 automation-store.mjs（rules_hash/collaboration_enabled）；多模型开关 module-0177 opencode.multiModel.enabled；多模型协作框架在 recovered/shared/collaboration-*.mjs（规则回执 collaboration_enabled=false）；记忆交接为 bridge_memory_* 工具（project-memory.mjs）。新共享源码按 see-now 先例放 recovered/shared/<dir>/，由 scripts/sync-shared.cjs 镜像到 recovered/esm/000-extension.js/ 并登记 modules.json。
- 不懂/未查证：set_todos 回执 structuredContent 的确切字段（实现同时解析结构化字段与中文回执“任务编号/修订号”）；bridge_batch 内部子调用不经过 tools/call（因此在包装层展开 bridge_batch 的 calls/results）；Multica 的具体实现细节（有意不看代码）。
- 需询问：无（用户已授权全做；宿主原生 ask_user 不可用，接班方式已获认可）。

## 修改前影响清单
- 新增：recovered/shared/multica/*.mjs（镜像到 recovered/esm/000-extension.js/multica/）、scripts/test-multica-borrow.mjs、docs/multica-borrow.md、tasks/opencode-multica-borrow-20261110-034000-step01/、.ai-workflow/logs|index/opencode-multica-borrow-20261110-034000-step01.*。
- 修改：module-0119.mjs（tools/list 追加 opencode_ops；tools/call 经 multicaRuntime().runToolCall 包装，内部异常不影响原调用）；scripts/sync-shared.cjs（追加 multica 镜像块，与他会话改动不同行）；modules.json（构建时自动登记 multica/*，插在 see-now 条目之后）。
- 重叠文件：scripts/sync-shared.cjs、modules.json 有他会话（REA 接入）未提交改动 → 用 tasks/opencode-multica-borrow-20261110-034000-step01/tools/stage.cjs 以“HEAD + 我方 hunk”生成 blob 暂存，不混入他人改动。
- 运行环境：Node ≥22（主机 npm run build 内置 esbuild）；状态目录 OPENCODE_MULTICA_HOME → %LOCALAPPDATA%/OpenCode/shared-automation/multica。
- 验收：每项 npm run build 退出码 0 + node --test scripts/test-multica-borrow.mjs（临时目录）+ 单独 commit。
- 残差：运行中的 OpenCode 实例不会加载新构建（不启停实例），因此真实会话内功能未验证。

## 分项状态（实时更新）
| 项 | 状态 | commit | 说明 |
|---|---|---|---|
| m01 任务卡主记录 | 完成 | 25f504e8 | 构建 0；离线单测通过 |
| m02 运行记录回放 | 完成 | 4016303d | 构建 0；离线单测通过 |
| m03 插话 steer | 完成 | 43b781dc | 构建 0；离线单测通过 |
| m04 评审闸门 | 完成 | 659dd309 | 构建 0；离线单测通过 |
| m05 小队与组长路由 | 完成 | 236071a1 | 构建 0；离线单测通过 |
| m06 重试与超时 | 完成 | 75af1ca2 | 构建 0；离线单测通过 |
| m07 Inbox | 完成 | a06a3af6 | 构建 0；离线单测通过 |
| m08 用量统计 | 完成 | f4df128d | 构建 0；离线单测通过 |
| m09 定时任务 autopilot | 完成 | b72eb461 | 构建 0；离线单测通过 |
| m10 Skills 锁文件 | 完成 | 6f7226ca | 构建 0；离线单测通过 |
| m11 权限范围 | 完成 | c21e0f6e | 构建 0；离线单测 12/12；2026-11-10 用户授权删除 03:56 残留 .update-lock（pid 30100 已被复用为 conhost，无对应 journal）后重跑 |
| m12 渠道接入 | 完成 | 3c2a4848 | 构建 0；离线单测 13/13 |

## 收尾（2026-11-10 CST）
- 总状态：完成（源码、构建、离线单测、本地提交）。会话内功能验证：未执行、未验证（需用户自行重启运行中实例加载新构建）。
- docs/multica-borrow.md：完成，提交 85d73f71。
- 构建发布：每次 npm run build 经 scripts/publish-runtime.cjs 写入 <仓库>/opencode（最后一次 09:32:53 CST，OPENCODE-RELEASE.json version 1.0.0-recovered.33，sourceCommit c21e0f6e + 工作区 m12 改动，journal completed）；未启停任何实例，未 push。
- 残差：bridge_batch 内部调用 opencode_ops 不拦截；token 为估算；渠道 webhook 未在真实实例中监听验证。

## 使用方法
- 配置：OPENCODE_MULTICA_HOME/multica.config.json（与默认值深合并，见 core.mjs DEFAULT_CONFIG）。
- 工具：opencode_ops（action=ops_status 查看）。m01：task_bind {task_id, dir} 绑定 tasks 目录 → 每次 set_todos/update_plan 成功后自动重写 task.md/progress.md 中的生成块与 .task-card.json；task_recover {task_id|dir} 返回可直接用于 set_todos(handoff) 的恢复参数；task_status。
- 测试：node --test scripts/test-multica-borrow.mjs（MULTICA_SRC 可指向临时副本）。
- 暂存提交：node tasks/opencode-multica-borrow-20261110-034000-step01/tools/stage.cjs <提交说明文件>。

## 文件索引
见 .ai-workflow/index/opencode-multica-borrow-20261110-034000-step01.json。
