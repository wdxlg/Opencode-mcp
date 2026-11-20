# bridge-task-panel-p44（Bridge 侧栏「任务」面板改进）

- 改动文件：recovered/esm/027-workbench.desktop.main.js/module-2764.mjs（openCodeBridgeSessionView.ts）
- 该文件改动前已有其他对话未提交改动，本任务不提交；补丁见 module-2764.p44.patch（相对改动前工作区版本 sha256:6924d1db…）。
- 改动前备份：backup/bridge-task-panel-20261118-1400/
- 内容：状态按实际结果（退出码≠0 → 红色错误图标 + 淡红左边框；取消 → 灰色斜杠；运行 → 蓝色旋转；成功 → 绿勾）、
  任务分段筛选（进行中/未完成/已完成 + 运行中调用数）、底部「失败 N / 命令失败 N」点击筛选、调用按任务卡分组（未归属）、
  命令轮询并入 run_command、批量调用摘要与子调用展开、单客户端隐藏客户端名、heredoc 标题、「+N 步」改为「另 N 条命令」、
  动词小图标、5 分钟时间分隔、耗时颜色分档、底部按钮悬停闪烁修复（只在提示文字变化时 setTitle）、停止按钮红色。

