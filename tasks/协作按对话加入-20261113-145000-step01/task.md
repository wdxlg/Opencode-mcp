# 协作按对话加入-20261113-145000-step01

## 总目标
多模型协作开启后，未加入协作的普通对话不再被降为只读；对话可主动加入／退出协作。状态：完成（源码已改，未构建、未测试、未重启）

## 根因
automation-store.mjs 的 role(owner) 在协作开关打开时对所有对话返回职位，未分配的落到 observer（readOnly），工具门禁随之拒绝变更型工具（POLICY_READ_ONLY）。

## 改动
- role()：新增 isCollaborationMember()，未加入协作的对话返回 null，按普通对话处理（只受规则组 readOnly/allowCommands 约束）。
- 加入判定：native-chat:automation 协作 worker、prepareNative 已分配职位的原生对话、本地用户在面板分配过职位（assignedBy=user）、调用 bridge_join_collaboration（joined=true）。旧版只登记为 observer、无 joined 标记的记录不算加入。
- bridge_join_collaboration：标记 joined；用户没分配过职位时默认“开发”职位；返回 joined:true。
- 新工具 bridge_leave_collaboration：退出协作回普通模式；持有运行中协作任务时拒绝。
- guard：其他协作工具要求先加入（COLLABORATION_NOT_JOINED）。
- assignAgent：记录 joined:true、assignedBy:'user'。
- 工具分组 module-0140／module-2765 与协作 worker 过滤列表加入 bridge_leave_collaboration。
- shared/automation-store.mjs、shared/collaboration-workers.mjs 与 esm 版同步。

## 快照
tag pre/协作按对话加入-20261113-145000-step01（HEAD acf4b60d）；文件备份 .ai-workflow/snapshots/协作按对话加入-20261113-145000-step01/

## 验收
- 已做：node --check 六个改动文件语法通过。
- 未做：构建、打包、测试、重启、功能验证（需用户授权）。
- 注意：esm/automation-store.mjs 里另有他人未提交的 bridge_start 输出精简改动（5 行），本次提交未包含。
