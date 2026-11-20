# custom-cmd-ui-20261111-011500-step01

## 总目标
输入框「配置工具…」旁新增「配置指令…」按钮；自定义指令可在窗口里新建/编辑文字内容（如 /draw → 使用一个 skill 去画画）；自定义工具出现在「工具」窗口并由内置 AI 直接使用。

## 分目标与状态
- [完成] 工作台按钮：module-2203 新增 ConfigureCommandsAction（workbench.action.chat.configureCommands，ChatInput navigation order 101）→ opencode.manageCommands
- [完成] 扩展命令：module-0023 注册 opencode.manageCommands
- [完成] 指令窗口：module-0161 manageOpenCodeCommands（列表/搜索/新建/编辑/删除/打开文件/打开目录，写 ~/.opencode/commands 或 <工作区>/.opencode/commands 的 名字.md）
- [完成] 工具窗口：module-0161 列出 .opencode/tools/*.json 自定义工具（分组「自定义工具」），开关共用 __ocDisabledTools
- [完成] 内置 AI：module-0177 prepareOcCustomTools 跳过被关闭的自定义工具；导出 __ocCustomCommandCatalog / __ocCustomToolCatalog
- [未执行] 构建（npm run build）与运行验证

## 使用方法
点输入框「配置指令…」→ 新建指令：名字 draw，内容「使用一个 skill 去画画：$ARGUMENTS」→ 保存；对话输入 /draw 一只猫。
自定义工具仍在 .opencode/tools/*.json 定义（/tools init 生成示例），在「配置工具…」窗口「自定义工具」组里开关。

## 快照
pre/custom-cmd-ui-20261111-011500-step01 → 2733f83a

## 验收
node --check 四个文件通过；webview 脚本单独 node --check 通过。未构建、未运行、功能未验证。

## 残差
- 018-sessions.desktop.main.js（会话窗口）里的 ConfigureToolsAction 副本未加「配置指令」按钮。
- 指令窗口按第一个工作区文件夹定位工作区级目录，未跟随对话设置的工作区。
