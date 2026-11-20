# task.md — context-fixes-20261118-1558

总目标：按「全部修复」实现原生对话上下文处理 6 项修复（窗口默认值与溢出学习 / 记忆简报每轮稳定注入 / AGENTS.md / 以往工具上下文裁剪与输出预留 / token 估算校准 / codebase_search 混合检索）。

| 分目标 | 状态 | 说明 |
|---|---|---|
| 1 窗口默认值、UI 提示、溢出解析与学习、2 次重试、兜底摘要 | 完成（源码+构建 exit 0；未运行验证） | 见 README |
| 2 记忆简报每轮稳定 + 增量进用户消息 | 完成（源码+构建 exit 0；未运行验证） | 任务卡句柄也移出 system |
| 3 AGENTS.md / CLAUDE.md | 完成（源码+构建 exit 0；未运行验证） | 设置 readAgentsMd / agentsMdBudgetBytes |
| 4 以往工具上下文裁剪、输出预留 | 部分完成 | spill 落盘未做（原因见 README） |
| 5 估算启发式 + 校准 + 圆环估算标记 | 完成（源码+构建 exit 0；未运行验证） | |
| 6 codebase_search 混合检索 | 跳过 | 原因：要对整个代码库切块做 embedding（大量付费请求、需持久向量缓存与失效策略），或每次检索额外联网重排（延迟/费用），且现有向量配置是为记忆目录准备的，借用会让代码检索悄悄产生费用；风险大于收益。 |

使用方法：见 README「自检」「回滚」。验收：node --check 全部改动文件、`node scripts/update.cjs` 构建发布到 opencode/；未运行功能测试（用户未要求测试），未重启 OpenCode。
参考相关性：dsh（E:\Dsh）文档 = 弱相关设计参考（agent-instructions 预算、pruner 头4K尾1K）；context-comparison 调研 = 强相关（问题定位）。
