# progress · parallel-branches-20261105-step01

- 当前步次：step01 完成（源码 + 构建 + 无界面测试）；界面内验证待用户。
- 构建：node scripts/update.cjs → verify "errors": []；000-extension.js compiled（warnings 1，为 module-0023 第 36 行既有的 module.exports 提示，非本次引入）；027-workbench compiled（warnings 0）；RUNTIME_UPDATE success，destination <repo>\opencode，changedFiles 6。
- dist 核对：opencode/resources/app/extensions/opencode/dist/extension.js 含 startParallelBranchJobs、attachParallelBranchJob、__openCodeParallelBranchJob、opencode.multiModel.cancelParallelBranches/manageParallelBranches、context.background ? … invokeDirect、协作 worktree 判断；package.json 含 parallelBranches；workbench.desktop.main.js 含 openCodeParallelBranchLimit/openCodeBranchBatchId/parallel 批次参数。
- node --check：5 个改动的 .mjs 通过；package.json JSON 解析通过。
- 测试（tests/，在 %TEMP%\oc-par-tests 临时目录运行，已清理）：
  - orch.test.cjs（从 module-0177 原文抽取并行编排代码，模拟 runRequest）：并发上限（3 = 前台 + 2 后台，前台结束后第 4 个启动）、owner id 透传、缓冲回放与实时转发、variantId 改写与 canonical、单分支取消、整批放弃时删除未挂接 worktree、limit=1 串行、排队中被挂接的作业在名额释放后优先启动 —— PASSED。
  - iso.test.cjs：新 isIsolatedFileCall 对两个同时存在的协作 worktree 所有者均判隔离、普通 Bridge 所有者判共享、尾斜杠不误判 —— PASSED；同一测试对旧版本失败（复现缺陷）。
  - wt.test.mjs（Windows 主机，真实 git，临时仓库）：快照不动真实索引；4 个 worktree 并发创建；node_modules 以 junction 链接；并发 collectBranchDiff 互不串扰；3 个并发快照引用无 index.lock 冲突；prepareCodeMergeSources 按 ownerId 排除其他对话文件、保留本对话文件；waitForWorkspaceQuiet 无他人改动时立即返回；并发删除先解链再删目录，主 node_modules 完好、worktree 列表干净 —— 9/9 PASSED。
- 未执行、未验证：OpenCode 界面内一键多模型分支的实际并行效果、状态栏显示、真实模型调用、后台 run_command 的实际执行与权限体验、合并总结在并行变体上的端到端流程。
- 下一步：用户在新构建的 <repo>\opencode 中实际试用；如需发布到 E:\opencode 由用户决定。
- 阻塞/待确认：后台分支的终端命令不逐条弹聊天确认（见 task.md 设计 5），如不接受可把 parallelBranches 设为 1。
