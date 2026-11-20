# task — collab-refresh-20261119-2140（团队协作页：不再“刷新”、子代理不进列表、画布去填充文字、工具栏重做）

快照：pre/collab-refresh-20261119-2140（d08dae0a）。

## 根因
扩展端（automation-workbench.mjs）没有重设 webview.html、也不会重建面板（retainContextWhenHidden，html 只在 open() 时赋值一次）。
“刷新”来自 webview 端整块重建：
- 扩展端 `setInterval(postAll,3000)` + `service.onDidChange(postAll)`：每 3 秒、以及每次 Bridge 连接 / 会话 / 子代理 / 任务卡变化都推一次完整 state；
  collaboration.js 的 render() 每次都 replaceChildren 重建项目下拉框、成员编排画布（drawCanvas）、成员列表（drawMembers）。
- 聊天记录的重建 key 含**所有**任务卡状态和**所有**成员（含每个外部对话/子代理的临时连接成员），别的对话一动就整段重建，
  replaceChildren 让 scrollTop 归零（没在底部时跳到顶），会话列表也整块重建。
- AI 画布（canvas-console）每 2 秒取一次快照，renderAll 把左侧列表、所有分组/卡片/网页截图 <img>、连线全部重建（截图会闪），右侧列表滚动归零。

## 改动（只改 webview，扩展端未动）
- 相同 state 直接跳过；下拉框、成员编排画布、成员列表按签名只在自己的数据变了才重建；
- 聊天记录 key 只看本频道引用的任务卡和发言人，重建时保留滚动位置；会话按钮按频道复用元素；
- AI 画布按 key 复用分组/卡片/网页元素，截图没变保留同一个 <img>；连线、左侧列表、筛选、在线头像按签名更新；右侧列表保留滚动；
- 子代理过滤：私聊列表去掉临时连接成员（temporary）和带 subagent/parentId/parentID/parentSessionId 标记的；AI 画布去掉带这些标记的 AI；
- 空画布：去掉长段说明、空的「没在项目里」分组、计数 0 的筛选、空小地图；左侧只留「暂无 AI」；
- 底部工具栏：分组（模式 | 缩放 | 排布 | 显示），图标 + 中文 + 说明；AI 画布/成员编排分段按钮；「聚焦」改名「居中」；「连线」「网页预览」带勾选框和开/关提示；窄宽度只留图标；
- 聊天头部「清空」「规则」加说明。

## 验收
- 新测试 tasks/collab-refresh-20261119-2140/test-collab-refresh.mjs：38/38
- 回归：test-comfy-wires 18/18、test-comfy-step02 24/24
- 截图：canvas-empty.png、canvas-ais.png、canvas-ais-wide.png
- 构建：OPENCODE_NO_AUTOCLOSE=1 node scripts/update.cjs（不关闭正在运行的 OpenCode）

## 残差
- 扩展端现在不给 Bridge AI / MCP 连接带“子代理”标记；AI 画布的过滤要扩展端（canvas-console.mjs / automation-workbench.mjs，均为其他对话未提交文件）补标记后才对真实数据生效。
- 实机界面未验收（无头 Edge + 深色主题桩）。
