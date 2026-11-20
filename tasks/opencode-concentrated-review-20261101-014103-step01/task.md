# 任务：集中看板、人工审阅、Git 合并和可信交接

- 任务 ID：`opencode-concentrated-review-20261101-014103-step01`；状态：源码和构建完成，运行版更新阻塞。
- 目标：在 `E:/OpenCode-Source-Recovery-20261013` 借鉴参考项目的集中看板、人工审阅、通用分支合并和历史自述／当前观察分离，不替换现有权限、回执、租约及记忆。
- 参考项目：`D:/杂物/Arena模型助手-源码-fyb-0.1.2/参考/arena-bridge-0.2.0-preview.8/arena-bridge`；强相关，仅借鉴；不引入自动测试、自动网页唤醒或自部署。
- 修改前 HEAD：`2722df0f9023bf85238d509a0ace5cb4a4d81021`。
- 修改前快照：`pre/opencode-concentrated-review-20261101-step01` → `28a1013ea0eeb69d743e6186c7576443f7696cd8`。隔离索引保存已存在的源码修改；没有切换分支，原索引 SHA-256 前后均为 `eb1b92270463dc7c5c9454ee943515726f9e72b0e2839434726090ce12293d85`。首次快照误包含既有 `__pycache__`，在改源码前修正了本次新建快照引用，未改用户工作树或既有历史。
- 本任务 Bridge 卡：`c5913797-7cd1-4341-9578-25a66ed742db`。

## 已读与约束

- `global` / workspace `ws_5e2cf43dbb28bf127d28ef24` 全部启用规则已读并按真实 hash 确认；`AGENTS.md` 与目标工程 `AGENTS.md` 全文已读。`frontend-design/SKILL.md` 全文已读。
- 相关源码：`recovered/shared/{automation-workbench,collaboration-workspaces,collaboration-runtime,collaboration-staff,collaboration-staff-store,collaboration-staff-integration}.mjs`，`project-memory.mjs` 中交接相关范围；`assets/.../collaboration.html`、`automation.css`；`recovered/standalone/.../collaboration.js`；同步与构建脚本。大文件只注明已读相关范围，不声称全文。
- 只生成；没有用户明确测试授权，不运行功能测试、回归、模型请求、真实协作或实际业务合并。不安装、不推送、不启停现有进程。运行版当前有活动进程，禁止覆盖；源码构建与发布分开。

## 设计与影响

- 集中看板由现有项目普通任务和团队任务计算，不创建替代账本。审阅意见绑定真实执行尝试与保留差异快照；只作为本地意见，不冒充经理读取回执、测试或用户验收。需要反馈时由本地用户显式发送已有定向消息。
- 合并仅在本机用户查看预览后再经独立确认；拒绝脏目标、未知执行、未满足的团队审查／整合与冲突，不自动运行测试、安装、推送或重启。Git 工作树、文件锁与哈希不是 OS 沙箱或绝对事务。
- 交接保留原有多槽位、锁和历史，清楚区分上次自述与本次读取到的记忆／协作状态，不把观察冒充对业务效果的证明。
- 拟改：`recovered/shared/automation-workbench.mjs`、`collaboration-workspaces.mjs`、新增审阅及合并共享模块、`project-memory.mjs`、`scripts/sync-shared.cjs`、协作 HTML/CSS 与 `recovered/standalone/.../collaboration.js`。源码构建会同步入口变体及产生 `generated/source-build`。
- 界面遵循现有 VS Code 主题：编辑器底色（fallback #1e1e1e）、标题底色（#252526）、正文（#cccccc）、次级说明（#9da0a2）、边界（#454545）、焦点（#007fd4）；主题变量优先。结构为工作区工具栏、按状态分列的任务卡、同屏差异／讨论，以及并列的历史与现时状态；窄屏折叠且保留键盘焦点。

## 交付状态

源码和构建完成；运行版更新因目标运行中而受阻。测试／真实协作／业务合并／模型请求均未执行。

- 源码提交：`ebf6ade22404317b5b4cfd0b79281b1884326a9c`，独立 ref `refs/heads/task/opencode-concentrated-review-20261101-014103-step01`，父级为上述修改前快照。此提交相对快照仅含 17 个本次源码及使用说明路径；预存用户修改保存在父快照中，未改变既有 HEAD、主暂存区或工作分支，未推送。
- 已同步 `000-extension.js` 的 5 个共享模块与模块索引，以及 `003-mcp-server.js/project-memory.mjs`。HTML/CSS、standalone 前端及 `COLLABORATION-REVIEW-AND-MERGE.md` 为本次交付源码。
- 仅生成：`node scripts/update.cjs --source-only`，最终命令 `cmd_71d3bd9839d092d95e56993df4e8488953ee248352d234d9` 成功；构建完整性记录 `success: true`、28 bundles、70 standalone 文件、10 项 product integrity、`errors: []`。两个被重新编译入口各有一条位于恢复版 `module.exports` 源文件的 CommonJS/ESM 提示；不冒充测试通过。
- 仅做静态语法、共享副本一致性、23 个新增 DOM ID、动作和模块索引及 Git diff 空白检查，命令 `cmd_250cb02d17d172379247b66a926778063a388230100895c3`；不是运行行为验证。
- 已向 `.ai-workflow/memory.sqlite` 写入本任务专用 delivery 和 17 条源码哈希记录（`cmd_30119c188e468b781a54d207497862392a49a4a4cdc1baa2`），不改其他任务行。
- 构建产物位于 `generated/source-build/`，只是源码编译暂存；固定运行目录 `opencode/` 未更新。用户自行关闭运行实例后才能按规则另行发布；测试须明确授权。Git 预览不提前断言无冲突，确认后才在目标更新前检查；合作锁不能阻止外部编辑器竞态，未知结果需人工核对、不可自动重试。
