# task — canvas-console-20261119-1856（团队协作页 → 多 AI 画布控制台）

总目标：把「团队协作」页重建为参照截图的多 AI 画布控制台（顶栏、左侧 AI 列表、画布、右侧 变更/活动/浏览器），状态只来自真实数据。用户已说“全都做”，不要确认框和成功提示。

| 阶段 | 内容 | 状态 |
|---|---|---|
| A | 数据层 recovered/shared/canvas-console.mjs：AI 身份、状态推导、活动日志与等待折叠、等你队列、可能卡住、全部停下；Bridge 工具 chat_join/chat_send/chat_read/chat_wait | 完成（源码+自测 24/24+构建） |
| B | 右侧 变更/活动 面板 | 完成（源码+无头截图自测+构建） |
| C | 左侧 画布上的 AI + 顶栏（项目切换、公网、在线数、全部停下） | 完成（同上） |
| D | 画布分组/卡片/筛选/小地图/缩放（原成员画布保留为「成员编排」） | 完成（同上） |
| E | 连线（群聊收发/派任务/上下级）与内置浏览器预览（browser 提案 API + CDP 截图，browser_open/list/close 工具） | 源码+自测完成；浏览器 API 未实机验证 |

使用方法：自测 `node tasks/canvas-console-20261119-1856/test-canvas-console.mjs`；构建 `node scripts/update.cjs`；真实界面需退出 OpenCode → deploy-to-E.cmd → 重启。
快照：pre/canvas-console-A-20261119-1856（4ac52543）。
失败原因/残差：见各阶段说明；未部署到 E:\opencode，界面未实机验证。
