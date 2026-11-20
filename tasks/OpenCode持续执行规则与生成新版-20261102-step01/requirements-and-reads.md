# 需求、影响与读取记录

## 明确要求
- 将持续执行指令放入 OpenCode 自身源码并生成新版，而非仅修改设置界面。
- 输出仅限 E:\OpenCode-Source-Recovery-20261013\opencode；不得覆盖 E:\OpenCode，不能启动或重启实例。
- 尚有已授权、非阻塞工作时，状态汇报之后继续工具操作；真实权限门禁、危险操作确认、必须依赖回答的工作仍受保护。
- 保护用户已有自定义规则、工作树与共享数据；不执行功能测试。

## 理解与残差
- 理解：规则中心使用本地共享规则库；迁移需要锁和旧库备份，初次启用不等于对所有用户配置无条件生效。
- 未确认：具体现有共享库内容、当前用户是否选择停用或自定义同名规则，以及真实宿主对等待问题的限制；不能凭构建结果声称运行时行为已实测。
- 影响：内置默认规则及其一次性迁移、版本号和说明、同步副本与生成产物。现有实例不受强制关闭或重启。

## 读取状态（如实记录）
- AGENTS.md、README.md、package.json、scripts/update.cjs：已读取，README/源码有原有未提交改动；以 pre 快照保存原貌。
- scripts/sync-shared.cjs、build-recovered.cjs、copy-static-assets.cjs、build-standalone.cjs、copy-defaults.cjs、verify-build.cjs、publish-runtime.cjs：已读取，构建前对同步覆盖范围进行只读预检。
- recovered/shared/automation-store.mjs：已读取与默认规则、规则数据校验、迁移、启动初始化相关的部分；超长行受到工具截断，未完整读取全文件，不宣称已完整阅读。通过精确版本条件修改并保留文件快照。
- 系统调试 skill 已读取部分；未进行运行时功能复现或测试。

## 生成方式
按项目发布器执行 node scripts/update.cjs；发布器检查运行实例、用户文件、路径和锁，拒绝时不得绕过。
