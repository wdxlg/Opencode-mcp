# Tailscale Funnel 提速（tailscaled 走代理 + DERP）

- 需求：Tailscale 固定地址速度达到 Cloudflare 隧道水平，且不影响实际功能。
- 原因：便携 tailscaled 直连海外（本机直连 ~17KB/s），cloudflared 已走系统代理（~70-97KB/s）。
- 方案：startPortableTailscaled 启动时注入与 cloudflared 相同的已配置/系统代理（HTTPS_PROXY/HTTP_PROXY、NO_PROXY=localhost），并在解析到代理时设 TS_DEBUG_ALWAYS_USE_DERP=true（UDP 无法走 HTTP 代理）。无代理或 http.proxySupport=off 时行为不变；用户已有的环境变量保留。
- 影响清单：仅 recovered/esm/000-extension.js/module-0114.mjs 的 startPortableTailscaled 与新增方法 tailscaledProcessEnvironment；他人在该文件的未提交改动（rea-native）未纳入提交、未改动。
- 快照：pre/opencode-tailscale走代理提速-20261111-1930-step01
