# OpenCode Bridge 原生提问优先与进行中任务保留

- 本地任务 ID：opencode-bridge-ask-priority-task-retention-20261031-step01
- Bridge 任务卡：`1f00b754-e341-43cd-bb6b-e7545c85d373`，当前 revision 3。
- 状态：实现中；尚未构建、测试、安装、重启或修改正式运行目录/用户配置。
- 用户要求：提问时优先当前宿主原生交互提问工具；只有该能力未提供或明确不可用时才回退 `bridge_ask_user`，避免重复提问。
- 用户选择：隐藏历史任务，不设折叠历史区。仅 `running`、`waiting_plan`、`awaiting_user`、`awaiting_sync` 在任务架可见；其他状态立即隐藏，并以非活动状态的 `updatedAt` 为起点保留 10 分钟后自动从持久化历史删除。
- 用户边界：不写入正式 `E:\OpenCode` 或真实用户配置；不安装依赖、不运行功能/回归测试、不启动或重启实例。源码恢复工程正常构建目标仅为本工程 `opencode/`。
- Git：原分支 `task/opencode-leanrea-replace-20261027`、HEAD `2722df0`；保留所有既有未提交及未跟踪内容，不暂存/提交无关改动。
- 修改前快照：`backup/opencode-bridge-ask-priority-task-retention-20261031T092744Z/`；pre 分支/tag：`pre/opencode-bridge-ask-priority-task-retention-20261031T092744Z` -> 原 HEAD。

## 实施范围
1. 更新 Bridge 默认提问规则和 `bridge_ask_user` 工具说明，增加原生优先与仅不可用时 Bridge 后备；对用户定制规则执行保守版本迁移。
2. 持久化清理仅处理非活动任务，答题等待与同步等待仍视为进行中；UI 两个 workbench 变体仅显示四个进行中状态，不渲染折叠历史。
3. 更新任务保留说明、本地化与源码版本，并保持 `recovered/shared/` 与构建副本一致。
4. 仅在现有构建依赖可用时执行正常源码构建/完整性发布；不运行功能测试、不启动应用。

## 已完成只读核查
- 已确认 VS Code 原生 `vscode_askQuestions` 定义，但当前 Bridge MCP `tools/list` 不暴露该工具；规则应检测 AI 当前会话的宿主能力，而不能假定它总是可用。
- 已核对两个 UI 变体：`027-workbench.desktop.main.js` 与 `018-sessions.desktop.main.js`；两个任务存储/清理路径均需同步行为。
- 已发现 `BridgeTaskStore.pruneTerminal()` 当前为空操作；状态快照与任务更新会调用它，持久化加载也将加上到期清理。
