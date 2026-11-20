# parallel-branches-20261105-step02 · 后台并行分支的终端命令需用户确认

- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027，基线 3190c7b（pre/parallel-branches-20261105-step02）
- 授权：用户「确认」——后台并行分支不再无确认地执行终端命令；改源码、node scripts/update.cjs 构建、在 E:\opencode 之外的临时目录跑无界面测试；不 push、不动 E:\opencode、不启停用户实例。
- 状态：源码 完成；构建 完成（errors []）；无界面逻辑测试 完成；界面内（通知 / 状态栏 / 真实分支模型）未执行、未验证。

## 总目标
step01 的后台分支经 invokeDirect 执行 run_command，没有逐条确认。现在：只有明显只读的命令自动放行，其余终端命令必须等用户明确允许；拒绝时给该分支模型返回清晰的工具错误，让它继续；等待确认不阻塞其他分支；取消 / 放弃批次 / 30 分钟清理时干净拒绝。step01 其余行为不变。

## 设计
1. 前台确认机制（module-0165 的 vscode.lm prepareInvocation + toolInvocationToken）依附于聊天请求，后台作业没有请求令牌，无法复用；因此新增后台专用审批：VS Code 非模态警告通知（「允许一次」/「拒绝」，显示分支模型、完整命令、cwd、需确认原因），状态栏「并行分支」项显示「N 待确认」并在 tooltip 列出命令，点击后的快速选择里可逐条「允许一次 / 拒绝」。关闭通知视为未允许（拒绝）。
2. 运行时（module-0183 handleIdeToolRequest）：context.background 时，run_command 与 send_command_input 在执行前调用 approveBackgroundCommand → context.approveCommand；未允许抛 BACKGROUND_COMMAND_DENIED（经 JSON-RPC 错误回到该分支模型）；没有审批通道时失败关闭。隔离 worktree 分支以 worktree 为根；非隔离后台运行以 defaultWorkspaceRoot 为根。get_command_output / cancel_command 及文件工具不受影响。
3. 扩展（module-0177）：classifyBackgroundCommand（只读白名单分类）、requestBackgroundCommandApproval（每条待审一个 Promise，互不阻塞）、settle/reject、状态栏与管理命令扩展；runRequest 给后台运行传 approveCommand（带 batchId / 模型 / 作业取消令牌）。
4. 拒绝时机：分支取消令牌触发（单个取消、整批取消、挂接请求被停止）、cancelParallelBranchesCommand（取消/放弃批次）、discardParallelJob（30 分钟无人挂接清理）、单条等待满 30 分钟（BACKGROUND_COMMAND_APPROVAL_TIMEOUT_MS = PARALLEL_JOB_TTL_MS）、扩展 dispose。迟到的回答被忽略。
5. send_command_input（向运行中的进程写入）一律需要确认。

## 只读白名单（全部条件同时满足才自动放行）
- 命令名：ls、dir、pwd、cat、type、head、tail、wc、grep/egrep/fgrep、findstr、rg（禁 --pre*）、stat、file、which、where、echo、tree、diff、cmp、du、basename、dirname、realpath、cut、tr、find（禁 -exec/-execdir/-ok/-okdir/-delete/-fprint*/-fls）、sort（只允许 -bdfghiMnrRsuVz 与 -k/-t，禁 -o/长选项）。
- git：可选 --no-pager 后接 status、diff、log、show、rev-parse、ls-files、blame、grep、describe、shortlog；branch 仅列表参数（-a -r -v -vv --all --remotes --list --show-current --no-color）；remote 仅 -v；git --version。禁 --output*、--ext-diff、-O*/--open-files-in-pager；git -C / -c 等全局选项需确认。
- 版本查询：node/npm/pnpm/yarn/python/python3/py/tsc/java/dotnet/go/cargo/rustc/deno/bun 仅 `--version`/`-v`/`-V`（go/dotnet 另含 version）。
- 语法：只允许单词、引号与 && || | ; 连接，且每一段都在白名单内；出现 > < 重定向、$ 变量/命令替换、反引号、单个 &、|&、括号、花括号、# 注释、行首 ~、换行、环境变量前缀（FOO=1 cmd）、cd、路径形式的命令名均需确认。
- 路径：cwd 必须在分支根内；参数（含 --x=/path、-f/path 形式的选项值）中的绝对路径、~、Windows 盘符路径、含 .. 的相对路径解析后必须在分支根内。命令总长 > 2000 字符需确认。
- 保守的已知代价：findstr /i 这类以 / 开头的参数、grep 的以 / 开头的模式、2>/dev/null 也会要求确认。

## 改动文件
- recovered/esm/000-extension.js/module-0177.mjs
- recovered/esm/000-extension.js/module-0183.mjs
- tasks/parallel-branches-20261105-step02/（task.md、progress.md、tests/classify.test.cjs、tests/approval.test.cjs），tasks/index.md

## 使用方法
- 构建：在仓库根执行 node scripts/update.cjs（本机需把 TEMP/TMP/TMPDIR 指到 E:\opencode 之外，在子 shell 内设置，否则 Bridge 终端会挂起）。
- 测试：node tasks/parallel-branches-20261105-step02/tests/classify.test.cjs recovered/esm/000-extension.js/module-0177.mjs；node tasks/parallel-branches-20261105-step02/tests/approval.test.cjs recovered/esm/000-extension.js/module-0177.mjs recovered/esm/000-extension.js/module-0183.mjs。

## 验收
见 progress.md。
