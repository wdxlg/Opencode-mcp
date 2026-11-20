# 任务：Tailscale 模式自动连接（opencode-tailscale自动连接-20261111-2040-step01）

状态：源码修改、内部打包（scripts/update.cjs，同 打包.cmd）完成；GUI 实际点选未验证
快照：tag pre/opencode-tailscale自动连接-20261111-2040-step01 → b4c1e412
## 改动（module-2692 Bridge 页）
- 选中 Tailscale Funnel 模式后：先检测；未连接直接走「一键连接」（登录页/Funnel 开启页自动打开并轮询）。
- 启动 Bridge 时若是 Tailscale 模式且未连接：先自动连接，连不上不启动。
- 连接失败或找不到 tailscale.exe：自动展开连接设置并平滑滚到「隧道状态」行。
## 打包
- update.cjs：errors=[]；发布到 E:/OpenCode-Source-Recovery-20261013/opencode（原目录已被移走，此次全量 18384 文件），含 proxy-core。
- 工作区含其他会话未提交改动（sourceDirty=true），已随构建进入产物；本提交只含 module-2692 与本任务记录。
