# REA 后端原生接入：静态架构核查

## 当前状态
尚未完成源码移植和构建。仅已完成限定 PRE、静态源码/依赖图及原生接口核查；上一版独立 REA 运行包仍在，不能当作本需求交付。没有启动产品、执行实际逆向或功能测试。

## 已确认
- 用户目标：全部后端；不要 REA CLI、前端、独立服务、专用 Node 或 REA MCP 子进程。外部 Ghidra、IDA、Frida 等引擎不随包交付。
- 固定官方 rea-agents 6.8.0 的完整目录 mcp-catalog-full.json 声明 229 个工具；这是目录数，不是已接通或已验证数。
- composition/binary.js:createBinarySession 是 CLI/MCP 共用的后端会话组合入口；server/createServer.js 组合分析服务与注册处理器。已有 mcpServer 注入点，但直接复用仍会携带 MCP 服务创建依赖，需抽出无传输的原生注册器，不能只改名称。
- 排除 EvidenceMcpServer 与 registerPrompts 后，AST 静态候选闭包含 1770 个模块/资源节点。该图不是穷尽动态资源证明；audit.json 的正则估算已由 audit-ast.json 替代。
- 候选闭包中 @modelcontextprotocol/server 只被 toolResult.js、ToolResultDelivery.js、mcpClientMetadata.js 直接导入：前两处取缓冲上限，后一处取请求元数据键。可以在移植边界中替换，不能因此打包整个 REA MCP 服务。外部 IDA/JEB 引擎所需 MCP client 是另一条第三方适配边界，不应误删其认证。
- OpenCode 原生接点：module-0114.mjs 的 availableBuiltinToolDefinitions / dispatcher 依赖与生命周期；module-0143.mjs 的调度、规则、参数验证、身份、活动记录及真实结果返回。原生后端必须经过同一工具门禁，不借 externalRegistry 启动旧 REA。
- FridaInstrumentationManager 支持注入 deviceManagerLoader，可保留外部 Frida 绑定，不打包 Frida 引擎。
- Windows 安全模块声明 Node-API 8、配套 manifest 与 SHA256 校验；属于必需后端安全依赖，不应与独立 Node 或外部逆向引擎混淆。其加载与自检没有执行。

## 尚未解决的移植工作
1. 抽出 229 项目录与具体处理器的覆盖映射，替换 MCP-only 注册、请求元数据与错误编码边界；保留规范输入输出校验和完整证据恢复链。
2. 每个真实调用者建立进程内会话；取消需贯穿等待与执行，关闭需先停止准入并等待 handler/finally，再关闭 provider；失败不能当作已释放。
3. 核对 process.env、process.cwd()、缓存与临时目录，不能为某会话修改整个 OpenCode 进程的全局状态。
4. 审阅后台 worker / Node 辅助进程的宿主启动方式。例如 SqliteDatabaseWorkerExecution 使用 process.execPath 与专用 worker 脚本；不能把 Electron 宿主当普通 node.exe 直接照搬，也不能暗中重新携带专用 Node。这些分析 helper 与独立 REA MCP 服务并不相同，但仍须正确适配。
5. 保留 worker、Python/Java/Swift 辅助脚本、Windows 原生模块及其完整性校验，建立静态导入之外的资源清单。
6. 上游声明 Node ^22.23.4 || ^24.22.1 || >=26.12.1；只读确认的构建 Node 是 v22.22.1。产品内宿主版本与所需 API 的兼容性尚未证明，不能用打包专用 Node 解决或将构建 Node 冒称产品宿主。
7. AST 审计的 dynamicImportsRequiringReview 中 processCaptureValidation.js 的 require(...) 实际是函数参数断言，不是 CommonJS 加载器（已读该文件 1–30 行确认）；不能将这些候选项报告成真实动态依赖缺失。其他别名加载器仍须单独核查。
8. 待替代实现就绪后，依据旧 manifest/所有权记录移除上次新增的独立运行资产与自动 MCP 注册，保留用户自定义配置、正式安装及通用 publisher 修复；限定 POST 后才构建发布。

## 快照与未变边界
PRE fe8af0fbb4ebee40a238836b8dceaee58530a65f，ref refs/heads/ai/rea-backend-0a0f5ddc/pre。当前核对 16 个限定产品源码/资产清单哈希均未变化；无 POST、无新构建、无发布。恢复须限定路径，不改共享 HEAD/index，不覆盖其他对话的改动。
