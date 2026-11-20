# Windows-MCP 0.8.8 OpenCode 补丁

基线：uv 缓存 archive-v0/aga__x9a08yEz3R9 中 windows-mcp==0.8.8（2026-11-04 运行中的版本），原样提交为第一个 commit。

行为变更：
1. 只有 Ctrl+Shift+Alt+Backspace 能手动关闭 AI 桌面控制；再按一次恢复。鼠标移动、按键不再夺回控制权。
2. 取消 10 秒闲置门槛，服务启动与每次调用都不需要先闲置。
3. 用户有物理键鼠输入时，仅桌面输入类工具（Click/Type/Scroll/Move/Shortcut/MultiSelect/MultiEdit/App）在每一步前等待到用户静止 3 秒后继续（连续操作 60 秒仍未静止则返回 USER_ACTIVE）。用户的键鼠不再被拦截吞掉。
4. 其余工具（PowerShell/FileSystem/Process/Registry/Scrape/Snapshot/Screenshot/Clipboard/Notification/Wait/WaitFor/DisplayInventory/ControlStatus）不经过控制权门控，不受用户操作影响。

改动文件：windows_mcp/desktop/control.py、windows_mcp/desktop/control_hooks.py、windows_mcp/tools/control_notifications.py。
未运行功能测试。
