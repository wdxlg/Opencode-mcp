# 拆分 Bridge ask 与需求澄清规则

- 任务 ID：ask-rule-split-20261029-021928-step01
- 状态：已完成本次授权的源码与构建交付；功能验证和用户验收未进行。
- 用户明确要求：将原有 ask 规则拆为 ask 独立部分与其他部分两条；原目标是 OpenCode 恢复源码与源码内 opencode 运行版。
- 不做：Arena 自动检测、按客户端自动切换、禁用/删除 ask MCP 工具、解除已有问答门禁、修改正式 E:/OpenCode 或启停实例；不运行功能测试。

## 目标和方案
1. 原默认规则拆为「需求澄清与交互式决策」（澄清、全部答复前暂停等通用要求）和「Bridge 交互式提问」（bridge_ask_user 单题/批次和 check 要求），独立启用。
2. 可精确识别的原版默认规则在新版启动时按既有加锁/备份/原子写入机制拆分，组与规则启用状态继承；自定义内容、名称冲突或无法安全拆分时不覆盖。此处涉及共享规则库，旧版可能看到变化；本次生成不写入真实规则库。
3. 已创建 Bridge 待答仍受服务端门禁，不因停用文本规则而取消。Arena 原生问答不自动提供 Bridge 回执。
4. 经源码检查、增量编译与静态完整性校验后按项目约定发布源码根 opencode/；正式安装与用户配置不覆盖。

## 必须读取与已读状态
- AGENTS.md：完整读取；sha256:1d1d07f43c1a2487fd40211d606326517e51b4ebab307a416168963976b6590d。
- README.md：完整读取；sha256:8cbe450321588115cf9154dfbee39a3a4aa673e23acbba8a4b0d9d38ccc8b0c0。
- package.json：完整读取；sha256:6248cbeb5dd932ae76cc801682ffdb1aac0788856a59d4aa541d6d2026a3be5b。
- 源码 recovered/shared/automation-store.mjs：原版已分段读取，超长第 36 行通过只读终端补齐；读取时 sha256:2bc4e9bcd453e1a1dd5c853bc5d5aa8b5eac5fe4998aa6b04a5969a5669a9c35。当前源码 sha256:4670b4459b6d63b9dc9fceb619af24d0f3d1be90831de71fa84a87dfcb24fa29。
- scripts/update.cjs、sync-shared.cjs、build-recovered.cjs、copy-static-assets.cjs、build-standalone.cjs、copy-defaults.cjs、verify-build.cjs、publish-runtime.cjs：完整读取，执行前已审阅。
- 已读取 systematic-debugging 与 mcp-builder 正文；技能不扩大执行授权。

## 意图与影响
- 技术理解：现有规则库按组逐条启停；原 v3 同时写入桥接提问和通用等待。
- 需求理解：拆成两条而不是关闭 ask 工具或做客户端识别。
- 交付理解：用户在新版规则中心可单独调整两条；旧运行版不会被热更新。
- 强相关参考：恢复源码默认规则、规则中心和既有迁移与发布实现；无无关参考。
- 不确定/未验证：规则升级、UI 与真正客户端链路均未运行验证。
- 影响文件：automation-store.mjs 真源及构建同步副本、README.md、package.json、任务文档和构建产物。

## 快照和状态
- 修改前 refs/heads/pre/ask-rule-split-20261029-021928-step01：2722df0f9023bf85238d509a0ace5cb4a4d81021；原分支和索引未改；未跟踪文件不进入该快照。
- 源码修改：两条内置规则、精确旧默认拆分逻辑和 README/package 版本已更新；构建副本与真源的读取校验值一致，尚未运行功能测试。
- 编译与发布：`npm run build` 退出码 0；编译回执 28 个 bundle、70 个 standalone 文件、10 项产品完整性检查，发布器在源码内 `opencode/` 更新 2 文件、删除 0 文件并保留用户数据。报告 1 条既有 CommonJS 警告（`module-0023.mjs:36`）；未启动程序。
- 静态核对：`node --check`、`git diff --check` 和真源/同步副本字节比较完成；发布版 extension.js SHA-256 `8dfce3012cc5cd7976babbfedfc875370080116fbb09e7f59b3079bd93bd548c` 与构建报告一致。静态包含两条规则 ID、ask 工具和待答门禁字串，不证明运行行为。
- 本地 Git：源码提交 `e5dbacc0565b5b53516942a69d48ede99312d3a3`，独立分支 `refs/heads/task/ask-rule-split-20261029-021928-step01`；原 HEAD 与实际索引未改。发布清单如实记录原 HEAD `2722df0f9023bf85238d509a0ace5cb4a4d81021` 和 `sourceDirty=true`，不是上述独立提交。
- 留痕：项目 SQLite 已备份并记录任务；备份 `backup/ask-rule-split-20261029-021928-step01/memory-before.sqlite` 的 SHA-256 为 `4d0cd64a0134a61096bac19030360f0e372c7e6de46a7d37780e4922d4798034`，不纳入 Git。项目索引和日志记录交付细节。
- 功能测试：未授权、未执行；自动迁移、规则开关、Arena 原生问答、其他客户端与真实 Bridge 待答行为均未实测。
- 用户验收：未进行。

## 使用方法
1. 用户自行启动本工程 `E:/OpenCode-Source-Recovery-20261013/opencode/` 的新版并打开规则中心，选择实际使用的规则组。
2. 找到「Bridge 交互式提问」并按需停用、保存；「需求澄清与交互式决策」可单独保留。若原默认规则定制过、有冲突或已删除，可能不会自动拆分，需手动处理。
3. 需要时重新连接客户端并重新读取确认有效规则；旧进程或旧连接不会因本次构建自动换版。Arena 原生提问可用性取决于该客户端。
4. 新版首次启动可能备份并升级共享规则库，其他使用同一库的旧版也可能看到变化；本次构建没有读取或写入真实共享规则库。已有 Bridge 待答仍需真实答复，不可切渠道绕过。

## 操作问题
- 本地临时补丁生成脚本首次 Python 字符串拼接语法错误，未修改目标文件；第二次补丁因引用了错误的旧行产生 PATCH_CONTEXT_NOT_FOUND，原文件未变。已重新根据原文件范围生成并使用文件版本前置条件成功应用；未产生目标源码错误快照。
- 只读 SQLite schema 的 Python 命令迟迟无输出，首次软中断未结束，第二次软中断后取消，退出码 130；未强制处理用户进程。已另用 Node SQLite 只读查询 schema，随后按工作流备份并写入本任务记录。
- 本地 Git 首次提交因仓库无作者身份而在创建临时索引前失败；重试时只对该提交临时指定 `OpenCode Local Agent` 本地身份，未修改 Git 用户配置，成功建立隔离分支。
