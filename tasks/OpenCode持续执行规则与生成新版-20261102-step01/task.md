# OpenCode 持续执行规则与生成新版

目标：在用户选定的恢复源码中加入未完成任务持续推进规则，生成到本项目 opencode/；不覆盖正式安装、不启动或停止实例、不运行功能测试。

影响：recovered/shared/automation-store.mjs、对应 esm 同步副本、package.json、README.md；构建会更新受管理的 generated、reports 和 opencode 输出。共用规则库只有新进程运行时依现有锁、备份及迁移策略变更；冲突或容量不足不强制修改。

修改前快照：pre/standing-execution-rule-20261102，commit e6a50786bca5e1e0bb268aed7b2b70aee353bcc7。文件副本及隔离索引位于 .ai-workflow/snapshots/standing-rule-20261102-pre/；未修改用户分支或原暂存区。

验收：生成脚本成功且目标 release 标记对应新版；未授权运行应用或功能测试，因此不能宣称实测规则生效。保留独立确认和所有真实权限门禁。

状态：源码修改及新版生成完成。构建校验通过，发布器报告改动 2 个受管理文件、移除 0 个文件，保留用户数据；OPENCODE-RELEASE.json 标记版本 1.0.0-recovered.29。仅做生成校验，未运行功能测试或启动应用，现有共享规则库的实际迁移和生效尚未验证。
