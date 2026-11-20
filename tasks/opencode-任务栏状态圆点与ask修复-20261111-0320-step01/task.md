# opencode-任务栏状态圆点与ask修复-20261111-0320-step01

## 总目标
1. 参照模型助手（ArenaCompanion `src/TaskbarStatusBadgeIcon.cs`）给 OpenCode 任务栏图标右上角加状态圆点：对话失败红、进行中黄、完成绿。
2. 检查并修复新版 OpenCode（本工程 opencode/）原生对话里 ask（bridge_ask_user）的问题。

## 用户意图判断
- 显式指令：更新 E:\OpenCode-Source-Recovery-20261013；圆点“参考模型助手的这个功能”；ask“检查并修复”。
- 参考相关性：模型助手 TaskbarStatusBadgeIcon.cs —— 强相关（颜色、优先级、计数显示照搬）。截图（模型助手图标右上角黄色“2”）—— 强相关。
- 未经用户确认的设计假设（如需改动请告知）：绿色只计“已完成且未读”的对话（打开看过即消失），失败同理只计未读；等待输入算红色（同模型助手“等待”计入红色）。归档对话不计。

## 调查结论
- 圆点：Code-OSS 主进程已有 `setApplicationBadge` → `BrowserWindow.setOverlayIcon`（006-main module-0242），但只有被禁用的 Agents 窗口（018 sessions）调用；主工作台没有。对话状态取 `IAgentSessionsService.model.sessions`（status 0失败/1完成/2进行中/3等待输入，isRead/isArchived）。
- ask：会话 cbda6cd7（模型 deepseek-v4.1-flash-1017，code 模式）发起 4 道批量提问后：
  1. agent-host 调宿主工具 `ide/tool/invoke` 固定 180 秒超时（002 module-0014），bridge_ask_user 本应一直等到回答，超时后模型收到错误、问题仍挂起，宿主稍后回包被丢弃（日志 `[agent-host] unexpected peer response id=host-38/48`），随后再次提问被拒、set_todos 被等待门禁拦截。
  2. 问题只显示在任务板，原生对话里只有“bridge_ask_user running”，用户看不到要回答什么（用户随后问“你做多少了，这也太慢了”）。
  3. 模型在 ask 模式误带 question_id、check 模式漏 batch_id，都被严格校验拒绝，浪费轮次。

## 改动（分目标与状态）
| 分目标 | 文件 | 状态 |
|---|---|---|
| 任务栏状态圆点 | 新增 `recovered/esm/027-workbench.desktop.main.js/opencode-chat-taskbar-badge.mjs`；登记 `modules.json`；`module-2590.mjs` 引入 | 完成（源码+编译），未实机验证 |
| 宿主工具等待不再 180 秒超时 | `recovered/esm/002-agent-host.js/module-0014.mjs`（bridge_ask_user/bridge_batch/bridge_wait_messages/bridge_wait_team/wait 无代理超时，取消仍生效） | 完成（源码+编译），未实机验证 |
| 原生对话内直接回答 | `recovered/esm/000-extension.js/module-0114.mjs`（`askInNativeChat`：登记问题后立即逐题弹出选择框，可自定义回答；任务板回答同样有效，先到先算） | 完成（源码+编译），未实机验证 |
| ask/check 参数容错 | `recovered/esm/000-extension.js/module-0143.mjs`（check 未带 id 时取本会话待答批次；ask 模式忽略误带的 question_id/batch_id） | 完成（源码+编译），未实机验证 |

## 使用方法
- 构建：`npm run build`（编译+校验通过；发布到 opencode/ 需先关闭正在运行的 opencode/OpenCode.exe，再执行一次）。
- 效果：Windows 任务栏 OpenCode 按钮右上角出现带数字的圆点；关闭所有对话活动后消失。

## 验收
- node --check 5 个文件通过；`npm run build`：000/002/027 三个包编译成功，build-verification success、0 错误；产物中可检出新代码。
- 发布：被拒（opencode/ 正在运行，脚本未停止任何进程）。
- 未运行功能测试、未实机验证圆点显示和对话内提问。

## 快照
- 修改前：tag `pre/opencode-任务栏状态圆点与ask修复-20261111-0320-step01`（HEAD 1ad856b9）。module-0114/0143 在修改前已有其他会话未提交改动，备份在 `backup/opencode-任务栏状态圆点与ask修复-20261111-0320-step01/`，提交时只带本次改动。
