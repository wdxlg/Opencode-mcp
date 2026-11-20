# OpenCode 运行管理层（借鉴 Multica 设计，自行实现）

参考：multica-ai/multica（Multica License = Apache-2.0 + 托管/商用嵌入/品牌附加条件）。只借鉴产品概念，没有复制代码，也不以其品牌命名。
位置：recovered/shared/multica/*.mjs（构建时由 scripts/sync-shared.cjs 镜像到 recovered/esm/000-extension.js/multica/）。
接入点：module-0119 BridgeMcpTransport（tools/call 经 multicaRuntime().runToolCall 包装；tools/list 追加 opencode_ops）。
配置：OPENCODE_MULTICA_HOME/multica.config.json（默认 %LOCALAPPDATA%/OpenCode/shared-automation/multica），和 core.mjs DEFAULT_CONFIG 深合并。
默认值：被动记录（taskSync、runRecords、steer 投递、inbox、usage、skillsLock）开启；会改变行为的功能（review、squad、retry、autopilot、permissions、channels）关闭。
| 项 | 模块 | 操作（opencode_ops action） |
|---|---|---|
| 1 任务卡主记录 | task-sync.mjs | task_bind / task_status / task_recover |
| 2 运行记录 | run-records.mjs | records_query / records_replay / records_verify |
| 3 插话 | steer.mjs | steer_post / steer_list |
| 4 评审闸门 | review-gate.mjs | review_start / submit / approve / reject / cleanup / list |
| 5 小队路由 | squad.mjs | squad_plan / squad_status |
| 6 重试超时 | retry.mjs | retry_policy |
| 7 Inbox | inbox.mjs | inbox_list / inbox_ack |
| 8 用量 | usage.mjs | usage_report |
| 9 autopilot | autopilot.mjs | autopilot_list / tick / queue / take |
| 10 Skills 锁 | skills-lock.mjs | skills_lock_write / skills_lock_verify / skills_used |
| 11 权限范围 | permissions.mjs | perm_whoami / perm_check / perm_set_role |
| 12 渠道 | channels.mjs | channels_start / stop / status、channel_inbound |
已知限制：bridge_batch 内部调用 opencode_ops 无效（只在顶层拦截）；运行中的 OpenCode 实例要等用户重启后才会加载新构建，会话内效果还没验证；token 是估算值。

## 提交记录（分支 task/opencode-leanrea-replace-20261027，仅本地）
修改前快照：tag pre/opencode-multica-borrow-20261110-034000-step01 → 5a93f69。每项提交都有 post/opencode-multica-borrow-20261110-034000-step01-mNN tag。

| 项 | commit |
|---|---|
| m01 | 25f504e8 |
| m02 | 4016303d |
| m03 | 43b781dc |
| m04 | 659dd309 |
| m05 | 236071a1 |
| m06 | 75af1ca2 |
| m07 | a06a3af6 |
| m08 | f4df128d |
| m09 | b72eb461 |
| m10 | 6f7226ca |
| m11 | c21e0f6e |
| m12 | 3c2a4848 |

## 验证范围
- 已执行：每项 npm run build 退出码 0（含 verify-build 与 scripts/publish-runtime.cjs 发布到 <仓库>/opencode）；node --test scripts/test-multica-borrow.mjs 离线单测，m12 时 13/13 通过；构建产物 extension.js 通过 node --check。
- 未执行、未验证：运行中 OpenCode 实例内的会话级功能（需用户自行重启实例加载新构建）；渠道 webhook 未对外监听过（测试只用回环地址临时端口）；没有连接任何外部服务。

## 使用
- 查看：opencode_ops（action=ops_status）。
- 测试：node --test scripts/test-multica-borrow.mjs（MULTICA_SRC 可指向临时副本）。
- 开启默认关闭的功能：在 multica.config.json 中把对应段的 enabled 设为 true（review / squad / retry / autopilot / permissions / channels）。

