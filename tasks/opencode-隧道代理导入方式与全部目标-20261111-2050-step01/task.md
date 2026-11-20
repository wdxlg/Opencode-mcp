# 任务：隧道代理——测速列出全部受影响连接，导入方式对齐 Arena 模型助手（opencode-隧道代理导入方式与全部目标-20261111-2050-step01）

状态：源码修改、内部打包（scripts/update.cjs）完成；界面实际导入 / 测速 未验证
快照：tag pre/opencode-隧道代理导入方式与全部目标-20261111-2050-step01
## 改动
- tunnel-proxy.mjs：测速目标 = Cloudflare 边缘、快速隧道 API（api.trycloudflare.com）、Tailscale 控制面、Tailscale DERP，并附各自被哪个程序使用；ngrok 启动时剥掉代理变量、不走隧道代理，故不列。
- 导入方式：订阅链接 / 分享链接文本 / HTTP / HTTPS / SOCKS5 / v2rayN 目录（只读 guiConfigs/guiNDB.db，node:sqlite，被锁时复制到临时目录读）/ Clash 目录（*.yaml/yml/json 与 profiles，只取带 proxies 的文件）；目录类可「更新」重新读取。一个来源可对应多个 provider 文件。
- module-0023：import 命令接受对象；新增 opencode.bridge.tunnelProxy.pickDirectory（文件夹选择框）。
- opencode-tunnel-proxy-section.mjs：导入面板按方式切换字段，目录可「选择目录…」；表头悬停显示用途；来源显示类型与未导入说明。
## 验证（离线）
- node --check 4 个模块通过；合成 v2rayN 库转换 3 个节点、跳过 tuic；mihomo -t 通过；临时目录已清理。
