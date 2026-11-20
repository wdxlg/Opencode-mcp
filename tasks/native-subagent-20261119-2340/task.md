# native-subagent-20261119-2340

目标：OpenCode 自己的原生子代理（agent-host `spawn_subagent` 跑出来的子会话）调用 Bridge 工具时，
画布不再把它们并进共享的 `local`（OpenCode 智能体）条目，而是各自一个条目，带 `subagent:true` / `parentId`，
被 collaboration.js 的 isSubAi 过滤隐藏。

## 链路
1. agent-host `module-0029.mjs` runSubagentTool：子运行带 `subagentSession = { id: "sub_<uuid>", parentID: 发起它的子会话 id 或 null, depth }`。
2. `agent-tool-exec.mjs`：外部工具调用 `executeExternalTool(name, args, { session })`。
3. `module-0014.mjs`：`ide/tool/invoke` 参数多带 `session: { id, parentID, depth }`（顶层调用不带，参数不变）。
4. 扩展 `module-0183.mjs` handleIdeToolRequest：`params.session` → `{ sessionId, parentID }`（parentID 为空时取本对话 id），传给 dispatchChatTool。
5. `module-0023.mjs` / `module-0114.mjs` dispatchChatTool：放到 `extra.ocSession`。
6. `module-0143.mjs` ocActorFromExtra：本机 actor 带 `sessionId` / `parentID`；extra 被重建的内层调用从 OC_ACTOR_STORE 继承。
7. `recovered/shared/canvas-console.mjs`：本机 actor 带 parentID → 身份 `local:sub:<sessionId>`，标记 subagent、parentKey（父是已知子会话则指向它，否则 `local`）；
   不认领、也不解析到父会话的 task_id / overview_session_id / owner 链接；子代理用 chat_* 起的新名字也被标记，之后同会话的调用归到该名字；
   复用父代理名字时不标记（父不会被隐藏）。顶层原生会话仍是 `local`，不变。

## 测试
- test-native-subagent.mjs 34/34
- test-subagent-marker 35/35，canvas-console self-test 30/30，collab-refresh 38/38，comfy 18/18、24/24

## 未验证
- 没有在运行中的 OpenCode 里实测（按要求不碰 E:\opencode 和运行中的进程）。
- 原生子代理的 IDE 工具（read_files、run_command 等）走 ideToolBroker，本来就不进画布活动记录；只有 Bridge 控制类工具（set_todos、bridge_* 等）经过 dispatcher 被记录/标记。
- 子代理 set_todos 仍写父对话的任务卡（overview_session_id 为父对话，原有行为未改）。
