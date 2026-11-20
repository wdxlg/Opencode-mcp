# 实测与修复（2026-11-19 16:15–16:35）

## 修复（tag pre/dsh-context-fix-20261119-1615 之后）
- 溢出文件放到工作区 `.opencode/tool-results/`（自带 .gitignore `*`，7 天前的文件自动清理），提示改为 read_files 按 start_line/end_line 读、run_command grep 搜；没有工作区时退回 %TEMP%。
- read_files 不再溢出（dsh spill-policy 同样放过 read）；上限按 dsh-token-meter 计价（字符/4 + 块开销 4）。
- 重放保留本轮注入的图片（工具截图等），不再替换成占位文字。
- 超大轮次不再整轮放弃：先去图片、再把工具结果截到 12K、再截到 2K，只有仍超过 8MB 才退回文字历史。

## 实测（hark_live.mjs，真实 agent-host 模块 + 假工具，swe-2 @ sub.xniu.shop，thinking 开）
窗口 65536 / 输出 8192：
- T1：s,u(工作区指令),u(问题) 连续 user 正常；run_command 结果溢出，消息约 12,487 token，模型用 read_files 读到第 3333 行。第 3 次请求缓存命中 23,936/45,721。
- T2：上一轮原样重放（含 tool_calls、reasoning_content），缓存命中 45,696/45,808；读 pkg/ 时补发 pkg/AGENTS.md，回答按规则以 PKGRULE 结尾。
- T3 手动压缩：走重放路径（带 3 个工具、thinking 开、8 段指令在最后），约 28,217 → 3,060 token。
- T4：s,u(指令),u(摘要),u(问题) 正常，答对两项。
- 第一次运行误设输出上限 = 窗口，压缩全部退回文字转录；属于测试配置问题。
备注：估算（字符/4，与 dsh 相同）对这类重复文本偏低约 40%，靠运行中 tokenRatio 校准；65K 窗口下 dsh 的 65,536 余量公式会跳过自动压缩，1M 窗口不受影响。
