# 删除 OpenCode 命令保护路径门禁并打包
状态：完成（源码与生成交付；功能未验证）。用户明确要求删除上次误判的默认命令门禁并从源码打包；不扩大到其余门禁。
事实：默认规则对只读 cat 的 .md 后缀误识别为写入命令；此次删除 default.deny-official-install-command-write，保留其他默认门禁、自定义规则与通用匹配能力。
影响：命令工具不再受该默认规则保护正式安装目录，存在修改或删除风险；直接文件写保护仍在。源码为 shared 真源及构建同步变体；构建目标为源码根下 opencode，新建运行目录，不覆盖现有正式安装。
已授权：修改源码并打包；不启动目标软件、不做功能测试、不安装依赖。需要保留本地独立 Git 提交，不推送、不改原分支及暂存区。
快照：pre/opencode-remove-command-gate-20261107-step01，基线 2599e7d6bdf1ee51acadf2e719825a67761dbc9b；两个源码副本在 .ai-workflow/snapshots/ 同名目录。
强制读取：项目 AGENTS.md、源码门禁和构建链；已读系统规则及 evidence-driven-debugging 技能；该恢复工程没有同名记忆 AGENTS/HANDOFF/REQUIREMENTS，项目记忆仅含小写 index.md。结果：已理解所删规则与输出位置；真实功能效果待用户日后验证。
验收：源码删除目标规则，生成并核对产物；未启动程序，未运行回归，不宣称功能测试通过。功能权限变化涉及风险，不声明其他防线完全阻止命令写入。

## 结果
- shared 真源及一个同步入口副本各删除同一条默认规则，其余默认规则和通用条件匹配代码保留。
- 独立本地提交：97f956dad548c8e8d8284eaacb138f4ca9e10b8a；原分支及原暂存区未改写。
- 生成目录：源码根下 opencode/；入口为 opencode/OpenCode.exe。仅生成目录，无 ZIP，遵循恢复工程现行约定。
- 构建发布命令 node scripts/update.cjs 返回 0；生成一致性校验成功；产物静态检查目标规则不存在，文件写保护及进程保护规则仍在。
- 构建有一条 CommonJS module 在 ESM 内的编译警告；未启动程序、未做功能或回归测试。
- 构建清单记录原 HEAD 2599e7d6 和 sourceDirty=true；本次实际源码另存提交为上述 97f956da，未切换原分支。
- 发行扩展脚本 SHA256 af4b486fecb05978a7e677248feb8c48ed9e20581a4b647f7c5be0c0ae22c1f9；启动 EXE SHA256 b805f2482f7654d7fbabbecf00424417de0969594924d20f02cb70b5ef87f38d。
