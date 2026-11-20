## 01:40 建议 11 完成（构建未跑、未实机）
改动：module-0119（tools/call 传 elicit；新增 elicitorFor）、module-0143（新增 startElicitation；单题/批量等待时并行推表单，finally 取消）、module-0114（elicitationEnabled 读设置）。快照在 pre/。node --check 三文件通过。
行为：仅 legacy 有状态会话 + 客户端声明 elicitation(form 或旧版空对象) + 设置开启时生效；任务板提问照常创建；表单 accept 写回任务板（answer.source=mcp-elicitation），decline/cancel/失败只回退任务板；任务板先答则 abort 表单请求。
MCP Tasks 暂缓：Tasks 语义是「任务增强的长请求」（客户端发起、服务端返回 taskId 供轮询），与任务卡（AI 自维护的计划）不是一回事；规范已转扩展（SEP-2663）仍在变。硬映射会让客户端误以为能轮询/取消任务卡。

## 02:00 建议 7 已提交 f99f6212（Hark 接手，构建未跑、未实机）
提交：module-0143、module-0114、scripts/sync-shared.cjs、shared/ 与 esm/ 两份 shadow-checkpoints.mjs，以及 modules.json 中只含 shadow-checkpoints 的那一条（用 update-index 单独暂存）。
work-automation / work-store / autopilot-store 三条还在工作区里没提交，留给那个会话自己处理；其他 M 状态的文件没有动。
下一步：建议 12（Spec 模式）。


## 02:30 建议 12 已提交 ad3ea345（构建未跑、未实机）
新模块 shared/spec-mode.mjs（esm 下也有一份），新增工具 bridge_spec：
- status：查看本任务三段的状态。
- submit：写入 .opencode/specs/<任务号前8位>/<stage>.md，然后在任务卡上提问，选项为「通过 / 需要修改（自定义回答写意见）/ 本任务跳过 Spec（只在需求段出现）」，最多等 30 分钟。
三段按 requirements → design → tasks 的顺序提交。重新提交前面的段，后面已有的段会标为 stale，需要重新评审。
门禁加在 module-0143 handleToolCallTracked 里（bridge_batch 的子调用也会经过这里）。拦的是 apply_patch、write_file、edit_file、create_file、run_command、send_command_input，以及 ext__*__powershell/filesystem/registry。只对开关开启后新建的任务卡生效，开启时间记在 .opencode/specs/.enabled-since.json，关掉开关时删除。门禁检查出错时放行，只记日志。
评审超时后用户才回答的，会在下一次 status 或门禁检查时补记结果。
开关是 opencode.bridge.specMode（默认关闭）。扩展 package.json 里同时加了 elicitation、checkpoints、specMode 三个设置项。
spec-mode.mjs 在宿主上用 node 单测过：顺序、修改、过期、跳过、开关关闭都正常。dispatcher 那部分没实机跑。modules.json 仍然只提交了本模块这一条。
剩下：建议 5（ACP）暂缓；构建打包和实机验证还没做。

