# REA 全部后端原生接入纠正

用户边界：仅后端功能；不交付 REA CLI/前端/独立服务/专用 Node/REA MCP 子进程。保留 Ghidra、IDA、Frida 等外部引擎适配但不打包引擎。授权源码与构建，不启动产品或实际逆向，不写正式 E:\OpenCode。

## 限定 PRE
fe8af0fbb4ebee40a238836b8dceaee58530a65f，ref refs/heads/ai/rea-backend-0a0f5ddc/pre。共享 HEAD/index 未变；恢复只按 state.json 所列路径，不整仓 checkout。后端源码审计仅读取现有固定官方包；未执行它的入口。

## 尚未完成
原生注册器、全工具目录、参数/结果验证、取消/清理、宿主兼容、仅后端依赖闭包及构建发布仍待完成。旧独立运行包不是此需求的交付。

## 当前未完成状态
静态核查与限定 PRE 已记录，详见 architecture-review.md 与 audit-ast.json。后端原生接入尚未实现，不能宣布完成；旧独立运行包尚未移除。当前产品源码哈希未变，无 POST、构建或发布。本状态不是等待用户授权。

## 源码移植中
用户继续后已补 PRE e83a49f3d232feed971c98e1c70fc7d6573badbe。新增 recovered/rea-backend：无传输分析服务、229 项目录、工作流模板与原生注册器。仅复制已有必要依赖缓存，不安装、不启动。待原生调度接线、资产迁移、POST 和构建。

## 原生后端源码完成，待构建
原生 229 工具与工作流已接入现有 OpenCode 调度/规则/结果通道；不再启动 REA MCP/CLI/专用 Node。资源闭包已补足两个包内 worker 映射、Ghidra Java 与 Python/Swift 辅助脚本。私有 Zod 与根依赖版本分别保留；必要依赖内容有锁定哈希。旧默认资产仅按原 manifest 和当前文件哈希退休。源码 POST 06ae06fc290be6d5cbcaa76f8876713f18d30e93，ref refs/heads/ai/rea-backend-0a0f5ddc/post；共享 HEAD/index 未变。没有启动产品或功能验证。

## 最终交付（源码与构建完成，不是运行验收）
版本沿用项目现有 1.0.0-recovered.33；唯一交付 E:\OpenCode-Source-Recovery-20261013\opencode。
全部 229 项后端工具及 rea_workflow 直接接 OpenCode 工具目录、调度、规则和结果通道；移植维护源码与必要的 80 包依赖，补齐 worker 包内映射及 Java/Python/Swift 辅助资源；没有 REA CLI/前端/独立 MCP 服务/专用 Node/外部引擎。
静态编译与默认资产哈希检查成功，两个分析 worker 入口编译成功；复核 7357 个已发布后端资产及 release 清单。私有 Zod 4.4.3、根依赖 Zod 4.6.7 的实际文件解析位置保留。
按磁盘当前全量输入构建，保留并包含同工作区“OpenCode 接入 dsh-see-now”和其他现有改动；不把他人源码纳入本任务新增提交。保留 data/.recovery-profile/非托管文件，不修改正式 E:\OpenCode，不杀实例、不强抢构建锁。
未启动产品、未实际逆向、未运行功能测试，不声称宿主运行兼容、引擎就绪、原生绑定、取消/并发/隔离/搬迁已验证。
PRE e83a49f3d232feed971c98e1c70fc7d6573badbe；错题快照 013b690f7444b037e874fd55cb9ba1cbb692f5d0；最终 POST 30775def83bed44446899e471bcc16670f619e70（refs/heads/ai/rea-backend-0a0f5ddc/post-v2）。共享 Git HEAD/index 未由本任务的快照操作修改，未 push。使用说明 docs/rea-integration.md。
