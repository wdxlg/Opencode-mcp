# Bridge 隧道代理：导入 / 选择节点 + 每节点到隧道端点的延迟

- 需求：像 Arena 模型助手一样，在 Bridge 页有地方导入、选择代理，并显示每个节点对隧道相关端点的延迟。
- 方案：
  - 内置 mihomo（复制自 Arena 模型助手 assets/proxy-core，v1.19.31，含 LICENSE/NOTICE）。
  - 扩展端 tunnel-proxy.mjs：导入订阅链接 / 节点分享链接 / Base64 / Clash YAML（交给 mihomo 解析，识别不出节点则回滚）；模式 system（原有系统代理逻辑，默认，行为不变）/ direct / node；node 模式 mihomo 只监听 127.0.0.1 随机端口，规则 MATCH 到选择组；测速走 external-controller /proxies/{name}/delay（unified-delay），目标 Cloudflare cp.cloudflare.com、Tailscale 控制面、DERP 洛杉矶。
  - module-0114：cloudflared / tailscaled 的代理按模式决定；node 模式 Quick Tunnel 走代理路线；tailscaled 记录启动时的代理签名，签名变化且 Funnel 未运行时重启免安装版 tailscaled。
  - module-0023：注册 opencode.bridge.tunnelProxy.* 命令。
  - 工作台：opencode-tunnel-proxy-section.mjs（连接设置卡片内「隧道代理」区块），module-2692 两行接入。
  - modules.json 两处登记新模块。
- 影响清单：上述文件；module-0114 / 扩展 modules.json 中他人未提交改动未纳入提交。
- 快照：pre/opencode-隧道代理选择与测速-20261111-2000-step01
