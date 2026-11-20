# parallel-branches-20261105-step01 · Code/Plan 多模型分支真并行

- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027，基线 c268771（pre/parallel-branches-20261105-step01）
- 授权：用户「继续更新并行」——改源码、node scripts/update.cjs 构建、临时 git 仓库测试；不 push、不动 E:\opencode、不启停用户实例。
- 状态：源码 完成；构建 完成（errors []）；无界面逻辑测试 完成；界面内实际使用 未执行、未验证。

## 总目标
「多模型分支」一键运行时，各分支模型同时作答，而不是逐个排队；完成后各自作为对话里的一个分支变体，原有替换/合并/清理流程不变。

## 前置疑点核查（只读）
(a) taskOwnerId 与 chatTaskOwnerId：原生对话只有聊天控制工具（set_todos 等）经 dispatchChatTool 进入 BridgeToolDispatcher，传入的 commandOwnerId/taskOwnerId 就是 chatTaskOwnerId（native-chat:<uuid>），二者一致。原生对话的 apply_patch/read_files 在 agent-host 运行时进程内本地执行，不经过 dispatcher，因此本对话改动不会被记成“其他对话”的改动（合并过滤与快照等待不会误伤本对话）；反过来，原生对话的改动也不进入改动台账，其他对话看不到它（既有缺口，非并行引入，未改，列为后续）。并行后台分支显式继承前台的 chatTaskOwnerId，不再各自生成随机 id。
(b) isIsolatedFileCall：协作 fileToolRoots 对 worktree 任务返回「共享根 + 追加的 worktree 根」，roots[0] 仍是主工作区，旧判断（只看 multimodel-worktrees 字样或首个根不同）对协作 worktree 判为非隔离，会把其 worktree 绝对路径记入台账（影响打包提示、静默等待和合并排除列表）。已修：出现基础根之外的追加根即视为隔离；路径统一去尾斜杠比较。原生多模型分支的文件工具不经过 dispatcher，其隔离由 runAgent 的 workspaceRoots=[worktree] 与 ISOLATED_BRANCH 守卫保证，多个分支同时运行互不影响（每个 runId 独立上下文）。

## 设计
1. 工作台（027 module-2556 ChatBranchRunAllAction）：设置 opencode.multiModel.parallelBranches ≥2 且可用分支模型 ≥2 时生成 batchId，把整批模型（identifier/vendor/id/modelConfiguration）放进每个分支请求的 openCodeBranchIntent.parallel；仍逐个发送聊天请求（会话一次只接受一个请求）。并行模式下单个分支失败不终止其余分支；请求未发出或被用户停止时停止整批；结束时调用 opencode.multiModel.cancelParallelBranches(batchId, true) 回收没被显示的后台作业。
2. 扩展（000 module-0177）：批次第一个请求在 planBranchRound 之后，为其余模型启动后台作业——直接复用同一个请求处理函数（runRequest），用合成请求（同问题、对应模型、固定 groupId、toolInvocationToken 为空）和缓冲流；Code 模式各自建独立 worktree（复用 createBranchWorktree/linkIgnoredDependencies/collectBranchDiff）。后续分支请求到达时挂接对应作业：回放缓冲内容并实时转发，作业完成后把 metadata 中的 variantId 改写为真实请求 id，必要时补设 canonical。变体插入、apply/merge/cleanup 均走原有请求/元数据路径。
3. 并发：同时运行数（含前台显示的那个）≤ parallelBranches（默认 3，1 即串行，上限 6）；已被请求挂接的作业优先获得名额。
4. 取消/失败隔离：挂接请求被停止只取消该分支；状态栏「并行分支 N 运行 · M 排队」点击可取消单个或全部；作业异常只影响自身变体；30 分钟无人挂接或整批放弃时删除其 worktree。
5. 后台作业差异：不建任务卡、不暴露 set_todos/update_plan/report_progress/bridge_ask_user、不带 MCP 外部工具；IDE 工具（run_command 等）经 invokeDirect 执行（与 Bridge 相同路径），不逐条弹聊天确认，Code 模式仍限制在分支 worktree 内且规则门禁照常生效。
6. 快照：每轮仍只有首答做一次 git add -A 快照（20s 上限）；分支各自在自己的 worktree 用独立索引收集 diff，不争用主仓库索引。

## 改动文件
- recovered/esm/000-extension.js/module-0177.mjs（并行作业、挂接、取消、状态栏；normalizeBranchIntent/planBranchRound 小改）
- recovered/esm/000-extension.js/module-0183.mjs（background 运行的 IDE 工具改走 invokeDirect）
- recovered/esm/000-extension.js/module-0143.mjs（isIsolatedFileCall 识别协作 worktree）
- recovered/esm/000-extension.js/module-0023.mjs（注册 cancelParallelBranches / manageParallelBranches）
- recovered/esm/027-workbench.desktop.main.js/module-2556.mjs（RunAll 并行批次）
- assets/resources/app/extensions/opencode/package.json（opencode.multiModel.parallelBranches）
- tasks/parallel-branches-20261105-step01/（本记录与测试脚本），tasks/index.md

## 验收
见 progress.md。
