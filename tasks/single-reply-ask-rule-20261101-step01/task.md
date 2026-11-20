# 任务记录：single-reply-ask-rule-20261101-step01

- **总目标**：更新 OpenCode 强制调用 `ask` 的规则（《需求澄清与交互式决策》v4→v5 及《Bridge 交互式提问》v2→v3），规定包含 `ask` 提问及答复后全部执行的整个任务必须在同一次回复内闭环完成，中途一切疑问/方案选择/工作流确认/授权询问必须通过交互式 `ask` 工具提出，严禁中途直接停止回复。
- **当前状态**：完成
- **修改前快照**：`refs/tags/pre/single-reply-ask-rule-20261101-step01` (`2722df0f9023bf85238d509a0ace5cb4a4d81021`) + `backup/single-reply-ask-rule-20261101-step01/`
- **本地隔离提交**：`refs/heads/task/single-reply-ask-rule-20261101` -> `abad1a27e7ba9b4ce378cf9f9e4fbf1d8db78aac`
- **子任务状态**：
  1. 只读核查实时规则库与源码定义：完成
  2. 通过原生 `ask_user` 完成范围与口径确认：完成（实时规则库 + 源码编译；涵盖一切中途疑问与工作流确认）
  3. 修改前备份快照与影响评估：完成
  4. 更新源码迁移逻辑、同步共享模块并编译 `opencode/`：完成（10/10 完整性校验通过）
  5. 原子升级本机实时规则库 `rules-and-collaboration.v1.json` 并通过单元测试：完成
- **失败原因**：无（首次字符串替换遇到 CRLF 换行差异已由保护断言拦截并按原文件换行符无损写入）
- **使用方法**：
  - 当前运行中的 `E:\opencode` 已通过共享规则库 `%LOCALAPPDATA%\OpenCode\shared-automation\rules-and-collaboration.v1.json`（修订号 `115`）即时生效，无需重启；
  - 新编译的便携运行版位于 `E:\OpenCode-Source-Recovery-20261013\opencode`（保留 `data/` 不变，未触碰正在运行的 `E:\opencode`）。
- **验收结果**：通过（单元测试通过、构建校验 `errors: []`、实时规则库原子升级成功）。
