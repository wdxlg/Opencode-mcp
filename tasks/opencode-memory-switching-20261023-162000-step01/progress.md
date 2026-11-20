# 进度状态板：opencode-memory-switching-20261023-162000-step01

- 当前步次：step02（完成）
- 最后完成事项：编译完成、已发布到源码根目录 `opencode/`，自检全部通过
- 下一步动作：无（本轮交付收尾）
- 当前操作文件：`tasks/opencode-memory-switching-20261023-162000-step01/task.md`
- 阻塞问题：无
- 需要用户确认事项：无

## 2026-10-23 18:15:00 - Step 03: 彻底移除工作区信任限制并添加 MCP 模式切换入口

### 变更与处理
1. **工作区信任（Workspace Trust）彻底解除**：
   - 在 `module-1047.mjs` 和 `module-1048.mjs` 中将 `WorkspaceTrustEnablementService.isWorkspaceTrustEnabled()` 修改为直接返回 `false`。
   - 将 `WorkspaceTrustManagementService.isWorkspaceTrusted()` 和 `calculateWorkspaceTrust()` 设为恒定返回 `true`，构造函数默认 `_isTrusted = true`。
   - 在 `module-3650.mjs` 和 `module-3380.mjs` 中修改配置定义默认值：`security.workspace.trust.enabled: false`，`startupPrompt: "never"`，`banner: "never"`，`emptyWindow: true`。
   - 在 `automation-workbench.mjs` 中移除限制检查 `if (!vscode.workspace.isTrusted ...)`，消除任何阻碍提示。
   - 在 `opencode/data/user-data/User/settings.json` 中注入默认配置 `security.workspace.trust.enabled: false`。

2. **临时 MCP vs 项目 MCP 界面入口与状态栏补齐**：
   - 在 `package.json` 中注册 `opencode.bridge.toggleWorkspaceScope` 命令（标题：切换 MCP 模式（临时/项目）），图标 `$(globe)`。
   - 在 Chat 面板顶部菜单栏（`workbench.panel.chat.view.copilot` 的 `view/title`）以 `navigation@8` 顺序添加切换按钮，位于规则中心前。
   - 在底部状态栏左侧增加实时状态项 `memoryScopeStatus`：
     - 临时模式显示：`$(globe) MCP: 临时 (整机设备)`，提示拥有全设备权限与临时专属记忆。
     - 项目模式显示：`$(folder) MCP: 项目 (<工作区名>)`，提示权限受限于当前项目文件夹与项目根目录档案袋记忆。
     - 支持点击一键切换，并附带通知提示。

3. **构建与验证**：
   - 运行 `scripts/sync-shared.cjs` 同步共享模块变体。
   - 运行 `scripts/update.cjs` 增量构建并发布 8 个变更核心文件到 `opencode/` 运行目录，校验 0 错误。
