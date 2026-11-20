# REA 后端原生接入（基于 6.8.0）

## 架构与范围

REA 后端分析服务和 229 项工具处理器在 OpenCode 扩展宿主进程内执行，由 OpenCode 原生工具目录、调度器、规则门禁和结果通道调用。另有 `rea_workflow`，用于原有工作流模板的列举、渲染和参数补全。

**不交付 REA CLI、REA MCP/HTTP/stdio 服务、前端、专用 Node 或 REA 子进程桥。** 不携带 Ghidra、IDA、Frida、Hopper、浏览器等外部引擎；保留对应适配器与第三方认证机制。必要的分析 worker、引擎辅助脚本、Windows Node-API 8 安全模块属于后端依赖，不是独立 REA 产品。

维护源码位于 `recovered/rea-backend/`，包括从固定官方 npm 发布物移植的 JavaScript 服务/处理器、接口契约和必要资源。不是恢复完整上游 TypeScript。`PROVENANCE.json` 记录原文件哈希、机械作用域适配、资源和必要依赖版本；MIT 与第三方许可证保留。`vendor/dist/cliCommandNames.js` 仅为错误提示共用的名称常量，不含 CLI 执行器。

## 原生工具

直接使用 `rea_` 加上原后端工具名，例如 `rea_open_binary`、`rea_analyze_function`、`rea_close_binary`。每个工具直接声明其完整输入/输出 schema，不再使用 `ext__rea__call_rea_tool` 等四层包装入口，也不在 MCP 管理页注册独立 REA 服务。

后端结果中的工具引用保持上游名称；实际调用时加 `rea_` 前缀。原始 content、structuredContent、isError、证据引用及来源标记通过 OpenCode 的真实工具结果通道返回，不转换为聊天提示词续轮。大结果遵循证据保留与分页恢复机制，不能自动重放已经执行或结果未知的操作。

工具可发现不等于对应引擎就绪。229 是固定目录数量，不能据此声称 229 项业务已运行验证。

## 状态、身份和取消

- 每个真实对话/Bridge 调用者使用独立进程内会话，工作目录位于活动 profile 的 extension global storage：`rea-backend/sessions/<owner-hash>/`。不使用依赖目录或真实项目作为默认工作目录。
- 缺少对话级身份时拒绝调用，不共享窗口级 `native-default`。最多保留 32 个调用者，满额拒绝，不驱逐忙碌或未知状态的会话。
- REA 有独立的有界公平执行门，不占满文件/IDE 工具的执行许可。服务内部原有分析准入、provider 队列、取消与 Windows 进程所有权机制保留。
- 环境、cwd 和临时目录默认值通过 AsyncLocalStorage 作用域传递，不修改整个 OpenCode 的 process.env 或 cwd。Node 分析 helper 使用宿主可执行文件，并在其私有子环境中设置 Electron Node 模式；不额外携带 Node。
- 关闭调用者时停止准入、发出取消、等待调用及 finally 完成，再关闭 provider 和会话。清理失败保留所有权，不能把取消请求或工具响应结束当作外部进程已经退出。
- 工作区信任、身份、规则和权限门禁继续生效。注解不是授权或操作系统沙箱；设备、注入、网络、修改二进制及任意命令仍需相应任务授权。

## 配置与外部引擎

可在活动 profile 的 `rea-backend/config.json` 自行提供后端引擎环境配置。该文件不由构建写入，不复制到源码或交付资产。

```json
{
  "environment": {
    "GHIDRA_INSTALL_DIR": "用户自行配置的绝对路径",
    "JAVA_HOME": "用户自行配置的绝对路径"
  },
  "fridaModule": "可选：用户自行安装的 Frida JS 入口绝对路径"
}
```

`environment` 接受字符串值的 `REA_*` 引擎设置以及 `GHIDRA_INSTALL_DIR`、`JAVA_HOME`、`HOPPER_LAUNCHER_PATH`；不要将示例占位文字直接作为配置。默认继承宿主已有引擎环境，不改变系统配置或凭据。Frida 也可由用户安装到该调用者工作目录的 `engines/node_modules/` 后按正常模块解析加载；本构建不安装、不加载 Frida 引擎。

已有自定义 REA MCP 条目不覆盖。仅对上次错误方案由本产品创建、记录和 secret 引用值均完全匹配且没有定制的 6.8 默认条目，未来启动初始化时才撤销注册；保留回退记录和所有凭据引用。没有在本次构建中启动产品或操作真实配置。

## 构建和完整性

`npm run build` 在既有依赖缓存存在时刷新后端资产、正常构建 OpenCode、校验所有默认资产并只发布到源码根 `opencode/`。`npm run prepare:rea` 仅从维护源码与 `upstream/rea-backend-deps/` 现有缓存准备后端资产，不联网、不安装、不运行上游 setup/lifecycle。

依赖缓存缺失会明确失败，需要另外准备固定依赖；不能暗中恢复整包 REA 或专用 Node。生产依赖的嵌套版本布局保留，上游包私有依赖位于移植后端的 `vendor/node_modules/`，不以扁平提升改变 Zod 等版本。

`defaults/manifest.json` 管理真实 SHA-256。移除旧资产仅限上一份可信 manifest 中未被定制的托管文件；构建/发布继续保留 data、.recovery-profile 和用户非托管文件。运行中的目标或冲突阻止发布，不杀实例、不强抢锁。通用 publisher 的嵌套 data 完整性修复保留。

## 验证边界

本任务授权是源码与构建：不会启动 OpenCode、连接外部引擎、打开目标或实际逆向，不运行旧 120 套测试。

静态编译目标是 Node 22；上游原声明 `^22.23.4 || ^24.22.1 || >=26.12.1` 保存在来源记录。本次没有在产品宿主加载/运行后端，也没有验证全部引擎、原生绑定、会话隔离、取消、并发、搬迁或业务行为。编译与哈希检查不能替代这些运行验收；具体提供方仍可能因平台、API 或外部依赖不可用而拒绝调用。
